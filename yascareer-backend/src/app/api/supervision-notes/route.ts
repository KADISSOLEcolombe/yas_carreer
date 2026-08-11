import { handler, ok, notFound, forbidden, badRequest } from "@/server/http";
import { requireUser } from "@/server/auth";
import { readJson, query } from "@/server/body";
import { supervisionNoteValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { NotificationService } from "@/server/services/notification";
import { MailService } from "@/server/services/mail";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NOTE_TYPE_LABELS: Record<string, string> = {
  rapport: "Rapport",
  evaluation: "Évaluation",
  observation: "Observation",
};

// Supervisor (own collaborators) or RH (read-only oversight): list follow-up entries.
export const GET = handler(async (req) => {
  const user = await requireUser(req);
  if (user.role !== "superviseur" && user.role !== "rh") {
    throw forbidden("Accès réservé au superviseur et au RH");
  }

  const { emploiId } = query(req);
  const emploiIdNum = Number(emploiId);
  if (!emploiId || Number.isNaN(emploiIdNum)) throw badRequest("emploiId invalide");

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
});

// Supervisor only: write a rapport / evaluation / observation for one of their own collaborators.
export const POST = handler(async (req) => {
  const user = await requireUser(req);
  if (user.role !== "superviseur") throw forbidden("Réservé au superviseur");

  const payload = supervisionNoteValidator.parse(await readJson(req));
  const emploi = await prisma.emploi.findUnique({
    where: { id: payload.emploiId },
    include: { user: true },
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

  const typeLabel = NOTE_TYPE_LABELS[payload.type] ?? payload.type;
  const authorName = user.fullName || user.email;
  const collaboratorName = emploi.user.fullName || emploi.user.email;

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

  return ok(sanitize(note));
});
