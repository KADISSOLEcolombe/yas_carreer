import { handler, notFound } from "@/server/http";
import { requireRole } from "@/server/auth";
import { query, readJson, toBool } from "@/server/body";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { runAiAnalyze } from "@/server/run-ai-analyze";
import { NotificationService } from "@/server/services/notification";
import { ActivityLogService } from "@/server/services/activity-log";
import { raw } from "@/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AiData = { criteriaUsed?: string | null } | null;

export const POST = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const actor = await requireRole(req, ["rh", "admin"]);
    const { id } = await ctx.params;
    const applicationId = Number(id);

    let application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { offer: true },
    });
    if (!application) throw notFound("Candidature introuvable");

    const q = query(req);
    const force = toBool(q.force);

    const body = (await readJson(req)) as { criteria?: string };
    if (typeof body.criteria === "string" && application.offer) {
      await prisma.offer.update({
        where: { id: application.offer.id },
        data: { aiAnalysisCriteria: body.criteria.trim() || null },
      });
      application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { offer: true },
      });
    }
    if (!application) throw notFound("Candidature introuvable");

    const currentCriteria = (application.offer?.aiAnalysisCriteria || "").trim();
    const usedCriteria = ((application.aiAnalysisData as AiData)?.criteriaUsed || "").trim();
    const criteriaMatch = usedCriteria === currentCriteria;
    const alreadyAnalyzed =
      application.aiMatchScore != null && application.aiAnalyzedAt != null && criteriaMatch;

    if (!force && alreadyAnalyzed) {
      const withUser = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { user: true },
      });
      return raw({ data: sanitize(withUser), cached: true });
    }

    await runAiAnalyze(applicationId);
    const refreshed = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true, offer: true },
    });

    const name = refreshed?.user?.fullName || refreshed?.user?.email || "candidat";
    await NotificationService.notify(
      actor.id,
      "ai_analysis_ready",
      `Analyse IA terminée pour ${name} — « ${refreshed?.offer?.title || "offre"} » (score ${refreshed?.aiMatchScore ?? "—"}).`
    );

    void ActivityLogService.fromRequest(req, actor, {
      action: "application.ai_analyze",
      category: "application",
      summary: `Analyse IA de ${name} — « ${refreshed?.offer?.title || "offre"} » (score ${refreshed?.aiMatchScore ?? "—"})`,
      resourceType: "application",
      resourceId: applicationId,
      metadata: {
        score: refreshed?.aiMatchScore,
        candidate: name,
        offerTitle: refreshed?.offer?.title,
      },
    });

    return raw({ data: sanitize(refreshed), cached: false });
  }
);
