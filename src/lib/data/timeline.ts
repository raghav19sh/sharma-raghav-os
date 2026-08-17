import type { SupabaseClient } from "@supabase/supabase-js";
import type { TimelineEvent } from "@/types/database";

export async function getPublicTimeline(supabase: SupabaseClient): Promise<TimelineEvent[]> {
  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("visibility", "public")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Failed to load timeline: ${error.message}`);
  return (data ?? []) as TimelineEvent[];
}
