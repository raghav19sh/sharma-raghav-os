import { AppearancePicker } from "./AppearancePicker";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentPublicTheme, PUBLIC_THEMES } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function AppearancePage() {
  const supabase = await createServerSupabaseClient();
  const currentTheme = await getCurrentPublicTheme(supabase);

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-2 mb-2">
          Admin OS / Appearance
        </div>
        <h1 className="text-[28px] font-semibold text-text-1">Public Theme</h1>
        <p className="text-[14px] text-text-2 mt-1 max-w-2xl">
          Choose the visual identity shown to every public visitor. This is a
          global setting — it is not stored in a visitor&apos;s browser.
        </p>
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-[13px] font-semibold text-text-1">Current public theme</div>
            <div className="text-[12px] text-text-2 mt-0.5">
              Changes apply to public pages on their next request.
            </div>
          </div>
          <span className="rounded-full bg-green-tint text-green-text px-2.5 py-1 text-[11px] font-semibold">
            Global
          </span>
        </div>
        <AppearancePicker themes={PUBLIC_THEMES} initialTheme={currentTheme} />
      </div>
    </div>
  );
}
