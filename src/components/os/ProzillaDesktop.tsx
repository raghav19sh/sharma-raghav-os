"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  Activity, BookOpen, Code2, FileText, Folder, Gamepad2, Globe2, Home, Laptop,
  Maximize2, Minus, Music2, Play, Search, Settings, Shield, Terminal, User,
  Volume2, VolumeX, X, Lock, Radio, PenLine, Zap, Sparkles, FolderOpen,
} from "lucide-react";
import type { StatusSnapshot } from "@/lib/data/status";

type AppId =
  | "about" | "research" | "projects" | "security" | "journal" | "knowledge"
  | "learning" | "media" | "system" | "games" | "terminal" | "music"
  | "now" | "timeline" | "reading-room" | "observatory" | "developer-workspace"
  | "changelog" | "soc" | "public-api" | "learning-hub" | "docs" | "privacy"
  | "engineering" | "security-lab" | "settings" | "minesweeper" | "wordle"
  | "ballmaze" | "logicsim";

type Icon = typeof Folder;
type Item = { id: AppId; name: string; description: string; icon: Icon };
type DesktopApp = { id: AppId; label: string; icon: Icon };

const BURGUNDY = "#8F2638";
const BURGUNDY_LIGHT = "#A52A3A";
const WINE = "#5B1020";
const INK = "#12070A";
const SURFACE = "#1B090E";

const desktop: DesktopApp[] = [
  { id: "about", label: "About", icon: User },
  { id: "research", label: "Research", icon: BookOpen },
  { id: "projects", label: "Projects", icon: Code2 },
  { id: "security", label: "Security Lab", icon: Shield },
  { id: "journal", label: "Journal", icon: PenLine },
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
  { id: "learning", label: "Learning", icon: Zap },
  { id: "media", label: "Media", icon: Folder },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "system", label: "System", icon: Settings },
];

const folders: Record<string, Item[]> = {
  about: [
    { id: "about", name: "profile", description: "Profile, skills, education and contact", icon: User },
    { id: "now", name: "now", description: "Current focus and activity", icon: Activity },
    { id: "timeline", name: "timeline", description: "Career and project timeline", icon: Radio },
  ],
  research: [
    { id: "research", name: "research archive", description: "Published research and investigations", icon: BookOpen },
    { id: "reading-room", name: "reading room", description: "Reading and reference material", icon: BookOpen },
    { id: "observatory", name: "observatory", description: "Research observations", icon: Globe2 },
    { id: "knowledge", name: "knowledge", description: "Knowledge base", icon: BookOpen },
  ],
  projects: [
    { id: "engineering", name: "engineering", description: "Engineering case files", icon: Code2 },
    { id: "developer-workspace", name: "developer workspace", description: "Software and infrastructure", icon: Laptop },
    { id: "changelog", name: "changelog", description: "System history", icon: FileText },
  ],
  security: [
    { id: "security-lab", name: "security lab", description: "Security utilities and experiments", icon: Shield },
    { id: "soc", name: "soc", description: "Detection and investigation workspace", icon: Activity },
    { id: "public-api", name: "public api", description: "API documentation", icon: Globe2 },
  ],
  journal: [
    { id: "journal", name: "journal", description: "Journal and notes", icon: PenLine },
    { id: "now", name: "now", description: "Current working log", icon: Activity },
  ],
  knowledge: [
    { id: "knowledge", name: "knowledge", description: "Articles and technical notes", icon: BookOpen },
    { id: "docs", name: "documentation", description: "Documentation", icon: FileText },
    { id: "reading-room", name: "reading room", description: "References", icon: BookOpen },
  ],
  learning: [
    { id: "learning-hub", name: "learning hub", description: "Learning material", icon: Zap },
    { id: "research", name: "research", description: "Research material", icon: BookOpen },
  ],
  media: [
    { id: "music", name: "music", description: "Local audio player", icon: Music2 },
    { id: "media", name: "media library", description: "Local media", icon: FileText },
  ],
  system: [
    { id: "settings", name: "settings", description: "Visitor preferences", icon: Settings },
    { id: "docs", name: "documentation", description: "System documentation", icon: FileText },
    { id: "privacy", name: "privacy", description: "Privacy information", icon: Lock },
  ],
  games: [
    { id: "minesweeper", name: "Minesweeper", description: "Classic minefield", icon: Gamepad2 },
    { id: "wordle", name: "Wordle", description: "Five-letter word game", icon: Gamepad2 },
    { id: "ballmaze", name: "Ball Maze", description: "Navigate the maze", icon: Gamepad2 },
    { id: "logicsim", name: "Logic Simulator", description: "Build logic gates", icon: Gamepad2 },
  ],
};

const titles: Record<AppId, string> = {
  about: "About", research: "Research OS", projects: "Projects OS", security: "Security Lab",
  journal: "Journal OS", knowledge: "Knowledge OS", learning: "Learning OS", media: "Media OS",
  system: "System", games: "Games", terminal: "Terminal", music: "Music Player", now: "Now",
  timeline: "Timeline", "reading-room": "Reading Room", observatory: "Observatory",
  "developer-workspace": "Developer Workspace", changelog: "Changelog", soc: "SOC Console",
  "public-api": "Public API", "learning-hub": "Learning Hub", docs: "Documentation",
  privacy: "Privacy", engineering: "Engineering", "security-lab": "Security Lab",
  settings: "Settings", minesweeper: "Minesweeper", wordle: "Wordle", ballmaze: "Ball Maze",
  logicsim: "Logic Simulator",
};

