import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req) => {
  await requireRole(req, ["rh", "admin"]);
  const [offersTotal, offersPublished, applicationsTotal, interviewsUpcoming, byStatus] =
    await Promise.all([
      prisma.offer.count(),
      prisma.offer.count({ where: { status: "publiee" } }),
      prisma.application.count(),
      prisma.interview.count({
        where: { status: "planifie", scheduledAt: { gte: new Date() } },
      }),
      prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

  return ok({
    offersTotal,
    offersPublished,
    applicationsTotal,
    interviewsUpcoming,
    applicationsByStatus: byStatus.map((r) => ({ status: r.status, total: r._count._all })),
  });
});
