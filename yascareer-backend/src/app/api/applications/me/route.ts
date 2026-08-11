import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req) => {
  const user = await requireRole(req, ["candidat"]);
  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: { offer: true, interview: true },
    orderBy: { appliedAt: "desc" },
  });
  return ok(applications);
});
