import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getContentBySlug } from "@/lib/data/content";
import { ContentDetail } from "@/components/content/ContentDetail";
import type { Project } from "@/types/database";

export const revalidate = 60;

async function getProject(slug: string) {
  const supabase = await createServerSupabaseClient();
  return getContentBySlug<Project>(supabase, "projects", slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getProject(slug);
  if (!item) return { title: "Not found" };
  return { title: item.title, description: item.summary ?? undefined };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getProject(slug);
  if (!item) notFound();
  return <ContentDetail item={item} />;
}
