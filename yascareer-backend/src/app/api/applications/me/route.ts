import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// L'analyse IA (score, résumé, données détaillées) est un outil interne RH —
// jamais renvoyée au candidat, même hors affichage (pas seulement masquée
// côté UI : absente de la réponse API elle-même).
export const GET = handler(async (req) => {
  const user = await requireRole(req, ["candidat"]);
  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: { offer: true, interview: true },
    omit: {
      aiMatchScore: true,
      aiSummary: true,
      aiAnalyzedAt: true,
      aiAnalysisData: true,
    },
    orderBy: { appliedAt: "desc" },
  });
  return ok(applications);
});
