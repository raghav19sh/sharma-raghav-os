"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Lock } from "lucide-react";

export default function SettingsPage() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const storedMotion = window.localStorage.getItem("sr-os-reduced-motion");
    setReducedMotion(storedMotion === "true");

    const onMotionChange = (event: Event) => {
      setReducedMotion(Boolean((event as CustomEvent<boolean>).detail));
    };

    window.addEventListener("sr-os-motion-change", onMotionChange);
    return () => window.removeEventListener("sr-os-motion-change", onMotionChange);
  }, []);

  function toggleMotion() {
    const next = !reducedMotion;
    setReducedMotion(next);
    window.localStorage.setItem("sr-os-reduced-motion", String(next));
    window.dispatchEvent(new CustomEvent("sr-os-motion-change", { detail: next }));
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><SettingsIcon size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">Settings</h1>
          <p className="text-[14px] text-text-2 mt-0.5">
            Visitor-only preferences are stored in your browser. Public appearance is controlled globally by Admin OS.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-card p-1">
        <Row title="Reduce motion" sub="Pause the rotating globe and other ambient animation.">
          <button
            onClick={toggleMotion}
            role="switch"
            aria-checked={reducedMotion}
            aria-label="Reduce motion"
            className={`w-[42px] h-6 rounded-full relative transition-colors duration-fast ${reducedMotion ? "bg-lavender" : "bg-border-strong"}`}
          >
            <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-surface transition-transform duration-fast ${reducedMotion ? "translate-x-[18px]" : ""}`} />
          </button>
        </Row>
      </div>

      <div className="flex items-center gap-2 text-[12px] text-text-2">
        <Lock size={13} /> Visitor session — read-only. Public theme is controlled by Admin OS.
      </div>
    </div>
  );
}

function Row({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-border last:border-0">
      <div>
        <div className="text-[14px] font-medium text-text-1">{title}</div>
        <div className="text-[12.5px] text-text-2 mt-0.5">{sub}</div>
      </div>
      {children}
    </div>
  );
}
