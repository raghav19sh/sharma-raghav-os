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
  | "minesweeper"
  | "wordle"
  | "ballmaze"
  | "logicsim"
  | "viewer"
  | "terminal"
  | "music";

type FolderItem = {
  name: string;
  description: string;
  path?: string;
  game?: WindowId;
  icon?: typeof Folder;
};

type DesktopItem = {
  id: WindowId;
  label: string;
  description: string;
  icon: typeof Folder;
  folder: boolean;
};

const FOLDERS: Record<Exclude<WindowId, "terminal" | "music" | "viewer" | "minesweeper" | "wordle" | "ballmaze" | "logicsim">, FolderItem[]> = {
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
    { name: "Minesweeper", description: "Local Minesweeper", game: "minesweeper", icon: Gamepad2 },
    { name: "Wordle", description: "Local Wordle", game: "wordle", icon: Gamepad2 },
    { name: "Ball Maze", description: "Local Ball Maze", game: "ballmaze", icon: Gamepad2 },
    { name: "Logic Sim", description: "Local Logic Simulator", game: "logicsim", icon: Gamepad2 },
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
  minesweeper: "Minesweeper",
  wordle: "Wordle",
  ballmaze: "Ball Maze",
  logicsim: "Logic Sim",
  viewer: "Page Viewer",
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
  const [viewerPath, setViewerPath] = useState<string | null>(null);
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
    // Files inside OS folders open the real portfolio page in the OS viewer.
    // Folder windows themselves are opened by launch(); this prevents a file
    // click from merely re-focusing the already-open parent folder.
    setViewerPath(path);
    launch("viewer");
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
                  onClick={() => launch(item.id)}
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
                    id === "viewer" ? <InternalPageViewer path={viewerPath} /> :
                    id === "minesweeper" ? <Minesweeper /> :
                    id === "wordle" ? <Wordle /> :
                    id === "ballmaze" ? <BallMaze /> :
                    id === "logicsim" ? <LogicSim /> :
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

function FolderView({
  id,
  onOpenRoute,
  onLaunch,
}: {
  id: Exclude<
    WindowId,
    "terminal" | "music" | "viewer" | "minesweeper" | "wordle" | "ballmaze" | "logicsim"
  >;
  onOpenRoute: (path: string) => void;
  onLaunch: (id: WindowId) => void;
}) {
  const items = FOLDERS[id] ?? [];

  return (
    <div className="prozilla-folder-view">
      <div className="prozilla-folder-view__path">
        <FolderOpen size={13} />
        /home/raghav/{id}
      </div>

      <div className="prozilla-folder-grid">
        {items.map((item) => {
          const Icon = item.icon ?? FileText;

          return (
            <button
              key={item.name}
              className="prozilla-file-card"
              onClick={() => {
                if (item.game) {
                  onLaunch(item.game);
                  return;
                }

                if (item.path) {
                  onOpenRoute(item.path);
                  return;
                }

                if (item.name === "music") {
                  onLaunch("music");
                }
              }}
            >
              <div className="prozilla-file-card__icon">
                <Icon size={25} />
              </div>

              <strong>{item.name}</strong>
              <span>{item.description}</span>

              <small>
                {item.game ? "run game" : item.path ? "open" : "application"}
              </small>
            </button>
          );
        })}
      </div>

      {id === "games" && (
        <div className="prozilla-folder-note">
          <Gamepad2 size={14} />
          All games run locally inside Raghav Sharma OS.
        </div>
      )}
    </div>
  );
}




function InternalPageViewer({ path }: { path: string | null }) {
  if (!path) {
    return <div className="prozilla-folder-note">Select a page from a portfolio folder.</div>;
  }

  const title = path.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ?? "page";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 520, background: "#09090b" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <Globe2 size={14} />
        <span style={{ textTransform: "capitalize", fontSize: 12 }}>{title}</span>
        <span style={{ opacity: .45, fontSize: 11 }}>{path}</span>
      </div>
      <iframe
        key={path}
        src={path}
        title={title}
        style={{ flex: 1, width: "100%", border: 0, background: "#fff" }}
      />
    </div>
  );
}

function GamePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: 500, padding: 20, background: "#09090b", color: "#f4f4f5", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <Gamepad2 size={17} />
        <strong>{title}</strong>
        <span style={{ opacity: .45, fontSize: 11 }}>LOCAL / OFFLINE</span>
      </div>
      {children}
    </div>
  );
}

