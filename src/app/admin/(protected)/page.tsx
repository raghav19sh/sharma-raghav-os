import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOpenLoopsForAdmin } from "@/lib/data/openLoops";
import { getStatusSnapshot } from "@/lib/data/status";

export default async function AdminDashboardPage() {
  const supabase = createServerSupabaseClient();
  const [openLoops, status] = await Promise.all([
    getOpenLoopsForAdmin(supabase),
    getStatusSnapshot(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <h1 className="text-[22px] font-semibold text-text-1">Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 max-[640px]:grid-cols-2">
        <Stat label="Published research" value={status.contentCounts.research} />
        <Stat label="Public projects" value={status.contentCounts.projects} />
        <Stat label="Published articles" value={status.contentCounts.articles} />
        <Stat label="Public journal" value={status.contentCounts.journalPublic} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold text-text-1">Open loops</h2>
          <span className="text-[11px] text-text-2">Private — never shown on the public site (§16)</span>
        </div>
        {openLoops.length === 0 ? (
          <p className="text-[13px] text-text-2">Nothing open right now.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {openLoops.map((loop) => (
              <div key={loop.id} className="flex items-center gap-3 bg-white border border-border rounded-[10px] px-4 py-3">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-status-amber-tint text-status-amber-text capitalize">{loop.priority}</span>
                <span className="text-[13.5px] text-text-1 flex-1">{loop.title}</span>
                <span className="text-[11px] text-text-2 capitalize">{loop.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link href="/admin/research" className="text-[13px] text-lavender underline">Manage research →</Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-border rounded-card p-4">
      <div className="text-[22px] font-semibold text-text-1">{value}</div>
      <div className="text-[11.5px] text-text-2 mt-0.5">{label}</div>
    </div>
  );
}
