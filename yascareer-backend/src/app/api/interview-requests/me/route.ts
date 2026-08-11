import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Supervisor: availability requests addressed to them.
export const GET = handler(async (req) => {
  const user = await requireRole(req, ["superviseur"]);
  const requests = await prisma.interviewRequest.findMany({
    where: { supervisorId: user.id },
    include: { application: { include: { offer: true, user: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok(sanitize(requests));
});
