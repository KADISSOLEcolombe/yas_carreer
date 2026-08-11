import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Candidate: their own interviews. Supervisor: interviews they're assigned to.
export const GET = handler(async (req) => {
  const user = await requireRole(req, ["candidat", "superviseur"]);
  const interviews = await prisma.interview.findMany({
    where:
      user.role === "candidat"
        ? { application: { userId: user.id } }
        : { supervisorId: user.id },
    include: { application: { include: { offer: true, user: true } } },
    orderBy: { scheduledAt: "asc" },
  });
  return ok(sanitize(interviews));
});
