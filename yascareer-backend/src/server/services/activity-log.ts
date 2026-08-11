import type { User } from "@prisma/client";
import { prisma } from "@/server/db";
import { clientIp } from "@/server/http";

export type ActivityInput = {
  userId: number;
  action: string;
  category: string;
  summary: string;
  resourceType?: string | null;
  resourceId?: number | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export const ActivityLogService = {
  async record(input: ActivityInput) {
    return prisma.activityLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        category: input.category,
        summary: input.summary.slice(0, 500),
        resourceType: input.resourceType || null,
        resourceId: input.resourceId ?? null,
        metadata: (input.metadata as object) ?? undefined,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent?.slice(0, 500) || null,
      },
    });
  },

  /** Records a staff action from the HTTP request (no-op for candidates). */
  async fromRequest(
    req: Request,
    user: User,
    input: Omit<ActivityInput, "userId" | "ipAddress" | "userAgent">
  ) {
    if (!["rh", "admin", "superviseur"].includes(user.role)) return null;
    try {
      return await this.record({
        ...input,
        userId: user.id,
        ipAddress: clientIp(req),
        userAgent: req.headers.get("user-agent") || null,
      });
    } catch {
      return null;
    }
  },
};
