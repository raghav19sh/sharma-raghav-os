import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  try {
    const supabase = createServiceSupabaseClient();
    const { data: existing, error: existingError } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
    if (existingError) throw existingError;
    if (!existing?.id) return NextResponse.json({ error: "No profile row exists yet." }, { status: 404 });
    const payload = {
      display_name: typeof body.display_name === "string" ? body.display_name.trim() : "",
      headline: typeof body.headline === "string" ? body.headline.trim() || null : null,
      bio: typeof body.bio === "string" ? body.bio.trim() || null : null,
      location: typeof body.location === "string" ? body.location.trim() || null : null,
      email_public: typeof body.email_public === "string" ? body.email_public.trim() || null : null,
      linkedin_url: typeof body.linkedin_url === "string" ? body.linkedin_url.trim() || null : null,
      github_url: typeof body.github_url === "string" ? body.github_url.trim() || null : null,
    };
    const { data, error } = await supabase.from("profiles").update(payload).eq("id", existing.id).select().single();
    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Profile could not be saved." }, { status: 500 });
  }
}