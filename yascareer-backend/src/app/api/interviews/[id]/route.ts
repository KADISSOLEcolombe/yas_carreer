import { handler, ok, notFound, forbidden } from "@/server/http";
import { requireUser } from "@/server/auth";
import { readJson } from "@/server/body";
import { interviewOutcomeValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { NotificationService } from "@/server/services/notification";
import { MailService } from "@/server/services/mail";
import { ApplicationStatusService } from "@/server/services/application-status";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const OUTCOME_LABELS: Record<string, string> = {
  planifie: "Planifié",
  termine: "Terminé",
  annule: "Annulé",
};

function formatWhen(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} à ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// RH or the assigned supervisor: record the outcome of an interview (not admin —
// this is the RH/supervisor recruitment process, see interviews POST for context).
export const PATCH = handler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireUser(req);
  const { id } = await params;

  const interview = await prisma.interview.findUnique({
    where: { id: Number(id) },
    include: { application: { include: { offer: true, user: true } } },
  });
  if (!interview) throw notFound("Entretien introuvable");

  const isAssignedSupervisor =
    user.role === "superviseur" && interview.supervisorId === user.id;
  if (user.role !== "rh" && !isAssignedSupervisor) {
    throw forbidden("Vous n’êtes pas autorisé à modifier cet entretien");
  }

  const payload = interviewOutcomeValidator.parse(await readJson(req));
  const updated = await prisma.interview.update({
    where: { id: interview.id },
    data: { status: payload.status, notes: payload.notes ?? interview.notes },
  });

  if (
    payload.status === "termine" &&
    interview.application.status !== "entretien_realise"
  ) {
    try {
      await ApplicationStatusService.changeStatus(
        interview.application,
        "entretien_realise",
        user,
        { force: true, silent: true }
      );
    } catch {
      // ignore invalid transition — the interview-outcome notification below still fires
    }
  }

  const statusLabel = OUTCOME_LABELS[payload.status] ?? payload.status;
  if (payload.status === "annule") {
    const when = formatWhen(interview.scheduledAt);
    await NotificationService.notify(
      interview.application.userId,
      "interview",
      `Votre entretien pour « ${interview.application.offer.title} » a été annulé.`
    );
    MailService.sendInterviewCancelledEmail(
      interview.application.user,
      interview.application.offer.title,
      when
    );
  } else {
    await NotificationService.notify(
      interview.application.userId,
      "interview",
      `Le statut de votre entretien pour « ${interview.application.offer.title} » est : ${statusLabel}.`
    );
    MailService.sendApplicationStatusEmail(
      interview.application.user,
      interview.application.offer.title,
      `Entretien — ${statusLabel}`
    );
  }

  void ActivityLogService.fromRequest(req, user, {
    action: "interview.outcome",
    category: "interview",
    summary: `Résultat de l’entretien « ${interview.application.offer.title} » : ${payload.status}`,
    resourceType: "application",
    resourceId: interview.applicationId,
    metadata: { status: payload.status, offerTitle: interview.application.offer.title },
  });

  return ok(updated);
});
