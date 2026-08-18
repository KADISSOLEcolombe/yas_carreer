import { handler, ok, notFound, forbidden } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// RH (tout dossier) ou superviseur (uniquement ses propres collaborateurs) :
// dossier complet d'un collaborateur — candidature, historique de statut,
// entretien, profil candidat — pour alimenter les onglets Profil/Parcours
// du dossier superviseur. Aucune nouvelle table : uniquement des relations
// déjà existantes.
export const GET = handler(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    const user = await requireRole(req, ["rh", "superviseur"]);
    const { id } = await params;

    const emploi = await prisma.emploi.findUnique({
      where: { id: Number(id) },
      include: {
        application: {
          include: {
            offer: true,
            interview: { include: { supervisor: true } },
            statusHistory: {
              orderBy: { changedAt: "asc" },
              include: { changer: true },
            },
          },
        },
        user: { include: { profile: true } },
        supervisor: true,
      },
    });
    if (!emploi) throw notFound("Dossier Emploi introuvable");
    if (user.role === "superviseur" && emploi.supervisorId !== user.id) {
      throw forbidden("Ce dossier ne vous est pas affecté");
    }

    return ok(sanitize(emploi));
  }
);
