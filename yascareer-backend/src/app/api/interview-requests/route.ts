import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { query } from "@/server/body";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// RH only: list availability requests — filtrable par candidature, par
// offre (demandes historiques liées à une candidature), ou par superviseur
// (demandes génériques, non liées à une candidature).
export const GET = handler(async (req) => {
  await requireRole(req, ["rh"]);
  const { applicationId, offerId, supervisorId } = query(req);
  const requests = await prisma.interviewRequest.findMany({
    where: {
      ...(applicationId ? { applicationId: Number(applicationId) } : {}),
      ...(offerId ? { application: { offerId: Number(offerId) } } : {}),
      ...(supervisorId ? { supervisorId: Number(supervisorId) } : {}),
    },
    include: {
      application: { include: { offer: true, user: true } },
      supervisor: true,
      requester: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return ok(sanitize(requests));
});
