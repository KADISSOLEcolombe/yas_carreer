import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Le frontend et ce backend sont deux origines distinctes (ports différents en
// dev, sous-domaines différents en prod) — tout appel authentifié envoie un
// header Authorization, ce qui déclenche systématiquement un preflight CORS
// (OPTIONS) côté navigateur. Aucune route n'exporte de handler OPTIONS, donc
// Next répondait 400 à ce preflight et le navigateur bloquait l'appel réel.
// Ce middleware répond au preflight avant d'atteindre les routes.
const allowedOrigin = process.env.FRONTEND_URL || "*";

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