const pageData: Record<string, { eyebrow: string; title: string; text: string; bullets: string[] }> = {
  about: { eyebrow: "PROFILE", title: "Raghav Sharma", text: "Cybersecurity, research and engineering work presented as a personal operating system.", bullets: ["Cybersecurity & Forensics", "VAPT and security engineering", "Research, documentation and practical labs", "Build, verify, document"] },
  now: { eyebrow: "CURRENT", title: "Now", text: "The current workstation focus.", bullets: ["Security tooling and detection labs", "Personal OS engineering", "Cybersecurity projects", "Continuous learning"] },
  timeline: { eyebrow: "TIMELINE", title: "Timeline", text: "Milestones and experiments across the portfolio.", bullets: ["Portfolio OS evolution", "Cybersecurity projects", "Engineering experiments", "Research and documentation"] },
  research: { eyebrow: "RESEARCH", title: "Research Archive", text: "Investigations, notes, experiments and security research.", bullets: ["Threat research", "Security experiments", "Technical references", "Research notes"] },
  "reading-room": { eyebrow: "REFERENCE", title: "Reading Room", text: "Papers, books and references worth revisiting.", bullets: ["Research papers", "Security references", "Technical books", "Saved notes"] },
  observatory: { eyebrow: "OBSERVATORY", title: "Research Observatory", text: "A view over research observations and experiments.", bullets: ["Detection signals", "Research observations", "Experiment logs", "Emerging techniques"] },
  projects: { eyebrow: "PROJECTS", title: "Projects", text: "Engineering work organized as case files.", bullets: ["Cybersecurity portfolio", "Developer tooling", "Web applications", "Security labs"] },
  engineering: { eyebrow: "ENGINEERING", title: "Engineering Case Files", text: "Practical engineering projects and experiments.", bullets: ["Voice Command Operator", "Web Scraper", "SOC Detection Lab", "Network and security tooling"] },
  "developer-workspace": { eyebrow: "WORKSPACE", title: "Developer Workspace", text: "The software and infrastructure behind this OS.", bullets: ["Next.js + React", "TypeScript", "Supabase + PostgreSQL", "Vercel deployment"] },
  changelog: { eyebrow: "CHANGELOG", title: "System History", text: "Important changes to Sharma-Raghav OS.", bullets: ["Desktop interface", "Internal applications", "Security hardening", "Reliability improvements"] },
  security: { eyebrow: "SECURITY", title: "Security Lab", text: "Hands-on security learning and defensive tooling.", bullets: ["VAPT methodology", "SOC detection", "Network analysis", "Secure application design"] },
  "security-lab": { eyebrow: "LAB", title: "Browser Security Tools", text: "Interactive security utilities that run locally.", bullets: ["Security helpers", "Encoding workflows", "Hash playground", "Local-only tooling"] },
  soc: { eyebrow: "SOC", title: "Detection Console", text: "A workstation for alert triage and investigation practice.", bullets: ["Alert triage", "MITRE ATT&CK mapping", "Log analysis", "Incident notes"] },
  "public-api": { eyebrow: "API", title: "Public API", text: "Documentation for public portfolio endpoints.", bullets: ["Read-only public data", "JSON responses", "Authentication boundaries", "Rate-limit aware design"] },
  journal: { eyebrow: "JOURNAL", title: "Journal OS", text: "Notes, reflections and working logs.", bullets: ["Daily notes", "Technical reflections", "Lessons learned", "Research diary"] },
  knowledge: { eyebrow: "KNOWLEDGE", title: "Knowledge Base", text: "Articles, essays, case studies and technical notes.", bullets: ["Cybersecurity concepts", "Engineering notes", "Case studies", "Reference material"] },
  learning: { eyebrow: "LEARNING", title: "Learning OS", text: "A structured learning space for skills and experiments.", bullets: ["Cybersecurity fundamentals", "Networking", "Programming", "Languages and communication"] },
  "learning-hub": { eyebrow: "HUB", title: "Learning Hub", text: "Study, practice, build and document.", bullets: ["Study", "Practice", "Build", "Document"] },
  media: { eyebrow: "MEDIA", title: "Media Library", text: "Local media and visual resources.", bullets: ["Audio", "Images", "Project media", "Local-only playback"] },
  docs: { eyebrow: "DOCS", title: "Documentation", text: "Architecture and operating notes.", bullets: ["Architecture", "Usage", "Security model", "Deployment notes"] },
  privacy: { eyebrow: "PRIVACY", title: "Privacy", text: "Visitor-side privacy information.", bullets: ["Preferences stay in the browser", "Security tools run locally", "Admin functionality remains protected", "No external game redirects"] },
  settings: { eyebrow: "SYSTEM", title: "Settings", text: "Visitor-side presentation preferences.", bullets: ["Reduced motion", "Theme preferences", "Local browser settings", "Read-only visitor session"] },
};

