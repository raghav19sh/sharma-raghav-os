import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "project";
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Project title is required." }, { status: 400 });
  const row = {
    slug: typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(title),
    title,
    kind: typeof body.kind === "string" ? body.kind.trim() || null : null,
    summary: typeof body.summary === "string" ? body.summary.trim() || null : null,
    body: typeof body.body === "string" ? body.body.trim() || null : null,
    repo_url: typeof body.repo_url === "string" ? body.repo_url.trim() || null : null,
    live_url: typeof body.live_url === "string" ? body.live_url.trim() || null : null,
    stack: Array.isArray(body.stack) ? body.stack.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [],
    status: typeof body.status === "string" ? body.status.trim() || "active" : "active",
    started_at: typeof body.started_at === "string" && body.started_at ? body.started_at : null,
    visibility: "public",
  };
  try {
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase.from("projects").insert(row).select().single();
    if (error) throw error;
    return NextResponse.json({ project: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Project could not be saved." }, { status: 500 });
  }
}