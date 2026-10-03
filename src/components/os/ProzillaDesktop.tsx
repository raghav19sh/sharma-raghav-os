"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  FileText,
  Folder,
  FolderOpen,
  Gamepad2,
  Globe2,
  Home,
  Info,
  Laptop,
  Maximize2,
  Minus,
  Music2,
  Play,
  Power,
  Search,
  Settings,
  Shield,
  Terminal,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { StatusSnapshot } from "@/lib/data/status";

type WindowId =
  | "about"
  | "research"
  | "projects"
  | "security"
  | "journal"
  | "knowledge"
  | "learning"
  | "media"
  | "system"
  | "games"
  | "terminal"
  | "music";

type FolderItem = {
  name: string;
  description: string;
  path?: string;
  external?: string;
  icon?: typeof Folder;
};

type DesktopItem = {
  id: WindowId;
  label: string;
  description: string;
  icon: typeof Folder;
  folder: boolean;
};

const FOLDERS: Record<Exclude<WindowId, "terminal" | "music">, FolderItem[]> = {
  about: [
    { name: "profile.md", description: "About Raghav Sharma", path: "/about", icon: User },
    { name: "now", description: "Current focus and activity", path: "/now", icon: Activity },
    { name: "timeline", description: "Career and project timeline", path: "/timeline", icon: Activity },
  ],
  research: [
    { name: "research", description: "Research archive", path: "/research", icon: BookOpen },
    { name: "reading-room", description: "Reading and reference material", path: "/reading-room", icon: BookOpen },
    { name: "observatory", description: "Research observatory", path: "/observatory", icon: Globe2 },
    { name: "knowledge", description: "Knowledge base", path: "/knowledge", icon: BookOpen },
  ],
  projects: [
    { name: "engineering", description: "Engineering projects and case files", path: "/engineering", icon: Code2 },
    { name: "developer-workspace", description: "Developer workspace", path: "/developer-workspace", icon: Laptop },
    { name: "changelog", description: "System and project changelog", path: "/changelog", icon: FileText },
  ],
  security: [
    { name: "security-lab", description: "Security labs and tools", path: "/security-lab", icon: Shield },
    { name: "soc", description: "SOC / detection work", path: "/soc", icon: Shield },
    { name: "public-api", description: "Public API documentation", path: "/public-api", icon: Globe2 },
  ],
  journal: [
    { name: "journal", description: "Journal and notes", path: "/journal", icon: FileText },
    { name: "media-library", description: "Media library", path: "/media-library", icon: FileText },
  ],
  knowledge: [
    { name: "knowledge", description: "Knowledge archive", path: "/knowledge", icon: BookOpen },
    { name: "docs", description: "Documentation", path: "/docs", icon: FileText },
    { name: "reading-room", description: "Reading room", path: "/reading-room", icon: BookOpen },
  ],
  learning: [
    { name: "learning-hub", description: "Learning hub", path: "/learning-hub", icon: BookOpen },
    { name: "research", description: "Research material", path: "/research", icon: BookOpen },
  ],
  media: [
    { name: "media-library", description: "Images, audio and media", path: "/media-library", icon: FileText },
    { name: "music", description: "Raghav's music player", icon: Music2 },
  ],
  system: [
    { name: "settings", description: "System preferences", path: "/settings", icon: Settings },
    { name: "docs", description: "System documentation", path: "/docs", icon: FileText },
    { name: "privacy", description: "Privacy information", path: "/privacy", icon: Shield },
  ],
  games: [
    { name: "Minesweeper", description: "ProzillaOS Minesweeper", external: "https://os.prozilla.dev/", icon: Gamepad2 },
    { name: "Wordle", description: "ProzillaOS Wordle", external: "https://os.prozilla.dev/", icon: Gamepad2 },
    { name: "Ball Maze", description: "ProzillaOS 3D Ball Maze", external: "https://os.prozilla.dev/", icon: Gamepad2 },
    { name: "Logic Sim", description: "ProzillaOS Logic Simulator", external: "https://os.prozilla.dev/", icon: Gamepad2 },
  ],
};

