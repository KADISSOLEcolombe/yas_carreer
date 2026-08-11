import { handler, ok, badRequest } from "@/server/http";
import { requireUser, hashPassword, verifyPassword } from "@/server/auth";
import { readJson } from "@/server/body";
import { changePasswordValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { serializeUser } from "@/server/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async (req) => {
  const user = await requireUser(req);
  const payload = changePasswordValidator.parse(await readJson(req));

  if (!user.mustChangePassword) {
    if (!payload.currentPassword) {
      throw badRequest("Mot de passe actuel requis");
    }
    const valid = await verifyPassword(payload.currentPassword, user.password);
    if (!valid) throw badRequest("Mot de passe actuel incorrect");
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(payload.password),
      mustChangePassword: false,
    },
  });

  return ok({ user: serializeUser(updated), message: "Mot de passe mis à jour" });
});
