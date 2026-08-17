"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface TermLine { type: "in" | "out"; text: string }

const NAV_ROUTES: [string[], string, string][] = [
  [["research", "show research"], "/research", "Opening Research OS…"],
  [["projects", "show projects", "engineering"], "/engineering", "Opening Engineering OS…"],
  [["resume", "about"], "/about", "Opening About OS…"],
  [["education", "learning"], "/learning-hub", "Opening Learning Hub…"],
  [["soc", "launch soc"], "/soc", "Opening SOC OS…"],
  [["articles", "knowledge", "latest article"], "/knowledge", "Opening Knowledge OS…"],
  [["timeline", "show timeline"], "/timeline", "Opening Timeline OS…"],
  [["journal"], "/journal", "Opening Journal OS…"],
  [["reading", "books"], "/reading-room", "Opening Reading Room…"],
  [["home"], "/", "Opening Command Center…"],
];

// Layer 2: a small set of real natural-language patterns backed by real
// queries — not an LLM, a deliberately narrow router. This is honest about
// what it is: §14 explicitly forbids calling deterministic routing "AI."
async function runLayer2(lower: string, supabase: ReturnType<typeof createClient>): Promise<string | null> {
  if (lower.includes("unfinished") && lower.includes("project")) {
    const { data, error } = await supabase
      .from("projects")
      .select("title,status")
      .eq("visibility", "public")
      .in("status", ["idea", "active", "paused"]);
    if (error) return `Query failed: ${error.message}`;
    if (!data?.length) return "No unfinished public projects right now.";
    return data.map((p) => `${p.title} (${p.status})`).join(", ");
  }
  if (lower.includes("research") && (lower.includes("this month") || lower.includes("recent"))) {
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data, error } = await supabase
      .from("research")
      .select("title")
      .eq("visibility", "public")
      .eq("status", "published")
      .gte("published_at", monthAgo);
    if (error) return `Query failed: ${error.message}`;
    if (!data?.length) return "No research published in the last 30 days.";
    return data.map((r) => r.title).join(", ");
  }
  return null;
}

export function Terminal({ compact = false }: { compact?: boolean }) {
  const [lines, setLines] = useState<TermLine[]>([
    { type: "out", text: "Welcome. Type 'help' to see what this terminal can do." },
  ]);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    const lower = cmd.toLowerCase();

    if (lower === "clear") { setLines([]); setInput(""); return; }

    let response: string | null = null;

    if (lower === "help") {
      response = "Layer 1 (navigation): research, projects, soc, journal, timeline, about, home, status, clear. Layer 2 (data): try \"show unfinished projects\" or \"research from this month\". There is no Layer 3 (AI assistant) connected in this deployment yet — see PLAN.md §14.";
    } else if (lower === "status") {
      response = "Fetching /api/v1/status…";
      setLines((p) => [...p, { type: "in", text: cmd }, { type: "out", text: response! }]);
      try {
        const res = await fetch("/api/v1/status");
        const json = await res.json();
        setLines((p) => [...p, { type: "out", text: `database: ${json.data.database} · research: ${json.data.contentCounts.research} · projects: ${json.data.contentCounts.projects}` }]);
      } catch {
        setLines((p) => [...p, { type: "out", text: "Could not reach /api/v1/status." }]);
      }
      setInput("");
      return;
    } else {
      for (const [keys, href, msg] of NAV_ROUTES) {
        if (keys.includes(lower)) {
          router.push(href);
          response = msg;
          break;
        }
      }
      if (!response) {
        const layer2 = await runLayer2(lower, supabase);
        response = layer2 ?? `Command not found: "${cmd}". Type 'help' for options. (No AI assistant is connected — this only matches known commands.)`;
      }
    }

    setLines((p) => [...p, { type: "in", text: cmd }, { type: "out", text: response! }]);
    setInput("");
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={bodyRef}
        className={`bg-bg border border-border rounded-[10px] px-3.5 py-3 overflow-y-auto font-mono text-[13px] flex flex-col gap-1.5 ${compact ? "h-32" : "h-80"}`}
      >
        {lines.map((l, i) => (
          <div key={i} className={l.type === "in" ? "text-burgundy-accent" : "text-text-2"}>{"> "}{l.text}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-bg border border-border rounded-[10px] px-3.5 py-2.5 text-lavender">
        <span>&gt;</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a command…"
          autoComplete="off"
          aria-label="Terminal command"
          className="flex-1 bg-transparent outline-none text-text-1 text-[13px] font-mono"
        />
      </form>
    </div>
  );
}
