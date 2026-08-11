import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { activityTrackValidator } from "@/server/validators";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async (req) => {
  const user = await requireRole(req, ["rh", "admin"]);
  const payload = activityTrackValidator.parse(await readJson(req));

  await ActivityLogService.fromRequest(req, user, {
    action: payload.action.startsWith("ui.") ? payload.action : `ui.${payload.action}`,
    category: payload.category || "ui",
    summary: payload.summary,
    resourceType: payload.resourceType || null,
    resourceId: payload.resourceId ?? null,
    metadata: (payload.metadata as Record<string, unknown>) || null,
  });

  return ok({ ok: true });
});
