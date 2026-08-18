import type { Metadata } from "next";
import { CloudRain } from "lucide-react";
import { Terminal } from "@/components/terminal/Terminal";

export const metadata: Metadata = {
  title: "Rain Terminal",
  description:
    "A rain-soaked command interface and public-facing companion for the Sharma-Raghav OS.",
};

const EXAMPLES = [
  "hi",
  "weather",
  "dance",
  "research",
  "projects",
  "soc",
  "show unfinished projects",
  "status",
];

export default function RainTerminalPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0">
          <CloudRain size={20} />
        </div>

        <div>
          <h1 className="text-[24px] font-semibold text-text-1">
            Rain Terminal
          </h1>
          <p className="text-[14px] text-text-2 mt-0.5">
            A live rain companion for the Sharma-Raghav OS. Talk to her, scan
            the rain, and watch the atmosphere respond.
          </p>
        </div>
      </div>

      <Terminal />

      <div>
        <div className="text-[12px] font-semibold uppercase tracking-wide text-text-2 mb-3">
          Try one of these
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <span
              key={ex}
              className="font-mono text-[12.5px] bg-surface border border-border text-text-2 px-3 py-1.5 rounded-lg"
            >
              {ex}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
