import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Middleware already gates /admin/* and /api/v1/admin/* at the edge. This
 * helper is the second, independent check inside individual Server Actions
 * and Route Handlers — defense in depth (§11: "least privilege"), so a
 * future refactor of middleware.ts can't silently remove the only check.
 *
 * Throws if the current request isn't the authorized admin, rather than
 * returning a boolean callers might forget to check.
 */
export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allowedEmail = process.env.ADMIN_ALLOWED_EMAIL;

  if (!user || !allowedEmail || user.email !== allowedEmail) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}