function Minesweeper() {
  const size = 8;
  const mines = 10;
  const makeBoard = () => {
    const cells = Array.from({ length: size * size }, () => ({ mine: false, open: false, flag: false }));
    let placed = 0;
    while (placed < mines) {
      const i = Math.floor(Math.random() * cells.length);
      if (!cells[i].mine) { cells[i].mine = true; placed++; }
    }
    return cells;
  };
  const [board, setBoard] = useState(makeBoard);
  const [dead, setDead] = useState(false);
  const [won, setWon] = useState(false);

  const adjacent = (index: number) => {
    const row = Math.floor(index / size);
    const col = index % size;
    const out: number[] = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < size && c >= 0 && c < size) out.push(r * size + c);
    }
    return out;
  };

  const count = (cells: typeof board, i: number) => adjacent(i).filter((n) => cells[n].mine).length;

  const reveal = (index: number) => {
    if (dead || won || board[index].open || board[index].flag) return;
    const next = board.map((x) => ({ ...x }));
    if (next[index].mine) {
      next.forEach((x) => { if (x.mine) x.open = true; });
      setBoard(next);
      setDead(true);
      return;
    }
    const queue = [index];
    const seen = new Set<number>();
    while (queue.length) {
      const i = queue.shift()!;
      if (seen.has(i) || next[i].mine || next[i].flag) continue;
      seen.add(i);
      next[i].open = true;
      if (count(next, i) === 0) adjacent(i).forEach((n) => { if (!seen.has(n)) queue.push(n); });
    }
    setBoard(next);
    const safe = next.filter((x) => !x.mine).every((x) => x.open);
    if (safe) setWon(true);
  };

  const toggleFlag = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    if (dead || won || board[index].open) return;
    setBoard((current) => current.map((x, i) => i === index ? { ...x, flag: !x.flag } : x));
  };

  return (
    <GamePanel title="Minesweeper">
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 42px)`, gap: 3, width: "max-content" }}>
        {board.map((cell, i) => {
          const n = count(board, i);
          return <button key={i} onClick={() => reveal(i)} onContextMenu={(e) => toggleFlag(e, i)}
            style={{ width: 42, height: 42, border: "1px solid #27272a", background: cell.open ? "#18181b" : "#27272a", color: cell.mine ? "#f87171" : "#e4e4e7", cursor: "pointer", fontWeight: 700 }}>
            {cell.open ? (cell.mine ? "✹" : n || "") : (cell.flag ? "⚑" : "")}
          </button>;
        })}
      </div>
      <p style={{ opacity: .65, fontSize: 12 }}>{dead ? "Mine hit." : won ? "Cleared." : "Left click reveal · right click flag"}</p>
      <button onClick={() => { setBoard(makeBoard()); setDead(false); setWon(false); }} style={{ padding: "8px 12px", border: "1px solid #3f3f46", background: "#18181b", color: "inherit" }}>New game</button>
    </GamePanel>
  );
}

function Wordle() {
  const words = ["CRANE", "SHARE", "LIGHT", "MOUSE", "PLANT", "WORLD", "TRUST", "STACK"];
  const [target, setTarget] = useState(() => words[Math.floor(Math.random() * words.length)]);
  const [guess, setGuess] = useState("");
  const [rows, setRows] = useState<string[]>([]);
  const done = rows.includes(target) || rows.length >= 6;

  const submit = () => {
    const value = guess.trim().toUpperCase();
    if (value.length !== 5 || done) return;
    setRows((r) => [...r, value]);
    setGuess("");
  };

  const reset = () => { setRows([]); setGuess(""); setTarget(words[Math.floor(Math.random() * words.length)]); };

  const colorFor = (letter: string, i: number) => {
    if (letter === target[i]) return "#166534";
    if (target.includes(letter)) return "#854d0e";
    return "#27272a";
  };

  return (
    <GamePanel title="Wordle">
      <div style={{ display: "grid", gap: 5, width: "max-content" }}>
        {Array.from({ length: 6 }, (_, row) => {
          const value = rows[row] ?? (row === rows.length ? guess.toUpperCase() : "");
          return <div key={row} style={{ display: "grid", gridTemplateColumns: "repeat(5, 48px)", gap: 5 }}>
            {Array.from({ length: 5 }, (_, i) => <div key={i} style={{ width: 48, height: 48, display: "grid", placeItems: "center", border: "1px solid #3f3f46", background: rows[row] ? colorFor(value[i] ?? "", i) : "#18181b", fontWeight: 800 }}>{value[i] ?? ""}</div>)}
          </div>;
        })}
      </div>
      <input value={guess} maxLength={5} onChange={(e) => setGuess(e.target.value.replace(/[^a-z]/gi, ""))} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="5 letters" style={{ marginTop: 14, padding: 9, background: "#18181b", color: "inherit", border: "1px solid #3f3f46" }} />
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button onClick={submit} style={{ padding: "8px 12px", border: "1px solid #3f3f46", background: "#18181b", color: "inherit" }}>Guess</button>
        <button onClick={reset} style={{ padding: "8px 12px", border: "1px solid #3f3f46", background: "#18181b", color: "inherit" }}>New game</button>
      </div>
      <p style={{ opacity: .65, fontSize: 12 }}>{rows.includes(target) ? "Solved." : rows.length >= 6 ? `Word: ${target}` : "Green = correct · amber = present"}</p>
    </GamePanel>
  );
}

function BallMaze() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [won, setWon] = useState(false);
  const walls = new Set(["1,0", "1,1", "3,1", "3,2", "0,3", "2,3", "4,3"]);
  const move = (dx: number, dy: number) => setPos((p) => {
    if (won) return p;
    const nx = Math.max(0, Math.min(4, p.x + dx));
    const ny = Math.max(0, Math.min(4, p.y + dy));
    if (walls.has(`${nx},${ny}`)) return p;
    if (nx === 4 && ny === 4) setWon(true);
    return { x: nx, y: ny };
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowUp") move(0, -1);
      if (e.key === "ArrowDown") move(0, 1);
      if (e.key === "ArrowLeft") move(-1, 0);
      if (e.key === "ArrowRight") move(1, 0);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <GamePanel title="Ball Maze">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 54px)", gap: 4, width: "max-content" }}>
        {Array.from({ length: 25 }, (_, i) => {
          const x = i % 5, y = Math.floor(i / 5), wall = walls.has(`${x},${y}`);
          const player = pos.x === x && pos.y === y;
          return <div key={i} style={{ width: 54, height: 54, display: "grid", placeItems: "center", background: wall ? "#18181b" : "#111113", border: "1px solid #27272a" }}>{player ? "●" : x === 4 && y === 4 ? "◎" : ""}</div>;
        })}
      </div>
      <p style={{ opacity: .65, fontSize: 12 }}>{won ? "Maze solved." : "Use arrow keys. Reach ◎."}</p>
      <button onClick={() => { setPos({ x: 0, y: 0 }); setWon(false); }} style={{ padding: "8px 12px", border: "1px solid #3f3f46", background: "#18181b", color: "inherit" }}>Reset</button>
    </GamePanel>
  );
}

function LogicSim() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const [gate, setGate] = useState<"AND" | "OR" | "XOR" | "NOT">("AND");
  const out = gate === "AND" ? a && b : gate === "OR" ? a || b : gate === "XOR" ? a !== b : !a;
  return (
    <GamePanel title="Logic Sim">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setA(!a)} style={{ padding: 12, border: "1px solid #3f3f46", background: a ? "#166534" : "#18181b", color: "inherit" }}>INPUT A: {a ? "1" : "0"}</button>
        <button onClick={() => setB(!b)} disabled={gate === "NOT"} style={{ padding: 12, border: "1px solid #3f3f46", background: b ? "#166534" : "#18181b", color: "inherit" }}>INPUT B: {b ? "1" : "0"}</button>
        <select value={gate} onChange={(e) => setGate(e.target.value as typeof gate)} style={{ padding: 11, background: "#18181b", color: "inherit", border: "1px solid #3f3f46" }}>
          <option>AND</option><option>OR</option><option>XOR</option><option>NOT</option>
        </select>
      </div>
      <div style={{ marginTop: 24, padding: 20, border: "1px solid #27272a", width: "max-content" }}>
        {gate} → <strong style={{ fontSize: 28 }}>{out ? "1" : "0"}</strong>
      </div>
    </GamePanel>
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
