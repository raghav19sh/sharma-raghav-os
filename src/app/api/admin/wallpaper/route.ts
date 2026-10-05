import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceSupabaseClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let value = "";
  try {
    const body = await request.json();
    value = typeof body?.url === "string" ? body.url.trim() : "";
  } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!value || value.length > 2000 || !/^(https?:\/\/|\/)/i.test(value)) {
    return NextResponse.json({ error: "Use a valid HTTPS image URL or a local path such as /wallpaper.svg." }, { status: 400 });
  }
  try {
    const supabase = createServiceSupabaseClient();
    const { error } = await supabase.from("site_settings").upsert({ key: "wallpaper_url", value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
    return NextResponse.json({ ok: true, wallpaperUrl: value });
  } catch { return NextResponse.json({ error: "Wallpaper setting could not be saved." }, { status: 500 }); }
}