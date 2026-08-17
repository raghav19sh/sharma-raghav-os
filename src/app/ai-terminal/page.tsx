import type { Metadata } from "next";
import { Terminal as TerminalIcon } from "lucide-react";
import { Terminal } from "@/components/terminal/Terminal";

export const metadata: Metadata = { title: "AI Terminal", description: "A layered command interface for the whole OS." };

const EXAMPLES = ["research", "projects", "soc", "timeline", "show unfinished projects", "research from this month", "status"];

export default function AiTerminalPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><TerminalIcon size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">AI Terminal</h1>
          <p className="text-[14px] text-text-2 mt-0.5">
            Layer 1: real navigation. Layer 2: real database queries. Layer 3 (an actual AI
            assistant with scoped tool access) isn&apos;t connected in this deployment — see PLAN.md §14.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-card p-5">
        <Terminal />
      </div>

      <div>
        <div className="text-[12px] font-semibold uppercase tracking-wide text-text-2 mb-3">Try one of these</div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <span key={ex} className="font-mono text-[12.5px] bg-surface border border-border text-text-2 px-3 py-1.5 rounded-lg">{ex}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