const DESKTOP_ITEMS: DesktopItem[] = [
  { id: "about", label: "About", description: "Raghav Sharma", icon: User, folder: true },
  { id: "research", label: "Research", description: "Research archive", icon: BookOpen, folder: true },
  { id: "projects", label: "Projects", description: "Engineering work", icon: Code2, folder: true },
  { id: "security", label: "Security Lab", description: "Security work", icon: Shield, folder: true },
  { id: "journal", label: "Journal", description: "Notes and writing", icon: FileText, folder: true },
  { id: "knowledge", label: "Knowledge", description: "Knowledge base", icon: BookOpen, folder: true },
  { id: "learning", label: "Learning", description: "Learning hub", icon: BookOpen, folder: true },
  { id: "media", label: "Media", description: "Media library", icon: Folder, folder: true },
  { id: "games", label: "Games", description: "ProzillaOS games", icon: Gamepad2, folder: true },
  { id: "system", label: "System", description: "Settings and docs", icon: Settings, folder: true },
];

const APP_LABELS: Record<WindowId, string> = {
  about: "About",
  research: "Research",
  projects: "Projects",
  security: "Security Lab",
  journal: "Journal",
  knowledge: "Knowledge",
  learning: "Learning",
  media: "Media",
  system: "System",
  games: "Games",
  terminal: "Terminal",
  music: "Music Player",
};

const MUSIC = [
  { title: "Soundtrack", src: "/music/soundtrack.mp3" },
  { title: "Für Elise", src: "/music/Fu╠êr Elise.mp3" },
  { title: "Rain Ambient", src: "/music/rain-ambient.mp3" },
];

export default function ProzillaDesktop({ status }: { status: StatusSnapshot }) {
  const [booting, setBooting] = useState(true);
  const [open, setOpen] = useState<WindowId[]>([]);
  const [active, setActive] = useState<WindowId | null>(null);
  const [maximized, setMaximized] = useState(false);
  const [powerMenu, setPowerMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 3000);
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(clock);
    };
  }, []);

  function launch(id: WindowId) {
    setOpen((current) => (current.includes(id) ? current : [...current, id]));
    setActive(id);
    setPowerMenu(false);
  }

  function close(id: WindowId) {
    setOpen((current) => current.filter((x) => x !== id));
    setActive((current) => (current === id ? null : current));
  }

  function minimize(id: WindowId) {
    setActive((current) => (current === id ? null : current));
  }

  function openRoute(path: string) {
    window.location.href = path;
  }

  if (booting) {
    return <BootScreen onSkip={() => setBooting(false)} />;
  }

  return (
    <div className="prozilla-os">
      <div className="prozilla-wallpaper">
        <div className="prozilla-wallpaper__glow" />
        <div className="prozilla-wallpaper__grid" />
        <div className="prozilla-wallpaper__grain" />

        <header className="prozilla-topbar">
          <button className="prozilla-brand" onClick={() => setPowerMenu((v) => !v)}>
            <div className="prozilla-brand__mark">RS</div>
            <span>Raghav Sharma OS</span>
          </button>
          <div className="prozilla-topbar__center">/home/raghav · PERSONAL WORKSTATION</div>
          <div className="prozilla-topbar__right">
            <span>CPU READY</span>
            <span>NET {status.database === "ok" ? "ONLINE" : "DEGRADED"}</span>
            <span>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            <button className="prozilla-iconbtn" onClick={() => setSearchOpen((v) => !v)} aria-label="Search"><Search size={15} /></button>
            <button className="prozilla-iconbtn" onClick={() => setPowerMenu((v) => !v)} aria-label="Power"><Power size={15} /></button>
          </div>
        </header>

        {powerMenu && (
          <div className="prozilla-power">
            <strong>RAGHAV SHARMA</strong>
            <span>Personal Security Workstation</span>
            <button onClick={() => location.reload()}><Power size={15} /> Reboot</button>
            <button onClick={() => setPowerMenu(false)}><X size={15} /> Close</button>
          </div>
        )}

        {searchOpen && (
          <div className="prozilla-search">
            <Search size={15} />
            <input autoFocus placeholder="Search folders, apps and pages..." onKeyDown={(e) => {
              if (e.key === "Escape") setSearchOpen(false);
              if (e.key === "Enter") {
                const value = e.currentTarget.value.toLowerCase();
                const item = DESKTOP_ITEMS.find((x) => x.label.toLowerCase().includes(value));
                if (item) {
                  launch(item.id);
                  setSearchOpen(false);
                }
              }
            }} />
          </div>
        )}

        <main className="prozilla-workspace">
          <div className="prozilla-filepath"><FolderOpen size={12} /> /home/raghav/Desktop</div>

          <div className="prozilla-icons">
            {DESKTOP_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className="prozilla-desktop-icon"
                  onDoubleClick={() => launch(item.id)}
                  onClick={() => setActive(item.id)}
                  title={item.description}
                >
                  <div className="prozilla-desktop-icon__image"><Icon size={27} strokeWidth={1.35} /></div>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {open.map((id) => {
            const isActive = active === id;
            return (
              <section
                key={id}
                className={`prozilla-window ${isActive ? "is-active" : ""} ${maximized && isActive ? "is-maximized" : ""}`}
                onMouseDown={() => setActive(id)}
              >
                <div className="prozilla-window__bar">
                  <div className="prozilla-window__title"><Folder size={14} /><span>{APP_LABELS[id]}</span></div>
                  <div className="prozilla-window__controls">
                    <button onClick={(e) => { e.stopPropagation(); minimize(id); }} aria-label="Minimize"><Minus size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setActive(id); setMaximized((v) => !v); }} aria-label="Maximize"><Maximize2 size={13} /></button>
                    <button onClick={(e) => { e.stopPropagation(); close(id); }} aria-label="Close"><X size={14} /></button>
                  </div>
                </div>
                <div className="prozilla-window__body">
                  {id === "terminal" ? <PortfolioTerminal onLaunch={launch} /> :
                    id === "music" ? <MusicApp /> :
                    <FolderView id={id} onOpenRoute={openRoute} onLaunch={launch} />}
                </div>
              </section>
            );
          })}
        </main>

        <nav className="prozilla-dock">
          <button className="prozilla-dock__home" onClick={() => setPowerMenu((v) => !v)} aria-label="System menu"><Home size={18} /></button>
          <button className="prozilla-dock__item" onClick={() => launch("terminal")} title="Terminal"><Terminal size={18} /></button>
          <button className="prozilla-dock__item" onClick={() => launch("music")} title="Music player"><Music2 size={18} /></button>
          <button className="prozilla-dock__item" onClick={() => launch("games")} title="Games"><Gamepad2 size={18} /></button>
          {(["research", "projects", "security", "about"] as WindowId[]).map((id) => {
            const Icon = DESKTOP_ITEMS.find((x) => x.id === id)?.icon ?? Folder;
            return <button key={id} onClick={() => launch(id)} className={`prozilla-dock__item ${active === id ? "is-active" : ""}`} title={APP_LABELS[id]}><Icon size={18} /></button>;
          })}
          <div className="prozilla-dock__spacer" />
          <button className="prozilla-dock__item" onClick={() => setSearchOpen((v) => !v)} title="Search"><Search size={18} /></button>
          <button className="prozilla-dock__item" onClick={() => openRoute("/settings")} title="Settings"><Settings size={18} /></button>
        </nav>

        <footer className="prozilla-statusbar">
          <span><span className="status-dot" /> {status.database === "ok" ? "All systems operational" : "System check required"}</span>
          <span>{status.contentCounts.research} research · {status.contentCounts.projects} projects</span>
        </footer>
      </div>
    </div>
  );
}

