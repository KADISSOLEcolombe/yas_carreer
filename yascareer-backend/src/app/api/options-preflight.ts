// Shared OPTIONS preflight responder. Import and re-export from a route if a
// specific endpoint needs to answer CORS preflight explicitly. The global
// headers in next.config.ts already attach the Access-Control-* headers.
export function OPTIONS() {
  return new Response(null, { status: 204 });
}
