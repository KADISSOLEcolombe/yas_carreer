import { handler, raw } from "@/server/http";
import { requireUser } from "@/server/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// JWTs are stateless; logout is client-side (token discard). We still require
// a valid token so the call behaves like the original endpoint.
export const POST = handler(async (req) => {
  await requireUser(req);
  return raw({ message: "Déconnexion réussie" });
});
