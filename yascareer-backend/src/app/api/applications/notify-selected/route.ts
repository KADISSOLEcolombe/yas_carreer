import { handler, ok, notFound } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { notifyCandidatesValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { NotificationService } from "@/server/services/notification";
import { MailService } from "@/server/services/mail";
import { ActivityLogService } from "@/server/services/activity-log";
import { APPLICATION_STATUS_LABELS, type ApplicationStatus } from "@/server/domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async (req) => {
  const actor = await requireRole(req, ["rh", "admin"]);
  const payload = notifyCandidatesValidator.parse(await readJson(req));

  const applications = await prisma.application.findMany({
    where: { id: { in: payload.applicationIds } },
    include: { user: true, offer: true, interview: true },
  });
  if (!applications.length) throw notFound("Aucune candidature trouvée");

  const offerTypeLabel = (t: string) => (t === "stage" ? "Stage" : "Emploi");
  const modeLabel = (m: string | null | undefined) =>
    m === "presentiel" ? "présentiel" : m === "distanciel" ? "distanciel" : m || null;

  const sent: { id: number; email: string }[] = [];
  const failed: { id: number; reason: string }[] = [];

  for (const application of applications) {
    const user = application.user;
    const offer = application.offer;
    if (!user?.email || !offer) {
      failed.push({ id: application.id, reason: "Données incomplètes" });
      continue;
    }
    try {
      const interview = application.interview;
      MailService.sendCandidateSelectionEmail({
        user,
        offerTitle: offer.title,
        offerType: offerTypeLabel(offer.type),
        offerLocation: offer.location || null,
        offerDeadline: offer.deadline ? offer.deadline.toISOString().slice(0, 10) : null,
        statusLabel: APPLICATION_STATUS_LABELS[application.status as ApplicationStatus],
        interviewMode: modeLabel(interview?.mode),
        interviewMeetingLink: interview?.meetingLink || null,
        interviewNotes: interview?.notes || null,
        customMessage: payload.message || null,
      });
      await NotificationService.notify(
        user.id,
        "rh_email",
        `L’équipe RH vous a envoyé un email concernant « ${offer.title} ». Consultez votre boîte mail.`
      );
      sent.push({ id: application.id, email: user.email });
    } catch (error) {
      failed.push({ id: application.id, reason: (error as Error).message });
    }
  }

  void ActivityLogService.fromRequest(req, actor, {
    action: "application.notify_selected",
    category: "application",
    summary: `Envoi d’email à ${sent.length} candidat(s) sélectionné(s)`,
    resourceType: "application",
    metadata: {
      applicationIds: payload.applicationIds,
      sentCount: sent.length,
      failedCount: failed.length,
      hasCustomMessage: Boolean(payload.message?.trim()),
    },
  });

  return ok({
    sentCount: sent.length,
    failedCount: failed.length,
    sent,
    failed,
    message: sent.length === 1 ? `Email envoyé à ${sent[0].email}` : `${sent.length} email(s) envoyé(s)`,
  });
});
