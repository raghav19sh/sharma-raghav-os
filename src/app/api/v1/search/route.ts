import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { searchQuerySchema } from "@/lib/validation/content";

const SEARCHABLE: { table: "research" | "projects" | "articles"; sub: string; href: (slug: string) => string }[] = [
  { table: "research", sub: "Research OS", href: (s) => `/research/${s}` },
  { table: "projects", sub: "Engineering OS", href: (s) => `/engineering/${s}` },
  { table: "articles", sub: "Knowledge OS", href: (s) => `/knowledge/${s}` },
];

export async function GET(request: NextRequest) {
  const parsed = searchQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing or invalid `q`" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { q } = parsed.data;

  try {
    const results = await Promise.all(
      SEARCHABLE.map(async ({ table, sub, href }) => {
        let query = supabase.from(table).select("title, slug").eq("visibility", "public").limit(6);
        if (table !== "projects") query = query.eq("status", "published");
        const { data } = await query.textSearch("search_vector", q, { type: "websearch" });
        return (data ?? []).map((row) => ({ title: row.title, sub, href: href(row.slug) }));
      })
    );

    return NextResponse.json({ data: results.flat().slice(0, 20) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Search failed" }, { status: 500 });
  }
}
