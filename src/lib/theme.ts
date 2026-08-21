import type { SupabaseClient } from "@supabase/supabase-js";

export const PUBLIC_THEMES = [
  { id: "cartoon", name: "Cartoon OS", description: "Playful cybersecurity world", icon: "🎨" },
  { id: "minimal", name: "Minimal Light", description: "Clean, bright, editorial", icon: "☀️" },
  { id: "neumorphism", name: "Neumorphism", description: "Soft 3D surfaces", icon: "◐" },
  { id: "space", name: "Space Explorer", description: "Deep space and exploration", icon: "🚀" },
  { id: "glass", name: "Glassmorphism", description: "Translucent, luminous UI", icon: "🫧" },
  { id: "dark-elegant", name: "Dark Elegant", description: "Premium black and gold", icon: "✦" },
  { id: "ocean", name: "Ocean Depths", description: "Deep blue underwater world", icon: "🌊" },
  { id: "immersive", name: "Immersive Studio", description: "Editorial black, lime signal, oversized type", icon: "◼" },
] as const;

export type PublicTheme = (typeof PUBLIC_THEMES)[number]["id"];

export const DEFAULT_PUBLIC_THEME: PublicTheme = "minimal";

export function isPublicTheme(value: unknown): value is PublicTheme {
  return PUBLIC_THEMES.some((theme) => theme.id === value);
}

export async function getCurrentPublicTheme(
  supabase: SupabaseClient
): Promise<PublicTheme> {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "public_theme")
    .maybeSingle();

  const value = data?.value;
  const candidate =
    typeof value === "string"
      ? value
      : value && typeof value === "object" && "theme" in value
        ? (value as { theme?: unknown }).theme
        : undefined;

  return isPublicTheme(candidate) ? candidate : DEFAULT_PUBLIC_THEME;
}
