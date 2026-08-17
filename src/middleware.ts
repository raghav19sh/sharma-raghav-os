import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Security + auth middleware.
 *
 * Important: Next.js App Router needs its client bootstrap scripts to execute.
 * A static CSP with `script-src 'self'` blocks Next's inline bootstrap and
 * causes the exact production failure mode where the HTML renders but every
 * React interaction (theme, search, terminal, toggles) appears dead.
 *
 * We therefore generate a per-request nonce and pass it to Next.js through
 * the request CSP. Next can attach the nonce to its generated scripts while
 * the browser still gets a strict CSP without `unsafe-inline` for scripts.
 */
function makeNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function applySecurityHeaders(request: NextRequest) {
  const nonce = makeNonce();
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  return { response, nonce };
}

export async function middleware(request: NextRequest) {
  const { response } = applySecurityHeaders(request);
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  response.headers.set("X-Request-ID", requestId);

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/v1/admin");
  const isLoginRoute = pathname === "/admin/login";

  // Public pages only need the security headers. Avoid doing an auth lookup
  // for every visitor request.
  if (!isAdminRoute && !isAdminApiRoute) return response;

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

  const allowedEmail = process.env.ADMIN_ALLOWED_EMAIL;
  const isAuthorized = !!user && !!allowedEmail && user.email === allowedEmail;

  if ((isAdminRoute || isAdminApiRoute) && !isLoginRoute && !isAuthorized) {
    if (isAdminApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers });
    }
    const redirectUrl = new URL("/admin/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl, { headers: response.headers });
  }

  if (isLoginRoute && isAuthorized) {
    return NextResponse.redirect(new URL("/admin", request.url), { headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
