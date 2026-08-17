import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Real health data only — this exists specifically because the audit
 * (PLAN.md, Phase 1 / §25 of the brief) found the prototype's Observatory
 * page showing fabricated CPU/memory/network/SOC-agent numbers. There is
 * no server to report CPU/RAM from in a serverless deployment, so those
 * fields are correctly absent here rather than faked. If you later add a
 * real uptime monitor or hosting-provider status API, extend this — don't
 * add numbers that aren't backed by a real source.
 */
export interface StatusSnapshot {
  database: "ok" | "error" | "unknown";
  timestamp: string;
  contentCounts: {
    research: number;
    projects: number;
    articles: number;
    journalPublic: number;
  };
}

export async function getStatusSnapshot(supabase: SupabaseClient): Promise<StatusSnapshot> {
  const timestamp = new Date().toISOString();

  try {
    const [research, projects, articles, journal] = await Promise.all([
      supabase.from("research").select("id", { count: "exact", head: true }).eq("visibility", "public").eq("status", "published"),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("visibility", "public"),
      supabase.from("articles").select("id", { count: "exact", head: true }).eq("visibility", "public").eq("status", "published"),
      supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("visibility", "public").eq("status", "published"),
    ]);

    const anyError = research.error || projects.error || articles.error || journal.error;

    return {
      database: anyError ? "error" : "ok",
      timestamp,
      contentCounts: {
        research: research.count ?? 0,
        projects: projects.count ?? 0,
        articles: articles.count ?? 0,
        journalPublic: journal.count ?? 0,
      },
    };
  } catch {
    return {
      database: "error",
      timestamp,
      contentCounts: { research: 0, projects: 0, articles: 0, journalPublic: 0 },
    };
  }
}
