import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getContentBySlug } from "@/lib/data/content";
import { ContentDetail } from "@/components/content/ContentDetail";
import type { JournalEntry } from "@/types/database";

export const revalidate = 60;

async function getEntry(slug: string) {
  const supabase = createServerSupabaseClient();
  // Same safety note as journal/page.tsx — this can only ever return a
  // public, published entry; private/unlisted entries 404 here by design.
  return getContentBySlug<JournalEntry>(supabase, "journal_entries", slug);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await getEntry(params.slug);
  if (!item) return { title: "Not found" };
  return { title: item.title, description: item.summary ?? undefined };
}

export default async function JournalDetailPage({ params }: { params: { slug: string } }) {
  const item = await getEntry(params.slug);
  if (!item) notFound();
  return <ContentDetail item={item} />;
}
