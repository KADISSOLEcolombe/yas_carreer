import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req) => {
  await requireRole(req, ["rh", "admin"]);
  const departements = await prisma.departement.findMany({
    orderBy: { nom: "asc" },
  });
  return ok(departements);
});
