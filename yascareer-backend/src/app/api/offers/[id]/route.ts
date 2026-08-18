import { handler, ok, notFound } from "@/server/http";
import { currentUser, requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { offerValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { NotificationService } from "@/server/services/notification";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const offer = await prisma.offer.findUnique({
      where: { id: Number(id) },
      include: { departement: true },
    });
    if (!offer) throw notFound("Offre introuvable");
    const user = await currentUser(req);
    if (offer.status !== "publiee" && (!user || user.role === "candidat")) {
      throw notFound("Offre introuvable");
    }
    return ok(offer);
  }
);

export const PUT = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const actor = await requireRole(req, ["rh", "admin"]);
    const { id } = await ctx.params;
    const offer = await prisma.offer.findUnique({ where: { id: Number(id) } });
    if (!offer) throw notFound("Offre introuvable");

    const wasPublished = offer.status === "publiee";
    const payload = offerValidator.parse(await readJson(req));

    const updated = await prisma.offer.update({
      where: { id: offer.id },
      data: {
        title: payload.title,
        type: payload.type,
        description: payload.description,
        requirements: payload.requirements || null,
        deadline: payload.deadline ? new Date(payload.deadline) : null,
        location: payload.location || null,
        status: payload.status || offer.status,
        ...(payload.aiAnalysisCriteria !== undefined
          ? { aiAnalysisCriteria: payload.aiAnalysisCriteria?.trim() || null }
          : {}),
        ...(payload.documentsRequis !== undefined
          ? { documentsRequis: payload.documentsRequis }
          : {}),
        departementId: payload.departementId,
      },
      include: { departement: true },
    });

    if (!wasPublished && updated.status === "publiee") {
      await NotificationService.notifyStaff(
        "offer_published",
        `Offre publiée : « ${updated.title} »${updated.location ? ` — ${updated.location}` : ""}.`,
        actor.id
      );
      await NotificationService.notify(
        actor.id,
        "offer_published",
        `Votre offre « ${updated.title} » est maintenant en ligne.`
      );
    }

    void ActivityLogService.fromRequest(req, actor, {
      action: !wasPublished && updated.status === "publiee" ? "offer.publish" : "offer.update",
      category: "offer",
      summary:
        !wasPublished && updated.status === "publiee"
          ? `Publication de l’offre « ${updated.title} »`
          : `Modification de l’offre « ${updated.title} »`,
      resourceType: "offer",
      resourceId: updated.id,
      metadata: { title: updated.title, status: updated.status, type: updated.type },
    });

    return ok(updated);
  }
);

export const DELETE = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const actor = await requireRole(req, ["rh", "admin"]);
    const { id } = await ctx.params;
    const offer = await prisma.offer.findUnique({ where: { id: Number(id) } });
    if (!offer) throw notFound("Offre introuvable");

    await prisma.offer.delete({ where: { id: offer.id } });

    void ActivityLogService.fromRequest(req, actor, {
      action: "offer.delete",
      category: "offer",
      summary: `Suppression de l’offre « ${offer.title} »`,
      resourceType: "offer",
      resourceId: offer.id,
      metadata: { title: offer.title },
    });

    return ok({ message: "Offre supprimée" });
  }
);
