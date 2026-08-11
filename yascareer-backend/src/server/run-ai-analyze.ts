import { prisma } from "@/server/db";
import { AiService, scoreToGrade } from "@/server/services/ai";
import { DocumentReaderService } from "@/server/services/document-reader";
import { WebResearchService } from "@/server/services/web-research";

/**
 * Analyzes one application (CV/cover/profile + optional web research) and
 * writes the score, summary and structured aiAnalysisData back to the DB.
 * Best-effort: never throws to its caller.
 */
export async function runAiAnalyze(
  applicationId: number,
  options: { webSearch?: boolean } = {}
): Promise<void> {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { offer: true },
    });
    if (!application || !application.offer) return;
    const offer = application.offer;

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

    let webResearch: {
      provider: string;
      summary: string;
      sources: { title: string; url: string; snippet: string }[];
    } | null = null;
    let webText: string | undefined;
    if (options.webSearch) {
      const user = await prisma.user.findUnique({
        where: { id: application.userId },
      });
      const research = await WebResearchService.researchPerson({
        fullName: user?.fullName,
        email: user?.email,
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

    await prisma.application.update({
      where: { id: application.id },
      data: {
        aiMatchScore: result.score,
        aiSummary: result.summary,
        aiAnalyzedAt: new Date(),
        aiAnalysisData: {
          grade: scoreToGrade(result.score),
          strengths: result.strengths || [],
          gaps: result.gaps || [],
          recommendation: result.recommendation || "a_envisager",
          criteriaUsed: (offer.aiAnalysisCriteria || "").trim() || null,
          documents: dossier.documents,
          webResearch,
        },
      },
    });
  } catch (error) {
    console.warn("[run-ai-analyze] failed for application", applicationId, error);
  }
}
