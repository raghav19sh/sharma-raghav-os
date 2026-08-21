"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Compass, Cpu, Shield, Activity, Layers, Book, BookOpen, Clock,
  Award, TrendingUp, Image as ImageIcon, Folder, Terminal, Server, Info,
  Settings, Lock, Plus, Upload, Download, CalendarDays, FileText,
} from "lucide-react";
import { PAGES, type PageGroup } from "@/lib/pages";

const ICONS: Record<string, typeof Home> = {
  "/": Home,
  "/research": Compass,
  "/engineering": Cpu,
  "/security-lab": Shield,
  "/soc": Activity,
  "/knowledge": Layers,
  "/journal": Book,
  "/timeline": Clock,
  "/reading-room": BookOpen,
  "/learning-hub": Award,
  "/observatory": TrendingUp,
  "/media-library": ImageIcon,
  "/developer-workspace": Folder,
  "/ai-terminal": Terminal,
  "/public-api": Server,
  "/about": Info,
  "/settings": Settings,
  "/now": CalendarDays,
  "/changelog": FileText,
  "/docs": BookOpen,
 // "/admin": Lock,
};

const SECTIONS: Array<{ group: PageGroup; label: string }> = [
  { group: "command", label: "Command" },
  { group: "knowledge", label: "Knowledge" },
  { group: "build", label: "Build" },
  { group: "security", label: "Security" },
  { group: "personal", label: "Personal" },
  { group: "system", label: "System" },
];

 /*const QUICK_ACTIONS = [
  { icon: Plus, label: "New Research" },
  { icon: Plus, label: "New Project" },
  { icon: Plus, label: "Journal Entry" },
  { icon: Upload, label: "Upload Media" },
  { icon: Download, label: "Download Report" },
]; */

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className={`sidebar w-[252px] shrink-0 sticky top-[68px] h-[calc(100vh-68px)] overflow-y-auto border-r border-border bg-bg py-4 px-3 flex flex-col z-[91] max-[980px]:fixed max-[980px]:left-0 max-[980px]:top-[68px] max-[980px]:transition-transform max-[980px]:duration-large ${open ? "max-[980px]:translate-x-0" : "max-[980px]:-translate-x-full"}`}>
      {SECTIONS.map(({ group, label }) => {
        const items = PAGES.filter((p) => p.group === group);
        return (
          <section key={group}>
            <div className="text-[11px] font-semibold tracking-wide uppercase text-text-2 px-2.5 pt-3 pb-1.5">{label}</div>
            {items.map((p) => (
              <NavItem key={p.href} href={p.href} label={p.label} Icon={ICONS[p.href] ?? Home} active={isActive(p.href)} onNavigate={onNavigate} locked={p.locked} />
            ))}
          </section>
        );
      })}

{/*      <div className="h-px bg-border my-3 mx-1.5" />
      <div className="text-[11px] font-semibold tracking-wide uppercase text-text-2 px-2.5 pb-1.5">Quick Actions</div>
      {QUICK_ACTIONS.map((q) => (
        <Link key={q.label} href="/admin" onClick={onNavigate} title="Requires Admin OS" className="flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[13.5px] text-text-2 hover:text-text-1 hover:bg-surface">
          <q.icon size={16} className="shrink-0" />
          <span className="flex-1">{q.label}</span>
          <Lock size={11} className="opacity-70" />
        </Link>
      ))} 
*/}
      <div className="h-px bg-border my-3 mx-1.5" />
      {PAGES.filter((p) => p.group === "bottom").map((p) => (
        <NavItem key={p.href} href={p.href} label={p.label} Icon={ICONS[p.href] ?? Home} active={isActive(p.href)} onNavigate={onNavigate} locked={p.locked} />
      ))}

      <div className="mt-auto flex items-center gap-2.5 px-2.5 pt-4 pb-1 border-t border-border">
        <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
        <div>
          <div className="text-[13px] font-medium text-text-1">Connected</div>
          <div className="text-[11px] text-text-2">Read-only visitor session</div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ href, label, Icon, active, onNavigate, locked }: { href: string; label: string; Icon: typeof Home; active: boolean; onNavigate?: () => void; locked?: boolean }) {
  return (
    <Link href={href} onClick={onNavigate} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[14px] transition-colors duration-fast ${active ? "bg-lavender-tint text-burgundy-accent font-medium" : "text-text-2 hover:text-text-1 hover:bg-surface"}`}>
      <Icon size={17} className="shrink-0" />
      <span className="flex-1">{label}</span>
      {locked && <Lock size={11} className="opacity-70" />}
    </Link>
  );
}
