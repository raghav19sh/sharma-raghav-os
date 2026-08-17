import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getContentBySlug } from "@/lib/data/content";
import { getTagsFor, getRelatedContent } from "@/lib/data/tags";
import { ContentDetail } from "@/components/content/ContentDetail";
import type { Research } from "@/types/database";

export const revalidate = 60;

async function getResearch(slug: string) {
  const supabase = await createServerSupabaseClient();
  return getContentBySlug<Research>(supabase, "research", slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getResearch(slug);
  if (!item) return { title: "Not found" };
  return {
    title: item.title,
    description: item.summary ?? undefined,
    openGraph: { title: item.title, description: item.summary ?? undefined, type: "article" },
  };
}

// Maps a taggables row back to a real, browsable href — extend this if you
// add tagging to books/courses/snippets/media later.
const HREF_BY_TABLE: Record<string, (id: string, slug?: string) => string> = {
  research: (_id, slug) => `/research/${slug}`,
  projects: (_id, slug) => `/engineering/${slug}`,
  articles: (_id, slug) => `/knowledge/${slug}`,
  journal_entries: (_id, slug) => `/journal/${slug}`,
};

export default async function ResearchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getResearch(slug);
  if (!item) notFound();

  const supabase = await createServerSupabaseClient();
  const [tags, relatedRaw] = await Promise.all([
    getTagsFor(supabase, "research", item.id),
    getRelatedContent(supabase, "research", item.id),
  ]);

  // Related rows only give us (table, id) — one more real lookup to get a
  // title + slug for display, not a fabricated label.
  const related = (
    await Promise.all(
      relatedRaw.map(async (r) => {
        const { data } = await supabase.from(r.taggable_table).select("title, slug").eq("id", r.taggable_id).maybeSingle();
        if (!data) return null;
        const hrefFn = HREF_BY_TABLE[r.taggable_table];
        return hrefFn ? { table: r.taggable_table, id: r.taggable_id, title: data.title, href: hrefFn(r.taggable_id, data.slug) } : null;
      })
    )
  ).filter((r): r is NonNullable<typeof r> => r !== null);
return (
  <div className="flex flex-col gap-6">
    <ContentDetail item={item} tags={tags} related={related} />

    {item.pdf_storage_path && (
      <div className="flex gap-3">
        <a
          href={`/api/v1/research/pdf?id=${item.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-lavender text-on-lavender text-[13px] font-medium px-4 py-2.5 rounded-btn"
        >
          View PDF
        </a>

        <a
          href={`/api/v1/research/pdf?id=${item.id}&download=true`}
          className="border border-border text-text-1 text-[13px] font-medium px-4 py-2.5 rounded-btn"
        >
          Download PDF
        </a>
      </div>
    )}
  </div>
);
}
