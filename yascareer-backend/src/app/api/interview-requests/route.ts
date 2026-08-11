import { handler, ok, notFound, badRequest } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson, query } from "@/server/body";
import { interviewRequestValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { NotificationService } from "@/server/services/notification";
import { MailService } from "@/server/services/mail";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// RH only: list availability requests, optionally filtered by application.
export const GET = handler(async (req) => {
  await requireRole(req, ["rh"]);
  const { applicationId } = query(req);
  const requests = await prisma.interviewRequest.findMany({
    where: applicationId ? { applicationId: Number(applicationId) } : undefined,
    include: {
      application: { include: { offer: true, user: true } },
      supervisor: true,
      requester: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return ok(sanitize(requests));
});

// RH only: ask a supervisor for their availability before scheduling an interview.
export const POST = handler(async (req) => {
  const actor = await requireRole(req, ["rh"]);
  const payload = interviewRequestValidator.parse(await readJson(req));

  const application = await prisma.application.findUnique({
    where: { id: payload.applicationId },
    include: { user: true, offer: true },
  });
  if (!application) throw notFound("Candidature introuvable");

  const supervisor = await prisma.user.findUnique({ where: { id: payload.supervisorId } });
  if (!supervisor || supervisor.role !== "superviseur") {
    throw badRequest("Superviseur introuvable");
  }

  const interviewRequest = await prisma.interviewRequest.create({
    data: {
      applicationId: application.id,
      supervisorId: supervisor.id,
      requestedBy: actor.id,
      status: "en_attente",
    },
  });

  await NotificationService.notify(
    supervisor.id,
    "availability_request",
    `Disponibilité demandée pour un entretien avec ${application.user.fullName || application.user.email} — « ${application.offer.title} ».`
  );
  MailService.sendAvailabilityRequestEmail(
    supervisor,
    application.user.fullName || application.user.email,
    application.offer.title
  );

  void ActivityLogService.fromRequest(req, actor, {
    action: "interview_request.create",
    category: "interview",
    summary: `Demande de disponibilité à ${supervisor.fullName || supervisor.email} pour « ${application.offer.title} »`,
    resourceType: "application",
    resourceId: application.id,
    metadata: {
      supervisor: supervisor.fullName || supervisor.email,
      offerTitle: application.offer.title,
      candidate: application.user.fullName || application.user.email,
    },
  });

  return ok(interviewRequest);
});
