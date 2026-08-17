import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client bound to the current request's cookies, so
 * `auth.uid()` resolves correctly inside RLS policies. Use this in Server
 * Components, Route Handlers, and Server Actions — never in client
 * components (use lib/supabase/client.ts there instead).
 *
 * This still uses the public anon key. It is NOT a service-role client —
 * see server-admin.ts for the one place (seed script, trusted server-only
 * jobs) that needs elevated access, and note the warning there.
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component; middleware.ts refreshes the
            // session cookie on every request, so this is safe to ignore.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Same as above.
          }
        },
      },
    }
  );
}