const music = [
  { title: "Soundtrack", src: "/music/soundtrack.mp3" },
  { title: "Für Elise", src: "/music/Fu╠êr Elise.mp3" },
  { title: "Rain Ambient", src: "/music/rain-ambient.mp3" },
] as const;

export default function ProzillaDesktop({ status }: { status: StatusSnapshot }) {
  const [booting, setBooting] = useState(true);
  const [windows, setWindows] = useState<AppId[]>([]);
  const [active, setActive] = useState<AppId | null>(null);
  const [maximized, setMaximized] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 1400);
    const clockTimer = window.setInterval(() => setClock(new Date()), 1000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(clockTimer);
    };
  }, []);

  const launch = (id: AppId) => {
    setWindows((current) => current.includes(id) ? current : [...current, id]);
    setActive(id);
    setMaximized(false);
  };

  const close = (id: AppId) => {
    setWindows((current) => current.filter((item) => item !== id));
    setActive((current) => current === id ? null : current);
    setMaximized(false);
  };

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return desktop;
    return desktop.filter((app) => app.label.toLowerCase().includes(q));
  }, [query]);

  if (booting) return <BootScreen onSkip={() => setBooting(false)} />;

  return (
    <div style={osStyle}>
      <div style={wallpaperStyle} aria-hidden="true">
        <div style={gridStyle} />
        <div style={circuitStyle} />
        <div style={glowStyle} />
        <div style={grainStyle} />
      </div>

      <header style={topbarStyle}>
        <button onClick={() => launch("system")} style={brandStyle}>
          <span style={brandMark}>RS</span>
          <span>RAGHAV SHARMA OS</span>
        </button>
        <span style={pathStyle}>/home/raghav · personal workstation</span>
        <div style={topRightStyle}>
          <span style={{ color: status.database === "ok" ? "#7BD89A" : "#E8B86D" }}>
            ● {status.database === "ok" ? "DATABASE ONLINE" : "DATABASE DEGRADED"}
          </span>
          <span>{clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <button onClick={() => setSearchOpen((value) => !value)} style={smallButton} aria-label="Search">
            <Search size={16} />
          </button>
        </div>
      </header>

      <main style={workspaceStyle}>
        <div style={desktopPath}><FolderOpen size={12} /> /home/raghav/Desktop</div>
        <div style={desktopGrid}>
          {desktop.map((app) => <DesktopIcon key={app.id} app={app} onClick={() => launch(app.id)} />)}
        </div>

        <div style={welcomeStyle}>
          <div style={eyebrowStyle}>SECURE PERSONAL WORKSTATION</div>
          <h1 style={welcomeTitle}>Raghav Sharma <span>OS</span></h1>
          <p style={welcomeText}>Cybersecurity · research · engineering · systems</p>
        </div>

        {searchOpen && (
          <div style={searchPanelStyle}>
            <div style={searchInputWrap}>
              <Search size={15} />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applications..." style={searchInputStyle} />
            </div>
            {matches.map((app) => (
              <button key={app.id} onClick={() => { launch(app.id); setSearchOpen(false); }} style={searchResultStyle}>
                <app.icon size={15} />
                {app.label}
              </button>
            ))}
          </div>
        )}

        {windows.map((id) => (
          <OSWindow
            key={id}
            id={id}
            active={active === id}
            maximized={maximized && active === id}
            onActivate={() => setActive(id)}
            onClose={() => close(id)}
            onMinimize={() => setActive(null)}
            onMaximize={() => setMaximized((value) => !value)}
          >
            {folders[id] ? (
              <FolderApp id={id} items={folders[id] ?? []} onOpen={launch} />
            ) : id === "terminal" ? (
              <TerminalApp onOpen={launch} />
            ) : id === "music" ? (
              <MusicApp />
            ) : id === "minesweeper" ? (
              <Minesweeper />
            ) : id === "wordle" ? (
              <Wordle />
            ) : id === "ballmaze" ? (
              <BallMaze />
            ) : id === "logicsim" ? (
              <LogicSim />
            ) : (
              <PageApp id={id} />
            )}
          </OSWindow>
        ))}
      </main>

      <nav style={dockStyle} aria-label="OS dock">
        <DockButton title="System" onClick={() => launch("system")}><Home size={17} /></DockButton>
        <DockButton title="Terminal" onClick={() => launch("terminal")}><Terminal size={17} /></DockButton>
        <DockButton title="Music" onClick={() => launch("music")}><Music2 size={17} /></DockButton>
        <DockButton title="Games" onClick={() => launch("games")}><Gamepad2 size={17} /></DockButton>
        <DockButton title="Search" onClick={() => setSearchOpen((value) => !value)}><Search size={17} /></DockButton>
      </nav>
    </div>
  );
}

function DesktopIcon({ app, onClick }: { app: DesktopApp; onClick: () => void }) {
  return (
    <button onClick={onClick} style={desktopIconStyle}>
      <span style={desktopIconImage}><app.icon size={25} /></span>
      <span>{app.label}</span>
    </button>
  );
}

function DockButton({ title, onClick, children }: { title: string; onClick: () => void; children: ReactNode }) {
  return <button title={title} aria-label={title} onClick={onClick} style={dockButtonStyle}>{children}</button>;
}

