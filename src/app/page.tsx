"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight, ChevronRight, Clock3, FileText, FlaskConical, Folder,
  FolderOpen, Grid2X2, HardDrive, Home, LayoutList, Search, ShieldCheck,
  UserRound, Wrench, Globe, Github, Mail, ExternalLink, Terminal, Activity,
  Command, Cpu, Radio, BriefcaseBusiness, Code2,
} from "lucide-react";

type Entry = {
  name: string;
  type: "DIR" | "WEB" | "DOC";
  description: string;
  href: string;
  icon: typeof Folder;
  external?: boolean;
  category: string;
  status: string;
  id: string;
};

const entries: Entry[] = [
  { id: "01", name: "PROJECTS", type: "DIR", description: "Applications, experiments and source repositories", href: "/os", icon: Code2, category: "WORKSPACE", status: "ACTIVE" },
  { id: "02", name: "RESEARCH", type: "DIR", description: "Security research, technical notes and write-ups", href: "/os", icon: FlaskConical, category: "WORKSPACE", status: "ACTIVE" },
  { id: "03", name: "SECURITY LAB", type: "DIR", description: "Cybersecurity tools, labs and investigations", href: "/os", icon: ShieldCheck, category: "WORKSPACE", status: "ACTIVE" },
  { id: "04", name: "WEB TOOLS", type: "WEB", description: "Image, PDF and browser-based utilities", href: "https://tools.sharma-raghav.com", icon: Wrench, external: true, category: "ONLINE", status: "LIVE" },
  { id: "05", name: "DIGITRUST", type: "WEB", description: "Digital trust, media analysis and source signals", href: "https://digitrust.sharma-raghav.com", icon: Radio, external: true, category: "ONLINE", status: "LIVE" },
  { id: "06", name: "PROFILE", type: "DOC", description: "Background, capabilities and contact information", href: "/os", icon: UserRound, category: "PERSONAL", status: "OPEN" },
  { id: "07", name: "RESUME", type: "DOC", description: "Professional profile and experience", href: "/resume", icon: FileText, category: "PERSONAL", status: "PDF / WEB" },
  { id: "08", name: "GITHUB", type: "WEB", description: "Source code, repositories and open-source work", href: "https://github.com/raghav19sh", icon: Github, external: true, category: "ONLINE", status: "LIVE" },
  { id: "09", name: "CONTACT", type: "WEB", description: "Direct email for projects and collaboration", href: "mailto:contact@sharma-raghav.com", icon: Mail, external: true, category: "PERSONAL", status: "EMAIL" },
];

