import type { Metadata } from "next";
import { Activity, Lock } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStatusSnapshot } from "@/lib/data/status";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "SOC OS", description: "Security operations practice overview." };
export const revalidate = 60;

/**
 * FLAGGED DECISION — see chat response, not silently decided:
 * §12 of the brief lists /soc as a public route, but §8's explicit visitor
 * permission list does NOT include viewing SOC alerts/incidents. Publishing
 * real alert history (what was probed, when, and how it was handled) is a
 * genuine information-disclosure risk for your own infrastructure. This
 * page shows methodology and real, safe-to-publish counts only — the
 * actual alert feed lives in Admin OS, authenticated, where §9 puts it.
 */
export default async function SOCPage() {
  const supabase = createServerSupabaseClient();
  const status = await getStatusSnapshot(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><Activity size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">SOC OS</h1>
          <p className="text-[14px] text-text-2 mt-0.5">Security operations practice — not a live alert feed.</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-2 text-[13px] text-text-2 mb-3">
          <Lock size={14} />
          <span>
            The detailed alert log is intentionally admin-only. Publishing real incident history for
            live infrastructure is a disclosure risk, not a transparency win.
          </span>
        </div>
        <p className="text-[13.5px] text-text-2 leading-relaxed">
          This space describes how monitoring and triage work here — log review, alert correlation,
          and the MITRE ATT&amp;CK framework as a reference model — without exposing what has
          actually been probed or found on real systems.
        </p>
      </Card>

      <Card>
        <div className="text-[13px] font-semibold text-text-1 mb-2">Database status</div>
        <p className="text-[13px] text-text-2">
          Confirmed reachable as of {new Date(status.timestamp).toLocaleString()}. This is the same
          real check used on Observatory — see that page for the full snapshot.
        </p>
      </Card>
    </div>
  );
}
