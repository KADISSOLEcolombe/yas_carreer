import { handler, ok, notFound, badRequest } from "@/server/http";
import { requireRole } from "@/server/auth";
import { readJson } from "@/server/body";
import { updateRoleValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { serializeUser } from "@/server/serialize";
import { ActivityLogService } from "@/server/services/activity-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const PATCH = handler(
  async (req, ctx: { params: Promise<{ id: string }> }) => {
    const actor = await requireRole(req, ["admin"]);
    const { id } = await ctx.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) throw notFound("Utilisateur introuvable");

    const { role } = updateRoleValidator.parse(await readJson(req));
    const previous = user.role;
    // role enum already excludes candidat; guard kept for parity
    if ((role as string) === "candidat") {
      throw badRequest("Les comptes candidats sont créés via les candidatures, pas par l’admin.");
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role },
    });

    void ActivityLogService.fromRequest(req, actor, {
      action: "user.role_change",
      category: "user",
      summary: `Changement de rôle pour ${user.fullName || user.email} : ${previous} → ${role}`,
      resourceType: "user",
      resourceId: user.id,
      metadata: { from: previous, to: role, email: user.email },
    });

    return ok({ user: serializeUser(updated) });
  }
);
