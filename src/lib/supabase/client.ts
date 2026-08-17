import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase client. Only ever uses the public anon key — RLS
 * policies (see supabase/migrations/0001_init.sql) are what actually
 * restrict what this client can read or write, not application code.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
