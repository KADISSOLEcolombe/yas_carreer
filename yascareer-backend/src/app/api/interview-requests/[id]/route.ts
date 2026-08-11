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

// Supervisor: confirm or decline their availability for a requested interview.
export const PATCH = handler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(req, ["superviseur"]);
  const { id } = await params;
  const payload = interviewRequestRespondValidator.parse(await readJson(req));

  const interviewRequest = await prisma.interviewRequest.findUnique({
    where: { id: Number(id) },
    include: { application: { include: { offer: true } } },
  });
  if (!interviewRequest) throw notFound("Demande introuvable");
  if (interviewRequest.supervisorId !== user.id) {
    throw forbidden("Cette demande ne vous est pas adressée");
  }

  const updated = await prisma.interviewRequest.update({
    where: { id: interviewRequest.id },
    data: {
      status: payload.status,
      availabilityNote: payload.availabilityNote || null,
      respondedAt: new Date(),
    },
  });

  await NotificationService.notify(
    interviewRequest.requestedBy,
    "availability_response",
    `${user.fullName || user.email} a répondu ${payload.status === "disponible" ? "disponible" : "indisponible"} pour « ${interviewRequest.application.offer.title} ».`
  );
  const requester = await prisma.user.findUnique({ where: { id: interviewRequest.requestedBy } });
  if (requester) {
    MailService.sendAvailabilityResponseEmail(
      requester,
      user.fullName || user.email,
      interviewRequest.application.offer.title,
      payload.status
    );
  }

  void ActivityLogService.fromRequest(req, user, {
    action: "interview_request.respond",
    category: "interview",
    summary: `Réponse à la demande de disponibilité pour « ${interviewRequest.application.offer.title} » : ${payload.status}`,
    resourceType: "application",
    resourceId: interviewRequest.applicationId,
    metadata: { status: payload.status, offerTitle: interviewRequest.application.offer.title },
  });

  return ok(updated);
});