function FolderView({ id, onOpenRoute, onLaunch }: { id: Exclude<WindowId, "terminal" | "music">; onOpenRoute: (path: string) => void; onLaunch: (id: WindowId) => void }) {
  const items = FOLDERS[id] ?? [];
  return (
    <div className="prozilla-folder-view">
      <div className="prozilla-folder-view__path"><FolderOpen size={13} /> /home/raghav/{id}</div>
      <div className="prozilla-folder-grid">
        {items.map((item) => {
          const Icon = item.icon ?? FileText;
          return (
            <button key={item.name} className="prozilla-file-card" onDoubleClick={() => item.path ? onOpenRoute(item.path) : item.external ? window.open(item.external, "_blank", "noopener,noreferrer") : item.name === "music" ? onLaunch("music") : undefined}>
              <div className="prozilla-file-card__icon"><Icon size={25} /></div>
              <strong>{item.name}</strong>
              <span>{item.description}</span>
              <small>{item.path ? "double-click to open" : item.external ? "opens ProzillaOS" : "application"}</small>
            </button>
          );
        })}
      </div>
      {id === "games" && <div className="prozilla-folder-note"><Gamepad2 size={14} /> The games are kept as ProzillaOS experiences. Double-click a game to open the ProzillaOS games environment.</div>}
    </div>
  );
}

