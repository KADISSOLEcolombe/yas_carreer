import { handler, ok, notFound } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { updateDepartementValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { serializeUser } from "@/server/serialize";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Admin only: rattacher un superviseur à un département — nécessaire pour
// ne proposer, lors de la programmation groupée d'entretiens, que les
// superviseurs du département de l'offre concernée.
export const PATCH = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const actor = await requireRole(req, ["admin"]);
    const { id } = await ctx.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) throw notFound("Utilisateur introuvable");

    const { departementId } = updateDepartementValidator.parse(await readJson(req));

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { departementId },
    });

    void ActivityLogService.fromRequest(req, actor, {
      action: "user.departement_change",
      category: "user",
      summary: `Département mis à jour pour ${user.fullName || user.email}`,
      resourceType: "user",
      resourceId: user.id,
      metadata: { departementId },
    });

    return ok({ user: serializeUser(updated) });
  }
);
