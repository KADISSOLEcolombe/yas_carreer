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
  /** Ollama OpenAI-compatible endpoint, e.g. http://localhost:11434/v1 */
  get OLLAMA_URL() {
    return process.env.OLLAMA_URL || undefined;
  },
  /** Optional bearer token if Ollama sits behind an auth proxy. */
  get OLLAMA_API_KEY() {
    return process.env.OLLAMA_API_KEY || undefined;
  },
  /** Model tag pulled into Ollama (e.g. `ollama pull llama3.1`). */
  get OLLAMA_MODEL() {
    return process.env.OLLAMA_MODEL || "llama3.1";
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
