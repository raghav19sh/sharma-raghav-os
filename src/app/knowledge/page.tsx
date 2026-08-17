import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublishedContent } from "@/lib/data/content";
import { ContentList } from "@/components/content/ContentList";

export const metadata: Metadata = { title: "Knowledge OS", description: "Articles, essays, case studies and notes." };
export const revalidate = 60;

export default async function KnowledgePage() {
  const supabase = createServerSupabaseClient();
  const { data } = await getPublishedContent(supabase, "articles", { pageSize: 50 });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><Layers size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">Knowledge OS</h1>
          <p className="text-[14px] text-text-2 mt-0.5">Articles, essays, case studies and notes.</p>
        </div>
      </div>
      <ContentList basePath="/knowledge" items={data} icon={Layers} emptyTitle="Knowledge base is empty" emptyText="Begin by publishing your first article in Admin OS." />
    </div>
  );
}
