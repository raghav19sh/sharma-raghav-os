import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * This is the actual security boundary for /admin/* and /api/v1/admin/*.
 * It runs before any page or route handler code, on every matching
 * request. Per the audit (see PLAN.md, Phase 1 finding B): the previous
 * prototype had no server at all, so "read-only" held only because there
 * was no write code path. This is the real version of that guarantee.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isAdminApiRoute = request.nextUrl.pathname.startsWith("/api/v1/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  const allowedEmail = process.env.ADMIN_ALLOWED_EMAIL;
  const isAuthorized = !!user && !!allowedEmail && user.email === allowedEmail;

  if ((isAdminRoute || isAdminApiRoute) && !isLoginRoute && !isAuthorized) {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const redirectUrl = new URL("/admin/login", request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginRoute && isAuthorized) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/v1/admin/:path*"],
};