function OSWindow({
  id, active, maximized, onActivate, onClose, onMinimize, onMaximize, children,
}: {
  id: AppId; active: boolean; maximized: boolean; onActivate: () => void; onClose: () => void;
  onMinimize: () => void; onMaximize: () => void; children: ReactNode;
}) {
  const style: CSSProperties = maximized
    ? { ...windowStyle, left: 12, top: 54, width: "calc(100% - 24px)", height: "calc(100% - 122px)", zIndex: 40 }
    : { ...windowStyle, left: "8%", top: "11%", width: "84%", height: "72%", zIndex: active ? 40 : 25 };

  return (
    <section onMouseDown={onActivate} style={style} aria-label={titles[id]}>
      <div style={windowBarStyle}>
        <div style={windowTitleStyle}><Sparkles size={14} /> {titles[id]}</div>
        <div style={{ display: "flex" }}>
          <button onClick={onMinimize} style={windowControl} aria-label="Minimize"><Minus size={14} /></button>
          <button onClick={onMaximize} style={windowControl} aria-label={maximized ? "Restore" : "Maximize"}><Maximize2 size={13} /></button>
          <button onClick={onClose} style={windowControl} aria-label="Close"><X size={14} /></button>
        </div>
      </div>
      <div style={windowBodyStyle}>{children}</div>
    </section>
  );
}

