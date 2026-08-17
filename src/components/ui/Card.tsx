import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-surface border border-border rounded-card p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

type Tone = "green" | "amber" | "red" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  green: "text-status-green-text bg-status-green-tint",
  amber: "text-status-amber-text bg-status-amber-tint",
  red: "text-status-red-text bg-status-red-tint",
  neutral: "text-text-2 bg-bg border border-border",
};

export function StatusPill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center text-[11.5px] font-medium px-2.5 py-0.5 rounded-full ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-14 px-6 border border-dashed border-border-strong rounded-panel">
      <div className="text-[15px] font-semibold text-text-1">{title}</div>
      <div className="text-[13.5px] text-text-2 max-w-sm">{text}</div>
    </div>
  );
}
