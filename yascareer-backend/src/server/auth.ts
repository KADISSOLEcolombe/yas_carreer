import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";
import { prisma } from "@/server/db";
import { env } from "@/server/env";
import { forbidden, unauthorized } from "@/server/http";
import type { UserRole } from "@/server/domain";

const JWT_EXPIRES_IN = "30d";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function issueToken(user: Pick<User, "id">): string {
  return jwt.sign({ sub: String(user.id) }, env.APP_KEY, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

/** Verifies credentials the way Lucid's withAuthFinder did. */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user || !(await verifyPassword(password, user.password))) {
    throw unauthorized("Identifiants invalides");
  }
  return user;
}

/** Returns the user if a valid token is present, otherwise null (silent auth). */
export async function currentUser(req: Request): Promise<User | null> {
  const token = bearerToken(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.APP_KEY) as { sub?: string };
    if (!payload.sub) return null;
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
    });
    if (!user || !user.isActive) return null;
    return user;
  } catch {
    return null;
  }
}

/** Requires an authenticated, active user — throws 401 otherwise. */
export async function requireUser(req: Request): Promise<User> {
  const user = await currentUser(req);
  if (!user) throw unauthorized();
  return user;
}

/** Requires an authenticated user with one of the given roles. */
export async function requireRole(
  req: Request,
  roles: UserRole[]
): Promise<User> {
  const user = await requireUser(req);
  if (!roles.includes(user.role as UserRole)) {
    throw forbidden("Vous n’avez pas les droits nécessaires");
  }
  return user;
}

export function isStaff(user: Pick<User, "role">): boolean {
  return user.role === "admin" || user.role === "rh";
}
