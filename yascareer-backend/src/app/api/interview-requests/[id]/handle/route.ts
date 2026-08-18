import { handler, ok, notFound } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// RH only : marque une demande de disponibilité comme traitée — la fait
// disparaître de l'onglet "À traiter" sans toucher à son statut/ses
// créneaux (utilisé après programmation d'un entretien à partir d'une
// réponse, ou pour classer une réponse "indisponible" une fois lue).
export const PATCH = handler(
  async (req, { params }: { params: Promise<{ id: string }> }) => {
    await requireRole(req, ["rh"]);
    const { id } = await params;

    const interviewRequest = await prisma.interviewRequest.findUnique({
      where: { id: Number(id) },
    });
    if (!interviewRequest) throw notFound("Demande introuvable");

    const updated = await prisma.interviewRequest.update({
      where: { id: interviewRequest.id },
      data: { handledAt: new Date() },
    });

    return ok(sanitize(updated));
  }
);
