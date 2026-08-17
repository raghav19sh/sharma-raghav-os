import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getContentBySlug } from "@/lib/data/content";
import type { Research } from "@/types/database";

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient();
  try {
    const item = await getContentBySlug<Research>(supabase, "research", params.slug);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: item });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
