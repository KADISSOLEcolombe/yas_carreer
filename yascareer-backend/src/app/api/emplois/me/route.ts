import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Supervisor: the collaborators (stagiaires/CDD/CDI) assigned to them.
export const GET = handler(async (req) => {
  const user = await requireRole(req, ["superviseur"]);
  const emplois = await prisma.emploi.findMany({
    where: { supervisorId: user.id },
    include: { application: { include: { offer: true } }, user: true },
    orderBy: { startDate: "desc" },
  });
  return ok(sanitize(emplois));
});
