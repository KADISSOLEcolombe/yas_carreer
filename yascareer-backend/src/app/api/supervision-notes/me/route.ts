import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Supervisor: historique de leurs évaluations d'entretien déjà envoyées
// (candidature/offre/entretien), pour la page « Mes évaluations ».
export const GET = handler(async (req) => {
  const user = await requireRole(req, ["superviseur"]);
  const notes = await prisma.supervisionNote.findMany({
    where: { authorId: user.id, type: "evaluation", applicationId: { not: null } },
    include: {
      application: {
        include: { offer: true, user: true, interview: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return ok(sanitize(notes));
});
