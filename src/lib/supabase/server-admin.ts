import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS entirely. This is intentionally NOT
 * exported from lib/supabase/server.ts so it can't be reached for granted
 * by accident from a page or route handler.
 *
 * Use this ONLY in:
 *   - scripts/seed.ts (a one-off local/CI script, never shipped)
 *   - a trusted server-only cron/webhook job, if you add one later
 *
 * Never import this into anything that runs per-request for a visitor —
 * every admin write in the actual app should go through the normal
 * server client (lib/supabase/server.ts) plus RLS plus an explicit
 * session check (lib/auth/admin.ts), so there is always a real
 * authorization check, not just "this key happens to be powerful."
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "This client should only be constructed in trusted server-only scripts."
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
