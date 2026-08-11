import { handler, ok, notFound } from "@/server/http";
import { requireRole } from "@/server/auth";
import { query, readJson, toBool } from "@/server/body";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { AiService, scoreToGrade, type RankGrade } from "@/server/services/ai";
import { DocumentReaderService } from "@/server/services/document-reader";
import { WebResearchService } from "@/server/services/web-research";
import { NotificationService } from "@/server/services/notification";
import { ActivityLogService } from "@/server/services/activity-log";
import type { Application, Offer, User } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type WebResearch = {
  provider: string;
  summary: string;
  sources: { title: string; url: string; snippet: string }[];
} | null;

type RankedItem = {
  rank: number;
  grade: RankGrade;
  applicationId: number;
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendation: "retenir" | "a_envisager" | "ecarter";
  documents: { label: string; ok: boolean; chars: number; images: number }[];
  webResearch: WebResearch;
  application: Application & { user: User | null; offer: Offer };
  fromCache: boolean;
};

type CachedAi = {
  grade?: RankGrade;
  strengths?: string[];
  gaps?: string[];
  recommendation?: "retenir" | "a_envisager" | "ecarter";
  criteriaUsed?: string | null;
  documents?: { label: string; ok: boolean; chars: number; images: number }[];
  webResearch?: WebResearch;
} | null;

export const POST = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const actor = await requireRole(req, ["rh", "admin"]);
    const { id } = await ctx.params;
    let offer = await prisma.offer.findUnique({ where: { id: Number(id) } });
    if (!offer) throw notFound("Offre introuvable");

    const q = query(req);
    const webSearch = q.webSearch === undefined ? true : toBool(q.webSearch);
    const force = toBool(q.force);

    const body = (await readJson(req)) as { criteria?: string };
    if (typeof body.criteria === "string") {
      offer = await prisma.offer.update({
        where: { id: offer.id },
        data: { aiAnalysisCriteria: body.criteria.trim() || null },
      });
    }

    const applications = await prisma.application.findMany({
      where: { offerId: offer.id },
      include: { user: true, offer: true },
      orderBy: { appliedAt: "asc" },
    });

    if (!applications.length) {
      return ok({
        offerId: offer.id,
        offerTitle: offer.title,
        overview:
          "Aucune candidature pour cette offre. Attendez des dossiers avant de lancer le classement.",
        recommendedCount: 0,
        webSearch,
        fromCache: true,
        analyzedNow: 0,
        ranked: [],
      });
    }

    const rankedItems: RankedItem[] = [];
    let analyzedNow = 0;

    for (const application of applications) {
      const currentCriteria = (offer.aiAnalysisCriteria || "").trim();
      const cachedData = application.aiAnalysisData as CachedAi;
      const usedCriteria = (cachedData?.criteriaUsed || "").trim();
      const canReuse =
        !force &&
        application.aiMatchScore != null &&
        application.aiAnalyzedAt != null &&
        application.aiSummary &&
        usedCriteria === currentCriteria;

      if (canReuse) {
        rankedItems.push({
          rank: 0,
          grade: (cachedData?.grade as RankGrade) || scoreToGrade(application.aiMatchScore!),
          applicationId: application.id,
          score: application.aiMatchScore!,
          summary: application.aiSummary!,
          strengths: cachedData?.strengths || [],
          gaps: cachedData?.gaps || [],
          recommendation: cachedData?.recommendation || "a_envisager",
          documents: cachedData?.documents || [],
          webResearch: cachedData?.webResearch || null,
          application,
          fromCache: true,
        });
        continue;
      }

      const profile = await prisma.candidateProfile.findUnique({
        where: { userId: application.userId },
      });
      const dossier = await DocumentReaderService.readApplicationDossier({
        cvUrl: application.cvUrl || profile?.cvUrl,
        coverLetterUrl: application.coverLetterUrl,
        coverLetterText: application.coverLetterText,
        profileBio: profile?.bio,
        profileSkills: profile?.skills,
        profileExtracted: profile?.aiExtractedData,
      });

      let webResearch: WebResearch = null;
      let webText: string | undefined;
      if (webSearch) {
        const research = await WebResearchService.researchPerson({
          fullName: application.user?.fullName,
          email: application.user?.email,
          skills: profile?.skills,
          offerTitle: offer.title,
        });
        webResearch = {
          provider: research.provider,
          summary: research.summary,
          sources: research.sources,
        };
        webText = research.summary;
      }

      const result = await AiService.analyzeApplication(
        application,
        offer,
        dossier.dossierText,
        webText
      );
      const grade = scoreToGrade(result.score);

      await prisma.application.update({
        where: { id: application.id },
        data: {
          aiMatchScore: result.score,
          aiSummary: result.summary,
          aiAnalyzedAt: new Date(),
          aiAnalysisData: {
            grade,
            strengths: result.strengths || [],
            gaps: result.gaps || [],
            recommendation: result.recommendation || "a_envisager",
            criteriaUsed: (offer.aiAnalysisCriteria || "").trim() || null,
            documents: dossier.documents,
            webResearch,
          } as object,
        },
      });
      analyzedNow++;

      rankedItems.push({
        rank: 0,
        grade,
        applicationId: application.id,
        score: result.score,
        summary: result.summary,
        strengths: result.strengths || [],
        gaps: result.gaps || [],
        recommendation: result.recommendation || "a_envisager",
        documents: dossier.documents,
        webResearch,
        application,
        fromCache: false,
      });
    }

    rankedItems.sort((a, b) => b.score - a.score || a.applicationId - b.applicationId);
    rankedItems.forEach((item, index) => (item.rank = index + 1));

    const overview = await AiService.summarizeOfferRanking({
      offerTitle: offer.title,
      ranked: rankedItems.map((item) => ({
        name:
          item.application.user?.fullName ||
          item.application.user?.email ||
          `Candidature #${item.applicationId}`,
        grade: item.grade,
        score: item.score,
        summary: item.summary,
      })),
    });

    const recommendedCount = rankedItems.filter(
      (i) => i.recommendation === "retenir" || i.grade === "A" || i.grade === "B"
    ).length;

    if (analyzedNow > 0) {
      await NotificationService.notify(
        actor.id,
        "ai_ranking_ready",
        `Classement IA prêt pour « ${offer.title} » — ${rankedItems.length} dossier(s), ${recommendedCount} prioritaire(s).`
      );
      void ActivityLogService.fromRequest(req, actor, {
        action: "application.ai_rank",
        category: "application",
        summary: `Classement IA pour « ${offer.title} » (${rankedItems.length} dossiers, ${analyzedNow} nouvelles analyses)`,
        resourceType: "offer",
        resourceId: offer.id,
        metadata: {
          offerTitle: offer.title,
          count: rankedItems.length,
          analyzedNow,
          recommendedCount,
          webSearch,
        },
      });
    }

    return ok({
      offerId: offer.id,
      offerTitle: offer.title,
      overview,
      recommendedCount,
      webSearch,
      fromCache: analyzedNow === 0,
      analyzedNow,
      ranked: sanitize(rankedItems),
    });
  }
);
