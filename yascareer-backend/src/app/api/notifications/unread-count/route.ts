import { handler, ok } from "@/server/http";
import { requireUser } from "@/server/auth";
import { NotificationService } from "@/server/services/notification";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req) => {
  const user = await requireUser(req);
  const count = await NotificationService.unreadCount(user.id);
  return ok({ count });
});
