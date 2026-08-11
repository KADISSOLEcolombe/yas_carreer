import { handler, ok, notFound } from "@/server/http";
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { NotificationService } from "@/server/services/notification";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const PATCH = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const user = await requireUser(req);
    const { id } = await ctx.params;
    const notification = await prisma.notification.findFirst({
      where: { id: Number(id), userId: user.id },
    });
    if (!notification) throw notFound("Notification introuvable");
    const updated = await NotificationService.markRead(notification.id);
    return ok(updated);
  }
);
