import type { Metadata } from "next";
import { Cpu } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublishedContent } from "@/lib/data/content";
import { ContentList } from "@/components/content/ContentList";

export const metadata: Metadata = { title: "Engineering OS", description: "Projects, architecture, releases and deployments." };
export const revalidate = 60;

export default async function EngineeringPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await getPublishedContent(supabase, "projects", { pageSize: 50 });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><Cpu size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">Engineering OS</h1>
          <p className="text-[14px] text-text-2 mt-0.5">Projects, architecture, releases and deployments.</p>
        </div>
      </div>
      <ContentList basePath="/engineering" items={data} icon={Cpu} emptyTitle="No public projects yet" emptyText="Projects appear here once published and marked public in Admin OS." />
    </div>
  );
}
