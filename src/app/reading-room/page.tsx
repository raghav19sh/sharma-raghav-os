import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Reading Room", description: "Books, papers, highlights and quotes." };
export const revalidate = 60;

export default async function ReadingRoomPage() {
  const supabase = createServerSupabaseClient();
  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("visibility", "public")
    .order("status", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><BookOpen size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">Reading Room</h1>
          <p className="text-[14px] text-text-2 mt-0.5">Books and papers, with real reading progress.</p>
        </div>
      </div>

      {!books || books.length === 0 ? (
        <EmptyState title="The reading list is empty" text="Books appear here once added in Admin OS." />
      ) : (
        <div className="grid grid-cols-2 gap-3.5 max-[1024px]:grid-cols-1">
          {books.map((b) => (
            <div key={b.id} className="bg-surface border border-border rounded-card p-[18px] flex flex-col gap-2">
              <div className="text-[15px] font-semibold text-text-1">{b.title}</div>
              {b.author && <div className="text-[12px] text-text-2">{b.author}</div>}
              <div className="h-1.5 bg-bg rounded-full overflow-hidden mt-1">
                <div className="h-full bg-lavender rounded-full" style={{ width: `${b.progress_percent}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11.5px] text-text-2">
                <span className="capitalize">{b.status.replace("_", " ")}</span>
                <span>{b.progress_percent}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
