export type PageGroup = "command" | "knowledge" | "build" | "security" | "personal" | "system" | "bottom";

export interface PageEntry {
  href: string;
  label: string;
  group: PageGroup;
  locked?: boolean;
}

/** Single source of truth for navigation, search, and command discovery. */
export const PAGES: PageEntry[] = [
  { href: "/", label: "Command Center", group: "command" },

  { href: "/research", label: "Research OS", group: "knowledge" },
  { href: "/knowledge", label: "Knowledge OS", group: "knowledge" },
  { href: "/reading-room", label: "Reading Room", group: "knowledge" },
  { href: "/learning-hub", label: "Learning Hub", group: "knowledge" },
  { href: "/media-library", label: "Media Library", group: "knowledge" },

  { href: "/engineering", label: "Engineering OS", group: "build" },
  { href: "/developer-workspace", label: "Developer Workspace", group: "build" },
  { href: "/ai-terminal", label: "AI Terminal", group: "build" },

  { href: "/security-lab", label: "Security Lab", group: "security" },
  { href: "/soc", label: "SOC OS", group: "security" },
  { href: "/observatory", label: "Observatory", group: "security" },
  { href: "/public-api", label: "Public API", group: "security" },

  { href: "/journal", label: "Journal OS", group: "personal" },
  { href: "/timeline", label: "Timeline OS", group: "personal" },
  { href: "/about", label: "About OS", group: "personal" },

  { href: "/settings", label: "Settings", group: "system" },
  { href: "/now", label: "Now", group: "system" },
  { href: "/changelog", label: "Changelog", group: "system" },
  { href: "/docs", label: "Documentation", group: "system" },

];
