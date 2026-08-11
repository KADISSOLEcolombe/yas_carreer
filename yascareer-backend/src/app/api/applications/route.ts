import { handler, ok, badRequest, conflict } from "@/server/http";
import { requireRole } from "@/server/auth";
import { query } from "@/server/body";
import { applicationStoreValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { StorageService } from "@/server/services/storage";
import { ApplicationStatusService } from "@/server/services/application-status";
import { NotificationService } from "@/server/services/notification";
import { MailService } from "@/server/services/mail";
import { runAiAnalyze } from "@/server/run-ai-analyze";
import { isOfferExpired, type ApplicationStatus } from "@/server/domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// RH/admin: list all applications, ranked by AI score then recency.
export const GET = handler(async (req) => {
  await requireRole(req, ["rh", "admin"]);
  const { offerId, status } = query(req);
  const applications = await prisma.application.findMany({
    where: {
      ...(offerId ? { offerId: Number(offerId) } : {}),
      ...(status ? { status: status as ApplicationStatus } : {}),
    },
    include: { offer: true, user: true, interview: true },
    orderBy: [{ aiMatchScore: "desc" }, { appliedAt: "desc" }],
  });
  return ok(sanitize(applications));
});

// Candidate: submit an application (multipart with optional cv/coverLetter files).
export const POST = handler(async (req) => {
  const user = await requireRole(req, ["candidat"]);
  const form = await req.formData();

  const payload = applicationStoreValidator.parse({
    offerId: form.get("offerId"),
    coverLetterText: form.get("coverLetterText") || undefined,
  });

  const offer = await prisma.offer.findUnique({ where: { id: payload.offerId } });
  if (!offer || offer.status !== "publiee") throw badRequest("Offre non disponible");
  if (isOfferExpired(offer.deadline)) {
    throw badRequest(
      "Les candidatures pour cette offre sont closes. La date limite de candidature est dépassée."
    );
  }

  const existing = await prisma.application.findFirst({
    where: { offerId: offer.id, userId: user.id },
  });
  if (existing) throw conflict("Vous avez déjà postulé à cette offre");

  let cvUrl: string | null = null;
  let coverLetterUrl: string | null = null;
  const cv = form.get("cv");
  const cover = form.get("coverLetter");
  if (cv instanceof File && cv.size) cvUrl = await StorageService.saveUpload(cv, "cv");
  if (cover instanceof File && cover.size)
    coverLetterUrl = await StorageService.saveUpload(cover, "cover");

  if (!cvUrl) {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.id } });
    cvUrl = profile?.cvUrl || null;
  }

  const application = await prisma.application.create({
    data: {
      offerId: offer.id,
      userId: user.id,
      cvUrl,
      coverLetterUrl,
      coverLetterText: payload.coverLetterText || null,
      status: "envoyee",
      appliedAt: new Date(),
    },
  });

  await ApplicationStatusService.recordInitial(application, user.id);

  const candidateName = user.fullName || user.email;
  await NotificationService.notify(
    user.id,
    "new_application",
    `Votre candidature pour « ${offer.title} » a bien été envoyée.`
  );
  MailService.sendApplicationConfirmationEmail(user, offer.title);

  const staff = await NotificationService.notifyStaff(
    "new_application",
    `Nouvelle candidature de ${candidateName} pour « ${offer.title} ».`
  );
  for (const member of staff) {
    MailService.sendNewApplicationStaffEmail(member, candidateName, offer.title);
  }

  void runAiAnalyze(application.id);

  return ok(application);
});
