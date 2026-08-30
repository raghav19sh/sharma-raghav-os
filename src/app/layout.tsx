import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/shell/AppShell";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentPublicTheme } from "@/lib/theme";
import { Analytics } from '@vercel/analytics/next';
export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sharma-raghav.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sharma-Raghav OS",
    template: "%s · Sharma-Raghav OS",
  },
  icons: {
  icon: "/favicon.svg",
},
  description:
    "Raghav Sharma's personal operating system for cybersecurity, AI, and systems research — read-only for visitors.",
  openGraph: {
    type: "website",
    siteName: "Sharma-Raghav OS",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const publicTheme = await getCurrentPublicTheme(supabase);

  return (
    <html lang="en" data-theme={publicTheme}>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}