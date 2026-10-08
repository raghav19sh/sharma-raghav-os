"use client";

import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Github,
  HardDrive,
  LockKeyhole,
  Mail,
  Maximize2,
  Menu,
  Minimize2,
  Network,
  Search,
  Settings,
  Shield,
  UserRound,
  Wifi,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import SecurityTools from "@/components/security/SecurityTools";
import AdminWindow from "@/components/admin/AdminWindow";

type Profile = {
  display_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  email_public: string | null;
  linkedin_url: string | null;
  github_url: string | null;
};

type Project = {
  id: string;
  slug: string;
  title: string;
  kind: string | null;
  summary: string | null;
  body: string | null;
  repo_url: string | null;
  live_url: string | null;
  stack: string[];
  status: string;
  started_at: string | null;
};

type Research = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  summary: string | null;
  body: string | null;
  status: string;
  read_time_minutes: number | null;
  published_at: string | null;
};

type AppId = "about" | "research" | "projects" | "security" | "settings" | "admin";

type WindowState = {
  id: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  z: number;
};

const APP_META: Record<AppId, { label: string; icon: string }> = {
  about: { label: "About", icon: "/os/about.svg" },
  research: { label: "Research", icon: "/os/research.svg" },
  projects: { label: "Projects", icon: "/os/projects.svg" },
  security: { label: "Security Lab", icon: "/os/security.svg" },
  settings: { label: "Settings", icon: "/os/settings.svg" },
  admin: { label: "Admin", icon: "/os/admin.svg" },
};

const APPS: AppId[] = ["about", "research", "projects", "security", "settings", "admin"];


