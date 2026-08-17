import type { Metadata } from "next";
import { Folder } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Developer Workspace", description: "Snippets and dev notes." };
export const revalidate = 60;

export default async function DeveloperWorkspacePage() {
  const supabase = await createServerSupabaseClient();
  const { data: snippets } = await supabase
    .from("snippets")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><Folder size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">Developer Workspace</h1>
          <p className="text-[14px] text-text-2 mt-0.5">Snippets and dev notes worth sharing.</p>
        </div>
      </div>

      {!snippets || snippets.length === 0 ? (
        <EmptyState title="No snippets shared yet" text="Add snippets in Admin OS." />
      ) : (
        <div className="flex flex-col gap-3.5">
          {snippets.map((s) => (
            <div key={s.id} className="bg-surface border border-border rounded-card p-[18px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[15px] font-semibold text-text-1">{s.title}</span>
                {s.language && <span className="text-[10.5px] text-text-2 bg-bg border border-border px-2 py-0.5 rounded-md">{s.language}</span>}
              </div>
              {s.summary && <p className="text-[13px] text-text-2 mb-3">{s.summary}</p>}
              {s.code && <pre className="bg-bg border border-border rounded-[10px] px-3.5 py-3 text-[12px] font-mono text-text-1 overflow-x-auto">{s.code}</pre>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
