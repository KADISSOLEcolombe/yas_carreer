/**
 * Central env access. APP_KEY is used both for JWT signing and for the
 * HMAC account-activation tokens (matching the original AdonisJS behaviour).
 */
export const env = {
  get APP_KEY() {
    return process.env.APP_KEY || "dev-insecure-app-key-change-me";
  },
  get FRONTEND_URL() {
    return process.env.FRONTEND_URL || "http://localhost:3000";
  },
  /** RodiumAI secret key (`rd_sk_…`). Absent → fallback heuristique. */
  get RODIUMAI_API_KEY() {
    return process.env.RODIUMAI_API_KEY || undefined;
  },
  /** OpenAI-compatible base URL. Default: https://api.rodiumai.io/v1 */
  get RODIUMAI_BASE_URL() {
    return process.env.RODIUMAI_BASE_URL || "https://api.rodiumai.io/v1";
  },
  /**
   * Provider-scoped model id, e.g. `openai/gpt-4o-mini`, `rodiumai/smart`.
   * Catalogue: GET https://api.rodiumai.io/v1/models
   */
  get RODIUMAI_MODEL() {
    return process.env.RODIUMAI_MODEL || "openai/gpt-4o-mini";
  },
  get TAVILY_API_KEY() {
    return process.env.TAVILY_API_KEY || undefined;
  },
  get SERPER_API_KEY() {
    return process.env.SERPER_API_KEY || undefined;
  },
  get SMTP_HOST() {
    return process.env.SMTP_HOST || undefined;
  },
  get SMTP_PORT() {
    return Number(process.env.SMTP_PORT) || 587;
  },
  get SMTP_USERNAME() {
    return process.env.SMTP_USERNAME || undefined;
  },
  get SMTP_PASSWORD() {
    return process.env.SMTP_PASSWORD || undefined;
  },
  get SMTP_FROM() {
    return process.env.SMTP_FROM || "YasCareer <no-reply@yascareer.tg>";
  },
};
