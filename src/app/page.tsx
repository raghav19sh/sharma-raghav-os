"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight, ChevronRight, Clock3, FileText, FlaskConical, Folder,
  FolderOpen, Grid2X2, HardDrive, Home, LayoutList, Search, ShieldCheck,
  UserRound, Wrench, Globe, Github, Mail, ExternalLink, ArrowLeft,
} from "lucide-react";

type Entry = {
  name: string;
  type: "folder" | "link" | "file";
  description: string;
  href: string;
  icon: typeof Folder;
  external?: boolean;
  category: string;
};

const entries: Entry[] = [
  { name: "Projects", type: "folder", description: "Applications, experiments and source code", href: "/os", icon: Folder, category: "Work" },
  { name: "Research", type: "folder", description: "Security research, notes and write-ups", href: "/os", icon: FlaskConical, category: "Work" },
  { name: "Security Lab", type: "folder", description: "Cybersecurity projects and lab workspace", href: "/os", icon: ShieldCheck, category: "Work" },
  { name: "Tools", type: "link", description: "Image, PDF and developer utilities", href: "https://tools.sharma-raghav.com", icon: Wrench, external: true, category: "Web" },
  { name: "DigiTrust", type: "link", description: "Digital trust and media analysis project", href: "https://digitrust.sharma-raghav.com", icon: Globe, external: true, category: "Web" },
  { name: "About Me", type: "file", description: "Profile, skills and contact information", href: "/os", icon: UserRound, category: "Personal" },
  { name: "Resume.pdf", type: "file", description: "View professional experience and skills", href: "/resume", icon: FileText, category: "Personal" },
  { name: "GitHub", type: "link", description: "Repositories and open-source work", href: "https://github.com/raghav19sh", icon: Github, external: true, category: "Web" },
  { name: "Contact", type: "link", description: "Send an email", href: "mailto:contact@sharma-raghav.com", icon: Mail, external: true, category: "Personal" },
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<"name" | "type">("name");
  const [activeCategory, setActiveCategory] = useState("All files");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries
      .filter((entry) => activeCategory === "All files" || entry.category === activeCategory)
      .filter((entry) => !term || [entry.name, entry.description, entry.category].some((s) => s.toLowerCase().includes(term)))
      .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
  }, [search, sort, activeCategory]);

  return (
    <main className="fm-shell">
      <header className="fm-topbar">
        <Link href="/" className="fm-brand" aria-label="Home">
          <span className="fm-brand-mark">r<span>.</span></span>
          <span><strong>RAGHAV FILES</strong><small>sharma-raghav.com</small></span>
        </Link>
        <div className="fm-breadcrumb"><HardDrive size={15} /><span>This PC</span><ChevronRight size={14} /><FolderOpen size={15} /><strong>Home</strong></div>
        <div className="fm-top-actions"><span className="fm-online-dot" /> <span>PERSONAL WORKSPACE</span></div>
      </header>

      <div className="fm-layout">
        <aside className="fm-sidebar">
          <p className="fm-side-label">QUICK ACCESS</p>
          {[
            { label: "Home", icon: Home, category: "All files" },
            { label: "Work", icon: Folder, category: "Work" },
            { label: "Web projects", icon: Globe, category: "Web" },
            { label: "Personal", icon: UserRound, category: "Personal" },
          ].map((item) => {
            const Icon = item.icon;
            return <button key={item.label} className={activeCategory === item.category ? "fm-side-item active" : "fm-side-item"} onClick={() => setActiveCategory(item.category)}><Icon size={16} /><span>{item.label}</span></button>;
          })}
          <div className="fm-sidebar-divider" />
          <p className="fm-side-label">LOCATIONS</p>
          <Link className="fm-side-item" href="/os"><HardDrive size={16} /><span>Raghav OS</span><ArrowUpRight size={13} className="fm-side-arrow" /></Link>
          <a className="fm-side-item" href="https://github.com/raghav19sh" target="_blank" rel="noreferrer"><Github size={16} /><span>GitHub</span><ArrowUpRight size={13} className="fm-side-arrow" /></a>
          <div className="fm-sidebar-bottom">
            <div className="fm-storage-icon"><HardDrive size={17} /></div>
            <div><strong>Personal workspace</strong><small>Online directory</small></div>
            <span className="fm-storage-status" />
          </div>
        </aside>

        <section className="fm-main">
          <div className="fm-page-heading">
            <div><p className="fm-eyebrow">DIRECTORY / HOME</p><h1>Home<span>.</span></h1><p className="fm-subtitle">A file-manager view of my projects, research, tools and profile.</p></div>
            <Link href="/os" className="fm-launch-button">Open workspace <ArrowUpRight size={15} /></Link>
          </div>

          <div className="fm-toolbar">
            <label className="fm-search"><Search size={16} /><input aria-label="Search files" placeholder="Search files and folders..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label>
            <div className="fm-toolbar-actions">
              <label className="fm-sort">Sort: <select value={sort} onChange={(event) => setSort(event.target.value as "name" | "type")}><option value="name">Name</option><option value="type">Type</option></select></label>
              <button className={view === "grid" ? "fm-view-button selected" : "fm-view-button"} onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 size={16} /></button>
              <button className={view === "list" ? "fm-view-button selected" : "fm-view-button"} onClick={() => setView("list")} aria-label="List view"><LayoutList size={16} /></button>
            </div>
          </div>

          <div className="fm-section-row"><h2>{activeCategory}</h2><span>{filtered.length} items</span></div>
          {filtered.length ? (
            <div className={view === "grid" ? "fm-file-grid" : "fm-file-list"}>
              {filtered.map((entry) => {
                const Icon = entry.icon;
                const body = <><div className="fm-file-icon"><Icon size={25} strokeWidth={1.65} /></div><div className="fm-file-copy"><strong>{entry.name}</strong><span>{entry.description}</span></div><div className="fm-file-meta"><span>{entry.type === "folder" ? "Folder" : entry.type === "file" ? "Document" : "Web link"}</span>{entry.external ? <ExternalLink size={14} /> : <ChevronRight size={15} />}</div></>;
                return entry.external ? <a key={entry.name} href={entry.href} target={entry.href.startsWith("mailto:") ? undefined : "_blank"} rel="noreferrer" className="fm-entry">{body}</a> : <Link key={entry.name} href={entry.href} className="fm-entry">{body}</Link>;
              })}
            </div>
          ) : <div className="fm-empty"><Search size={25} /><strong>No matching files</strong><span>Try another name or choose a different location.</span></div>}

          <footer className="fm-footer"><span><span className="fm-online-dot" /> All directories ready</span><span><Clock3 size={13} /> Built to explore</span><span>© {new Date().getFullYear()} Raghav Sharma</span></footer>
        </section>
      </div>
    </main>
  );
}
