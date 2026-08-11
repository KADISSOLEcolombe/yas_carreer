import { handler, ok, notFound } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { offerAiCriteriaValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const PATCH = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const actor = await requireRole(req, ["rh", "admin"]);
    const { id } = await ctx.params;
    const offer = await prisma.offer.findUnique({ where: { id: Number(id) } });
    if (!offer) throw notFound("Offre introuvable");

    const payload = offerAiCriteriaValidator.parse(await readJson(req));
    const updated = await prisma.offer.update({
      where: { id: offer.id },
      data: { aiAnalysisCriteria: payload.aiAnalysisCriteria?.trim() || null },
    });

    void ActivityLogService.fromRequest(req, actor, {
      action: "offer.ai_criteria",
      category: "offer",
      summary: `Critères d’analyse IA mis à jour pour « ${offer.title} »`,
      resourceType: "offer",
      resourceId: offer.id,
      metadata: { title: offer.title, criteriaLength: updated.aiAnalysisCriteria?.length || 0 },
    });

    return ok(updated);
  }
);
