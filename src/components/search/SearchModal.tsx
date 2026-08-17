"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";

interface SearchResult {
  title: string;
  sub: string;
  href: string;
}

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
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setResults(json.data ?? []);
        setActiveIdx(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  function go(result?: SearchResult) {
    if (!result) return;
    router.push(result.href);
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter") { e.preventDefault(); go(results[activeIdx]); }
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
