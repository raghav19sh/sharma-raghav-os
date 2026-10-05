import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "research";
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Research title is required." }, { status: 400 });
  const row = {
    slug: typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(title),
    title,
    kind: typeof body.kind === "string" ? body.kind.trim() || "article" : "article",
    summary: typeof body.summary === "string" ? body.summary.trim() || null : null,
    body: typeof body.body === "string" ? body.body.trim() || null : null,
    status: typeof body.status === "string" ? body.status.trim() || "published" : "published",
    read_time_minutes: typeof body.read_time_minutes === "number" ? Math.max(1, Math.round(body.read_time_minutes)) : null,
    published_at: typeof body.published_at === "string" && body.published_at ? body.published_at : new Date().toISOString(),
    visibility: "public",
  };
  try {
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase.from("research").insert(row).select().single();
    if (error) throw error;
    return NextResponse.json({ research: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Research entry could not be saved." }, { status: 500 });
  }
}