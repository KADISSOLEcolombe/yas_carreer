import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { query } from "@/server/body";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req) => {
  await requireRole(req, ["admin"]);
  const { userId, category, action, q, limit } = query(req);
  const take = Math.min(Number(limit || 100), 300);

  const where: Prisma.ActivityLogWhereInput = {
    user: { role: { in: ["rh", "admin"] } },
  };
  if (userId) where.userId = Number(userId);
  if (category) where.category = category;
  if (action) where.action = action;
  if (q) where.summary = { contains: q, mode: "insensitive" };

  const logs = await prisma.activityLog.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take,
  });
  return ok(sanitize(logs));
});
