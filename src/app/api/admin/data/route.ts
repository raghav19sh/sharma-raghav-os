import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const supabase = createServiceSupabaseClient();
    const [profileResult, projectsResult, researchResult, wallpaperResult] = await Promise.all([
      supabase.from("profiles").select("display_name,headline,bio,location,email_public,linkedin_url,github_url").maybeSingle(),
      supabase.from("projects").select("id,slug,title,status").order("created_at", { ascending: false }).range(0, 49),
      supabase.from("research").select("id,slug,title,status").order("created_at", { ascending: false }).range(0, 49),
      supabase.from("site_settings").select("value").eq("key", "wallpaper_url").maybeSingle(),
    ]);
    const firstError = profileResult.error || projectsResult.error || researchResult.error || wallpaperResult.error;
    if (firstError) throw firstError;
    return NextResponse.json({
      profile: profileResult.data,
      projects: projectsResult.data || [],
      research: researchResult.data || [],
      wallpaperUrl: wallpaperResult.data?.value || "/wallpaper.svg",
    });
  } catch {
    return NextResponse.json({ error: "Admin data could not be loaded. Check the Supabase service key and site_settings table." }, { status: 500 });
  }
}