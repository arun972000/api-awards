import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "api_awards_admin";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(value: string) {
  return createHmac("sha256", requireEnv("ADMIN_SESSION_SECRET"))
    .update(value)
    .digest("base64url");
}

export function verifyAdminCredentials(username: string, password: string) {
  return (
    safeEqual(username, requireEnv("ADMIN_USERNAME")) &&
    safeEqual(password, requireEnv("ADMIN_PASSWORD"))
  );
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  const payload = `v1.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSession(value: string | undefined) {
  if (!value) return false;

  const [version, expiresAt, signature, ...extra] = value.split(".");
  if (version !== "v1" || !expiresAt || !signature || extra.length > 0) return false;

  const expiration = Number(expiresAt);
  if (!Number.isSafeInteger(expiration) || expiration <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  return safeEqual(signature, sign(`${version}.${expiresAt}`));
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
    priority: "high" as const,
  };
}
