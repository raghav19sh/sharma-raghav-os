import type { SupabaseClient } from "@supabase/supabase-js";
import type { SlugContentTable, SlugContentRow, Paginated } from "@/types/database";

/**
 * One generic pair of functions for research/projects/articles/journal_entries
 * — they share the same id/slug/title/summary/status/visibility shape, so
 * every page and every /api/v1/* route for these four tables calls through
 * here instead of hand-rolling the same query four times (§7: single
 * source of truth; §17 of the design doc: "every component reusable").
 *
 * These do NOT bypass RLS — they run through the normal server client, so
 * the actual filtering is enforced by the database policies in
 * supabase/migrations/0001_init.sql. The `.eq("visibility", "public")`
 * clauses below are a second, explicit layer on top of RLS, not a
 * replacement for it — belt and suspenders, not either/or.
 */

interface ListOptions {
  page?: number;
  pageSize?: number;
  tag?: string;
  search?: string;
}

// research/articles/journal_entries use status as a publish-state
// (draft/published/archived). projects uses status as a *lifecycle* state
// (idea/active/paused/completed/archived) — "published" isn't a valid value
// there, so it can't be filtered the same way. This table says what "safe
// to show publicly" means per table, instead of a broken one-size ternary.
const PUBLIC_STATUS_FILTER: Record<SlugContentTable, string[] | null> = {
  research: ["preprint", "published"],
  articles: ["published"],
  journal_entries: ["published"],
  projects: null, // no status filter — visibility alone gates projects; all non-idea lifecycle states are fine to list
};

export async function getPublishedContent<T = SlugContentRow>(
  supabase: SupabaseClient,
  table: SlugContentTable,
  options: ListOptions = {}
): Promise<Paginated<T>> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(table)
    .select("*", { count: "exact" })
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .range(from, to);

  const statusFilter = PUBLIC_STATUS_FILTER[table];
  if (statusFilter) {
    query = query.in("status", statusFilter);
  }

  if (options.search) {
    query = query.textSearch("search_vector", options.search, { type: "websearch" });
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Failed to load ${table}: ${error.message}`);
  }

  return {
    data: (data ?? []) as T[],
    meta: { total: count ?? 0, page, pageSize },
  };
}

export async function getContentBySlug<T = SlugContentRow>(
  supabase: SupabaseClient,
  table: SlugContentTable,
  slug: string
): Promise<T | null> {
  let query = supabase
    .from(table)
    .select("*")
    .eq("slug", slug)
    .eq("visibility", "public");

  const statusFilter = PUBLIC_STATUS_FILTER[table];
  if (statusFilter) {
    query = query.in("status", statusFilter);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Failed to load ${table}/${slug}: ${error.message}`);
  }

  return data as T | null;
}

/**
 * Admin variant — no visibility/status filtering, because the caller has
 * already passed requireAdmin(). Only ever call this from code paths that
 * sit behind the admin auth check.
 */
export async function getAllContentForAdmin<T = SlugContentRow>(
  supabase: SupabaseClient,
  table: SlugContentTable
): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load ${table} (admin): ${error.message}`);
  }

  return (data ?? []) as T[];
}
