import { handler, ok, notFound, forbidden, badRequest } from "@/server/http";
import { requireUser } from "@/server/auth";
import { readJson } from "@/server/body";
import { supervisionNoteBaseValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Supervisor only: edit one of their own follow-up entries. Une évaluation
// d'entretien déjà envoyée (applicationId + type "evaluation") n'est plus
// modifiable — elle engage le superviseur vis-à-vis du RH.
export const PATCH = handler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireUser(req);
  if (user.role !== "superviseur") throw forbidden("Réservé au superviseur");
  const { id } = await params;

  const note = await prisma.supervisionNote.findUnique({ where: { id: Number(id) } });
  if (!note) throw notFound("Entrée de suivi introuvable");
  if (note.authorId !== user.id) throw forbidden("Vous n’êtes pas l’auteur de cette entrée");
  if (note.applicationId && note.type === "evaluation") {
    throw badRequest("Une évaluation d'entretien déjà envoyée ne peut plus être modifiée");
  }

  const payload = supervisionNoteBaseValidator.partial().parse(await readJson(req));
  const updated = await prisma.supervisionNote.update({
    where: { id: note.id },
    data: {
      ...(payload.type ? { type: payload.type } : {}),
      ...(payload.title !== undefined ? { title: payload.title || null } : {}),
      ...(payload.content ? { content: payload.content } : {}),
      ...(payload.rating !== undefined ? { rating: payload.rating ?? null } : {}),
    },
  });

  void ActivityLogService.fromRequest(req, user, {
    action: "supervision_note.update",
    category: "supervision",
    summary: `Modification d’une entrée de suivi #${note.id}`,
    resourceType: "emploi",
    resourceId: note.emploiId,
  });

  return ok(sanitize(updated));
});