export default function RaghavOSDesktop({
  profile,
  projects,
  research,
  databaseOnline,
  wallpaperUrl,
}: {
  profile: Profile | null;
  projects: Project[];
  research: Research[];
  databaseOnline: boolean;
  wallpaperUrl: string;
}) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [menu, setMenu] = useState<"system" | "File" | "Edit" | "View" | "Go" | "Window" | "Help" | null>(null);
  const [online, setOnline] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [sessionStart] = useState(() => Date.now());
  const [drag, setDrag] = useState<{ id: AppId; offsetX: number; offsetY: number } | null>(null);
  const [resize, setResize] = useState<{
    id: AppId;
    direction: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startLeft: number;
    startTop: number;
  } | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const interval = window.setInterval(tick, 1000);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!drag && !resize) return;

    const move = (event: PointerEvent) => {
      if (drag) {
        setWindows((current) =>
          current.map((win) => {
            if (win.id !== drag.id || win.maximized) return win;
            const nextX = Math.max(8, Math.min(window.innerWidth - 160, event.clientX - drag.offsetX));
            const nextY = Math.max(42, Math.min(window.innerHeight - 120, event.clientY - drag.offsetY));
            return { ...win, x: nextX, y: nextY };
          }),
        );
      }

      if (resize) {
        const minWidth = 320;
        const minHeight = 220;
        const dx = event.clientX - resize.startX;
        const dy = event.clientY - resize.startY;

        setWindows((current) =>
          current.map((win) => {
            if (win.id !== resize.id || win.maximized) return win;

            let width = resize.startWidth;
            let height = resize.startHeight;
            let x = resize.startLeft;
            let y = resize.startTop;

            if (resize.direction.includes("e")) width = Math.max(minWidth, resize.startWidth + dx);
            if (resize.direction.includes("s")) height = Math.max(minHeight, resize.startHeight + dy);

            if (resize.direction.includes("w")) {
              width = Math.max(minWidth, resize.startWidth - dx);
              x = resize.startLeft + (resize.startWidth - width);
            }

            if (resize.direction.includes("n")) {
              height = Math.max(minHeight, resize.startHeight - dy);
              y = resize.startTop + (resize.startHeight - height);
            }

            const maxRight = window.innerWidth - 8;
            const maxBottom = window.innerHeight - 42;
            if (x + width > maxRight) width = Math.max(minWidth, maxRight - x);
            if (y + height > maxBottom) height = Math.max(minHeight, maxBottom - y);

            return { ...win, x, y, width, height };
          }),
        );
      }
    };

    const up = () => {
      setDrag(null);
      setResize(null);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag, resize]);

  function focus(id: AppId) {
    setWindows((current) => {
      const top = current.reduce((max, win) => Math.max(max, win.z), 100);
      return current.map((win) => win.id === id ? { ...win, minimized: false, z: top + 1 } : win);
    });
  }

  function openWindow(id: AppId) {
    setWindows((current) => {
      const top = current.reduce((max, win) => Math.max(max, win.z), 100);
      const existing = current.find((win) => win.id === id);
      if (existing) {
        return current.map((win) => win.id === id ? { ...win, minimized: false, z: top + 1 } : win);
      }
      const offset = Math.min(current.length, 5) * 26;
      const wide = id === "security" || id === "projects" || id === "research";
      const size = {
        width: wide || id === "admin" ? 850 : 650,
        height: id === "security" || id === "admin" ? 610 : 500,
      };
      return [
        ...current,
        {
          id,
          title: APP_META[id].label,
          x: Math.max(34, 210 + offset),
          y: Math.max(52, 78 + offset),
          width: size.width,
          height: size.height,
          minimized: false,
          maximized: false,
          z: top + 1,
        },
      ];
    });
    setMenu(null);
  }

  function closeWindow(id: AppId) {
    setWindows((current) => current.filter((win) => win.id !== id));
  }

  function minimizeWindow(id: AppId) {
    setWindows((current) => current.map((win) => win.id === id ? { ...win, minimized: true } : win));
  }

  function toggleMaximize(id: AppId) {
    setWindows((current) => current.map((win) => win.id === id ? { ...win, maximized: !win.maximized, minimized: false } : win));
  }

  function resetDesktop() {
    setWindows([]);
    setMenu(null);
  }

  function startDrag(id: AppId, event: React.PointerEvent<HTMLDivElement>) {
    const target = windows.find((win) => win.id === id);
    if (!target || target.maximized || event.button !== 0) return;
    focus(id);
    setDrag({ id, offsetX: event.clientX - target.x, offsetY: event.clientY - target.y });
  }

  function startResize(id: AppId, direction: string, event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    const target = windows.find((win) => win.id === id);
    if (!target || target.maximized || event.button !== 0) return;

    focus(id);
    setResize({
      id,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: target.width,
      startHeight: target.height,
      startLeft: target.x,
      startTop: target.y,
    });
  }

  const elapsed = Math.floor((now.getTime() - sessionStart) / 1000);
  const uptime = [Math.floor(elapsed / 3600), Math.floor((elapsed % 3600) / 60), elapsed % 60]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  const stamp = now.toLocaleString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  function renderWindow(id: AppId) {
    switch (id) {
      case "about": return <AboutWindow profile={profile} />;
      case "research": return <ResearchWindow research={research} />;
      case "projects": return <ProjectsWindow projects={projects} />;
      case "security": return <SecurityTools />;
      case "settings": return <SettingsWindow />;
      case "admin": return <AdminWindow />;
    }
  }

  return (
    <main className="os-root" onClick={() => menu && setMenu(null)}>
      <div className="os-wallpaper" style={{ backgroundImage: "url(" + JSON.stringify(wallpaperUrl) + ")" }}>
        <div className="os-overlay" aria-hidden="true" />

        <header className="os-topbar" onClick={(event) => event.stopPropagation()}>
          <button className="os-system" type="button" onClick={() => setMenu(menu === "system" ? null : "system")} aria-label="Open system menu">
            <span className="os-logo">RS</span>
            <strong>RAGHAV SHARMA OS</strong>
          </button>

          <nav className="os-menus" aria-label="System menus">
            {(["File", "Edit", "View", "Go", "Window", "Help"] as const).map((label) => (
              <button
                className={menu === label ? "os-menu is-open" : "os-menu"}
                type="button"
                key={label}
                onClick={() => setMenu(menu === label ? null : label)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="os-status">
            {online ? <Wifi size={14} /> : <span className="status-offline"><Wifi size={14} /></span>}
            <span className="os-date">{stamp}</span>
            <Search size={14} className="os-search-button" onClick={() => openWindow("about")} />
            <button className="os-admin-trigger" type="button" onClick={(event) => { event.stopPropagation(); openWindow("admin"); }} aria-label="Open admin console" title="Admin Console"><LockKeyhole size={14} /></button>
          </div>

          {menu && (
            <div className="os-dropdown" onClick={(event) => event.stopPropagation()}>
              {menu === "system" && (
                <>
                  <button type="button" onClick={() => openWindow("settings")}>System Settings</button>
                  <button type="button" onClick={resetDesktop}>Clear desktop</button>
                </>
              )}
              {menu === "File" && (
                <>
                  <button type="button" onClick={() => openWindow("about")}>Open About</button>
                  <button type="button" onClick={() => openWindow("projects")}>Open Projects</button>
                </>
              )}
              {menu === "Edit" && (
                <>
                  <button type="button" onClick={() => navigator.clipboard?.writeText("Raghav Sharma OS")}>Copy system name</button>
                  <button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Copy URL</button>
                </>
              )}
              {menu === "View" && (
                <>
                  <button type="button" onClick={resetDesktop}>Reset desktop</button>
                  <button type="button" onClick={() => setWindows((current) => current.map((win) => ({ ...win, minimized: true })))}>Minimize all</button>
                </>
              )}
              {menu === "Go" && APPS.map((id) => (
                <button key={id} type="button" onClick={() => openWindow(id)}>{APP_META[id].label}</button>
              ))}
              {menu === "Window" && (
                <>
                  <button type="button" onClick={() => setWindows((current) => current.map((win) => ({ ...win, maximized: true, minimized: false })))}>Maximize all</button>
                  <button type="button" onClick={() => setWindows((current) => current.map((win) => ({ ...win, minimized: true })))}>Minimize all</button>
                </>
              )}
              {menu === "Help" && (
                <>
                  <button type="button" onClick={() => openWindow("about")}>About this OS</button>
                  <button type="button" onClick={() => openWindow("security")}>Security Lab</button>
                </>
              )}
            </div>
          )}
        </header>

        <section className="os-desktop" onClick={(event) => event.stopPropagation()}>
          <aside className="os-desktop-icons" aria-label="Applications">
            {APPS.map((id) => (
              <button className="os-desktop-icon" type="button" key={id} onClick={() => openWindow(id)} title={APP_META[id].label}>
                <img src={APP_META[id].icon} alt="" />
                <span>{APP_META[id].label}</span>
              </button>
            ))}
          </aside>

          <section className="os-center">
            <div className="os-hero">
              <span className="os-kicker">&gt;_ SECURITY WORKSTATION</span>
              <h1>RAGHAV <em>SHARMA</em></h1>
              <p>Cybersecurity &amp; Forensics</p>
              <span className="os-rule" />
              <div className="os-keywords">
                <span>SECURITY RESEARCH</span>
                <span>ENGINEERING</span>
                <span>DETECTION</span>
                <span>DOCUMENTATION</span>
              </div>
            </div>
          </section>

          <a className="os-resume-widget" href="/resume" onClick={(event) => event.stopPropagation()} aria-label="Open Raghav Sharma resume">
            <div className="os-resume-widget-top">
              <span>RESUME / 2026</span>
              <span className="os-resume-arrow">↗</span>
            </div>
            <strong>Raghav Sharma</strong>
            <span className="os-resume-role">CYBERSECURITY · VAPT · MALWARE</span>
            <span className="os-resume-action">VIEW RESUME</span>
          </a>

          <aside className="os-quiet-status" aria-label="System status">
            <div className="os-quiet-head">
              <span>SYSTEM</span>
              <b className={online ? "is-online" : "is-offline"}>{online ? "ONLINE" : "OFFLINE"}</b>
            </div>
            <div><Wifi size={13} /><span>Network</span><b>{online ? "Connected" : "Offline"}</b></div>
            <div><HardDrive size={13} /><span>Database</span><b>{databaseOnline ? "Connected" : "Unavailable"}</b></div>
            <div><span className="mini-dot" /><span>Session</span><b>{uptime}</b></div>
          </aside>

          {windows.map((win) => {
            if (win.minimized) return null;
            const meta = APP_META[win.id];
            return (
              <section
                key={win.id}
                className={win.maximized ? "os-window is-maximized" : "os-window"}
                style={win.maximized ? undefined : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z }}
                onMouseDown={() => focus(win.id)}
                aria-label={meta.label}
              >
                <div className="os-window-bar" onPointerDown={(event) => startDrag(win.id, event)}>
                  <div className="os-window-title">
                    <span className="window-dot" />
                    <img src={meta.icon} alt="" />
                    <strong>{meta.label}</strong>
                  </div>
                  <div className="os-window-actions">
                    <button type="button" onClick={(event) => { event.stopPropagation(); minimizeWindow(win.id); }} aria-label="Minimize"><Minimize2 size={13} /></button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); toggleMaximize(win.id); }} aria-label="Maximize"><Maximize2 size={13} /></button>
                    <button type="button" onClick={(event) => { event.stopPropagation(); closeWindow(win.id); }} aria-label="Close"><X size={14} /></button>
                  </div>
                </div>
                <div className="os-window-body">{renderWindow(win.id)}</div>
                {!win.maximized && (
                  <>
                    {["n", "s", "e", "w", "ne", "nw", "se", "sw"].map((direction) => (
                      <div
                        key={direction}
                        className={`os-window-resize-handle resize-${direction}`}
                        onPointerDown={(event) => startResize(win.id, direction, event)}
                        aria-hidden="true"
                      />
                    ))}
                  </>
                )}
              </section>
            );
          })}

          <nav className="os-dock" aria-label="Dock">
            <button type="button" className="os-dock-launch" onClick={() => openWindow("about")} title="About">
              <Menu size={18} />
            </button>
            {APPS.map((id) => {
              const active = windows.some((win) => win.id === id && !win.minimized);
              return (
                <button
                  type="button"
                  key={id}
                  className={active ? "os-dock-item is-active" : "os-dock-item"}
                  onClick={() => openWindow(id)}
                  title={APP_META[id].label}
                >
                  <img src={APP_META[id].icon} alt="" />
                  {active && <i />}
                </button>
              );
            })}
          </nav>

          <div className="os-bottom">
            <span><i className={online ? "status-dot" : "status-dot is-offline"} />{online ? "Connected" : "Offline"}</span>
            <span>RAGHAV-OS / HOME</span>
            <span>Visitor mode · read-only</span>
          </div>
        </section>
      </div>
    </main>
  );
}

function WindowHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="content-header">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function AboutWindow({ profile }: { profile: Profile | null }) {
  const displayName = profile?.display_name || "Raghav Sharma";
  const headline = profile?.headline || "Cybersecurity & Forensics";
  const bio = profile?.bio || "Focused on vulnerability assessment, security operations, research, and learning by building.";

  const skills = [
    ["Cybersecurity", "Malware Analysis · Static/Dynamic Analysis · Threat Intelligence · Incident Response · VAPT · OWASP Top 10 · Digital Forensics"],
    ["SOC / Detection", "SIEM fundamentals · Log Analysis · Threat Hunting · Alert Triage · MITRE ATT&CK"],
    ["Networking", "TCP/IP · DNS · DHCP · VPNs · Subnetting · Firewalls · Wireshark · Linux Security"],
    ["Tooling", "Python · Bash · Nmap · Burp Suite · Metasploit · Ghidra · x64dbg"],
  ];

  return (
    <div className="content-scroll">
      <WindowHeader eyebrow="IDENTITY" title={displayName} subtitle={headline} />
      <div className="about-grid">
        <article className="content-card about-main">
          <div className="initials">RS</div>
          <h3>Cybersecurity &amp; Forensics</h3>
          <p>{bio}</p>
          <div className="about-links">
            <a href={"mailto:" + (profile?.email_public || "contact@sharma-raghav.com")}><Mail size={14} />{profile?.email_public || "contact@sharma-raghav.com"}</a>
            <span><HardDrive size={14} />{profile?.location || "India"}</span>
            <a href={profile?.github_url || "https://github.com/raghav19sh"} target="_blank" rel="noreferrer"><Github size={14} />GitHub</a>
            <a href={profile?.linkedin_url || "https://www.linkedin.com/in/sharmaraghav1/"} target="_blank" rel="noreferrer"><Network size={14} />LinkedIn</a>
          </div>
        </article>
        <article className="content-card">
          <span className="section-label">BACKGROUND</span>
          <p><b>Education</b><br />B.Tech — Computer Science &amp; Engineering (CyberSecurity &amp; Forensics), MIT ADT University</p>
          <p><b>Experience</b><br />Business Analyst Virtual Intern, AICTE-EduSkills (Celonis-supported) · Grade O</p>
          <p><b>Working style</b><br />Learn by building · Understand systems · Document what you learn · Verify before assuming</p>
        </article>
      </div>
      <div className="content-card">
        <span className="section-label">SKILLS / EVIDENCE</span>
        <div className="skills-list">
          {skills.map(([name, value]) => <div key={name}><b>{name}</b><span>{value}</span></div>)}
        </div>
      </div>
    </div>
  );
}

