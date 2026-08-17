import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStatusSnapshot } from "@/lib/data/status";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Observatory", description: "Real platform telemetry — nothing simulated." };
export const revalidate = 60;

export default async function ObservatoryPage() {
  const supabase = createServerSupabaseClient();
  const status = await getStatusSnapshot(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><TrendingUp size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">Observatory</h1>
          <p className="text-[14px] text-text-2 mt-0.5">Only real telemetry is shown here — see the note below for what&apos;s intentionally absent.</p>
        </div>
      </div>

      <Card>
        <div className="text-[13px] font-semibold text-text-1 mb-4">Content, live from the database</div>
        <div className="grid grid-cols-4 gap-4 max-[640px]:grid-cols-2">
          <Stat label="Published research" value={status.contentCounts.research} />
          <Stat label="Public projects" value={status.contentCounts.projects} />
          <Stat label="Published articles" value={status.contentCounts.articles} />
          <Stat label="Public journal entries" value={status.contentCounts.journalPublic} />
        </div>
      </Card>

      <Card>
        <div className="text-[13px] font-semibold text-text-1 mb-2">Not shown here, on purpose</div>
        <p className="text-[13px] text-text-2 leading-relaxed">
          CPU, memory, network, and visitor/session analytics are not displayed. There is no real
          source for them in this deployment yet — a serverless host doesn&apos;t expose
          machine-level metrics the way a dedicated server would, and no analytics provider is
          connected. Wire in Vercel Analytics (or a self-hosted, privacy-respecting alternative)
          and a real uptime monitor, then extend <code className="font-mono text-[12px]">lib/data/status.ts</code>{" "}
          — don&apos;t add numbers here without a real source behind them (§25/§26).
        </p>
      </Card>

      <div className="text-[11px] text-text-2">
        Last checked {new Date(status.timestamp).toLocaleString()} · database:{" "}
        <span className={status.database === "ok" ? "text-status-green-text" : "text-status-red-text"}>{status.database}</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[26px] font-semibold text-text-1">{value}</div>
      <div className="text-[12px] text-text-2 mt-0.5">{label}</div>
    </div>
  );
}
