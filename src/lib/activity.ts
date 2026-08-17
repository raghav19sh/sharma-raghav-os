import type { SupabaseClient } from "@supabase/supabase-js";
import type { SlugContentTable } from "@/types/database";

/**
 * §17: activity_events is the public-facing "what changed" feed, kept
 * explicitly separate from audit_logs (security/admin actions). Only
 * called when content is actually visibility='public' AND status=
 * 'published' — draft and private edits never create an activity event,
 * so this can't leak the existence/timing of unpublished work.
 */

const KIND_LABEL: Record<SlugContentTable, { created: string; updated: string; noun: string }> = {
  research: { created: "research_published", updated: "research_updated", noun: "research" },
  projects: { created: "project_published", updated: "project_updated", noun: "project" },
  articles: { created: "article_published", updated: "article_updated", noun: "article" },
  journal_entries: { created: "journal_published", updated: "journal_updated", noun: "journal entry" },
};

export function describeActivity(table: SlugContentTable, kind: "created" | "updated", title: string) {
  const meta = KIND_LABEL[table];
  const verb = kind === "created" ? "Published" : "Updated";
  return { kind: meta[kind], summary: `${verb} "${title}"` };
}

export async function writeActivityEvent(
  supabase: SupabaseClient,
  event: { kind: string; summary: string },
  related?: { table: string; id: string }
) {
  const { error } = await supabase.from("activity_events").insert({
    kind: event.kind,
    summary: event.summary,
    related_table: related?.table ?? null,
    related_id: related?.id ?? null,
  });
  if (error) {
    // Never let a logging failure break the actual publish action.
    // eslint-disable-next-line no-console
    console.error("Failed to write activity event:", error.message);
  }
}

export async function getRecentActivity(supabase: SupabaseClient, limit = 8) {
  const { data, error } = await supabase
    .from("activity_events")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to load activity: ${error.message}`);
  return data ?? [];
}
