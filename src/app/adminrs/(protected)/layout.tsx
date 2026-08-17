import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logoutAction } from "../login/actions";

/**
 * middleware.ts already redirects unauthenticated requests before this
 * layout ever runs. This check exists anyway (§11: never rely on a single
 * layer) — if it somehow renders unauthenticated, it renders nothing
 * sensitive rather than trusting middleware blindly.
 *
 * This layout lives at admin/(protected)/layout.tsx — a route group —
 * specifically so it does NOT wrap admin/login/page.tsx. An earlier
 * version of this scaffold had the gate at admin/layout.tsx directly,
 * which meant the login page inherited this same "return null if
 * unauthenticated" check and could never render for the person who most
 * needed to see it. Keep login outside this group if you restructure.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const allowedEmail = process.env.ADMIN_ALLOWED_EMAIL;
  const isAuthorized = !!user && user.email === allowedEmail;

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between px-6 h-16 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-burgundy text-on-lavender font-bold text-xs flex items-center justify-center">SR</div>
          <span className="text-[14px] font-semibold text-text-1">Admin OS</span>
        </div>
        <nav className="flex items-center gap-4 text-[13px] text-text-2">
          <Link href="/adminrs" className="hover:text-text-1">Dashboard</Link>
          <Link href="/adminrs/research" className="hover:text-text-1">Research</Link>
          <Link href="/adminrs/projects" className="hover:text-text-1">Projects</Link>
          <Link href="/adminrs/articles" className="hover:text-text-1">Articles</Link>
          <Link href="/adminrs/journal" className="hover:text-text-1">Journal</Link>
          <Link href="/" className="hover:text-text-1">View public site</Link>
          <form action={logoutAction}>
            <button className="text-status-red-text">Log out</button>
          </form>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
