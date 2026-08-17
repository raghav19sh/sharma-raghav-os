"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import { PAGES } from "@/lib/pages";

interface SearchResult {
  title: string;
  sub: string;
  href: string;
  kind?: "page" | "command" | "content";
}

const COMMANDS: SearchResult[] = [
  { title: "Open Command Center", sub: "Command", href: "/", kind: "command" },
  { title: "Open Security Lab", sub: "Command", href: "/security-lab", kind: "command" },
  { title: "Open AI Terminal", sub: "Command", href: "/ai-terminal", kind: "command" },
  { title: "Open Observatory", sub: "Command", href: "/observatory", kind: "command" },
  { title: "Open Timeline", sub: "Command", href: "/timeline", kind: "command" },
  { title: "Open Settings", sub: "Command", href: "/settings", kind: "command" },
];

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQ("");
      setResults([]);
      setActiveIdx(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Debounced real fetch — no client-side static index to keep in sync by
  // hand; this hits /api/v1/search, which queries Postgres directly.
  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const t = setTimeout(async () => {
      const needle = q.trim().toLowerCase();
      const pageResults: SearchResult[] = PAGES
        .filter((page) => `${page.label} ${page.href}`.toLowerCase().includes(needle))
        .map((page) => ({ title: page.label, sub: page.href, href: page.href }));

      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
        const json = await res.json();
        const remote = Array.isArray(json.data) ? json.data : [];
        const merged = [...pageResults, ...remote];
        const seen = new Set<string>();
        setResults(merged.filter((r: SearchResult) => {
          const key = `${r.title}|${r.href}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 20));
      } catch {
        // The search API is an enhancement. Page navigation remains searchable
        // even if Supabase/API connectivity is temporarily unavailable.
        setResults(pageResults.slice(0, 20));
      } finally {
        setLoading(false);
        setActiveIdx(0);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  function go(result?: SearchResult) {
    if (!result) return;
    router.push(result.href);
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown" && results.length) { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp" && results.length) { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results.length) { e.preventDefault(); go(results[activeIdx]); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black/40 backdrop-blur-sm flex justify-center pt-[14vh]" onClick={onClose}>
      <div
        className="w-[min(560px,92vw)] h-fit bg-surface rounded-dialog border border-border shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Universal search"
      >
        <div className="flex items-center gap-3 px-[18px] py-4 border-b border-border text-text-2">
          <Search size={17} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search research, projects, articles…"
            aria-label="Search everything"
            className="flex-1 bg-transparent outline-none text-[15px] text-text-1"
          />
          <span className="text-[11px] font-mono border border-border rounded px-1.5 py-0.5">esc</span>
        </div>
        <div className="max-h-[360px] overflow-y-auto p-2">
          {loading ? (
            <div className="p-6 text-center text-[13px] text-text-2">Searching…</div>
          ) : q && results.length === 0 ? (
            <div className="p-6 text-center text-[13px] text-text-2">No results for &quot;{q}&quot;.</div>
          ) : !q ? (
            <div>
              <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-text-2">Commands</div>
              {COMMANDS.map((r, i) => (
                <button
                  key={r.href}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left ${i === activeIdx ? "bg-lavender-tint text-text-1" : "text-text-2"}`}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => go(r)}
                >
                  <span className="flex-1 text-[13.5px] text-text-1">{r.title}</span>
                  <span className="text-[11.5px] text-text-2">{r.sub}</span>
                  {i === activeIdx && <CornerDownLeft size={13} className="text-lavender" />}
                </button>
              ))}
              <div className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wide text-text-2">Pages</div>
              {PAGES.slice(0, 8).map((r, i) => {
                const idx = COMMANDS.length + i;
                return (
                  <button key={r.href} className={`w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-left ${idx === activeIdx ? "bg-lavender-tint text-text-1" : "text-text-2"}`} onMouseEnter={() => setActiveIdx(idx)} onClick={() => go({ title: r.label, sub: r.href, href: r.href, kind: "page" })}>
                    <span className="flex-1 text-[13px] text-text-1">{r.label}</span><span className="text-[11px] text-text-2">{r.href}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.href + i}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left ${i === activeIdx ? "bg-lavender-tint text-text-1" : "text-text-2"}`}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => go(r)}
              >
                <span className="flex-1 text-[13.5px] text-text-1">{r.title}</span>
                <span className="text-[11.5px] text-text-2">{r.sub}</span>
                {i === activeIdx && <CornerDownLeft size={13} className="text-lavender" />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
