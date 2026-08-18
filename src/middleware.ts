import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Generate a per-request CSP nonce.
 */
function makeNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  return btoa(String.fromCharCode(...bytes));
}

/**
 * Security headers.
 *
 * Development:
 * Next.js React Fast Refresh requires unsafe-eval.
 *
 * Production:
 * unsafe-eval is NOT allowed.
 */
function applySecurityHeaders(request: NextRequest) {
  const nonce = makeNonce();

  const isDevelopment = process.env.NODE_ENV === "development";

  const scriptSources = [
    "'self'",
    `'nonce-${nonce}'`,
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
  ].join(" ");

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSources}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co ws: wss: blob:",
    "media-src 'self' blob: data:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);

  /*
   * Next.js can use this nonce for generated scripts.
   */
  requestHeaders.set("x-nonce", nonce);

  /*
   * Pass CSP through the request as well as the response.
   */
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(
    "Content-Security-Policy",
    csp
  );

  response.headers.set(
    "X-Content-Type-Options",
    "nosniff"
  );

  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  response.headers.set(
    "X-Frame-Options",
    "DENY"
  );

  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  response.headers.set(
    "X-DNS-Prefetch-Control",
    "off"
  );

  return { response, nonce };
}

export async function middleware(request: NextRequest) {
  const { response } = applySecurityHeaders(request);

  const requestId =
    request.headers.get("x-request-id") ??
    crypto.randomUUID();

  response.headers.set(
    "X-Request-ID",
    requestId
  );

  const pathname = request.nextUrl.pathname;

  /*
   * Admin routes
   */
  const isAdminRoute =
    pathname.startsWith("/adminrs");

  const isAdminApiRoute =
    pathname.startsWith("/api/v1/admin");

  const isLoginRoute =
    pathname === "/adminrs/login";

  /*
   * Public pages:
   * security headers only.
   */
  if (!isAdminRoute && !isAdminApiRoute) {
    return response;
  }

  /*
   * Supabase server client
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },

        set(
          name: string,
          value: string,
          options: CookieOptions
        ) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },

        remove(
          name: string,
          options: CookieOptions
        ) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allowedEmail =
    process.env.ADMIN_ALLOWED_EMAIL;

  const isAuthorized =
    !!user &&
    !!allowedEmail &&
    user.email === allowedEmail;

  /*
   * Protect Admin OS and Admin API.
   */
  if (
    (isAdminRoute || isAdminApiRoute) &&
    !isLoginRoute &&
    !isAuthorized
  ) {
    /*
     * Admin API → JSON response
     */
    if (isAdminApiRoute) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
          headers: response.headers,
        }
      );
    }

    /*
     * Admin OS → login page
     */
    const redirectUrl = new URL(
      "/adminrs/login",
      request.url
    );

    redirectUrl.searchParams.set(
      "next",
      pathname
    );

    return NextResponse.redirect(
      redirectUrl,
      {
        headers: response.headers,
      }
    );
  }

  /*
   * Already authenticated admin visiting login
   * → dashboard.
   */
  if (
    isLoginRoute &&
    isAuthorized
  ) {
    return NextResponse.redirect(
      new URL("/adminrs", request.url),
      {
        headers: response.headers,
      }
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};