function BootScreen({ onSkip }: { onSkip: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const bootLines = [
    "[    0.000000] Raghav Sharma OS kernel starting...",
    "[    0.143201] Initializing personal operating environment",
    "[    0.387201] Mounting /home/raghav",
    "[    0.601021] Mounting /research",
    "[    0.824101] Mounting /projects",
    "[    1.071004] Starting security services",
    "[    1.332201] Loading ProzillaOS desktop layer",
    "[    1.681004] Network stack: ready",
    "[    2.013221] User session: RAGHAV_SHARMA",
    "[    2.421229] Welcome, Raghav Sharma.",
  ];

  useEffect(() => {
    const timers = bootLines.map((line, i) => setTimeout(() => setLines((l) => [...l, line]), 120 + i * 230));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="prozilla-boot" role="dialog" aria-label="System boot">
      <div className="prozilla-boot__scanlines" />
      <div className="prozilla-boot__head"><span>RAGHAV SHARMA OS</span><span>UEFI / WEB</span></div>
      <div className="prozilla-boot__logo">RS</div>
      <div className="prozilla-boot__name">RAGHAV SHARMA</div>
      <div className="prozilla-boot__prompt">root@raghav:~$ systemctl start user-session</div>
      <div className="prozilla-boot__logs">{lines.map((l) => <div key={l}>{l}</div>)}</div>
      <div className="prozilla-boot__loader"><span /></div>
      <button className="prozilla-boot__skip" onClick={onSkip}>SKIP BOOT</button>
    </div>
  );
}

function MusicApp() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try { await audio.play(); setPlaying(true); } catch { setPlaying(false); }
    } else { audio.pause(); setPlaying(false); }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (playing) void audio.play().catch(() => setPlaying(false));
  }, [track]);

  return (
    <div className="prozilla-music-app">
      <div className="prozilla-music-app__disc"><Music2 size={42} /></div>
      <h2>{MUSIC[track]?.title}</h2>
      <p>Raghav Sharma · local media</p>
      <audio ref={audioRef} src={MUSIC[track]?.src} onEnded={() => setTrack((track + 1) % MUSIC.length)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <div className="prozilla-music-app__controls">
        <button onClick={() => setTrack((track - 1 + MUSIC.length) % MUSIC.length)}>‹</button>
        <button className="primary" onClick={toggle}>{playing ? <span>Ⅱ</span> : <Play size={17} />}</button>
        <button onClick={() => setTrack((track + 1) % MUSIC.length)}>›</button>
        <button onClick={() => { const next = !muted; setMuted(next); if (audioRef.current) audioRef.current.muted = next; }} aria-label="Mute">{muted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
      </div>
      <div className="prozilla-music-app__playlist">
        {MUSIC.map((song, index) => <button key={song.src} className={index === track ? "is-current" : ""} onClick={() => setTrack(index)}><Music2 size={13} />{song.title}</button>)}
      </div>
    </div>
  );
}

function PortfolioTerminal({ onLaunch }: { onLaunch: (id: WindowId) => void }) {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<string[]>([
    "Raghav Sharma OS terminal — type 'help'",
    "Connected to public portfolio environment.",
    "",
  ]);

  function run() {
    const raw = input.trim();
    const cmd = raw.toLowerCase();
    if (!raw) return;
    const next = [...lines, `raghav@os:~$ ${raw}`];
    if (cmd === "help") next.push("commands: about, research, projects, security, journal, games, music, clear, whoami");
    else if (cmd === "whoami") next.push("Raghav Sharma — cybersecurity / research / engineering");
    else if (cmd === "about") { next.push("Opening About..."); onLaunch("about"); }
    else if (cmd === "research") { next.push("Opening Research..."); onLaunch("research"); }
    else if (cmd === "projects") { next.push("Opening Projects..."); onLaunch("projects"); }
    else if (cmd === "security") { next.push("Opening Security Lab..."); onLaunch("security"); }
    else if (cmd === "journal") { next.push("Opening Journal..."); onLaunch("journal"); }
    else if (cmd === "games") { next.push("Opening Games..."); onLaunch("games"); }
    else if (cmd === "music") { next.push("Opening Music Player..."); onLaunch("music"); }
    else if (cmd === "clear") { setLines([]); setInput(""); return; }
    else next.push(`command not found: ${raw}`);
    setLines(next);
    setInput("");
  }

  return (
    <div className="prozilla-terminal">
      <div className="prozilla-terminal__banner"><span><span className="terminal-user">raghav</span>@sharma-os <span className="terminal-path">~/</span></span><span className="terminal-meta">bash-compatible portfolio shell</span></div>
      <div className="prozilla-terminal__output">{lines.map((line, index) => <div key={`${index}-${line}`}>{line || "\u00a0"}</div>)}</div>
      <div className="prozilla-terminal__input"><span>raghav@os:~$</span><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} autoFocus /></div>
    </div>
  );
}
