import { handler, ok, forbidden } from "@/server/http";
import { readJson } from "@/server/body";
import { loginValidator } from "@/server/validators";
import { verifyCredentials, issueToken } from "@/server/auth";
import { serializeUser } from "@/server/serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async (req) => {
  const { email, password } = loginValidator.parse(await readJson(req));
  const user = await verifyCredentials(email, password);
  if (!user.isActive) throw forbidden("Compte désactivé");
  const token = issueToken(user);
  return ok({
    user: serializeUser(user),
    token,
    mustChangePassword: Boolean(user.mustChangePassword),
  });
});
