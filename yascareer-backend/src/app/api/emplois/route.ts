import { handler, ok, notFound, badRequest, conflict } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { emploiValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { NotificationService } from "@/server/services/notification";
import { MailService } from "@/server/services/mail";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// RH only: list all employment/internship records tied to recruitment.
export const GET = handler(async (req) => {
  await requireRole(req, ["rh"]);
  const emplois = await prisma.emploi.findMany({
    include: {
      application: { include: { offer: true } },
      user: true,
      supervisor: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return ok(sanitize(emplois));
});

// RH only: create the employment/internship record for an accepted candidate.
export const POST = handler(async (req) => {
  const actor = await requireRole(req, ["rh"]);
  const payload = emploiValidator.parse(await readJson(req));

  const application = await prisma.application.findUnique({
    where: { id: payload.applicationId },
    include: { user: true, offer: true, emploi: true },
  });
  if (!application) throw notFound("Candidature introuvable");
  if (application.status !== "acceptee") {
    throw badRequest("Le dossier Emploi ne peut être créé que pour une candidature acceptée");
  }
  if (application.emploi) {
    throw conflict("Un dossier Emploi existe déjà pour cette candidature");
  }

  const supervisor = await prisma.user.findUnique({ where: { id: payload.supervisorId } });
  if (!supervisor || supervisor.role !== "superviseur") {
    throw badRequest("Superviseur introuvable");
  }

  const emploi = await prisma.emploi.create({
    data: {
      applicationId: application.id,
      userId: application.userId,
      supervisorId: supervisor.id,
      department: payload.department || null,
      contractType: payload.contractType,
      startDate: new Date(payload.startDate),
      endDate: payload.endDate ? new Date(payload.endDate) : null,
      status: "actif",
    },
  });

  await NotificationService.notify(
    supervisor.id,
    "emploi_assigned",
    `${application.user.fullName || application.user.email} vous est affecté(e) en suivi (${payload.contractType}) — « ${application.offer.title} ».`
  );
  MailService.sendEmploiAssignedEmail(
    supervisor,
    application.user.fullName || application.user.email,
    payload.contractType,
    application.offer.title
  );

  void ActivityLogService.fromRequest(req, actor, {
    action: "emploi.create",
    category: "emploi",
    summary: `Dossier Emploi créé pour ${application.user.fullName || application.user.email} (${payload.contractType}), superviseur ${supervisor.fullName || supervisor.email}`,
    resourceType: "application",
    resourceId: application.id,
    metadata: {
      contractType: payload.contractType,
      supervisor: supervisor.fullName || supervisor.email,
      candidate: application.user.fullName || application.user.email,
    },
  });

  return ok(sanitize(emploi));
});
