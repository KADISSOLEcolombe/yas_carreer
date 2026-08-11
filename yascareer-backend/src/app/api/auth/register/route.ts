import { Prisma } from "@prisma/client";
import { handler, ok, conflict } from "@/server/http";
import { readJson } from "@/server/body";
import { registerValidator } from "@/server/validators";
import { hashPassword, issueToken } from "@/server/auth";
import { serializeUser } from "@/server/serialize";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Public registration — creates a candidat account. Required before applying
// to an offer (see the apply flow on the offer detail page).
export const POST = handler(async (req) => {
  const payload = registerValidator.parse(await readJson(req));
  const email = payload.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict("Cet email est déjà utilisé.");

  let user;
  try {
    user = await prisma.user.create({
      data: {
        fullName: payload.fullName,
        email,
        password: await hashPassword(payload.password),
        phone: payload.phone || null,
        role: "candidat",
        isActive: true,
        mustChangePassword: false,
      },
    });
  } catch (error) {
    // Deux inscriptions concurrentes avec le même email peuvent toutes deux
    // franchir le `findUnique` ci-dessus avant qu'aucune n'ait encore écrit
    // en base — la contrainte unique tranche alors à la création. On
    // convertit cette erreur brute Prisma en même message propre 409 plutôt
    // que de laisser remonter un 500 générique.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw conflict("Cet email est déjà utilisé.");
    }
    throw error;
  }
  await prisma.candidateProfile.create({ data: { userId: user.id } });

  const token = issueToken(user);
  return ok({
    user: serializeUser(user),
    token,
    message: "Compte créé avec succès. Bienvenue sur YasCareer !",
  });
});
