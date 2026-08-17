import type { SupabaseClient } from "@supabase/supabase-js";
import type { OpenLoop } from "@/types/database";

/**
 * Open loops are Raghav's private working notes (§16) — there is no public
 * visibility column on this table at all, unlike the content tables. RLS
 * restricts every row to the admin session; this function is only ever
 * called from admin-gated code paths.
 */
export async function getOpenLoopsForAdmin(supabase: SupabaseClient): Promise<OpenLoop[]> {
  const { data, error } = await supabase
    .from("open_loops")
    .select("*")
    .neq("status", "done")
    .order("priority", { ascending: false })
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw new Error(`Failed to load open loops: ${error.message}`);
  return (data ?? []) as OpenLoop[];
}
