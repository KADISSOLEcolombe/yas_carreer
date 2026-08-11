import { handler, ok, notFound, badRequest } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { applicationStatusValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { sanitize } from "@/server/serialize";
import { ApplicationStatusService } from "@/server/services/application-status";
import { ActivityLogService } from "@/server/services/activity-log";
import { APPLICATION_STATUS_LABELS, type ApplicationStatus } from "@/server/domain";
import { HttpError } from "@/server/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const PATCH = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const actor = await requireRole(req, ["rh", "admin"]);
    const { id } = await ctx.params;
    const application = await prisma.application.findUnique({ where: { id: Number(id) } });
    if (!application) throw notFound("Candidature introuvable");

    const previous = application.status;
    const payload = applicationStatusValidator.parse(await readJson(req));

    try {
      await ApplicationStatusService.changeStatus(application, payload.status, actor, {
        force: payload.force,
      });
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw badRequest((error as Error).message);
    }

    const full = await prisma.application.findUnique({
      where: { id: application.id },
      include: { offer: true, user: true },
    });

    void ActivityLogService.fromRequest(req, actor, {
      action: "application.status_change",
      category: "application",
      summary: `Statut candidature « ${full?.offer?.title || "#" + application.id} » : ${APPLICATION_STATUS_LABELS[previous as ApplicationStatus] || previous} → ${APPLICATION_STATUS_LABELS[payload.status]}`,
      resourceType: "application",
      resourceId: application.id,
      metadata: {
        from: previous,
        to: payload.status,
        candidate: full?.user?.fullName || full?.user?.email,
        offerTitle: full?.offer?.title,
      },
    });

    return ok(sanitize(full));
  }
);
