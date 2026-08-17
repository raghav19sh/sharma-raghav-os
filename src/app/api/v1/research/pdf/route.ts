import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const download = request.nextUrl.searchParams.get("download") === "true";

  if (!id) {
    return NextResponse.json({ error: "Research ID is required" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { data: research, error } = await supabase
    .from("research")
    .select("id, pdf_storage_path, pdf_filename, pdf_mime_type, visibility, status")
    .eq("id", id)
    .single();

  if (error || !research) {
    return NextResponse.json({ error: "Research not found" }, { status: 404 });
  }

  if (!research.pdf_storage_path) {
    return NextResponse.json({ error: "No PDF attached to this research" }, { status: 404 });
  }

  const isPublic =
    research.visibility === "public" &&
    ["preprint", "submitted", "under_review", "accepted", "published"].includes(research.status);

  if (!isPublic) {
    return NextResponse.json({ error: "PDF is not publicly available" }, { status: 403 });
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from("research-pdfs")
    .createSignedUrl(research.pdf_storage_path, 300, {
      download: download ? research.pdf_filename ?? true : false,
    });

  if (signedUrlError || !data?.signedUrl) {
    return NextResponse.json({ error: "Unable to generate PDF URL" }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}