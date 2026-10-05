import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, createAdminToken, passwordMatches } from "@/lib/admin-auth";

export const runtime = "nodejs";
const attempts = new Map<string, { count: number; resetAt: number }>();

function allowed(ip: string) {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt <= now) { attempts.set(ip, { count: 1, resetAt: now + 60_000 }); return true; }
  if (current.count >= 8) return false;
  current.count += 1;
  return true;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allowed(ip)) return NextResponse.json({ error: "Too many login attempts. Try again shortly." }, { status: 429 });

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Admin credentials are not configured on the server." }, { status: 503 });
  }
  if (!passwordMatches(password)) return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });

  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_COOKIE,
    value: createAdminToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return NextResponse.json({ ok: true });
}