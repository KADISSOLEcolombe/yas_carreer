import { handler, ok, notFound, forbidden, badRequest } from "@/server/http";
import { requireUser } from "@/server/auth";
import { readJson, query } from "@/server/body";
import { supervisionNoteValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { NotificationService } from "@/server/services/notification";
import { MailService } from "@/server/services/mail";
import { ActivityLogService } from "@/server/services/activity-log";
import { generateSupervisionReportPdf } from "@/server/services/pdf-report";
import { StorageService } from "@/server/services/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NOTE_TYPE_LABELS: Record<string, string> = {
  rapport: "Rapport",
  evaluation: "Évaluation",
  observation: "Observation",
};

const RECOMMENDATION_LABELS: Record<string, string> = {
  favorable: "Favorable",
  a_revoir: "À revoir",
  defavorable: "Défavorable",
};

// Supervisor (own collaborators/entretiens) or RH (read-only oversight):
// list follow-up entries — soit pour un dossier Emploi, soit pour une
// candidature (évaluation d'entretien avant toute embauche).
export const GET = handler(async (req) => {
  const user = await requireUser(req);
  if (user.role !== "superviseur" && user.role !== "rh") {
    throw forbidden("Accès réservé au superviseur et au RH");
  }

  const { emploiId, applicationId } = query(req);

  if (!emploiId && !applicationId) {
    // RH uniquement : tous les rapports (suivis + évaluations d'entretien),
    // toutes affectations confondues — vue centralisée pour la page Rapports.
    if (user.role !== "rh") throw badRequest("emploiId ou applicationId requis");
    const notes = await prisma.supervisionNote.findMany({
      include: {
        author: true,
        emploi: { include: { user: true, application: { include: { offer: true } } } },
        application: { include: { user: true, offer: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(sanitize(notes));
  }

  if (emploiId) {
    const emploiIdNum = Number(emploiId);
    if (Number.isNaN(emploiIdNum)) throw badRequest("emploiId invalide");
    const emploi = await prisma.emploi.findUnique({ where: { id: emploiIdNum } });
    if (!emploi) throw notFound("Dossier Emploi introuvable");
    if (user.role === "superviseur" && emploi.supervisorId !== user.id) {
      throw forbidden("Ce dossier ne vous est pas affecté");
    }
    const notes = await prisma.supervisionNote.findMany({
      where: { emploiId: emploi.id },
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });
    return ok(sanitize(notes));
  }

  const applicationIdNum = Number(applicationId);
  if (Number.isNaN(applicationIdNum)) throw badRequest("applicationId invalide");
  const application = await prisma.application.findUnique({
    where: { id: applicationIdNum },
    include: { interview: true },
  });
  if (!application) throw notFound("Candidature introuvable");
  if (user.role === "superviseur" && application.interview?.supervisorId !== user.id) {
    throw forbidden("Cette candidature ne vous est pas affectée");
  }
  const notes = await prisma.supervisionNote.findMany({
    where: { applicationId: application.id },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
  return ok(sanitize(notes));
});

// Supervisor only: write a rapport / evaluation / observation — soit pour un
// de leurs collaborateurs (emploiId), soit pour l'entretien d'une
// candidature dont ils sont le superviseur assigné (applicationId).
export const POST = handler(async (req) => {
  const user = await requireUser(req);
  if (user.role !== "superviseur") throw forbidden("Réservé au superviseur");

  const payload = supervisionNoteValidator.parse(await readJson(req));
  const typeLabel = NOTE_TYPE_LABELS[payload.type] ?? payload.type;
  const authorName = user.fullName || user.email;

  if (payload.emploiId) {
    const emploi = await prisma.emploi.findUnique({
      where: { id: payload.emploiId },
      include: { user: true, application: { include: { offer: true } } },
    });
    if (!emploi) throw notFound("Dossier Emploi introuvable");
    if (emploi.supervisorId !== user.id) {
      throw forbidden("Ce dossier ne vous est pas affecté");
    }

    const note = await prisma.supervisionNote.create({
      data: {
        emploiId: emploi.id,
        authorId: user.id,
        type: payload.type,
        title: payload.title || null,
        content: payload.content,
        rating: payload.type === "evaluation" ? payload.rating ?? null : null,
      },
    });

    const collaboratorName = emploi.user.fullName || emploi.user.email;

    // Même mécanisme que pour les évaluations d'entretien : un PDF est
    // généré une seule fois, ici, et son chemin stocké sur l'entrée.
    let fichierRapport: string | null = null;
    try {
      const pdfBuffer = await generateSupervisionReportPdf({
        type: note.type,
        personLabel: "Collaborateur",
        personName: collaboratorName,
        contextLabel: "Poste",
        contextValue: emploi.application?.offer?.title ?? emploi.department,
        supervisorName: authorName,
        createdAt: note.createdAt,
        title: note.title,
        rating: note.rating,
        recommendation: null,
        content: note.content,
      });
      fichierRapport = await StorageService.saveBuffer(pdfBuffer, "reports");
      await prisma.supervisionNote.update({
        where: { id: note.id },
        data: { fichierRapport },
      });
    } catch (error) {
      console.error("[supervision-notes] PDF generation failed:", error);
    }

    await NotificationService.notify(
      emploi.userId,
      "supervision_note",
      `${authorName} a ajouté ${typeLabel === "Évaluation" ? "une" : "un"} ${typeLabel.toLowerCase()} vous concernant.`
    );
    MailService.sendSupervisionNoteEmail(emploi.user, authorName, typeLabel, collaboratorName);

    const staff = await NotificationService.notifyStaff(
      "supervision_note",
      `${authorName} a ajouté ${typeLabel === "Évaluation" ? "une" : "un"} ${typeLabel.toLowerCase()} concernant ${collaboratorName}.`
    );
    for (const member of staff) {
      MailService.sendSupervisionNoteEmail(member, authorName, typeLabel, collaboratorName);
    }

    void ActivityLogService.fromRequest(req, user, {
      action: "supervision_note.create",
      category: "supervision",
      summary: `Nouvelle entrée de suivi (${payload.type}) — dossier Emploi #${emploi.id}`,
      resourceType: "emploi",
      resourceId: emploi.id,
      metadata: { type: payload.type },
    });

    return ok(sanitize({ ...note, fichierRapport }));
  }

  // Évaluation d'entretien (applicationId) — avant toute embauche.
  const application = await prisma.application.findUnique({
    where: { id: payload.applicationId },
    include: { interview: true, user: true, offer: true },
  });
  if (!application) throw notFound("Candidature introuvable");
  if (!application.interview || application.interview.supervisorId !== user.id) {
    throw forbidden("Cette candidature ne vous est pas affectée");
  }

  const note = await prisma.supervisionNote.create({
    data: {
      applicationId: application.id,
      authorId: user.id,
      type: payload.type,
      title: payload.title || null,
      content: payload.content,
      rating: payload.type === "evaluation" ? payload.rating ?? null : null,
      recommendation: payload.type === "evaluation" ? payload.recommendation ?? null : null,
    },
  });

  const candidateName = application.user.fullName || application.user.email;

  // Génère le PDF récapitulatif une seule fois, ici, plutôt qu'à la
  // demande de téléchargement — son chemin est stocké sur l'entrée.
  let fichierRapport: string | null = null;
  try {
    const pdfBuffer = await generateSupervisionReportPdf({
      type: note.type,
      personLabel: "Candidat",
      personName: candidateName,
      contextLabel: "Offre",
      contextValue: application.offer.title,
      supervisorName: authorName,
      createdAt: note.createdAt,
      title: note.title,
      rating: note.rating,
      recommendation: note.recommendation,
      content: note.content,
    });
    fichierRapport = await StorageService.saveBuffer(pdfBuffer, "reports");
    await prisma.supervisionNote.update({
      where: { id: note.id },
      data: { fichierRapport },
    });
  } catch (error) {
    // best-effort — l'évaluation reste envoyée même si la génération du PDF échoue
    console.error("[supervision-notes] PDF generation failed:", error);
  }
  const recommendationLabel = payload.recommendation
    ? RECOMMENDATION_LABELS[payload.recommendation]
    : null;
  const staff = await NotificationService.notifyStaff(
    "supervision_note",
    `${authorName} a envoyé son évaluation d'entretien pour ${candidateName} (« ${application.offer.title} »)${
      recommendationLabel ? ` — ${recommendationLabel}` : ""
    }.`
  );
  for (const member of staff) {
    MailService.sendSupervisionNoteEmail(member, authorName, "Évaluation d'entretien", candidateName);
  }

  void ActivityLogService.fromRequest(req, user, {
    action: "supervision_note.create",
    category: "supervision",
    summary: `Évaluation d'entretien envoyée pour ${candidateName} (« ${application.offer.title} »)`,
    resourceType: "application",
    resourceId: application.id,
    metadata: { type: payload.type, recommendation: payload.recommendation ?? null },
  });

  return ok(sanitize({ ...note, fichierRapport }));
});
