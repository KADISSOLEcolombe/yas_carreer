import { handler, ok } from "@/server/http";
import { requireUser } from "@/server/auth";
import { readJson } from "@/server/body";
import { updateProfileValidator } from "@/server/validators";
import { prisma } from "@/server/db";
import { serializeUser } from "@/server/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const PATCH = handler(async (req) => {
  const user = await requireUser(req);
  const payload = updateProfileValidator.parse(await readJson(req));

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(payload.fullName !== undefined ? { fullName: payload.fullName } : {}),
      ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
    },
  });

  let profile = await prisma.candidateProfile.findUnique({
    where: { userId: user.id },
  });
  profile = await prisma.candidateProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      bio: payload.bio ?? null,
      skills: payload.skills ?? null,
      anneesEtude: payload.anneesEtude ?? null,
      ville: payload.ville ?? null,
      quartier: payload.quartier ?? null,
    },
    update: {
      ...(payload.bio !== undefined ? { bio: payload.bio } : {}),
      ...(payload.skills !== undefined ? { skills: payload.skills } : {}),
      ...(payload.anneesEtude !== undefined ? { anneesEtude: payload.anneesEtude } : {}),
      ...(payload.ville !== undefined ? { ville: payload.ville } : {}),
      ...(payload.quartier !== undefined ? { quartier: payload.quartier } : {}),
    },
  });

  return ok({
    user: serializeUser(updated),
    profile,
    updatedAt: new Date().toISOString(),
  });
});
