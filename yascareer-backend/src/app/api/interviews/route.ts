import { handler, ok, notFound, forbidden } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { interviewValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { scheduleInterview } from "@/server/run-schedule-interview";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  const { wasUpdate, when } = await scheduleInterview(application, payload, actor);

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