function FolderApp({ id, items, onOpen }: { id: string; items: Item[]; onOpen: (id: AppId) => void }) {
  return (
    <div style={appPadding}>
      <div style={sectionHeader}>
        <FolderOpen size={20} />
        <div><div style={mutedPath}>/home/raghav/{id}</div><h2 style={sectionTitle}>{titles[id as AppId] ?? id}</h2></div>
      </div>
      <div style={fileGrid}>
        {items.map((item) => (
          <button key={item.id} onClick={() => onOpen(item.id)} style={fileCardStyle}>
            <item.icon size={23} />
            <strong>{item.name}</strong>
            <span>{item.description}</span>
            <small>OPEN WINDOW →</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function PageApp({ id }: { id: string }) {
  const data = pageData[id] ?? {
    eyebrow: "APPLICATION", title: titles[id as AppId] ?? id,
    text: "Internal OS application.", bullets: ["Local OS module", "Read-only visitor interface", "No external redirect"],
  };
  return (
    <div style={appPadding}>
      <div style={sectionHeader}>
        <div style={appBadge}><Sparkles size={23} /></div>
        <div><div style={eyebrowStyle}>{data.eyebrow}</div><h1 style={pageTitle}>{data.title}</h1></div>
      </div>
      <p style={pageText}>{data.text}</p>
      <div style={infoGrid}>
        {data.bullets.map((bullet, index) => (
          <div key={bullet} style={infoCard}>
            <span style={infoNumber}>0{index + 1}</span>
            <strong>{bullet}</strong>
            <small>Internal OS module</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function TerminalApp({ onOpen }: { onOpen: (id: AppId) => void }) {
  const [command, setCommand] = useState("");
  const [lines, setLines] = useState<string[]>(["Raghav Sharma OS terminal", "Type help for commands."]);
  const execute = () => {
    const value = command.trim().toLowerCase();
    if (!value) return;
    if (value === "clear") { setLines([]); setCommand(""); return; }
    const supported: Record<string, AppId> = {
      about: "about", research: "research", projects: "projects", security: "security",
      games: "games", music: "music", settings: "settings", knowledge: "knowledge",
      learning: "learning", journal: "journal", media: "media", system: "system",
    };
    if (value === "help") setLines((current) => [...current, "raghav@os:~$ help", "about research projects security games music settings knowledge learning journal media system clear"]);
    else if (supported[value]) { onOpen(supported[value]); setLines((current) => [...current, `raghav@os:~$ ${command}`, "opening internal window..."]); }
    else setLines((current) => [...current, `raghav@os:~$ ${command}`, "command not found"]);
    setCommand("");
  };
  return (
    <div style={terminalStyle}>
      <div style={{ opacity: 0.55, marginBottom: 12 }}>LOCAL PORTFOLIO SHELL</div>
      {lines.map((line, index) => <div key={index} style={{ margin: "5px 0" }}>{line}</div>)}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <span>raghav@os:~$</span>
        <input autoFocus value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") execute(); }} style={terminalInput} />
      </div>
    </div>
  );
}

function MusicApp() {
  const audio = useRef<HTMLAudioElement>(null);
  const [track, setTrack] = useState(0);
  const [muted, setMuted] = useState(false);
  const current = music[track] ?? music[0];

  const toggle = async () => {
    if (!audio.current) return;
    if (audio.current.paused) { try { await audio.current.play(); } catch {} }
    else audio.current.pause();
  };

  return (
    <div style={musicStyle}>
      <div style={discStyle}><Music2 size={42} /></div>
      <h2>{current.title}</h2>
      <p style={mutedText}>Local audio · no external streaming</p>
      <audio ref={audio} src={current.src} muted={muted} onEnded={() => setTrack((value) => (value + 1) % music.length)} controls style={{ width: "min(500px, 100%)", margin: "20px 0" }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button style={pillStyle} onClick={() => setTrack((value) => (value + music.length - 1) % music.length)}>‹</button>
        <button style={pillStyle} onClick={toggle}><Play size={16} /></button>
        <button style={pillStyle} onClick={() => setTrack((value) => (value + 1) % music.length)}>›</button>
        <button style={pillStyle} onClick={() => setMuted((value) => !value)}>{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
      </div>
      <div style={playlistStyle}>
        {music.map((item, index) => <button key={item.src} onClick={() => setTrack(index)} style={playlistItem}>{index + 1}. {item.title}</button>)}
      </div>
    </div>
  );
}

function GameShell({ title, children, reset }: { title: string; children: ReactNode; reset: () => void }) {
  return <div style={gameStyle}><div style={sectionHeader}><Gamepad2 /><h2 style={sectionTitle}>{title}</h2></div>{children}<button onClick={reset} style={newGameStyle}>NEW GAME</button></div>;
}

function Minesweeper() {
  const size = 8;
  const makeBoard = () => {
    const board = Array.from({ length: size * size }, () => ({ mine: false, open: false, flag: false }));
    let mines = 0;
    while (mines < 10) {
      const index = Math.floor(Math.random() * board.length);
      const cell = board[index];
      if (cell && !cell.mine) { cell.mine = true; mines += 1; }
    }
    return board;
  };
  const [board, setBoard] = useState(makeBoard);
  const [lost, setLost] = useState(false);
  const adjacent = (index: number) => {
    const row = Math.floor(index / size), col = index % size, result: number[] = [];
    for (let y = -1; y <= 1; y += 1) for (let x = -1; x <= 1; x += 1) {
      const r = row + y, c = col + x;
      if ((x !== 0 || y !== 0) && r >= 0 && r < size && c >= 0 && c < size) result.push(r * size + c);
    }
    return result;
  };
  const reveal = (index: number) => {
    const cell = board[index];
    if (!cell || lost || cell.open || cell.flag) return;
    const next = board.map((item) => ({ ...item }));
    const selected = next[index];
    if (!selected) return;
    if (selected.mine) { setBoard(next.map((item) => item.mine ? { ...item, open: true } : item)); setLost(true); return; }
    const queue = [index], seen = new Set<number>();
    while (queue.length) {
      const current = queue.shift();
      if (current === undefined || seen.has(current)) continue;
      const item = next[current];
      if (!item || item.mine || item.flag) continue;
      seen.add(current); item.open = true;
      if (adjacent(current).every((neighbor) => !next[neighbor]?.mine)) queue.push(...adjacent(current));
    }
    setBoard(next);
  };
  return <GameShell title="Minesweeper" reset={() => { setBoard(makeBoard()); setLost(false); }}>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 40px)`, gap: 3, width: "max-content" }}>
      {board.map((cell, index) => {
        const number = adjacent(index).filter((neighbor) => board[neighbor]?.mine).length;
        return <button key={index} onClick={() => reveal(index)} onContextMenu={(event) => { event.preventDefault(); setBoard((current) => current.map((item, i) => i === index ? { ...item, flag: !item.flag } : item)); }} style={{ width: 40, height: 40, border: 0, borderRadius: 6, background: cell.open ? "#32121B" : "#4A1724", color: cell.mine ? "#E8B86D" : "#F5E8E5", fontWeight: 800 }}>{cell.open ? (cell.mine ? "✹" : number || "") : cell.flag ? "⚑" : ""}</button>;
      })}
    </div>
    <p style={mutedText}>{lost ? "Mine triggered — start a new game." : "Left click reveal · right click flag"}</p>
  </GameShell>;
}

function Wordle() {
  const words = ["CRANE", "SHARE", "LIGHT", "MOUSE", "PLANT", "WORLD", "TRUST", "STACK"];
  const randomWord = () => words[Math.floor(Math.random() * words.length)] ?? "CRANE";
  const [target, setTarget] = useState(randomWord);
  const [guess, setGuess] = useState("");
  const [rows, setRows] = useState<string[]>([]);
  const submit = () => { if (guess.length === 5 && rows.length < 6) { setRows((current) => [...current, guess.toUpperCase()]); setGuess(""); } };
  return <GameShell title="Wordle" reset={() => { setTarget(randomWord()); setGuess(""); setRows([]); }}>
    <div style={{ display: "grid", gap: 5, width: "max-content" }}>
      {Array.from({ length: 6 }, (_, row) => <div key={row} style={{ display: "grid", gridTemplateColumns: "repeat(5, 46px)", gap: 5 }}>
        {Array.from({ length: 5 }, (_, column) => {
          const letter = rows[row]?.[column] ?? "";
          const background = !letter ? "#2A0D14" : letter === target[column] ? "#6E1626" : target.includes(letter) ? "#8F6A2A" : "#43202A";
          return <div key={column} style={{ width: 46, height: 46, display: "grid", placeItems: "center", borderRadius: 6, background, fontWeight: 800 }}>{letter}</div>;
        })}
      </div>)}
    </div>
    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
      <input maxLength={5} value={guess} onChange={(event) => setGuess(event.target.value.replace(/[^a-z]/gi, ""))} onKeyDown={(event) => { if (event.key === "Enter") submit(); }} style={gameInput} />
      <button onClick={submit} style={pillStyle}>GO</button>
    </div>
    <p style={mutedText}>{rows.includes(target) ? "Solved." : rows.length >= 6 ? `Word: ${target}` : "Guess a five-letter word."}</p>
  </GameShell>;
}

function BallMaze() {
  const walls = new Set(["1,0", "1,1", "3,1", "3,2", "0,3", "2,3", "4,3"]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      let dx = 0, dy = 0;
      if (event.key === "ArrowUp") dy = -1;
      if (event.key === "ArrowDown") dy = 1;
      if (event.key === "ArrowLeft") dx = -1;
      if (event.key === "ArrowRight") dx = 1;
      if (!dx && !dy) return;
      setPosition((current) => {
        const x = Math.max(0, Math.min(4, current.x + dx));
        const y = Math.max(0, Math.min(4, current.y + dy));
        return walls.has(`${x},${y}`) ? current : { x, y };
      });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return <GameShell title="Ball Maze" reset={() => setPosition({ x: 0, y: 0 })}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 54px)", gap: 4, width: "max-content" }}>
      {Array.from({ length: 25 }, (_, index) => {
        const x = index % 5, y = Math.floor(index / 5), wall = walls.has(`${x},${y}`);
        return <div key={index} style={{ width: 54, height: 54, display: "grid", placeItems: "center", borderRadius: 7, background: wall ? "#210B11" : "#18090D", border: "1px solid rgba(255,255,255,.08)" }}>{position.x === x && position.y === y ? "●" : x === 4 && y === 4 ? "◎" : ""}</div>;
      })}
    </div>
    <p style={mutedText}>Use arrow keys to reach ◎.</p>
  </GameShell>;
}

function LogicSim() {
  const [a, setA] = useState(false), [b, setB] = useState(false), [gate, setGate] = useState("AND");
  const output = gate === "AND" ? a && b : gate === "OR" ? a || b : gate === "XOR" ? a !== b : !a;
  return <GameShell title="Logic Simulator" reset={() => { setA(false); setB(false); setGate("AND"); }}>
    <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
      <button onClick={() => setA((value) => !value)} style={logicButton(a)}>A: {a ? 1 : 0}</button>
      <button disabled={gate === "NOT"} onClick={() => setB((value) => !value)} style={logicButton(b)}>B: {b ? 1 : 0}</button>
      <select value={gate} onChange={(event) => setGate(event.target.value)} style={selectStyle}>
        <option>AND</option><option>OR</option><option>XOR</option><option>NOT</option>
      </select>
    </div>
    <div style={logicOutput}>{gate} OUTPUT → <strong>{output ? 1 : 0}</strong></div>
  </GameShell>;
}

function BootScreen({ onSkip }: { onSkip: () => void }) {
  const [count, setCount] = useState(0);
  const logs = ["initializing kernel", "mounting /home/raghav", "loading research modules", "starting security services", "loading local games", "mounting media", "checking database", "starting desktop", "user session ready"];
  useEffect(() => {
    const timer = window.setInterval(() => setCount((value) => Math.min(logs.length, value + 1)), 130);
    return () => window.clearInterval(timer);
  }, [logs.length]);
  return <div style={bootStyle}>
    <div style={{ width: "min(760px, 100%)" }}>
      <div style={bootMark}>RS</div>
      <h1 style={{ margin: "20px 0 8px", fontSize: "clamp(30px, 5vw, 58px)" }}>RAGHAV SHARMA OS</h1>
      <p style={{ opacity: 0.45, letterSpacing: ".18em", fontSize: 11 }}>SECURE PERSONAL WORKSTATION</p>
      <div style={{ marginTop: 28 }}>{logs.slice(0, count).map((log, index) => <div key={log} style={{ margin: "6px 0", opacity: .75 }}>[{String(index).padStart(2, "0")}] {log} <span style={{ color: "#7BD89A" }}>OK</span></div>)}</div>
      <button onClick={onSkip} style={skipStyle}>SKIP BOOT</button>
    </div>
  </div>;
}

const osStyle: CSSProperties = { position: "fixed", inset: 0, overflow: "hidden", background: INK, color: "#F8EFEC", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" };
const wallpaperStyle: CSSProperties = { position: "absolute", inset: 0, background: `radial-gradient(circle at 75% 18%, rgba(165,42,58,.28), transparent 30%), radial-gradient(circle at 15% 85%, rgba(91,16,32,.32), transparent 34%), linear-gradient(135deg, #12070A 0%, #210B11 48%, #12070A 100%)` };
const gridStyle: CSSProperties = { position: "absolute", inset: 0, opacity: .09, backgroundImage: "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px)", backgroundSize: "52px 52px", maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)" };
const circuitStyle: CSSProperties = { position: "absolute", inset: 0, opacity: .08, backgroundImage: "radial-gradient(circle at 20% 25%, #A52A3A 0 1px, transparent 2px),radial-gradient(circle at 80% 70%, #A52A3A 0 1px, transparent 2px)", backgroundSize: "110px 110px,140px 140px" };
const glowStyle: CSSProperties = { position: "absolute", inset: "-20%", background: "conic-gradient(from 210deg, transparent 0 25%, rgba(165,42,58,.10) 32%, transparent 42% 70%, rgba(143,38,56,.08) 78%, transparent 86%)", filter: "blur(55px)" };
const grainStyle: CSSProperties = { position: "absolute", inset: 0, opacity: .025, backgroundImage: "radial-gradient(rgba(255,255,255,.7) .5px, transparent .5px)", backgroundSize: "4px 4px" };
const topbarStyle: CSSProperties = { position: "relative", zIndex: 20, height: 48, display: "flex", alignItems: "center", gap: 16, padding: "0 14px", background: "rgba(18,7,10,.84)", borderBottom: "1px solid rgba(255,255,255,.10)", backdropFilter: "blur(18px)", fontSize: 11 };
const brandStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 9, border: 0, background: "transparent", color: "inherit", cursor: "pointer", fontWeight: 800, letterSpacing: ".04em" };
const brandMark: CSSProperties = { width: 25, height: 25, borderRadius: 7, display: "grid", placeItems: "center", background: BURGUNDY, color: "#FFF", boxShadow: "0 0 25px rgba(165,42,58,.28)" };
const pathStyle: CSSProperties = { flex: 1, opacity: .38 };
const topRightStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 13, opacity: .78 };
const smallButton: CSSProperties = { width: 30, height: 30, border: 0, borderRadius: 7, background: "rgba(255,255,255,.06)", color: "inherit", display: "grid", placeItems: "center", cursor: "pointer" };
const workspaceStyle: CSSProperties = { position: "relative", height: "calc(100vh - 48px)", zIndex: 5 };
const desktopPath: CSSProperties = { position: "absolute", top: 17, left: 22, display: "flex", alignItems: "center", gap: 6, opacity: .4, fontSize: 10 };
const desktopGrid: CSSProperties = { position: "absolute", left: 22, top: 54, width: 220, display: "grid", gridTemplateColumns: "repeat(2, 90px)", gap: 12 };
const desktopIconStyle: CSSProperties = { width: 88, minHeight: 84, border: 0, background: "transparent", color: "inherit", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, borderRadius: 12, padding: 8 };
const desktopIconImage: CSSProperties = { width: 50, height: 50, borderRadius: 13, display: "grid", placeItems: "center", color: "#F1DDE0", background: "linear-gradient(145deg, rgba(165,42,58,.28), rgba(91,16,32,.10))", border: "1px solid rgba(214,122,139,.26)", boxShadow: "0 8px 25px rgba(0,0,0,.2)" };
const welcomeStyle: CSSProperties = { position: "absolute", left: "28%", top: "25%", maxWidth: 650, pointerEvents: "none" };
const eyebrowStyle: CSSProperties = { fontSize: 10, letterSpacing: ".24em", color: "#D68A99", fontWeight: 800 };
const welcomeTitle: CSSProperties = { margin: "10px 0 0", fontFamily: "ui-sans-serif, system-ui, sans-serif", fontSize: "clamp(46px, 7vw, 90px)", lineHeight: .9, letterSpacing: "-.065em" };
const welcomeText: CSSProperties = { marginTop: 18, opacity: .45, fontSize: 12, letterSpacing: ".13em", textTransform: "uppercase" };
const searchPanelStyle: CSSProperties = { position: "absolute", right: 20, top: 14, zIndex: 60, width: "min(370px, calc(100vw - 30px))", padding: 12, borderRadius: 12, background: "rgba(27,9,14,.98)", border: "1px solid rgba(214,122,139,.22)", boxShadow: "0 25px 70px rgba(0,0,0,.5)" };
const searchInputWrap: CSSProperties = { display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", background: "rgba(255,255,255,.05)", borderRadius: 8 };
const searchInputStyle: CSSProperties = { flex: 1, border: 0, outline: 0, background: "transparent", color: "inherit", font: "inherit", fontSize: 12 };
const searchResultStyle: CSSProperties = { width: "100%", display: "flex", alignItems: "center", gap: 9, border: 0, background: "transparent", color: "inherit", padding: 9, borderRadius: 7, cursor: "pointer", textAlign: "left" };
const windowStyle: CSSProperties = { position: "fixed", minWidth: 320, minHeight: 300, overflow: "hidden", borderRadius: 14, background: "rgba(18,7,10,.97)", border: "1px solid rgba(214,122,139,.24)", boxShadow: "0 30px 100px rgba(0,0,0,.62), 0 0 0 1px rgba(255,255,255,.025)", backdropFilter: "blur(20px)" };
const windowBarStyle: CSSProperties = { height: 42, display: "flex", alignItems: "center", paddingLeft: 12, background: "linear-gradient(90deg, rgba(143,38,56,.30), rgba(91,16,32,.12))", borderBottom: "1px solid rgba(255,255,255,.08)" };
const windowTitleStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 8, flex: 1, fontSize: 12, fontWeight: 800 };
const windowControl: CSSProperties = { width: 36, height: 36, border: 0, background: "transparent", color: "inherit", display: "grid", placeItems: "center", cursor: "pointer", opacity: .72 };
const windowBodyStyle: CSSProperties = { height: "calc(100% - 42px)", overflow: "auto", background: "rgba(24,9,13,.98)" };
const appPadding: CSSProperties = { padding: 24 };
const sectionHeader: CSSProperties = { display: "flex", alignItems: "center", gap: 12, marginBottom: 18, color: "#D68A99" };
const mutedPath: CSSProperties = { opacity: .42, fontSize: 10 };
const sectionTitle: CSSProperties = { margin: "3px 0", fontSize: 23, color: "#F8EFEC" };
const fileGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 };
const fileCardStyle: CSSProperties = { minHeight: 135, padding: 15, borderRadius: 10, border: "1px solid rgba(214,122,139,.15)", background: "linear-gradient(145deg, rgba(143,38,56,.15), rgba(255,255,255,.025))", color: "inherit", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 7, textAlign: "left" };
const appBadge: CSSProperties = { width: 50, height: 50, display: "grid", placeItems: "center", borderRadius: 14, background: "rgba(143,38,56,.22)", border: "1px solid rgba(214,122,139,.24)" };
const pageTitle: CSSProperties = { margin: "3px 0", fontSize: 27 };
const pageText: CSSProperties = { maxWidth: 800, fontSize: 14, lineHeight: 1.75, opacity: .68 };
const infoGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10, marginTop: 22 };
const infoCard: CSSProperties = { padding: 17, borderRadius: 11, background: "rgba(255,255,255,.035)", border: "1px solid rgba(214,122,139,.12)" };
const infoNumber: CSSProperties = { display: "block", color: "#D68A99", fontSize: 10, marginBottom: 8 };
const terminalStyle: CSSProperties = { minHeight: "100%", padding: 20, background: "#090506", color: "#A8D5B5", font: "12px/1.7 ui-monospace,monospace" };
const terminalInput: CSSProperties = { flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: "inherit", font: "inherit" };
const musicStyle: CSSProperties = { padding: 28, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" };
const discStyle: CSSProperties = { width: 130, height: 130, borderRadius: "50%", display: "grid", placeItems: "center", background: `conic-gradient(${BURGUNDY}, ${BURGUNDY_LIGHT}, ${WINE}, ${BURGUNDY})`, boxShadow: "0 0 70px rgba(143,38,56,.28)" };
const mutedText: CSSProperties = { opacity: .45, fontSize: 11 };
const playlistStyle: CSSProperties = { width: "min(500px,100%)", marginTop: 18, display: "grid", gap: 3 };
const playlistItem: CSSProperties = { border: 0, borderRadius: 7, background: "rgba(255,255,255,.035)", color: "inherit", padding: 10, textAlign: "left", cursor: "pointer" };
const pillStyle: CSSProperties = { minWidth: 40, height: 40, padding: "0 12px", border: 0, borderRadius: 9, background: BURGUNDY, color: "#FFF", cursor: "pointer", display: "grid", placeItems: "center" };
const gameStyle: CSSProperties = { minHeight: "100%", padding: 24 };
const gameInput: CSSProperties = { width: 180, border: "1px solid rgba(214,122,139,.22)", borderRadius: 8, background: "#210B11", color: "inherit", padding: 10, outline: 0 };
const newGameStyle: CSSProperties = { ...pillStyle, marginTop: 18, fontSize: 10, letterSpacing: ".12em" };
const selectStyle: CSSProperties = { border: 0, borderRadius: 9, padding: "0 12px", background: "#32121B", color: "inherit" };
const logicButton = (on: boolean): CSSProperties => ({ ...pillStyle, minWidth: 80, background: on ? "#6E1626" : "#32121B" });
const logicOutput: CSSProperties = { marginTop: 28, padding: 25, borderRadius: 13, background: "linear-gradient(135deg, rgba(143,38,56,.24), rgba(91,16,32,.10))", border: "1px solid rgba(214,122,139,.14)", fontSize: 21 };
const dockStyle: CSSProperties = { position: "fixed", zIndex: 70, left: "50%", bottom: 12, transform: "translateX(-50%)", display: "flex", gap: 5, padding: 6, borderRadius: 14, background: "rgba(18,7,10,.88)", border: "1px solid rgba(214,122,139,.20)", boxShadow: "0 20px 55px rgba(0,0,0,.45)", backdropFilter: "blur(20px)" };
const dockButtonStyle: CSSProperties = { width: 38, height: 38, border: 0, borderRadius: 8, background: "transparent", color: "inherit", display: "grid", placeItems: "center", cursor: "pointer" };
const bootStyle: CSSProperties = { position: "fixed", inset: 0, zIndex: 1000, display: "grid", placeItems: "center", padding: 30, background: "#090506", color: "#EFDDE0", font: "12px/1.7 ui-monospace,monospace" };
const bootMark: CSSProperties = { width: 72, height: 72, display: "grid", placeItems: "center", borderRadius: 16, background: "rgba(143,38,56,.24)", border: "1px solid rgba(214,122,139,.28)", fontSize: 20, fontWeight: 900, boxShadow: "0 0 80px rgba(143,38,56,.25)" };
const skipStyle: CSSProperties = { marginTop: 22, padding: "8px 12px", border: "1px solid rgba(214,122,139,.22)", borderRadius: 8, background: "transparent", color: "inherit", cursor: "pointer", font: "inherit", fontSize: 10 };

