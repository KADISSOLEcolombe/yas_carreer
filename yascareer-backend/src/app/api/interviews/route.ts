import { handler, ok, notFound, forbidden } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { interviewValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { ApplicationStatusService } from "@/server/services/application-status";
import { NotificationService } from "@/server/services/notification";
import { MailService } from "@/server/services/mail";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} à ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// RH/admin: list all interviews.
export const GET = handler(async (req) => {
  await requireRole(req, ["rh", "admin"]);
  const interviews = await prisma.interview.findMany({
    include: { application: { include: { offer: true, user: true } } },
    orderBy: { scheduledAt: "asc" },
  });
  return ok(sanitize(interviews));
});

// RH/admin: schedule or reschedule an interview.
// If a supervisor is attached, only RH may perform this action (business process
// owned by RH — admin stays out of the recruitment-with-supervisor workflow).
export const POST = handler(async (req) => {
  const actor = await requireRole(req, ["rh", "admin"]);
  const payload = interviewValidator.parse(await readJson(req));
  if (payload.supervisorId && actor.role !== "rh") {
    throw forbidden("Seul le RH peut programmer un entretien impliquant un superviseur");
  }

  const application = await prisma.application.findUnique({
    where: { id: payload.applicationId },
    include: { user: true, offer: true },
  });
  if (!application) throw notFound("Candidature introuvable");

  const existing = await prisma.interview.findUnique({
    where: { applicationId: application.id },
  });
  const wasUpdate = Boolean(existing);

  // Un seul mode à la fois : le présentiel n'a pas de lien visio, le distanciel n'a pas de lieu.
  const data = {
    scheduledAt: new Date(payload.scheduledAt),
    durationMinutes: payload.durationMinutes,
    supervisorId: payload.supervisorId || null,
    mode: payload.mode,
    location: payload.mode === "presentiel" ? payload.location || null : null,
    meetingLink: payload.mode === "distanciel" ? payload.meetingLink || null : null,
    notes: payload.notes || null,
    status: "planifie" as const,
  };

  await prisma.interview.upsert({
    where: { applicationId: application.id },
    create: { applicationId: application.id, ...data },
    update: data,
  });

  if (application.status !== "entretien_programme") {
    try {
      await ApplicationStatusService.changeStatus(
        application,
        "entretien_programme",
        actor,
        { force: true, silent: true }
      );
    } catch {
      // ignore invalid transition — force handles admin path
    }
  }

  const when = formatWhen(payload.scheduledAt);
  const supervisor = payload.supervisorId
    ? await prisma.user.findUnique({ where: { id: payload.supervisorId } })
    : null;
  const action = wasUpdate ? "modifié" : "programmé";

  await NotificationService.notify(
    application.userId,
    "interview",
    `Entretien ${action} pour « ${application.offer.title} » le ${when}${payload.mode === "distanciel" ? " (distanciel)" : " (présentiel)"}.`
  );
  MailService.sendInterviewEmail(application.user, application.offer.title, when, {
    mode: payload.mode,
    durationMinutes: payload.durationMinutes,
    location: data.location,
    meetingLink: data.meetingLink,
    supervisorName: supervisor?.fullName || supervisor?.email || null,
    isReschedule: wasUpdate,
  });
  if (supervisor) {
    await NotificationService.notify(
      supervisor.id,
      "interview",
      `Entretien ${action} le ${when} avec ${application.user.fullName || application.user.email} — « ${application.offer.title} ».`
    );
    MailService.sendInterviewEmail(supervisor, application.offer.title, when, {
      mode: payload.mode,
      durationMinutes: payload.durationMinutes,
      location: data.location,
      meetingLink: data.meetingLink,
      isReschedule: wasUpdate,
    });
  }

  void ActivityLogService.fromRequest(req, actor, {
    action: wasUpdate ? "interview.update" : "interview.schedule",
    category: "interview",
    summary: `${wasUpdate ? "Mise à jour" : "Programmation"} d’entretien pour « ${application.offer.title} » — ${when}`,
    resourceType: "application",
    resourceId: application.id,
    metadata: {
      offerTitle: application.offer.title,
      candidate: application.user?.fullName || application.user?.email,
      scheduledAt: payload.scheduledAt,
      mode: payload.mode,
    },
  });

  const interview = await prisma.interview.findUnique({
    where: { applicationId: application.id },
  });
  return ok(interview);
});
