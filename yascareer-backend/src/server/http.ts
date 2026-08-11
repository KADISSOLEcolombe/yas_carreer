import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Every successful YasCareer response wraps its payload as { data: ... }.
 * A handful of endpoints (logout, etc.) return message-only bodies — those are
 * returned as-is via `raw()`.
 */
export function ok<T>(data: T, init?: number | ResponseInit) {
  const responseInit =
    typeof init === "number" ? { status: init } : init;
  return NextResponse.json({ data }, responseInit);
}

export function raw<T>(body: T, init?: number | ResponseInit) {
  const responseInit = typeof init === "number" ? { status: init } : init;
  return NextResponse.json(body, responseInit);
}

/** Domain error with an HTTP status — thrown from services/handlers. */
export class HttpError extends Error {
  status: number;
  errors?: unknown;

  constructor(status: number, message: string, errors?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.errors = errors;
  }
}

// Convenience constructors mirroring AdonisJS response helpers.
export const badRequest = (message: string, errors?: unknown) =>
  new HttpError(400, message, errors);
export const unauthorized = (message = "Non authentifié") =>
  new HttpError(401, message);
export const forbidden = (message = "Accès refusé") =>
  new HttpError(403, message);
export const notFound = (message = "Ressource introuvable") =>
  new HttpError(404, message);
export const conflict = (message: string) => new HttpError(409, message);
export const gone = (message: string) => new HttpError(410, message);

/**
 * Wraps a route handler, converting thrown HttpError / ZodError into the
 * response shape the frontend `api.ts` client expects:
 *   { message: string, errors?: [{ message }] }
 */
export function handler<Ctx = unknown>(
  fn: (req: Request, ctx: Ctx) => Promise<Response> | Response
) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      return await fn(req, ctx);
    } catch (error) {
      if (error instanceof HttpError) {
        return NextResponse.json(
          { message: error.message, errors: error.errors },
          { status: error.status }
        );
      }
      if (error instanceof ZodError) {
        const first = error.issues[0];
        return NextResponse.json(
          {
            message: first?.message || "Données invalides",
            errors: error.issues.map((i) => ({
              field: i.path.join("."),
              message: i.message,
            })),
          },
          { status: 422 }
        );
      }
      console.error("[api] Unhandled error:", error);
      return NextResponse.json(
        { message: "Une erreur interne est survenue" },
        { status: 500 }
      );
    }
  };
}

/** Extract the client IP from proxy headers (best effort). */
export function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}
