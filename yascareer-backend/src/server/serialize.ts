import type { User } from "@prisma/client";

export function computeInitials(user: Pick<User, "fullName" | "email">): string {
  const source = user.fullName ? user.fullName.split(" ") : user.email.split("@");
  const [first, last] = source;
  if (first && last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }
  return `${(first || "").slice(0, 2)}`.toUpperCase();
}

/** Mirrors UserTransformer: public user shape with initials, no password. */
export function serializeUser(user: User) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phone: user.phone,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    departementId: user.departementId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    initials: computeInitials(user),
  };
}

const USER_CORE_FIELDS = new Set([
  "id",
  "fullName",
  "email",
  "password",
  "role",
  "phone",
  "isActive",
  "mustChangePassword",
  "departementId",
  "createdAt",
  "updatedAt",
]);

/** Deeply strips `password` from any nested `user` relation in a payload. */
export function sanitize<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => sanitize(v)) as unknown as T;
  }
  if (value instanceof Date) {
    return value;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key === "password") continue;
      if (
        key === "user" &&
        val &&
        typeof val === "object" &&
        "email" in (val as Record<string, unknown>)
      ) {
        // Base user shape strips the password and adds `initials` ; toute
        // relation supplémentaire explicitement `include`e par la route
        // (ex. `profile`) est conservée et sanitizée récursivement plutôt
        // que silencieusement perdue.
        const extra: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
          if (!USER_CORE_FIELDS.has(k)) extra[k] = sanitize(v);
        }
        out[key] = { ...serializeUser(val as User), ...extra };
      } else {
        out[key] = sanitize(val);
      }
    }
    return out as T;
  }
  return value;
}
