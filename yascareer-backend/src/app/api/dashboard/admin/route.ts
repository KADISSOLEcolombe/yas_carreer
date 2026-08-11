import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req) => {
  await requireRole(req, ["admin"]);
  const [usersTotal, rhCount, offersTotal, applicationsTotal, interviewsUpcoming, byStatus] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "rh" } }),
      prisma.offer.count(),
      prisma.application.count(),
      prisma.interview.count({ where: { status: "planifie" } }),
      prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

  return ok({
    usersTotal,
    rhCount,
    offersTotal,
    applicationsTotal,
    interviewsUpcoming,
    applicationsByStatus: byStatus.map((r) => ({ status: r.status, total: r._count._all })),
  });
});
