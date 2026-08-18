import { handler, ok, badRequest, conflict } from "@/server/http";
import { requireRole } from "@/server/auth";
import { query } from "@/server/body";
import { applicationStoreValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { StorageService } from "@/server/services/storage";
import { DocumentReaderService } from "@/server/services/document-reader";
import { assessCvText, assessCoverLetterText } from "@/server/services/ai";
import { ApplicationStatusService } from "@/server/services/application-status";
import { NotificationService } from "@/server/services/notification";
import { MailService } from "@/server/services/mail";
import { runAiAnalyze } from "@/server/run-ai-analyze";
import {
  isOfferExpired,
  type ApplicationStatus,
  type OfferDocumentRequirement,
} from "@/server/domain";

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

/**
 * Résout un document exigé pour la candidature : soit un nouveau fichier
 * téléversé pour cette candidature précise (clé `fileKey`), soit une
 * référence vers un document déjà enregistré dans le profil du candidat
 * (clé `idKey`, id de CandidateDocument — dont on vérifie la propriété).
 * Retourne `null` si ni l'un ni l'autre n'a été fourni.
 */
async function resolveDocument(
  form: FormData,
  fileKey: string,
  idKey: string,
  userId: number,
  folder: string,
  label: string
): Promise<string | null> {
  const file = form.get(fileKey);
  if (file instanceof File && file.size) {
    return StorageService.saveUpload(file, folder);
  }
  const idRaw = form.get(idKey);
  if (idRaw) {
    const id = Number(idRaw);
    const doc = await prisma.candidateDocument.findUnique({ where: { id } });
    if (!doc || doc.userId !== userId) {
      throw badRequest(`Document invalide : ${label}`);
    }
    return doc.url;
  }
  return null;
}

// Candidate: submit an application. Chaque document exigé (CV, lettre de
// motivation, documents complémentaires de l'offre) est fourni soit par un
// nouveau fichier propre à cette candidature, soit par référence à un
// document déjà enregistré dans "Mes documents" — jamais récupéré
// automatiquement sans action explicite du candidat.
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

  const cvUrl = await resolveDocument(form, "cv", "cvDocumentId", user.id, "cv", "CV");
  if (!cvUrl) throw badRequest("Le CV est requis (sélectionnez-en un ou téléversez-en un nouveau)");

  const coverLetterUrl = await resolveDocument(
    form,
    "coverLetter",
    "coverLetterDocumentId",
    user.id,
    "cover",
    "Lettre de motivation"
  );
  if (!coverLetterUrl) {
    throw badRequest(
      "La lettre de motivation est requise (sélectionnez-en une ou téléversez-en une nouvelle)"
    );
  }

  // Garde-fou serveur : même si la vérification côté formulaire a été
  // contournée (appel direct à l'API, document changé après coup…), un CV ou
  // une lettre qui ne ressemble pas à un vrai document du bon type ne doit
  // jamais entrer dans le système — ni être vu par le RH, ni analysé par l'IA.
  const cvText = (await DocumentReaderService.readUpload(cvUrl))?.text || "";
  const cvCheck = assessCvText(cvText);
  if (!cvCheck.valid) throw badRequest(cvCheck.message);

  const coverLetterFileText =
    (await DocumentReaderService.readUpload(coverLetterUrl))?.text || "";
  const coverLetterCheck = assessCoverLetterText(coverLetterFileText);
  if (!coverLetterCheck.valid) throw badRequest(coverLetterCheck.message);

  let documentsUrls: Record<string, string> | null = null;
  const documentRequirements = (offer.documentsRequis ?? []) as unknown as OfferDocumentRequirement[];
  for (const requirement of documentRequirements) {
    const url = await resolveDocument(
      form,
      `doc:${requirement.nom}`,
      `docId:${requirement.nom}`,
      user.id,
      "documents",
      requirement.nom
    );
    if (!url) {
      if (requirement.obligatoire) {
        throw badRequest(`Document requis manquant : ${requirement.nom}`);
      }
      continue;
    }
    documentsUrls = { ...(documentsUrls || {}), [requirement.nom]: url };
  }

  const application = await prisma.application.create({
    data: {
      offerId: offer.id,
      userId: user.id,
      cvUrl,
      coverLetterUrl,
      coverLetterText: payload.coverLetterText || null,
      documentsUrls: documentsUrls ?? undefined,
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
