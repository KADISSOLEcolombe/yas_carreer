import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req) => {
  const user = await requireRole(req, ["candidat"]);
  const applications = await prisma.application.findMany({ where: { userId: user.id } });
  const interviewsUpcoming = await prisma.interview.count({
    where: {
      status: "planifie",
      scheduledAt: { gte: new Date() },
      application: { userId: user.id },
    },
  });

  const byStatus: Record<string, number> = {};
  for (const a of applications) byStatus[a.status] = (byStatus[a.status] || 0) + 1;

  return ok({
    applicationsTotal: applications.length,
    applicationsByStatus: byStatus,
    interviewsUpcoming,
  });
});
