import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req) => {
  await requireRole(req, ["admin"]);
  const staff = await prisma.user.findMany({
    where: { role: { in: ["rh", "admin"] }, isActive: true },
    orderBy: { fullName: "asc" },
  });

  const rows = await Promise.all(
    staff.map(async (user) => {
      const totalActions = await prisma.activityLog.count({ where: { userId: user.id } });
      const last = await prisma.activityLog.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      return {
        user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
        totalActions,
        lastActionAt: last?.createdAt?.toISOString() || null,
        lastSummary: last?.summary || null,
      };
    })
  );
  return ok(rows);
});