function ResearchWindow({ research }: { research: Research[] }) {
  const [selected, setSelected] = useState(research[0]?.id ?? "");
  const item = research.find((record) => record.id === selected) ?? research[0] ?? null;
  const snippets = item?.body ? item.body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 4) : [];

  return (
    <div className="content-scroll research-window">
      <WindowHeader eyebrow="KNOWLEDGE GRAPH" title="Research" subtitle="Research is treated as a living system: questions branch into methods, results and future work." />
      {!research.length ? (
        <div className="empty-state"><Search size={20} /><p>No public research records are currently published.</p></div>
      ) : (
        <div className="research-grid">
          <aside className="research-tree">
            <div className="tree-root">PUBLIC RESEARCH</div>
            {research.map((record) => (
              <button className={record.id === selected ? "tree-node is-selected" : "tree-node"} key={record.id} type="button" onClick={() => setSelected(record.id)}>
                <ChevronRight size={13} />{record.title}
              </button>
            ))}
          </aside>
          <section className="research-detail">
            {item && (
              <>
                <div className="detail-meta">{item.kind} · {item.status.replace("_", " ").toUpperCase()}</div>
                <h3>{item.title}</h3>
                {item.summary && <p className="detail-summary">{item.summary}</p>}
                <div className="detail-sections">
                  {["PROBLEM", "HYPOTHESIS", "METHODOLOGY", "RESULTS"].map((label, index) => (
                    <div key={label}><span>0{index + 1} / {label}</span><p>{snippets[index] || "Recorded in the published research write-up."}</p></div>
                  ))}
                </div>
                <div className="record-row">
                  <span>{item.read_time_minutes ? item.read_time_minutes + " min read" : "Research record"}</span>
                  <span>{item.published_at ? new Date(item.published_at).toLocaleDateString("en-IN") : "Publication date not set"}</span>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function ProjectsWindow({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState(projects[0]?.id ?? "");
  const item = projects.find((project) => project.id === selected) ?? projects[0] ?? null;

  return (
    <div className="content-scroll projects-window">
      <WindowHeader eyebrow="ENGINEERING ARCHIVE" title="Projects" subtitle="Practical builds presented as compact engineering case files." />
      {!projects.length ? (
        <div className="empty-state"><Code2 size={20} /><p>No public projects are currently published.</p></div>
      ) : (
        <>
          <div className="project-tabs">
            {projects.map((project, index) => (
              <button key={project.id} type="button" className={project.id === selected ? "project-tab is-selected" : "project-tab"} onClick={() => setSelected(project.id)}>
                <small>CASE #{String(index + 1).padStart(3, "0")}</small>
                <strong>{project.title}</strong>
                <span>{project.status.replace("_", " ")}</span>
              </button>
            ))}
          </div>
          {item && (
            <article className="project-detail content-card">
              <div className="detail-meta">CASE FILE · {item.kind || "ENGINEERING"} · {item.status.toUpperCase()}</div>
              <h3>{item.title}</h3>
              <p className="detail-summary">{item.summary || "Problem statement documented in the project record."}</p>
              {item.body && <p className="project-body">{item.body}</p>}
              <div className="stack-row">{item.stack.map((tech) => <span key={tech}>{tech}</span>)}</div>
              <div className="record-row">
                <span>{item.started_at ? "Started " + new Date(item.started_at).toLocaleDateString("en-IN") : "Project record"}</span>
                <span className="project-links">
                  {item.repo_url && <a href={item.repo_url} target="_blank" rel="noreferrer">GitHub <Github size={12} /></a>}
                  {item.live_url && <a href={item.live_url} target="_blank" rel="noreferrer">Live <ChevronRight size={12} /></a>}
                </span>
              </div>
            </article>
          )}
        </>
      )}
    </div>
  );
}

function SettingsWindow() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.localStorage.getItem("sr-os-reduced-motion") === "true");
  }, []);

  function toggleMotion() {
    const next = !reducedMotion;
    setReducedMotion(next);
    window.localStorage.setItem("sr-os-reduced-motion", String(next));
  }

  return (
    <div className="content-scroll settings-window">
      <WindowHeader eyebrow="SYSTEM PREFERENCES" title="Settings" subtitle="Visitor-only preferences stay in this browser." />
      <div className="content-card setting-row">
        <div><b>Reduce motion</b><p>Reduce ambient movement for a calmer workspace.</p></div>
        <button className={reducedMotion ? "switch is-on" : "switch"} type="button" role="switch" aria-checked={reducedMotion} onClick={toggleMotion}><span /></button>
      </div>
      <div className="content-card">
        <span className="section-label">ACCESS</span>
        <div className="settings-note"><LockKeyhole size={14} />Public visitor session · read-only</div>
      </div>
    </div>
  );
}

