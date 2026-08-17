import type { ComponentType } from "react";

export interface PageEntry {
  href: string;
  label: string;
  group: "top" | "platform" | "bottom";
  locked?: boolean;
}

// Real hrefs. This is the thing that made routing fake before — every nav
// surface (sidebar, search, terminal) resolves through this list, and
// Next.js's own router (not a useState string) does the rest: back/forward,
// refresh, deep links, and metadata all work because these are real routes.
export const PAGES: PageEntry[] = [
  { href: "/", label: "Command Center", group: "top" },
  { href: "/research", label: "Research OS", group: "platform" },
  { href: "/engineering", label: "Engineering OS", group: "platform" },
  { href: "/security-lab", label: "Security Lab", group: "platform" },
  { href: "/soc", label: "SOC OS", group: "platform" },
  { href: "/knowledge", label: "Knowledge OS", group: "platform" },
  { href: "/journal", label: "Journal OS", group: "platform" },
  { href: "/timeline", label: "Timeline OS", group: "platform" },
  { href: "/reading-room", label: "Reading Room", group: "platform" },
  { href: "/learning-hub", label: "Learning Hub", group: "platform" },
  { href: "/observatory", label: "Observatory", group: "platform" },
  { href: "/media-library", label: "Media Library", group: "platform" },
  { href: "/developer-workspace", label: "Developer Workspace", group: "platform" },
  { href: "/ai-terminal", label: "AI Terminal", group: "platform" },
  { href: "/public-api", label: "Public API", group: "platform" },
  { href: "/about", label: "About OS", group: "platform" },
  { href: "/settings", label: "Settings", group: "bottom" },
  { href: "/admin", label: "Admin OS", group: "bottom", locked: true },
];

// Icon components are wired in Sidebar.tsx directly (lucide-react) keyed by
// href, kept out of this data file so it stays framework-agnostic and easy
// to feed into the search index / terminal without pulling in React types.
export type IconMap = Record<string, ComponentType<{ size?: number; className?: string }>>;
