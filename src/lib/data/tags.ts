import type { SupabaseClient } from "@supabase/supabase-js";
import type { SlugContentTable, Tag } from "@/types/database";

/**
 * §18: relationships must come from real rows in `taggables`, not a
 * decorative visualization. This gives every content detail page a real
 * "tagged with" list and a real "related content" query (other items
 * sharing at least one tag) — no separate "citation graph" fabrication.
 */

export async function getTagsFor(supabase: SupabaseClient, table: SlugContentTable, id: string) {
  const { data, error } = await supabase
    .from("taggables")
    .select("tags(id, name, slug)")
    .eq("taggable_table", table)
    .eq("taggable_id", id);
  if (error) throw new Error(`Failed to load tags: ${error.message}`);
  const rows = (data ?? []) as Array<{ tags: Tag | Tag[] | null }>;
  return rows.flatMap((row) => {
    if (!row.tags) return [];
    return Array.isArray(row.tags) ? row.tags : [row.tags];
  });
}

export async function setTagsFor(supabase: SupabaseClient, table: SlugContentTable, id: string, tagNames: string[]) {
  // Replace-all: simplest correct behavior for a small admin form. Delete
  // existing links, upsert each tag by name, relink. Fine at this scale;
  // revisit if tag volume ever makes this a hot path.
  await supabase.from("taggables").delete().eq("taggable_table", table).eq("taggable_id", id);

  for (const rawName of tagNames) {
    const name = rawName.trim();
    if (!name) continue;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const { data: tag, error: tagError } = await supabase
      .from("tags")
      .upsert({ name, slug }, { onConflict: "slug" })
      .select()
      .single();
    if (tagError || !tag) continue;

    await supabase.from("taggables").insert({ tag_id: tag.id, taggable_table: table, taggable_id: id });
  }
}

export async function getRelatedContent(supabase: SupabaseClient, table: SlugContentTable, id: string, limit = 4) {
  const tags = await getTagsFor(supabase, table, id);
  if (tags.length === 0) return [];

  const tagIds = tags.map((t) => t.id);
  const { data: related, error } = await supabase
    .from("taggables")
    .select("taggable_table, taggable_id")
    .in("tag_id", tagIds)
    .neq("taggable_id", id);
  if (error || !related) return [];

  // Dedupe by (table, id), keep it simple rather than a fancy relevance score.
  const seen = new Set<string>();
  const unique = related.filter((r) => {
    const key = `${r.taggable_table}:${r.taggable_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);

  return unique;
}
