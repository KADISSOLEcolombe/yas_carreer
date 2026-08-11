import { badRequest } from "@/server/http";

/** Parse a JSON body, returning {} for empty bodies. */
export async function readJson(req: Request): Promise<unknown> {
  const text = await req.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw badRequest("Corps de requête JSON invalide");
  }
}

/** Read query params as a plain object. */
export function query(req: Request): Record<string, string> {
  const url = new URL(req.url);
  const out: Record<string, string> = {};
  url.searchParams.forEach((v, k) => (out[k] = v));
  return out;
}

export function toBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}
