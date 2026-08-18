import { handler, ok, notFound, forbidden } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { interviewRequestRespondValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { NotificationService } from "@/server/services/notification";
import { MailService } from "@/server/services/mail";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Le superviseur répond lui-même à sa propre demande ; à défaut (superviseur
// injoignable), le RH peut saisir la réponse à sa place — cas de secours, pas
// le chemin attendu.
export const PATCH = handler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(req, ["superviseur", "rh"]);
  const { id } = await params;
  const payload = interviewRequestRespondValidator.parse(await readJson(req));

  const interviewRequest = await prisma.interviewRequest.findUnique({
    where: { id: Number(id) },
    include: { application: { include: { offer: true } } },
  });
  if (!interviewRequest) throw notFound("Demande introuvable");
  const onBehalfOfSupervisor = user.role === "rh";
  if (!onBehalfOfSupervisor && interviewRequest.supervisorId !== user.id) {
    throw forbidden("Cette demande ne vous est pas adressée");
  }

  const updated = await prisma.interviewRequest.update({
    where: { id: interviewRequest.id },
    data: {
      status: payload.status,
      availabilityNote: payload.availabilityNote || null,
      availableSlots: payload.availableSlots ?? undefined,
      respondedAt: new Date(),
    },
  });

  const offerTitle = interviewRequest.application?.offer.title;
  const context = offerTitle ? ` pour « ${offerTitle} »` : "";
  const supervisor = onBehalfOfSupervisor
    ? await prisma.user.findUnique({ where: { id: interviewRequest.supervisorId } })
    : user;
  const responderLabel = onBehalfOfSupervisor
    ? `${user.fullName || user.email} (pour ${supervisor?.fullName || supervisor?.email})`
    : user.fullName || user.email;

  // Le RH qui saisit à la place du superviseur est aussi, la plupart du
  // temps, l'auteur de la demande initiale — inutile de se notifier soi-même.
  if (interviewRequest.requestedBy !== user.id) {
    await NotificationService.notify(
      interviewRequest.requestedBy,
      "availability_response",
      `${responderLabel} a répondu ${payload.status === "disponible" ? "disponible" : "indisponible"}${context}.`
    );
    const requester = await prisma.user.findUnique({ where: { id: interviewRequest.requestedBy } });
    if (requester) {
      MailService.sendAvailabilityResponseEmail(requester, responderLabel, payload.status, {
        offerTitle,
        slots:
          payload.status === "disponible"
            ? (updated.availableSlots as { date: string; start: string; end: string }[] | null)
            : null,
      });
    }
  }

  void ActivityLogService.fromRequest(req, user, {
    action: onBehalfOfSupervisor
      ? "interview_request.respond_on_behalf"
      : "interview_request.respond",
    category: "interview",
    summary: `Réponse à la demande de disponibilité${context} : ${payload.status}${onBehalfOfSupervisor ? " (saisie par le RH)" : ""}`,
    resourceType: interviewRequest.applicationId ? "application" : "user",
    resourceId: interviewRequest.applicationId ?? interviewRequest.supervisorId,
    metadata: { status: payload.status, offerTitle: offerTitle ?? null, onBehalfOfSupervisor },
  });

  return ok(updated);
});
