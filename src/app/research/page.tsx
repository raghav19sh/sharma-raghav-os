import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublishedContent } from "@/lib/data/content";
import { ContentList } from "@/components/content/ContentList";

export const metadata: Metadata = {
  title: "Research OS",
  description: "Papers, drafts, references, and the citation graph.",
};
export const revalidate = 60;

export default async function ResearchPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await getPublishedContent(supabase, "research", { pageSize: 50 });

  return (
    <div className="flex flex-col gap-6">
      <PageHeading />
      <ContentList
        basePath="/research"
        items={data}
        icon={Compass}
        emptyTitle="Research archive is empty"
        emptyText="Begin by publishing your first paper in Admin OS."
      />
    </div>
  );
}

function PageHeading() {
  return (
    <div className="flex items-start gap-3.5">
      <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0">
        <Compass size={20} />
      </div>
      <div>
        <h1 className="text-[24px] font-semibold text-text-1">Research OS</h1>
        <p className="text-[14px] text-text-2 mt-0.5">Papers, drafts, references and citation graph.</p>
      </div>
    </div>
  );
}
