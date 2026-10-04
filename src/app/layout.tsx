import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sharma-Raghav OS",
  description: "Raghav Sharma's cybersecurity workstation.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6683707263772741"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
