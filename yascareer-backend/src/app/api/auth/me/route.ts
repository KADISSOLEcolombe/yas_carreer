import { handler, ok } from "@/server/http";
import { requireUser } from "@/server/auth";
import { prisma } from "@/server/db";
import { serializeUser } from "@/server/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req) => {
  const user = await requireUser(req);
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: user.id },
  });
  return ok({ user: serializeUser(user), profile: profile || null });
});
