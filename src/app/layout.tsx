import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/shell/AppShell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sharma-raghav.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sharma-Raghav OS",
    template: "%s · Sharma-Raghav OS",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
