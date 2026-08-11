import { handler, ok } from "@/server/http";
import { requireRole } from "@/server/auth";
import { query } from "@/server/body";
import { readJson } from "@/server/body";
import { createUserValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { serializeUser } from "@/server/serialize";
import { hashPassword } from "@/server/auth";
import { AccountActivationService } from "@/server/services/account-activation";
import { MailService } from "@/server/services/mail";
import { NotificationService } from "@/server/services/notification";
import { ActivityLogService } from "@/server/services/activity-log";
import type { UserRole } from "@/server/domain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  rh: "Ressources humaines",
  superviseur: "Superviseur",
};

// Admin: manage all accounts. RH: read-only access to the supervisor list only
// (needed to assign a supervisor when requesting availability / creating an
// Emploi record) — never the full staff directory.
export const GET = handler(async (req) => {
  const actor = await requireRole(req, ["admin", "rh"]);
  const { role } = query(req);
  const effectiveRole: UserRole | undefined =
    actor.role === "rh" ? "superviseur" : (role as UserRole | undefined);
  const users = await prisma.user.findMany({
    where: effectiveRole ? { role: effectiveRole } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return ok(users.map(serializeUser));
});

export const POST = handler(async (req) => {
  const actor = await requireRole(req, ["admin"]);
  const payload = createUserValidator.parse(await readJson(req));
  const temporaryPassword = payload.password || AccountActivationService.randomPassword(14);

  const user = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email.toLowerCase().trim(),
      password: await hashPassword(temporaryPassword),
      role: payload.role,
      phone: payload.phone || null,
      isActive: true,
      mustChangePassword: true,
    },
  });

  MailService.sendStaffInviteEmail(user, temporaryPassword, ROLE_LABELS[user.role] || user.role);

  await NotificationService.notify(
    user.id,
    "account_activated",
    "Votre compte YasCareer a été créé. Connectez-vous avec l’email reçu, puis définissez votre mot de passe."
  );

  void ActivityLogService.fromRequest(req, actor, {
    action: "user.create",
    category: "user",
    summary: `Invitation ${ROLE_LABELS[user.role] || user.role} : ${user.fullName || user.email}`,
    resourceType: "user",
    resourceId: user.id,
    metadata: { email: user.email, role: user.role },
  });

  return ok({
    user: serializeUser(user),
    message: `Compte créé. Un email avec les accès a été envoyé à ${user.email}.`,
  });
});
