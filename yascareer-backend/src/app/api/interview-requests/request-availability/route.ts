import { handler, ok, badRequest } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { requestAvailabilityValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { NotificationService } from "@/server/services/notification";
import { MailService } from "@/server/services/mail";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// RH only : demande de disponibilité générique — ne concerne aucune
// candidature précise, seulement l'organisation globale des entretiens
// avec un ou plusieurs superviseurs. Crée une InterviewRequest par
// superviseur (applicationId: null), avec les créneaux proposés par le RH
// stockés dans availableSlots (écrasés par la réponse du superviseur).
export const POST = handler(async (req) => {
  const actor = await requireRole(req, ["rh"]);
  const payload = requestAvailabilityValidator.parse(await readJson(req));

  const supervisors = await prisma.user.findMany({
    where: { id: { in: payload.supervisorIds }, role: "superviseur" },
  });
  if (supervisors.length === 0) throw badRequest("Aucun superviseur valide sélectionné");

  const created = await prisma.$transaction(
    supervisors.map((supervisor) =>
      prisma.interviewRequest.create({
        data: {
          applicationId: null,
          supervisorId: supervisor.id,
          requestedBy: actor.id,
          status: "en_attente",
          availableSlots: payload.proposedSlots,
          message: payload.message,
        },
      })
    )
  );

  for (const supervisor of supervisors) {
    await NotificationService.notify(
      supervisor.id,
      "availability_request",
      "Le RH sollicite vos disponibilités pour l'organisation d'entretiens."
    );
    MailService.sendGenericAvailabilityRequestEmail(supervisor);
  }

  void ActivityLogService.fromRequest(req, actor, {
    action: "interview_request.generic_create",
    category: "interview",
    summary: `Demande de disponibilité envoyée à ${supervisors.length} superviseur${supervisors.length > 1 ? "s" : ""}`,
    resourceType: "user",
    metadata: {
      supervisorIds: payload.supervisorIds,
      slotCount: payload.proposedSlots.length,
    },
  });

  return ok(sanitize(created));
});
