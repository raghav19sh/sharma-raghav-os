import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublishedContent } from "@/lib/data/content";
import { ResearchOS } from "@/components/research/ResearchOS";
import type { Research } from "@/types/database";

export const metadata: Metadata = {
  title: "Research OS",
  description: "A visual research and knowledge system.",
};
export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await getPublishedContent<Research>(supabase, "research", { pageSize: 50 });
  return <ResearchOS items={data} />;
}
