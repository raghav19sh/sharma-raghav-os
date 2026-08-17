import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server-admin";

const PUBLIC_RESEARCH_STATUSES = [
  "preprint",
  "submitted",
  "under_review",
  "accepted",
  "published",
];

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const download = request.nextUrl.searchParams.get("download") === "true";

  if (!id) {
    return NextResponse.json(
      { error: "Research ID is required" },
      { status: 400 }
    );
  }

  /*
   * Use the normal server client for the research lookup.
   * This keeps the normal application's RLS/session behavior intact.
   */
  const supabase = await createServerSupabaseClient();

  const { data: research, error } = await supabase
    .from("research")
    .select(
      "id, pdf_storage_path, pdf_filename, pdf_mime_type, visibility, status"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !research) {
    return NextResponse.json(
      { error: "Research not found" },
      { status: 404 }
    );
  }

  if (!research.pdf_storage_path) {
    return NextResponse.json(
      { error: "No PDF attached to this research" },
      { status: 404 }
    );
  }

  /*
   * A PDF is publicly accessible only when the research itself
   * is public and has reached a public research status.
   *
   * Draft/researching/review/rejected/archived remain inaccessible
   * through the public PDF endpoint.
   */
  const isPublic =
    research.visibility === "public" &&
    PUBLIC_RESEARCH_STATUSES.includes(research.status);

  if (!isPublic) {
    return NextResponse.json(
      { error: "PDF is not publicly available" },
      { status: 403 }
    );
  }

  /*
   * Storage is private.
   *
   * The normal anon client can find the research record, but Storage
   * signed-URL generation is failing because of Storage RLS.
   *
   * Use the service-role client ONLY for this trusted server-side
   * operation. The service-role key never reaches the browser.
   */
  const storageAdmin = createServiceRoleClient();

  const { data, error: signedUrlError } = await storageAdmin.storage
    .from("research-pdfs")
    .createSignedUrl(
      research.pdf_storage_path,
      300,
      {
        download: download
          ? research.pdf_filename ?? true
          : false,
      }
    );

  if (signedUrlError || !data?.signedUrl) {
    /*
     * Do NOT expose Supabase's internal error, bucket name,
     * storage path, or other implementation details to visitors.
     */
    console.error("Research PDF signed URL generation failed:", {
      researchId: research.id,
      path: research.pdf_storage_path,
      error: signedUrlError?.message,
    });

    return NextResponse.json(
      { error: "Unable to open PDF" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.signedUrl);
}