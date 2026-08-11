import { handler, ok, badRequest, notFound, forbidden } from "@/server/http";
import { readJson } from "@/server/body";
import { activateAccountValidator } from "@/server/validators";
import { AccountActivationService } from "@/server/services/account-activation";
import { NotificationService } from "@/server/services/notification";
import { hashPassword, issueToken } from "@/server/auth";
import { prisma } from "@/server/db";
import { serializeUser } from "@/server/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async (req) => {
  const payload = activateAccountValidator.parse(await readJson(req));
  const decoded = AccountActivationService.verifyToken(payload.token);
  if (!decoded) throw badRequest("Lien d’activation invalide ou expiré");

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || user.role !== "candidat") throw notFound("Compte introuvable");
  if (!user.isActive) throw forbidden("Compte désactivé");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(payload.password),
      mustChangePassword: false,
    },
  });

  await NotificationService.notify(
    updated.id,
    "account_activated",
    "Votre espace YasCareer est activé. Vous pouvez suivre vos candidatures et entretiens."
  );

  const token = issueToken(updated);
  return ok({
    user: serializeUser(updated),
    token,
    message: "Compte activé. Bienvenue sur YasCareer !",
  });
});
