import { handler, ok, notFound } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { finalizeSelectionValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { ApplicationStatusService } from "@/server/services/application-status";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// RH/admin: finalize the selection for an offer in one action — the chosen
// candidates are accepted, every other still-active candidate for this same
// offer is automatically rejected (notification + email handled by
// ApplicationStatusService.changeStatus, reused as-is for both branches).
export const POST = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const actor = await requireRole(req, ["rh", "admin"]);
    const { id } = await ctx.params;
    const offerId = Number(id);

    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) throw notFound("Offre introuvable");

    const payload = finalizeSelectionValidator.parse(await readJson(req));
    const retainedIds = new Set(payload.retainedApplicationIds);

    // Only candidatures still "in play" are touched — already accepted/rejected
    // applications are left untouched, never re-processed or re-notified.
    const activeApplications = await prisma.application.findMany({
      where: {
        offerId,
        status: {
          in: [
            "envoyee",
            "en_cours_analyse",
            "preselectionnee",
            "entretien_programme",
            "entretien_realise",
          ],
        },
      },
    });

    const accepted: number[] = [];
    const rejected: number[] = [];
    const failed: { id: number; reason: string }[] = [];

    for (const application of activeApplications) {
      const nextStatus = retainedIds.has(application.id) ? "acceptee" : "rejetee";
      try {
        await ApplicationStatusService.changeStatus(application, nextStatus, actor, {
          force: true,
        });
        if (nextStatus === "acceptee") accepted.push(application.id);
        else rejected.push(application.id);
      } catch (error) {
        failed.push({ id: application.id, reason: (error as Error).message });
      }
    }

    void ActivityLogService.fromRequest(req, actor, {
      action: "application.finalize_selection",
      category: "application",
      summary: `Sélection finalisée pour « ${offer.title} » : ${accepted.length} accepté(s), ${rejected.length} rejeté(s)`,
      resourceType: "offer",
      resourceId: offer.id,
      metadata: {
        offerTitle: offer.title,
        acceptedIds: accepted,
        rejectedIds: rejected,
        failedCount: failed.length,
      },
    });

    return ok({
      offerId,
      acceptedCount: accepted.length,
      rejectedCount: rejected.length,
      accepted,
      rejected,
      failed,
      message: `Sélection finalisée : ${accepted.length} accepté(s), ${rejected.length} rejeté(s) et notifié(s).`,
    });
  }
);
