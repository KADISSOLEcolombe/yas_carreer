import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { offerAssistValidator } from "@/server/validators";
import { AiService } from "@/server/services/ai";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async (req) => {
  const user = await requireRole(req, ["rh", "admin"]);
  const { brief, type } = offerAssistValidator.parse(await readJson(req));
  const result = await AiService.assistOffer(brief, type);

  void ActivityLogService.fromRequest(req, user, {
    action: "offer.ai_assist",
    category: "offer",
    summary: `Assistance IA pour rédiger une offre (${type || "auto"})`,
    resourceType: "offer",
    metadata: { briefLength: brief.length, type: type || null },
  });

  return ok(result);
});
