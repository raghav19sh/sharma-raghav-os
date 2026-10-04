"use client";

import {
  Activity,
  Battery,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileCode2,
  FileText,
  Folder,
  Github,
  HardDrive,
  Info,
  LayoutGrid,
  LockKeyhole,
  Mail,
  Maximize2,
  Menu,
  Minimize2,
  Music2,
  Network,
  Play,
  Pause,
  Power,
  Search,
  Settings,
  Shield,
  Terminal as TerminalIcon,
  UserRound,
  Wifi,
  Volume2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import SecurityTools from "@/components/security/SecurityTools";

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

type WindowId = "files" | "terminal" | "about" | "research" | "projects" | "security" | "settings" | "music";

type WindowState = {
  id: WindowId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  z: number;
};

const APP_META: Record<WindowId, { label: string; hint: string; icon: typeof Folder }> = {
  files: { label: "Files", hint: "Browse the public workspace", icon: Folder },
  terminal: { label: "Terminal", hint: "Local command interface", icon: TerminalIcon },
  about: { label: "About", hint: "Profile & skills", icon: UserRound },
  research: { label: "Research", hint: "Research archive", icon: BookOpen },
  projects: { label: "Projects", hint: "Engineering case files", icon: Code2 },
  security: { label: "Security Lab", hint: "Interactive local tools", icon: Shield },
  settings: { label: "Settings", hint: "Visitor preferences", icon: Settings },
  music: { label: "Music", hint: "Local audio library", icon: Music2 },
};

const INITIAL_WINDOWS: WindowState[] = [
  { id: "files", title: "Files", x: 520, y: 300, width: 660, height: 470, minimized: false, maximized: false, z: 4 },
  { id: "terminal", title: "Terminal", x: 70, y: 390, width: 500, height: 400, minimized: false, maximized: false, z: 5 },
];

const TRACKS = [
  { title: "Soundtrack", file: "/music/soundtrack.mp3", note: "Sharma-Raghav OS" },
  { title: "Für Elise", file: "/music/Fu╠êr Elise.mp3", note: "Classical" },
  { title: "Rain Ambient", file: "/music/rain-ambient.mp3", note: "Ambient" },
];

const DESKTOP_APPS: WindowId[] = ["about", "research", "projects", "security", "settings", "music"];

export default function RaghavOSDesktop({
  profile,
  projects,
  research,
  databaseOnline,
}: {
  profile: Profile | null;
  projects: Project[];
  research: Research[];
  databaseOnline: boolean;
}) {
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [menu, setMenu] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [sessionStart] = useState(() => Date.now());
  const [drag, setDrag] = useState<{ id: WindowId; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, 1000);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!drag) return;
    const move = (event: PointerEvent) => {
      setWindows((current) =>
        current.map((win) => {
          if (win.id !== drag.id || win.maximized) return win;
          const nextX = Math.max(8, Math.min(window.innerWidth - 140, event.clientX - drag.offsetX));
          const nextY = Math.max(34, Math.min(window.innerHeight - 100, event.clientY - drag.offsetY));
          return { ...win, x: nextX, y: nextY };
        })
      );
    };
    const up = () => setDrag(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag]);

  function focus(id: WindowId) {
    setWindows((current) => {
      const top = current.reduce((highest, win) => Math.max(highest, win.z), 0);
      return current.map((win) => win.id === id ? { ...win, minimized: false, z: top + 1 } : win);
    });
  }

  function openWindow(id: WindowId) {
    setWindows((current) => {
      const top = current.reduce((highest, win) => Math.max(highest, win.z), 0);
      const existing = current.find((win) => win.id === id);
      if (existing) {
        return current.map((win) => win.id === id ? { ...win, minimized: false, z: top + 1 } : win);
      }
      const offset = current.length * 24;
      return [...current, { id, title: APP_META[id].label, x: 160 + offset, y: 90 + offset, width: id === "security" ? 930 : id === "research" || id === "projects" ? 820 : 650, height: id === "security" ? 650 : 520, minimized: false, maximized: false, z: top + 1 }];
    });
    setMenu(null);
  }

  function closeWindow(id: WindowId) {
    setWindows((current) => current.filter((win) => win.id !== id));
  }

  function minimizeWindow(id: WindowId) {
    setWindows((current) => current.map((win) => win.id === id ? { ...win, minimized: true } : win));
  }

  function toggleMaximize(id: WindowId) {
    setWindows((current) => current.map((win) => win.id === id ? { ...win, maximized: !win.maximized, minimized: false } : win));
  }

  function resetWindows() {
    setWindows(INITIAL_WINDOWS.map((win) => ({ ...win })));
  }

  function closeAll() {
    setWindows([]);
  }

  function startDrag(id: WindowId, event: React.PointerEvent<HTMLDivElement>) {
    const target = windows.find((win) => win.id === id);
    if (!target || target.maximized || event.button !== 0) return;
    focus(id);
    setDrag({ id, offsetX: event.clientX - target.x, offsetY: event.clientY - target.y });
  }

  const uptime = Math.floor((now.getTime() - sessionStart) / 1000);
  const uptimeText = [Math.floor(uptime / 3600), Math.floor((uptime % 3600) / 60), uptime % 60]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");

  const displayDate = now.toLocaleString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  function renderWindowContent(id: WindowId) {
    switch (id) {
      case "files":
        return <FilesWindow openWindow={openWindow} />;
      case "terminal":
        return <TerminalWindow openWindow={openWindow} />;
      case "about":
        return <AboutWindow profile={profile} />;
      case "research":
        return <ResearchWindow research={research} />;
      case "projects":
        return <ProjectsWindow projects={projects} />;
      case "security":
        return <SecurityTools />;
      case "settings":
        return <SettingsWindow />;
      case "music":
        return <MusicWindow />;
    }
  }

  return (
    <main className="os-root" onClick={() => menu && setMenu(null)}>
      <div className="os-wallpaper">
        <div className="os-stars" />
        <div className="os-topbar" onClick={(event) => event.stopPropagation()}>
          <button className="os-system" onClick={() => setMenu(menu === "system" ? null : "system")} aria-label="System menu">
            <span className="os-logo">RS</span>
            <strong>RAGHAV SHARMA OS</strong>
          </button>

          <nav className="os-menus" aria-label="System menus">
            {["File", "Edit", "View", "Go", "Window", "Help"].map((label) => (
              <button
                key={label}
                className={menu === label ? "os-menu is-open" : "os-menu"}
                onClick={() => setMenu(menu === label ? null : label)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="os-status">
            {online ? <Wifi size={14} /> : <Network size={14} />}
            <Volume2 size={14} />
            <Battery size={15} />
            <span>{displayDate}</span>
            <Search size={14} onClick={() => openWindow("terminal")} className="os-clickable" />
          </div>

          {menu && (
            <div className="os-dropdown" onClick={(event) => event.stopPropagation()}>
              {menu === "File" && <>
                <button onClick={() => openWindow("files")}>Open Files</button>
                <button onClick={() => openWindow("terminal")}>New Terminal</button>
              </>}
              {menu === "Edit" && <>
                <button onClick={() => navigator.clipboard?.writeText("Raghav Sharma OS")}>Copy system name</button>
                <button onClick={() => navigator.clipboard?.writeText(window.location.href)}>Copy URL</button>
              </>}
              {menu === "View" && <>
                <button onClick={resetWindows}>Reset desktop layout</button>
                <button onClick={closeAll}>Close all windows</button>
              </>}
              {menu === "Go" && DESKTOP_APPS.map((id) => <button key={id} onClick={() => openWindow(id)}>{APP_META[id].label}</button>)}
              {menu === "Window" && <>
                <button onClick={() => setWindows((current) => current.map((win) => ({ ...win, minimized: true })))}>Minimize all</button>
                <button onClick={resetWindows}>Restore default windows</button>
              </>}
              {menu === "Help" && <>
                <button onClick={() => openWindow("about")}>About this OS</button>
                <button onClick={() => openWindow("terminal")}>Terminal help</button>
              </>}
              {menu === "system" && <>
                <button onClick={() => openWindow("settings")}>System Settings</button>
                <button onClick={() => setMenu(null)}>Lock screen</button>
              </>}
            </div>
          )}
        </div>

        <div className="os-desktop">
          <div className="os-desktop-icons">
            {DESKTOP_APPS.map((id) => {
              const Icon = APP_META[id].icon;
              return (
                <button key={id} className="os-desktop-icon" onClick={(event) => { event.stopPropagation(); openWindow(id); }}>
                  <span className="os-icon-tile"><Icon size={27} /></span>
                  <span>{APP_META[id].label}</span>
                </button>
              );
            })}
          </div>

          <section className="os-center" onClick={(event) => event.stopPropagation()}>
            <div className="os-hero">
              <span className="os-kicker">SECURITY WORKSTATION</span>
              <h1>RAGHAV SHARMA</h1>
              <p>Cybersecurity &amp; Forensics</p>
              <span className="os-cursor">▸_</span>
              <div className="os-keywords">
                <span>SECURITY RESEARCH</span>
                <span>ENGINEERING</span>
                <span>DETECTION</span>
                <span>DOCUMENTATION</span>
              </div>
            </div>

            <div className="os-cards">
              <button onClick={() => openWindow("research")} className="os-card">
                <BookOpen size={29} />
                <span><b>Research</b><small>Explorations, Analysis &amp; Notes</small></span>
                <ChevronRight size={19} />
              </button>
              <button onClick={() => openWindow("projects")} className="os-card">
                <Code2 size={29} />
                <span><b>Projects</b><small>Engineering &amp; Open Source</small></span>
                <ChevronRight size={19} />
              </button>
              <button onClick={() => openWindow("security")} className="os-card">
                <Shield size={29} />
                <span><b>Security Lab</b><small>SOC, Tools &amp; Experiments</small></span>
                <ChevronRight size={19} />
              </button>
            </div>
          </section>

          <aside className="os-status-card" onClick={(event) => event.stopPropagation()}>
            <div className="os-status-card__head">
              <span>SYSTEM STATUS</span>
              <span className={online ? "os-live" : "os-offline"}>{online ? "ONLINE" : "OFFLINE"} <i /></span>
            </div>
            <div className="os-status-line"><Wifi size={14} /><span>Network</span><b>{online ? "Connected" : "Offline"}</b></div>
            <div className="os-status-line"><HardDrive size={14} /><span>Database</span><b>{databaseOnline ? "Connected" : "Unavailable"}</b></div>
            <div className="os-status-line"><Activity size={14} /><span>Session</span><b>{uptimeText}</b></div>
            <div className="os-status-line"><Zap size={14} /><span>Focus</span><b>Application Security</b></div>
          </aside>

          <div className="os-quote">
            <span>BUILD</span>
            <span>ANALYSE</span>
            <span>SECURE</span>
            <span>REPEAT</span>
          </div>

          {windows.map((win) => {
            if (win.minimized) return null;
            const Icon = APP_META[win.id].icon;
            const style = win.maximized
              ? undefined
              : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z };
            return (
              <section
                key={win.id}
                className={win.maximized ? "os-window is-maximized" : "os-window"}
                style={style}
                onMouseDown={() => focus(win.id)}
                aria-label={win.title}
              >
                <div
                  className="os-window-bar"
                  onPointerDown={(event) => startDrag(win.id, event)}
                >
                  <div className="os-window-title">
                    <span className="os-window-dot red" />
                    <span className="os-window-dot amber" />
                    <span className="os-window-dot green" />
                    <Icon size={14} />
                    <span>{win.title}</span>
                  </div>
                  <div className="os-window-actions">
                    <button onClick={(event) => { event.stopPropagation(); minimizeWindow(win.id); }} aria-label="Minimize"><Minimize2 size={13} /></button>
                    <button onClick={(event) => { event.stopPropagation(); toggleMaximize(win.id); }} aria-label="Maximize"><Maximize2 size={13} /></button>
                    <button onClick={(event) => { event.stopPropagation(); closeWindow(win.id); }} aria-label="Close"><X size={14} /></button>
                  </div>
                </div>
                <div className="os-window-body">{renderWindowContent(win.id)}</div>
              </section>
            );
          })}

          <div className="os-dock" onClick={(event) => event.stopPropagation()}>
            <button className="os-dock-item os-dock-launch" onClick={() => openWindow("files")} title="Files"><LayoutGrid size={17} /></button>
            <span className="os-dock-sep" />
            {(["terminal", "files", "research", "projects", "security", "music", "settings"] as WindowId[]).map((id) => {
              const Icon = APP_META[id].icon;
              const active = windows.some((win) => win.id === id && !win.minimized);
              return (
                <button key={id} className={active ? "os-dock-item is-active" : "os-dock-item"} onClick={() => openWindow(id)} title={APP_META[id].label}>
                  <Icon size={18} />
                  {active && <i />}
                </button>
              );
            })}
          </div>

          <div className="os-bottom-bar">
            <span><span className={online ? "status-dot" : "status-dot is-offline"} />{online ? "Connected" : "Offline"}</span>
            <span>RAGHAV-OS / HOME</span>
            <span>Visitor mode · read-only</span>
          </div>
        </div>
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
        <div className="empty-state"><BookOpen size={20} /><p>No public research records are currently published.</p></div>
      ) : (
        <div className="research-grid">
          <aside className="research-tree">
            <div className="tree-root">PUBLIC RESEARCH</div>
            {research.map((record) => (
              <button className={record.id === selected ? "tree-node is-selected" : "tree-node"} key={record.id} onClick={() => setSelected(record.id)}>
                <ChevronRight size={13} />{record.title}
              </button>
            ))}
          </aside>
          <section className="research-detail">
            {item && <>
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
            </>}
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
      <WindowHeader eyebrow="SECURITY ARCHIVE" title="Projects" subtitle="Every build is presented as a compact case file: problem, method, evidence and outcome." />
      {!projects.length ? (
        <div className="empty-state"><Code2 size={20} /><p>No public case files are currently published.</p></div>
      ) : (
        <>
          <div className="project-tabs">
            {projects.map((project, index) => (
              <button key={project.id} className={project.id === selected ? "project-tab is-selected" : "project-tab"} onClick={() => setSelected(project.id)}>
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
                  {item.live_url && <a href={item.live_url} target="_blank" rel="noreferrer">Live <Zap size={12} /></a>}
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
    window.dispatchEvent(new CustomEvent("sr-os-motion-change", { detail: next }));
  }

  return (
    <div className="content-scroll settings-window">
      <WindowHeader eyebrow="SYSTEM PREFERENCES" title="Settings" subtitle="Visitor-only preferences are stored locally in this browser." />
      <div className="content-card setting-row">
        <div><b>Reduce motion</b><p>Reduce ambient animation for a calmer workspace.</p></div>
        <button className={reducedMotion ? "switch is-on" : "switch"} role="switch" aria-checked={reducedMotion} onClick={toggleMotion}><span /></button>
      </div>
      <div className="content-card">
        <span className="section-label">ACCESS</span>
        <div className="settings-note"><LockKeyhole size={14} />Visitor session — read-only. Administrative controls are not exposed in the public workstation.</div>
      </div>
    </div>
  );
}

function MusicWindow() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const current = TRACKS[track] ?? TRACKS[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    audio.load();
    if (playing) void audio.play().catch(() => setPlaying(false));
  }, [current, playing]);

  function select(index: number) {
    setTrack(index);
    setTime(0);
    setPlaying(true);
    window.setTimeout(() => void audioRef.current?.play().catch(() => setPlaying(false)), 0);
  }

  function step(delta: number) {
    const next = (track + delta + TRACKS.length) % TRACKS.length;
    select(next);
  }

  return (
    <div className="music-window content-scroll">
      <audio
        ref={audioRef}
        src={current?.file}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onEnded={() => step(1)}
      />
      <div className="music-art"><Music2 size={34} /></div>
      <span className="section-label">LOCAL AUDIO</span>
      <h2>{current?.title}</h2>
      <p>{current?.note}</p>
      <input
        className="music-seek"
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={Math.min(time, duration || 0)}
        onChange={(event) => { const value = Number(event.target.value); setTime(value); if (audioRef.current) audioRef.current.currentTime = value; }}
        aria-label="Track progress"
      />
      <div className="music-time"><span>{formatSeconds(time)}</span><span>{formatSeconds(duration)}</span></div>
      <div className="music-controls">
        <button onClick={() => step(-1)} aria-label="Previous"><ChevronLeft size={18} /></button>
        <button className="music-play" onClick={() => { if (!audioRef.current) return; if (playing) audioRef.current.pause(); else void audioRef.current.play().catch(() => {}); }} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button onClick={() => step(1)} aria-label="Next"><ChevronRight size={18} /></button>
      </div>
      <div className="playlist">
        {TRACKS.map((item, index) => (
          <button key={item.file} className={index === track ? "playlist-item is-current" : "playlist-item"} onClick={() => select(index)}>
            <span><Music2 size={14} />{item.title}</span>
            {index === track && <i>{playing ? "PLAYING" : "PAUSED"}</i>}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatSeconds(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return minutes + ":" + seconds;
}

function FilesWindow({ openWindow }: { openWindow: (id: WindowId) => void }) {
  const [folder, setFolder] = useState<"home" | "music">("home");

  if (folder === "music") {
    return (
      <div className="files-window content-scroll">
        <div className="files-path"><button onClick={() => setFolder("home")}><ChevronLeft size={13} />Home</button><span>/</span><b>Music</b></div>
        <div className="file-grid">
          {TRACKS.map((track) => (
            <button key={track.file} className="file-card" onClick={() => openWindow("music")}>
              <span className="file-card-icon"><Music2 size={23} /></span>
              <strong>{track.title}.mp3</strong>
              <small>Local audio file</small>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const folders: { id: WindowId | "music"; label: string; icon: typeof Folder; description: string }[] = [
    { id: "about", label: "About", icon: UserRound, description: "Profile, skills, experience" },
    { id: "research", label: "Research", icon: BookOpen, description: "Published research archive" },
    { id: "projects", label: "Projects", icon: Code2, description: "Engineering case files" },
    { id: "security", label: "Security Lab", icon: Shield, description: "Browser-only tools" },
    { id: "settings", label: "Settings", icon: Settings, description: "Visitor preferences" },
    { id: "music", label: "Music", icon: Music2, description: "Local audio library" },
  ];

  return (
    <div className="files-window content-scroll">
      <div className="files-path"><span>Home</span><span>/</span><b>RAGHAV-OS</b></div>
      <div className="file-grid">
        {folders.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className="file-card" onClick={() => item.id === "music" ? setFolder("music") : openWindow(item.id)}>
              <span className="file-card-icon"><Icon size={23} /></span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </button>
          );
        })}
      </div>
      <div className="files-foot"><FileText size={13} /> Public workstation filesystem · selected public content only</div>
    </div>
  );
}

function TerminalWindow({ openWindow }: { openWindow: (id: WindowId) => void }) {
  const [lines, setLines] = useState<string[]>([
    "Raghav Sharma OS v3.0",
    "Public workstation — read-only",
    "",
    "Type help to list commands.",
  ]);
  const [input, setInput] = useState("");

  function run(command: string) {
    const value = command.trim().toLowerCase();
    if (!value) return;
    if (value === "clear") {
      setLines([]);
      return;
    }
    if (value === "help") {
      setLines((current) => [...current, "$ " + command, "about    Open profile", "research Open research", "projects Open projects", "security Open Security Lab", "settings Open settings", "music    Open Music", "clear    Clear terminal"]);
      return;
    }
    const map: Record<string, WindowId> = {
      about: "about",
      research: "research",
      projects: "projects",
      security: "security",
      settings: "settings",
      music: "music",
    };
    const appId = map[value];
    if (appId) {
      setLines((current) => [...current, "$ " + command, "Opening " + APP_META[appId].label + "…"]);
      openWindow(appId);
      return;
    }
    setLines((current) => [...current, "$ " + command, "command not found: " + value]);
  }

  return (
    <div className="terminal-window">
      <div className="terminal-banner"><span>visitor@raghav-os</span><span>/home/public</span></div>
      <div className="terminal-output">
        {lines.map((line, index) => <div key={index}>{line || " "}</div>)}
      </div>
      <form className="terminal-input" onSubmit={(event) => { event.preventDefault(); run(input); setInput(""); }}>
        <span>visitor@os:~$</span>
        <input value={input} onChange={(event) => setInput(event.target.value)} autoFocus aria-label="Terminal command" spellCheck={false} />
      </form>
    </div>
  );
}
