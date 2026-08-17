import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getContentBySlug } from "@/lib/data/content";
import { ContentDetail } from "@/components/content/ContentDetail";
import type { Article } from "@/types/database";

export const revalidate = 60;

async function getArticle(slug: string) {
  const supabase = await createServerSupabaseClient();
  return getContentBySlug<Article>(supabase, "articles", slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getArticle(slug);
  if (!item) return { title: "Not found" };
  return { title: item.title, description: item.summary ?? undefined, openGraph: { type: "article" } };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getArticle(slug);
  if (!item) notFound();
  return <ContentDetail item={item} />;
}
