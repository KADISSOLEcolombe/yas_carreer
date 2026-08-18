import { handler, ok, notFound } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { applicationNoteValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    await requireRole(req, ["rh", "admin"]);
    const { id } = await ctx.params;
    const notes = await prisma.applicationNote.findMany({
      where: { applicationId: Number(id) },
      orderBy: { createdAt: "desc" },
      include: { author: true },
    });
    return ok(sanitize(notes));
  }
);

// Note interne RH — sans effet sur le statut, jamais visible du candidat.
export const POST = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const actor = await requireRole(req, ["rh", "admin"]);
    const { id } = await ctx.params;
    const applicationId = Number(id);

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw notFound("Candidature introuvable");

    const payload = applicationNoteValidator.parse(await readJson(req));

    const note = await prisma.applicationNote.create({
      data: { applicationId, authorId: actor.id, content: payload.content },
      include: { author: true },
    });

    void ActivityLogService.fromRequest(req, actor, {
      action: "application.note_add",
      category: "application",
      summary: `Note ajoutée à la candidature #${applicationId}`,
      resourceType: "application",
      resourceId: applicationId,
    });

    return ok(sanitize(note));
  }
);
