import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sr-os-admin";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function getSecret() { return process.env.ADMIN_SESSION_SECRET || ""; }
function sign(payload: string) { return createHmac("sha256", getSecret()).update(payload).digest("base64url"); }

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function hashPassword(value: string) { return createHash("sha256").update(value).digest(); }

export function passwordMatches(value: string) {
  const configured = process.env.ADMIN_PASSWORD || "";
  if (!configured || !value) return false;
  return timingSafeEqual(hashPassword(value), hashPassword(configured));
}

export function createAdminToken() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(exp);
  if (!getSecret()) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return payload + "." + sign(payload);
}

export function verifyAdminToken(token: string | undefined) {
  if (!token || !getSecret()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, sign(payload));
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
}