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
  const download =
    request.nextUrl.searchParams.get("download") === "true";

  if (!id) {
    return NextResponse.json(
      { error: "Research ID is required" },
      { status: 400 }
    );
  }

  // Normal server client: respects the user's session and RLS.
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

  // Only publicly released research can expose its PDF.
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
   * The Storage bucket is private.
   *
   * The service-role client is used ONLY on the server to generate
   * a temporary signed URL. The service-role key is never exposed
   * to the browser.
   */
  const storageAdmin = createServiceRoleClient();

  const { data, error: signedUrlError } =
    await storageAdmin.storage
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
    // Detailed information stays in server/Vercel logs only.
    console.error(
      "Research PDF signed URL generation failed:",
      {
        researchId: research.id,
        path: research.pdf_storage_path,
        error:
          signedUrlError?.message ??
          "No signed URL returned",
      }
    );

    // Never expose internal Storage details to visitors.
    return NextResponse.json(
      { error: "Unable to open PDF" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(data.signedUrl);
}