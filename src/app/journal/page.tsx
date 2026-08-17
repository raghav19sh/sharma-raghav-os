import type { Metadata } from "next";
import { Book } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublishedContent } from "@/lib/data/content";
import { ContentList } from "@/components/content/ContentList";

export const metadata: Metadata = { title: "Journal OS", description: "Daily logs and public reflections." };
export const revalidate = 60;

export default async function JournalPage() {
  const supabase = await createServerSupabaseClient();
  // getPublishedContent filters visibility='public' AND status='published'
  // in the SQL query itself (lib/data/content.ts), and RLS enforces the
  // same rule again at the database layer regardless of what this code
  // does — private/unlisted entries cannot reach this page even if this
  // function had a bug. See §21 and §11 of PLAN.md.
  const { data } = await getPublishedContent(supabase, "journal_entries", { pageSize: 50 });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><Book size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">Journal OS</h1>
          <p className="text-[14px] text-text-2 mt-0.5">Daily logs and public reflections — private entries are never shown here.</p>
        </div>
      </div>
      <ContentList basePath="/journal" items={data} icon={Book} emptyTitle="No public journal entries yet" emptyText="Entries appear here once written and explicitly marked public in Admin OS." />
    </div>
  );
}
