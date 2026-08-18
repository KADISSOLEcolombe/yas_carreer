import { handler, ok, notFound, forbidden } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { ApplicationStatusService } from "@/server/services/application-status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// RH/admin : dossier complet (profil, historique de statut, notes internes,
// analyse IA, entretien). Superviseur : même dossier central, mais limité à
// une candidature avec laquelle il a un lien réel — soit comme superviseur
// d'entretien assigné, soit comme superviseur du dossier Emploi qui en est
// issu (ce sont deux affectations indépendantes : la personne qui a mené
// l'entretien n'est pas forcément celle qui suit le collaborateur ensuite).
// Sections internes RH (notes, historique de statut, analyse IA) retirées
// de la réponse — pas de duplication du dossier, juste une vue restreinte
// de la même source.
export const GET = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const actor = await requireRole(req, ["rh", "admin", "superviseur"]);
    const { id } = await ctx.params;
    const applicationId = Number(id);

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { interview: true, emploi: true },
    });
    if (!application) throw notFound("Candidature introuvable");

    if (actor.role === "superviseur") {
      const isInterviewSupervisor = application.interview?.supervisorId === actor.id;
      const isEmploiSupervisor = application.emploi?.supervisorId === actor.id;
      if (!isInterviewSupervisor && !isEmploiSupervisor) {
        throw forbidden("Cette candidature ne vous est pas affectée");
      }

      const [full, profile] = await Promise.all([
        prisma.application.findUnique({
          where: { id: applicationId },
          include: {
            offer: true,
            user: true,
            interview: { include: { supervisor: true } },
          },
        }),
        prisma.candidateProfile.findUnique({
          where: { userId: application.userId },
        }),
      ]);
      if (!full) throw notFound("Candidature introuvable");

      return ok(sanitize({ ...full, profile }));
    }

    // Ouvrir le dossier est une action métier à part entière : elle fait
    // passer la candidature de "envoyee" à "en_cours_analyse" (une seule
    // fois — les ouvertures suivantes ne re-déclenchent rien). Réservé au
    // flux RH, jamais déclenché par une simple consultation superviseur.
    if (application.status === "envoyee") {
      try {
        await ApplicationStatusService.changeStatus(
          application,
          "en_cours_analyse",
          actor,
          { force: true }
        );
      } catch {
        // best-effort — le dossier reste consultable même si la transition échoue
      }
    }

    const [full, profile, notes] = await Promise.all([
      prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          offer: true,
          user: true,
          interview: { include: { supervisor: true } },
          statusHistory: {
            orderBy: { changedAt: "asc" },
            include: { changer: true },
          },
        },
      }),
      prisma.candidateProfile.findUnique({
        where: { userId: application.userId },
      }),
      prisma.applicationNote.findMany({
        where: { applicationId },
        orderBy: { createdAt: "desc" },
        include: { author: true },
      }),
    ]);
    if (!full) throw notFound("Candidature introuvable");

    return ok(sanitize({ ...full, profile, notes }));
  }
);
