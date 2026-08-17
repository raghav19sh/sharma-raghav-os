import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPublicTimeline } from "@/lib/data/timeline";
import { EmptyState } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Timeline OS", description: "Research, projects and milestones over time." };
export const revalidate = 60;

export default async function TimelinePage() {
  const supabase = createServerSupabaseClient();
  const events = await getPublicTimeline(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><Clock size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">Timeline OS</h1>
          <p className="text-[14px] text-text-2 mt-0.5">The platform&apos;s history — research, projects, and milestones over time.</p>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState title="Timeline is empty" text="Add milestones in Admin OS to populate this." />
      ) : (
        <ol className="flex flex-col">
          {events.map((e, i) => (
            <li key={e.id} className="flex gap-[18px]">
              <div className="w-14 shrink-0 text-[13px] font-semibold text-text-2 pt-2.5">{e.year_label}</div>
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-[34px] h-[34px] rounded-full border-[1.5px] flex items-center justify-center text-[12px] font-semibold ${e.is_current ? "bg-lavender border-lavender text-on-lavender" : "bg-surface border-border-strong text-text-2"}`}>
                  {i + 1}
                </div>
                {i < events.length - 1 && <div className="w-px flex-1 bg-border-strong min-h-[28px]" />}
              </div>
              <div className="pb-6 pt-1.5">
                <div className="text-[14.5px] font-semibold text-text-1 mb-1">{e.title}</div>
                {e.body && <div className="text-[13px] text-text-2 leading-relaxed max-w-lg">{e.body}</div>}
                {e.event_date && <div className="text-[11px] text-text-2 mt-1">{formatDate(e.event_date)}</div>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