const sections = ["ALL SYSTEMS", "WORKSPACE", "ONLINE", "PERSONAL"];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");
  const [activeSection, setActiveSection] = useState("ALL SYSTEMS");
  const [now] = useState(() => new Date());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((entry) =>
      (activeSection === "ALL SYSTEMS" || entry.category === activeSection) &&
      (!q || [entry.name, entry.description, entry.category, entry.type].some((s) => s.toLowerCase().includes(q)))
    );
  }, [search, activeSection]);

  return (
    <main className="fm-shell bloomberg-shell">
      <header className="bb-topline">
        <Link href="/" className="bb-brand"><span className="bb-brand-mark">SR</span><span><strong>SHARMA<span> / </span>TERMINAL</strong><small>PERSONAL INTELLIGENCE SYSTEM</small></span></Link>
        <div className="bb-market-status"><i /> SYSTEM STATUS <b>OPERATIONAL</b></div>
        <div className="bb-top-right"><span>IN / LOCAL</span><span className="bb-clock">{now.toLocaleTimeString("en-IN", {hour:"2-digit",minute:"2-digit",hour12:false})} IST</span></div>
      </header>

      <div className="bb-commandbar">
        <div className="bb-command-label"><Command size={13} /> WORKSPACE DIRECTORY</div>
        <div className="bb-command-path"><span>HOME</span><ChevronRight size={12}/><strong>FILE INDEX</strong></div>
        <Link href="/os" className="bb-command-link">LAUNCH OS <ArrowUpRight size={13}/></Link>
      </div>

      <section className="bb-ticker" aria-label="System overview">
        <div><span>SR TERMINAL</span><b>PERSONAL WORKSPACE</b></div>
        <div><span>MODULES</span><b>{String(entries.length).padStart(2,"0")}</b></div>
        <div><span>ONLINE LINKS</span><b className="bb-green">03 LIVE</b></div>
        <div><span>MODE</span><b>DIRECTORY / 001</b></div>
        <div><span>DATE</span><b>{now.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase()}</b></div>
      </section>

      <div className="bb-layout">
        <aside className="bb-sidebar">
          <div className="bb-side-heading">NAVIGATION <span>F1</span></div>
          {sections.map((section, index) => <button key={section} onClick={() => setActiveSection(section)} className={activeSection === section ? "bb-nav-item selected" : "bb-nav-item"}><span className="bb-nav-num">{String(index+1).padStart(2,"0")}</span><span>{section}</span>{activeSection === section && <ChevronRight size={13}/>}</button>)}
          <div className="bb-side-rule"/>
          <div className="bb-side-heading">QUICK LAUNCH</div>
          <Link href="/os" className="bb-quick-link"><Terminal size={14}/> RAGHAV OS <ArrowUpRight size={12}/></Link>
          <a href="https://github.com/raghav19sh" target="_blank" rel="noreferrer" className="bb-quick-link"><Github size={14}/> SOURCE CODE <ArrowUpRight size={12}/></a>
          <div className="bb-side-status"><Activity size={14}/><div><b>DIRECTORY SERVICE</b><span>Responding normally</span></div><i/></div>
        </aside>

        <section className="bb-main">
          <div className="bb-title-row">
            <div><div className="bb-eyebrow"><span>HOME</span> / <span>FILE INDEX</span> / 00{sections.indexOf(activeSection)+1}</div><h1>PERSONAL <em>DIRECTORY</em></h1><p>Projects, research, digital utilities and professional information. Select an entry to open its destination.</p></div>
            <div className="bb-title-stamp"><span>TERMINAL ID</span><strong>SR-001</strong><span>ACCESS / PUBLIC</span></div>
          </div>

          <div className="bb-toolbar">
            <label className="bb-search"><Search size={15}/><input aria-label="Search directory" placeholder="SEARCH DIRECTORY..." value={search} onChange={(e)=>setSearch(e.target.value)}/><kbd>⌘ K</kbd></label>
            <div className="bb-view-controls"><span>DISPLAY</span><button className={view==="list"?"active":""} onClick={()=>setView("list")} aria-label="List view"><LayoutList size={15}/></button><button className={view==="grid"?"active":""} onClick={()=>setView("grid")} aria-label="Grid view"><Grid2X2 size={15}/></button></div>
          </div>

          <div className="bb-table-head"><span>IDX</span><span>NAME / RESOURCE</span><span>TYPE</span><span>STATUS</span><span>OPEN</span></div>
          <div className={view==="grid"?"bb-resource-grid":"bb-resource-list"}>
            {filtered.map((entry)=>{
              const Icon=entry.icon;
              const contents=<><span className="bb-entry-index">{entry.id}</span><div className="bb-entry-name"><span className="bb-entry-icon"><Icon size={17}/></span><span><strong>{entry.name}</strong><small>{entry.description}</small></span></div><span className="bb-entry-type">{entry.type}</span><span className={entry.status==="LIVE"||entry.status==="ACTIVE"?"bb-entry-status live":"bb-entry-status"}><i/>{entry.status}</span><span className="bb-entry-open"><ArrowUpRight size={15}/></span></>;
              return entry.external ? <a key={entry.id} className="bb-resource" href={entry.href} target={entry.href.startsWith("mailto:")?undefined:"_blank"} rel="noreferrer">{contents}</a> : <Link key={entry.id} className="bb-resource" href={entry.href}>{contents}</Link>;
            })}
          </div>
          {filtered.length===0&&<div className="bb-empty">NO MATCHING RECORDS — MODIFY SEARCH QUERY</div>}

          <div className="bb-bottom-panels">
            <div className="bb-info-panel"><div className="bb-panel-title"><span><Cpu size={13}/> WORKSPACE SUMMARY</span><b>SYS / 01</b></div><div className="bb-summary-row"><span>Primary focus</span><strong>CYBERSECURITY + SOFTWARE</strong></div><div className="bb-summary-row"><span>Interface</span><strong>WEB DIRECTORY</strong></div><div className="bb-summary-row"><span>Navigation</span><strong>LINK / WINDOW</strong></div></div>
            <div className="bb-info-panel bb-status-panel"><div className="bb-panel-title"><span><BriefcaseBusiness size={13}/> ACCESS POINTS</span><b>NET / 02</b></div><div className="bb-access-row"><span className="bb-access-dot"/> <span>TOOLS PLATFORM</span><a href="https://tools.sharma-raghav.com" target="_blank" rel="noreferrer">OPEN <ArrowUpRight size={11}/></a></div><div className="bb-access-row"><span className="bb-access-dot"/> <span>DIGITRUST PLATFORM</span><a href="https://digitrust.sharma-raghav.com" target="_blank" rel="noreferrer">OPEN <ArrowUpRight size={11}/></a></div><div className="bb-access-row"><span className="bb-access-dot"/> <span>GITHUB PROFILE</span><a href="https://github.com/raghav19sh" target="_blank" rel="noreferrer">OPEN <ArrowUpRight size={11}/></a></div></div>
          </div>

          <footer className="bb-footer"><span>SHARMA / TERMINAL <b>v1.0</b></span><span><i/> ALL SYSTEMS NOMINAL</span><span>© {now.getFullYear()} RAGHAV SHARMA</span></footer>
        </section>
      </div>
    </main>
  );
}
