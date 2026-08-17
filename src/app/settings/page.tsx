"use client";

import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Sun, Moon, Lock } from "lucide-react";

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("sr-os-theme");
    const storedMotion = window.localStorage.getItem("sr-os-reduced-motion");
    if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme);
    setReducedMotion(storedMotion === "true");
  }, []);

  function applyTheme(next: "light" | "dark") {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("sr-os-theme", next);
  }

  function toggleMotion() {
    const next = !reducedMotion;
    setReducedMotion(next);
    window.localStorage.setItem("sr-os-reduced-motion", String(next));
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-start gap-3.5">
        <div className="w-[42px] h-[42px] rounded-btn bg-lavender-tint text-burgundy-accent flex items-center justify-center shrink-0"><SettingsIcon size={20} /></div>
        <div>
          <h1 className="text-[24px] font-semibold text-text-1">Settings</h1>
          <p className="text-[14px] text-text-2 mt-0.5">
            Stored in your browser&apos;s localStorage only (§40). Nothing here reaches the
            database or changes Raghav&apos;s real settings.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-card p-1">
        <Row title="Appearance" sub="Choose how the OS looks on your screen.">
          <div className="flex bg-bg border border-border rounded-[10px] p-0.5 gap-0.5">
            <button onClick={() => applyTheme("light")} className={`flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg ${theme === "light" ? "bg-surface text-text-1 shadow-sm" : "text-text-2"}`}>
              <Sun size={14} /> Light
            </button>
            <button onClick={() => applyTheme("dark")} className={`flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg ${theme === "dark" ? "bg-surface text-text-1 shadow-sm" : "text-text-2"}`}>
              <Moon size={14} /> Dark
            </button>
          </div>
        </Row>
        <Row title="Reduce motion" sub="Pause the rotating globe and other ambient animation.">
          <button
            onClick={toggleMotion}
            role="switch"
            aria-checked={reducedMotion}
            aria-label="Reduce motion"
            className={`w-[42px] h-6 rounded-full relative transition-colors duration-fast ${reducedMotion ? "bg-lavender" : "bg-border-strong"}`}
          >
            <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white transition-transform duration-fast ${reducedMotion ? "translate-x-[18px]" : ""}`} />
          </button>
        </Row>
      </div>

      <div className="flex items-center gap-2 text-[12px] text-text-2">
        <Lock size={13} /> Visitor session — read-only. Admin settings live in Admin OS.
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
