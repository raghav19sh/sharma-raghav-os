"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Palette } from "lucide-react";
import { setPublicTheme } from "./actions";
import type { PUBLIC_THEMES, PublicTheme } from "@/lib/theme";

type Theme = (typeof PUBLIC_THEMES)[number];

export function AppearancePicker({
  themes,
  initialTheme,
}: {
  themes: readonly Theme[];
  initialTheme: PublicTheme;
}) {
  const [selected, setSelected] = useState<PublicTheme>(initialTheme);
  const [saved, setSaved] = useState(initialTheme);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function choose(theme: PublicTheme) {
    setSelected(theme);
    setError("");
  }

  function save() {
    setError("");
    startTransition(async () => {
      try {
        await setPublicTheme(selected);
        setSaved(selected);
        // The admin shell itself is intentionally not themed. The public
        // site reads the database value, so the admin cannot accidentally
        // change their private admin appearance by choosing a public theme.
      } catch {
        setError("Could not save the public theme. Please try again.");
      }
    });
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 max-[1000px]:grid-cols-2 max-[700px]:grid-cols-1">
        {themes.map((theme) => {
          const active = selected === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => choose(theme.id)}
              className={`theme-choice text-left rounded-[16px] border p-4 transition-all ${
                active
                  ? "border-lavender ring-2 ring-lavender/20 bg-lavender-tint"
                  : "border-border bg-bg hover:border-border-strong"
              }`}
              aria-pressed={active}
            >
              <div className={`theme-preview theme-preview-${theme.id}`}>
                <span>{theme.icon}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[14px] font-semibold text-text-1">{theme.name}</span>
                {active && <Check size={15} className="text-lavender ml-auto" />}
              </div>
              <div className="text-[12px] text-text-2 mt-1">{theme.description}</div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-[12px] text-text-2">
          <Palette size={14} />
          {saved === selected ? "Saved public theme" : "Unsaved theme selection"}
        </div>
        <button
          type="button"
          disabled={isPending || selected === saved}
          onClick={save}
          className="inline-flex items-center gap-2 rounded-btn bg-lavender text-on-lavender px-4 py-2 text-[13px] font-semibold disabled:opacity-50"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          {isPending ? "Applying…" : "Apply to public site"}
        </button>
      </div>

      {error ? <p className="text-[12px] text-red-text">{error}</p> : null}
    </>
  );
}
