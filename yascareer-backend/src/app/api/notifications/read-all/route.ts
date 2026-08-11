import { handler, ok } from "@/server/http";
import { requireUser } from "@/server/auth";
import { NotificationService } from "@/server/services/notification";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const PATCH = handler(async (req) => {
  const user = await requireUser(req);
  await NotificationService.markAllRead(user.id);
  return ok({ message: "Toutes les notifications ont été marquées comme lues" });
});
