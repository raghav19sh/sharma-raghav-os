"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isPublicTheme, type PublicTheme } from "@/lib/theme";

export async function setPublicTheme(theme: PublicTheme) {
  await requireAdmin();

  if (!isPublicTheme(theme)) {
    throw new Error("INVALID_THEME");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("settings")
    .upsert(
      {
        key: "public_theme",
        value: theme,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

  if (error) {
    throw new Error(`THEME_SAVE_FAILED:${error.message}`);
  }

  return { ok: true, theme };
}
