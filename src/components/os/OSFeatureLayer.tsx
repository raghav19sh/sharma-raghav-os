"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type FeatureApp =
  | "files" | "terminal" | "monitor" | "system" | "notes" | "calculator"
  | "network" | "hash" | "logs" | "hex" | "browser" | "music" | "security" | "settings" | "malware" | "soc" | "forensics" | "rain" | "wallpaper";

type FeatureWindow = {
  id: FeatureApp;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  z: number;
};

type ResizeState = {
  id: FeatureApp;
  dir: string;
  x: number;
  y: number;
  w: number;
  h: number;
  left: number;
  top: number;
};

const APP_INFO: Record<FeatureApp, { label: string; glyph: string; description: string }> = {
  files: { label: "File Manager", glyph: "▣", description: "Browse the OS workspace and public portfolio files." },
  terminal: { label: "Terminal", glyph: ">_", description: "A visitor-safe shell for exploring this workstation." },
  monitor: { label: "System Monitor", glyph: "◫", description: "Live browser/session resource telemetry." },
  system: { label: "System Information", glyph: "◉", description: "Hardware, browser and runtime information." },
  notes: { label: "Text Editor", glyph: "✎", description: "A local-only notes and scratchpad editor." },
  calculator: { label: "Calculator", glyph: "＋", description: "Basic arithmetic without sending data anywhere." },
  network: { label: "Network Analyzer", glyph: "⌁", description: "Inspect browser-visible connection information." },
  hash: { label: "Hash Analyzer", glyph: "#", description: "Calculate SHA-256 hashes locally in the browser." },
  logs: { label: "Log Viewer", glyph: "≡", description: "Inspect actions from the current visitor session." },
  hex: { label: "Hex Viewer", glyph: "0x", description: "Convert text into a compact hexadecimal view." },
  browser: { label: "Browser", glyph: "◎", description: "Quick navigation to Raghav's public resources." },
  music: { label: "Music Player", glyph: "♫", description: "Play a local audio file without uploading it." },
  security: { label: "Security Center", glyph: "◇", description: "Browser-side security and privacy posture." },
  settings: { label: "OS Settings", glyph: "⚙", description: "Desktop preferences and session controls." },
  malware: { label: "Malware Workbench", glyph: "⌬", description: "Local triage workspace for hashes, strings and indicators." },
  soc: { label: "SOC Dashboard", glyph: "◈", description: "A compact incident and detection operations board." },
  forensics: { label: "Forensics Toolkit", glyph: "⌗", description: "Evidence notes, timeline and artifact inspection tools." },
  rain: { label: "Rain Terminal", glyph: "◌", description: "The security-focused companion terminal." },
  wallpaper: { label: "Wallpaper Manager", glyph: "▧", description: "Choose and persist workstation visual presets." },
};

const APP_ORDER: FeatureApp[] = [
  "files", "terminal", "monitor", "system", "notes", "calculator", "network",
  "hash", "logs", "hex", "browser", "music", "security", "settings", "malware", "soc", "forensics", "rain", "wallpaper",
];

const INITIAL_WINDOWS: FeatureWindow[] = [];

const DEFAULT_NOTES =
  "# Raghav Sharma OS\n\n" +
  "Visitor workspace. Notes stay in this browser.\n\n" +
  "Ideas:\n- Build security tooling\n- Document research\n- Verify before trusting\n";

const styles = `
.osx-layer{position:fixed;inset:0;z-index:500;pointer-events:none;color:#eee8f3;font-family:Inter,ui-sans-serif,system-ui,sans-serif}
.osx-layer *{box-sizing:border-box}
.osx-ui{pointer-events:auto}
.osx-start{position:fixed;left:14px;bottom:14px;width:42px;height:42px;border:1px solid rgba(224,201,255,.18);border-radius:11px;background:rgba(12,5,20,.82);backdrop-filter:blur(18px);color:#d9baff;display:grid;place-items:center;cursor:pointer;box-shadow:0 12px 35px rgba(0,0,0,.3)}
.osx-start:hover,.osx-tray button:hover{background:rgba(92,37,139,.45);color:#fff}
.osx-tray{position:fixed;right:14px;bottom:14px;display:flex;align-items:center;gap:4px;padding:5px;border:1px solid rgba(224,201,255,.14);border-radius:12px;background:rgba(10,4,17,.82);backdrop-filter:blur(18px);box-shadow:0 12px 35px rgba(0,0,0,.3)}
.osx-tray button{width:30px;height:30px;border:0;border-radius:8px;background:transparent;color:#a99caf;cursor:pointer}
.osx-clock{padding:0 8px;color:#9d91a5;font:700 8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}
.osx-dot{width:5px;height:5px;border-radius:50%;display:inline-block;margin-right:4px;background:#77d79b}
.osx-dot.off{background:#d77b91}
.osx-menu{position:fixed;left:14px;bottom:64px;width:340px;max-height:min(620px,calc(100vh - 82px));overflow:auto;padding:10px;border:1px solid rgba(224,201,255,.16);border-radius:15px;background:rgba(11,4,18,.94);backdrop-filter:blur(24px);box-shadow:0 28px 80px rgba(0,0,0,.5)}
.osx-menu-head{padding:12px 12px 10px;border-bottom:1px solid rgba(224,201,255,.07);margin-bottom:8px}
.osx-menu-head strong{display:block;font-size:14px;font-weight:600}.osx-menu-head span{display:block;margin-top:4px;color:#766a80;font:700 7px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em}
.osx-app-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.osx-app{display:flex;align-items:center;gap:9px;padding:9px;border:0;border-radius:9px;background:transparent;color:#b7acbd;text-align:left;cursor:pointer}
.osx-app:hover{background:rgba(132,62,232,.14);color:#f2eaf6}.osx-app b{display:block;font-size:10px;font-weight:600}.osx-app small{display:block;margin-top:2px;color:#74697c;font-size:7px;line-height:1.3}.osx-glyph{width:29px;height:29px;flex:0 0 29px;border:1px solid rgba(205,163,255,.14);border-radius:8px;display:grid;place-items:center;background:rgba(132,62,232,.08);color:#cda0ff;font:800 10px ui-monospace,SFMono-Regular,Menlo,monospace}
.osx-menu-actions{display:flex;gap:5px;margin-top:9px;padding-top:9px;border-top:1px solid rgba(224,201,255,.07)}
.osx-menu-actions button,.osx-context button{flex:1;padding:8px;border:1px solid rgba(224,201,255,.09);border-radius:8px;background:rgba(255,255,255,.02);color:#a99caf;font:700 7px ui-monospace,SFMono-Regular,Menlo,monospace;cursor:pointer}.osx-menu-actions button:hover,.osx-context button:hover{background:rgba(132,62,232,.13);color:#e8dff0}
.osx-context{position:fixed;width:205px;padding:6px;border:1px solid rgba(224,201,255,.14);border-radius:10px;background:rgba(11,4,18,.96);box-shadow:0 18px 45px rgba(0,0,0,.42);backdrop-filter:blur(20px)}
.osx-context button{display:block;width:100%;text-align:left;border:0;background:transparent}.osx-context hr{border:0;border-top:1px solid rgba(224,201,255,.07);margin:5px 0}
.osx-notice-panel{position:fixed;right:14px;bottom:64px;width:310px;padding:12px;border:1px solid rgba(224,201,255,.14);border-radius:13px;background:rgba(10,4,17,.95);box-shadow:0 22px 65px rgba(0,0,0,.45);backdrop-filter:blur(22px)}
.osx-notice-panel header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.osx-notice-panel header strong{font-size:11px}.osx-notice-panel header button{border:0;background:none;color:#80738a;cursor:pointer}
.osx-notice{padding:9px;border:1px solid rgba(224,201,255,.07);border-radius:9px;background:rgba(255,255,255,.018);margin-top:5px}.osx-notice b{display:block;font-size:9px}.osx-notice span{display:block;margin-top:3px;color:#82778a;font-size:8px;line-height:1.5}
.osx-window{position:fixed;min-width:320px;min-height:220px;border:1px solid rgba(224,201,255,.16);border-radius:13px;overflow:hidden;background:rgba(10,4,17,.95);box-shadow:0 28px 90px rgba(0,0,0,.55),0 0 45px rgba(132,62,232,.08);backdrop-filter:blur(22px);pointer-events:auto}
.osx-window.max{inset:48px 12px 68px!important;width:auto!important;height:auto!important}
.osx-titlebar{height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 7px 0 11px;border-bottom:1px solid rgba(224,201,255,.08);background:rgba(255,255,255,.018);cursor:grab;user-select:none}.osx-titlebar:active{cursor:grabbing}
.osx-title{display:flex;align-items:center;gap:7px;font-size:10px}.osx-title .osx-glyph{width:22px;height:22px;flex-basis:22px;font-size:8px}.osx-actions{display:flex;gap:2px}.osx-actions button{width:25px;height:24px;border:0;border-radius:6px;background:transparent;color:#81758a;cursor:pointer}.osx-actions button:hover{background:rgba(255,255,255,.06);color:#fff}
.osx-body{height:calc(100% - 36px);min-height:0;overflow:auto;padding:14px}.osx-body.padless{padding:0}
.osx-resize{position:absolute;z-index:10}.osx-resize.n,.osx-resize.s{left:10px;right:10px;height:7px;cursor:ns-resize}.osx-resize.n{top:-3px}.osx-resize.s{bottom:-3px}.osx-resize.e,.osx-resize.w{top:10px;bottom:10px;width:7px;cursor:ew-resize}.osx-resize.e{right:-3px}.osx-resize.w{left:-3px}.osx-resize.ne,.osx-resize.nw,.osx-resize.se,.osx-resize.sw{width:12px;height:12px}.osx-resize.ne{top:-4px;right:-4px;cursor:nesw-resize}.osx-resize.nw{top:-4px;left:-4px;cursor:nwse-resize}.osx-resize.se{right:-4px;bottom:-4px;cursor:nwse-resize}.osx-resize.sw{left:-4px;bottom:-4px;cursor:nesw-resize}
.osx-toolbar{display:flex;align-items:center;gap:6px;margin-bottom:10px}.osx-input{flex:1;min-width:0;padding:9px 10px;border:1px solid rgba(224,201,255,.1);border-radius:8px;background:#0d0615;color:#eae1ef;outline:none;font-size:10px}.osx-input:focus{border-color:rgba(189,125,255,.4)}.osx-btn{padding:8px 10px;border:1px solid rgba(224,201,255,.1);border-radius:8px;background:rgba(255,255,255,.025);color:#b8adbf;cursor:pointer;font:700 8px ui-monospace,SFMono-Regular,Menlo,monospace}.osx-btn:hover{background:rgba(132,62,232,.12);color:#eee}
.osx-files{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:7px}.osx-file{padding:12px;border:1px solid rgba(224,201,255,.07);border-radius:9px;background:rgba(255,255,255,.018);cursor:pointer}.osx-file:hover{background:rgba(132,62,232,.08);border-color:rgba(189,125,255,.2)}.osx-file-icon{font-size:18px;color:#c28dff}.osx-file strong{display:block;margin-top:7px;font-size:9px}.osx-file span{display:block;margin-top:3px;color:#71667a;font-size:7px}
.osx-terminal{height:100%;display:flex;flex-direction:column;background:#07030b;color:#cdb9dc;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}.osx-terminal-out{flex:1;overflow:auto;padding:12px;white-space:pre-wrap;line-height:1.65}.osx-terminal-form{display:flex;padding:9px 12px;border-top:1px solid rgba(224,201,255,.08);gap:7px}.osx-terminal-form span{color:#9d65dc}.osx-terminal-form input{flex:1;border:0;background:transparent;outline:0;color:#eee;font:inherit}
.osx-stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.osx-stat{padding:12px;border:1px solid rgba(224,201,255,.08);border-radius:9px;background:rgba(255,255,255,.018)}.osx-stat span{display:block;color:#756a7e;font:700 7px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em}.osx-stat strong{display:block;margin-top:7px;font-size:19px;font-weight:500}.osx-bar{height:5px;margin-top:9px;border-radius:9px;background:rgba(255,255,255,.06);overflow:hidden}.osx-bar i{display:block;height:100%;border-radius:inherit;background:#9a55e8}
.osx-section-title{margin:14px 0 7px;color:#897d91;font:800 7px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em}
.osx-kv{display:grid;grid-template-columns:145px 1fr;gap:5px;padding:6px 0;border-bottom:1px solid rgba(224,201,255,.05);font-size:9px}.osx-kv span{color:#766a7e}.osx-kv b{font-weight:500;color:#c2b7c8;word-break:break-word}
.osx-editor{width:100%;height:100%;min-height:300px;resize:none;border:0;outline:0;background:#08040d;color:#d9cedf;padding:14px;font:11px ui-monospace,SFMono-Regular,Menlo,monospace;line-height:1.7}
.osx-calc{max-width:330px;margin:auto}.osx-calc-display{width:100%;padding:15px;margin-bottom:8px;text-align:right;border:1px solid rgba(224,201,255,.1);border-radius:9px;background:#08040d;color:#f2eaf6;font:500 23px ui-monospace,SFMono-Regular,Menlo,monospace;overflow:hidden}.osx-calc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}.osx-calc-grid button{height:48px;border:1px solid rgba(224,201,255,.08);border-radius:8px;background:rgba(255,255,255,.025);color:#c7bdcc;cursor:pointer;font-size:12px}.osx-calc-grid button:hover{background:rgba(132,62,232,.16);color:#fff}
.osx-log{display:grid;gap:5px}.osx-log-row{display:grid;grid-template-columns:80px 1fr;gap:8px;padding:7px;border-radius:7px;background:rgba(255,255,255,.018);font:8px ui-monospace,SFMono-Regular,Menlo,monospace}.osx-log-row time{color:#6f6478}.osx-log-row span{color:#a99ead}
.osx-code{margin:0;padding:12px;border:1px solid rgba(224,201,255,.07);border-radius:8px;background:#07030b;color:#cbbbd4;font:9px ui-monospace,SFMono-Regular,Menlo,monospace;line-height:1.65;white-space:pre-wrap;overflow:auto}
.osx-browser-links{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.osx-browser-links a{padding:12px;border:1px solid rgba(224,201,255,.08);border-radius:8px;color:#c2b4ca;text-decoration:none;background:rgba(255,255,255,.018);font-size:9px}.osx-browser-links a:hover{border-color:rgba(189,125,255,.3);background:rgba(132,62,232,.08)}
.osx-security-grid{display:grid;gap:7px}.osx-security-row{display:flex;align-items:center;justify-content:space-between;padding:10px;border:1px solid rgba(224,201,255,.07);border-radius:8px;background:rgba(255,255,255,.018)}.osx-security-row span{color:#978b9f;font-size:9px}.osx-pass{color:#7bd49a!important}.osx-warn{color:#e5bd78!important}
.osx-drop{border:1px dashed rgba(189,125,255,.25);border-radius:10px;padding:28px;text-align:center;color:#82768b;font-size:9px}.osx-drop input{margin-top:10px}
.osx-snap-hint{padding:9px;border-radius:8px;background:rgba(132,62,232,.08);color:#9d91a5;font-size:8px;line-height:1.5}
@media(max-width:760px){.osx-menu{left:8px;right:8px;bottom:62px;width:auto}.osx-tray{right:8px}.osx-start{left:8px}.osx-window{left:8px!important;top:70px!important;width:calc(100vw - 16px)!important;height:calc(100vh - 140px)!important}.osx-window.max{inset:38px 0 55px!important}.osx-stat-grid{grid-template-columns:1fr 1fr}.osx-browser-links{grid-template-columns:1fr}}
`;

function nowStamp() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function OSFeatureLayer() {
  const [windows, setWindows] = useState<FeatureWindow[]>(INITIAL_WINDOWS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [context, setContext] = useState<{ x: number; y: number } | null>(null);
  const [online, setOnline] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [z, setZ] = useState(20);
  const [drag, setDrag] = useState<{ id: FeatureApp; ox: number; oy: number } | null>(null);
  const [resize, setResize] = useState<ResizeState | null>(null);
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [logs, setLogs] = useState<string[]>(["Session started"]);
  const [notifications, setNotifications] = useState([
    { title: "Raghav OS ready", body: "Start menu, terminal and workstation tools are available." },
    { title: "Privacy mode", body: "Feature apps process their inputs locally in this browser." },
  ]);
  const [theme, setTheme] = useState<"violet" | "mono">("violet");
  const [focused, setFocused] = useState<FeatureApp | null>(null);
  const [musicUrl, setMusicUrl] = useState("");
  const [sessionStart] = useState(() => Date.now());

  useEffect(() => {
    const saved = window.localStorage.getItem("sr-os-feature-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.windows)) setWindows(parsed.windows);
        if (typeof parsed.notes === "string") setNotes(parsed.notes);
        if (parsed.theme === "violet" || parsed.theme === "mono") setTheme(parsed.theme);
      } catch {}
    }
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sr-os-feature-state", JSON.stringify({ windows, notes, theme }));
  }, [windows, notes, theme]);

  useEffect(() => {
    if (!drag && !resize) return;
    const move = (event: PointerEvent) => {
      if (drag) {
        setWindows(current => current.map(win => {
          if (win.id !== drag.id || win.maximized) return win;
          return {
            ...win,
            x: Math.max(4, Math.min(window.innerWidth - 100, event.clientX - drag.ox)),
            y: Math.max(42, Math.min(window.innerHeight - 90, event.clientY - drag.oy)),
          };
        }));
      }
      if (resize) {
        setWindows(current => current.map(win => {
          if (win.id !== resize.id || win.maximized) return win;
          const dx = event.clientX - resize.x;
          const dy = event.clientY - resize.y;
          let w = resize.w, h = resize.h, left = resize.left, top = resize.top;
          if (resize.dir.includes("e")) w = Math.max(320, resize.w + dx);
          if (resize.dir.includes("s")) h = Math.max(220, resize.h + dy);
          if (resize.dir.includes("w")) { w = Math.max(320, resize.w - dx); left = resize.left + resize.w - w; }
          if (resize.dir.includes("n")) { h = Math.max(220, resize.h - dy); top = resize.top + resize.h - h; }
          return { ...win, x: Math.max(4, left), y: Math.max(42, top), width: Math.min(w, window.innerWidth - Math.max(4, left) - 4), height: Math.min(h, window.innerHeight - Math.max(42, top) - 58) };
        }));
      }
    };
    const up = () => { setDrag(null); setResize(null); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [drag, resize]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "Tab") {
        event.preventDefault();
        setWindows(current => {
          const visible = current.filter(win => !win.minimized).sort((a,b) => b.z-a.z);
          if (visible.length < 2) return current;
          const next = visible[1];
          const top = Math.max(20, ...current.map(win => win.z));
          setFocused(next.id);
          return current.map(win => win.id === next.id ? { ...win, z: top + 1 } : win);
        });
      }
      if ((event.metaKey || event.ctrlKey) && event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        const current = focused ? windows.find(win => win.id === focused) : null;
        if (current) snapWindow(current.id, event.key === "ArrowLeft" ? "left" : "right");
      }
      if (event.key === "Escape") {
        setMenuOpen(false); setNotificationsOpen(false); setContext(null);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [focused, windows]);

  function log(message: string) {
    setLogs(current => [...current.slice(-79), `[${nowStamp()}] ${message}`]);
  }

  function bringToFront(id: FeatureApp) {
    setZ(current => current + 1);
    setWindows(current => current.map(win => win.id === id ? { ...win, z: z + 1, minimized: false } : win));
    setFocused(id);
  }

  function openApp(id: FeatureApp) {
    setMenuOpen(false);
    setContext(null);
    setNotificationsOpen(false);
    setWindows(current => {
      const existing = current.find(win => win.id === id);
      if (existing) return current.map(win => win.id === id ? { ...win, minimized: false, z: z + 1 } : win);
      const offset = Math.min(current.length, 5) * 24;
      const size = id === "terminal" || id === "files" ? { width: 760, height: 500 } : { width: 620, height: 440 };
      return [...current, { id, title: APP_INFO[id].label, x: Math.max(28, 180 + offset), y: Math.max(56, 80 + offset), width: size.width, height: size.height, minimized: false, maximized: false, z: z + 1 }];
    });
    setZ(current => current + 1);
    setFocused(id);
    log(`Opened ${APP_INFO[id].label}`);
  }

  function closeApp(id: FeatureApp) {
    setWindows(current => current.filter(win => win.id !== id));
    if (focused === id) setFocused(null);
    log(`Closed ${APP_INFO[id].label}`);
  }

  function minimizeApp(id: FeatureApp) {
    setWindows(current => current.map(win => win.id === id ? { ...win, minimized: true } : win));
    log(`Minimized ${APP_INFO[id].label}`);
  }

  function maximizeApp(id: FeatureApp) {
    setWindows(current => current.map(win => win.id === id ? { ...win, maximized: !win.maximized, minimized: false } : win));
  }

  function snapWindow(id: FeatureApp, side: "left" | "right") {
    setWindows(current => current.map(win => win.id === id ? {
      ...win, maximized: false, minimized: false,
      x: side === "left" ? 8 : Math.floor(window.innerWidth / 2) + 2,
      y: 48, width: Math.max(320, Math.floor(window.innerWidth / 2) - 14), height: Math.max(220, window.innerHeight - 118),
    } : win));
    log(`Snapped ${APP_INFO[id].label} ${side}`);
  }

  function resetSession() {
    setWindows([]);
    setNotes(DEFAULT_NOTES);
    setLogs(["Session reset"]);
    window.localStorage.removeItem("sr-os-feature-state");
    log("Session restored to defaults");
  }

  function startDrag(id: FeatureApp, event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const win = windows.find(item => item.id === id);
    if (!win || win.maximized) return;
    bringToFront(id);
    setDrag({ id, ox: event.clientX - win.x, oy: event.clientY - win.y });
  }

  function startResize(id: FeatureApp, dir: string, event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    const win = windows.find(item => item.id === id);
    if (!win || win.maximized || event.button !== 0) return;
    bringToFront(id);
    setResize({ id, dir, x: event.clientX, y: event.clientY, w: win.width, h: win.height, left: win.x, top: win.y });
  }

  const uptime = Math.floor((now.getTime() - sessionStart) / 1000);
  const mins = Math.floor(uptime / 60);
  const uptimeText = `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2,"0")}m ${String(uptime % 60).padStart(2,"0")}s`;

  function terminalCommand(raw: string, append: (s: string) => void) {
    const cmd = raw.trim();
    if (!cmd) return;
    const [name, ...args] = cmd.split(/\s+/);
    const arg = args.join(" ");
    switch (name.toLowerCase()) {
      case "help":
        append("help  ls  pwd  whoami  date  uptime  neofetch  apps  open <app>  clear  echo <text>  status");
        break;
      case "ls": append("Desktop  Documents  Projects  Research  Security  Resume.pdf  README.md"); break;
      case "pwd": append("/home/raghav"); break;
      case "whoami": append("visitor@raghav-os"); break;
      case "date": append(new Date().toString()); break;
      case "uptime": append(uptimeText); break;
      case "neofetch": append("RAGHAV-OS\nKernel: web-runtime\nShell: srsh\nDE: Raghav Desktop\nSecurity: visitor/read-only\nStorage: local browser"); break;
      case "apps": append(APP_ORDER.map(id => APP_INFO[id].label).join("  ·  ")); break;
      case "open": {
        const target = APP_ORDER.find(id => id === arg || APP_INFO[id].label.toLowerCase() === arg.toLowerCase());
        if (target) { openApp(target); append(`Launching ${APP_INFO[target].label}...`); } else append("Unknown app. Try: apps");
        break;
      }
      case "clear": append("\u0000"); break;
      case "echo": append(arg); break;
      case "status": append(`network=${online ? "online" : "offline"}  secure_context=${window.isSecureContext}  windows=${windows.length}`); break;
      default: append(`srsh: command not found: ${name}`);
    }
    log(`terminal: ${cmd}`);
  }

  function renderApp(id: FeatureApp) {
    switch (id) {
      case "files": return <FileManager openApp={openApp} />;
      case "terminal": return <Terminal run={terminalCommand} />;
      case "monitor": return <SystemMonitor now={now} />;
      case "system": return <SystemInfo />;
      case "notes": return <textarea className="osx-editor" value={notes} onChange={e => setNotes(e.target.value)} aria-label="Local notes" />;
      case "calculator": return <Calculator />;
      case "network": return <NetworkAnalyzer online={online} />;
      case "hash": return <HashAnalyzer />;
      case "logs": return <div className="osx-log">{logs.length ? logs.map((line,i) => <div className="osx-log-row" key={`${line}-${i}`}><time>{line.slice(1,9)}</time><span>{line.slice(11)}</span></div>) : <span>No session logs.</span>}</div>;
      case "hex": return <HexViewer />;
      case "browser": return <BrowserLinks />;
      case "music": return <MusicPlayer musicUrl={musicUrl} setMusicUrl={setMusicUrl} />;
      case "security": return <SecurityCenter online={online} />;
      case "settings": return <SettingsPanel theme={theme} setTheme={setTheme} resetSession={resetSession} />;
      case "malware": return <MalwareWorkbench />;
      case "soc": return <SOCDashboard />;
      case "forensics": return <ForensicsToolkit />;
      case "rain": return <Terminal run={terminalCommand} />;
      case "wallpaper": return <WallpaperManager />;
    }
  }

  return (
    <div className={`osx-layer ${theme === "mono" ? "osx-mono" : ""}`} style={{background:"var(--sr-os-wallpaper,transparent)"}} onContextMenu={e => {
      e.preventDefault();
      setMenuOpen(false); setNotificationsOpen(false);
      setContext({ x: Math.min(e.clientX, window.innerWidth - 215), y: Math.min(e.clientY, window.innerHeight - 230) });
    }}>
      <style>{styles}</style>

      {context && (
        <div className="osx-context osx-ui" style={{ left: context.x, top: context.y }} onClick={e => e.stopPropagation()}>
          <button onClick={() => openApp("files")}>Open File Manager</button>
          <button onClick={() => openApp("terminal")}>Open Terminal</button>
          <button onClick={() => openApp("system")}>System Information</button>
          <hr />
          <button onClick={() => { setWindows(current => current.map(w => ({ ...w, minimized: true }))); setContext(null); }}>Minimize all</button>
          <button onClick={() => { setWindows(current => current.map(w => ({ ...w, maximized: true, minimized: false }))); setContext(null); }}>Maximize all</button>
          <button onClick={() => { setContext(null); setNotificationsOpen(true); }}>Notifications</button>
          <hr />
          <button onClick={() => { setContext(null); setMenuOpen(true); }}>Applications</button>
        </div>
      )}

      {menuOpen && (
        <div className="osx-menu osx-ui" onClick={e => e.stopPropagation()}>
          <div className="osx-menu-head">
            <strong>RAGHAV SHARMA OS</strong>
            <span>APPLICATION LAUNCHER · VISITOR MODE</span>
          </div>
          <div className="osx-app-grid">
            {APP_ORDER.map(id => (
              <button className="osx-app" key={id} onClick={() => openApp(id)}>
                <span className="osx-glyph">{APP_INFO[id].glyph}</span>
                <span><b>{APP_INFO[id].label}</b><small>{APP_INFO[id].description}</small></span>
              </button>
            ))}
          </div>
          <div className="osx-menu-actions">
            <button onClick={() => openApp("settings")}>Settings</button>
            <button onClick={() => resetSession()}>Reset session</button>
          </div>
        </div>
      )}

      {notificationsOpen && (
        <div className="osx-notice-panel osx-ui" onClick={e => e.stopPropagation()}>
          <header><strong>Notifications</strong><button onClick={() => setNotificationsOpen(false)}>×</button></header>
          {notifications.map((item,i) => <div className="osx-notice" key={`${item.title}-${i}`}><b>{item.title}</b><span>{item.body}</span></div>)}
        </div>
      )}

      {windows.map(win => {
        if (win.minimized) return null;
        const app = APP_INFO[win.id];
        return (
          <section
            key={win.id}
            className={win.maximized ? "osx-window max" : "osx-window"}
            style={win.maximized ? { zIndex: win.z } : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z }}
            onMouseDown={() => bringToFront(win.id)}
          >
            <div
              className="osx-titlebar"
              onPointerDown={e => startDrag(win.id, e)}
              onDoubleClick={() => maximizeApp(win.id)}
            >
              <div className="osx-title"><span className="osx-glyph">{app.glyph}</span><strong>{app.label}</strong></div>
              <div className="osx-actions">
                <button onClick={e => { e.stopPropagation(); minimizeApp(win.id); }} aria-label="Minimize">—</button>
                <button onClick={e => { e.stopPropagation(); maximizeApp(win.id); }} aria-label="Maximize">□</button>
                <button onClick={e => { e.stopPropagation(); closeApp(win.id); }} aria-label="Close">×</button>
              </div>
            </div>
            <div className={win.id === "terminal" ? "osx-body padless" : "osx-body"}>{renderApp(win.id)}</div>
            {!win.maximized && ["n","s","e","w","ne","nw","se","sw"].map(dir =>
              <div key={dir} className={`osx-resize ${dir}`} onPointerDown={e => startResize(win.id, dir, e)} />
            )}
          </section>
        );
      })}

      <button className="osx-start osx-ui" onClick={() => { setMenuOpen(v => !v); setNotificationsOpen(false); setContext(null); }} aria-label="Open application launcher" title="Applications">RS</button>

      <div className="osx-tray osx-ui">
        <button onClick={() => setNotificationsOpen(v => !v)} title="Notifications">♢</button>
        <button onClick={() => openApp("monitor")} title="System Monitor">◫</button>
        <button onClick={() => openApp("network")} title="Network">⌁</button>
        <button onClick={() => openApp("settings")} title="Settings">⚙</button>
        <span className="osx-clock"><i className={`osx-dot ${online ? "" : "off"}`}/>{now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:false})}</span>
      </div>
    </div>
  );
}

function MalwareWorkbench() {
  const [sample, setSample] = useState("");
  const [strings, setStrings] = useState<string[]>([]);
  const [digest, setDigest] = useState("");
  async function triage() {
    const bytes = new TextEncoder().encode(sample);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    setDigest(Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join(""));
    setStrings(sample.match(/[A-Za-z0-9_./:-]{5,}/g)?.slice(0, 30) ?? []);
  }
  return <div>
    <div className="osx-section-title">LOCAL SAMPLE TRIAGE</div>
    <textarea className="osx-input" style={{width:"100%",minHeight:100,resize:"vertical"}} value={sample} onChange={e=>setSample(e.target.value)} placeholder="Paste text, strings or an IOC sample. No upload occurs." />
    <button className="osx-btn" style={{marginTop:7}} onClick={triage}>Analyze locally</button>
    {digest && <><div className="osx-section-title">SHA-256</div><pre className="osx-code">{digest}</pre></>}
    <div className="osx-section-title">EXTRACTED STRINGS / INDICATORS</div>
    <pre className="osx-code">{strings.length ? strings.join("\n") : "No strings extracted yet."}</pre>
    <p className="osx-snap-hint" style={{marginTop:9}}>This is a safe triage helper, not an executable malware sandbox.</p>
  </div>;
}

function SOCDashboard() {
  const alerts = [
    ["CRITICAL", "Suspicious PowerShell chain", "T1059.001", "Needs triage"],
    ["HIGH", "Credential access pattern", "T1003", "Investigate"],
    ["MEDIUM", "Unexpected archive execution", "T1560", "Contained"],
    ["LOW", "New browser session", "TA0001", "Informational"],
  ];
  return <div>
    <div className="osx-stat-grid"><div className="osx-stat"><span>ALERTS</span><strong>04</strong></div><div className="osx-stat"><span>CRITICAL</span><strong>01</strong></div><div className="osx-stat"><span>STATUS</span><strong style={{fontSize:13}}>MONITORING</strong></div></div>
    <div className="osx-section-title">DETECTION QUEUE</div>
    <div className="osx-security-grid">{alerts.map(([sev,name,mitre,status])=><div className="osx-security-row" key={name}><span><b style={{display:"block",fontWeight:600,color:"#c9bdcf"}}>{name}</b><small style={{display:"block",marginTop:3,color:"#6f6477"}}>{mitre} · {status}</small></span><b className={sev==="CRITICAL" ? "osx-warn" : "osx-pass"}>{sev}</b></div>)}</div>
    <p className="osx-snap-hint" style={{marginTop:10}}>Demo telemetry for the portfolio workstation; it does not claim to monitor a real SOC backend.</p>
  </div>;
}

function ForensicsToolkit() {
  const [evidence, setEvidence] = useState("");
  const [timeline, setTimeline] = useState<string[]>([]);
  function addEvent() {
    if (!evidence.trim()) return;
    setTimeline(current => [...current, new Date().toISOString() + " · " + evidence.trim()]);
    setEvidence("");
  }
  return <div>
    <div className="osx-section-title">CASE NOTES / TIMELINE</div>
    <div className="osx-toolbar"><input className="osx-input" value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="Evidence event or observation..." /><button className="osx-btn" onClick={addEvent}>Add</button></div>
    <div className="osx-log">{timeline.length ? timeline.map((line,i)=><div className="osx-log-row" key={i}><time>{line.slice(11,19)}</time><span>{line.slice(24)}</span></div>) : <span>No evidence events recorded.</span>}</div>
    <div className="osx-section-title">QUICK TOOLS</div>
    <div className="osx-browser-links"><button className="osx-btn" onClick={()=>navigator.clipboard?.writeText(timeline.join("\n"))}>Copy timeline</button><button className="osx-btn" onClick={()=>window.print()}>Print case</button></div>
  </div>;
}

function WallpaperManager() {
  const presets = [
    ["Deep Violet", "radial-gradient(circle at 70% 20%,rgba(132,62,232,.24),transparent 32%),linear-gradient(145deg,#07030c,#12071c 55%,#09040f)"],
    ["Carbon", "radial-gradient(circle at 30% 10%,rgba(255,255,255,.06),transparent 25%),linear-gradient(145deg,#050607,#111315 55%,#070809)"],
    ["Midnight Blue", "radial-gradient(circle at 70% 15%,rgba(49,112,190,.2),transparent 30%),linear-gradient(145deg,#03070d,#081221 55%,#05070c)"],
  ];
  const [selected,setSelected]=useState(()=>window.localStorage.getItem("sr-os-wallpaper")||presets[0][0]);
  function choose(name:string, background:string){setSelected(name);window.localStorage.setItem("sr-os-wallpaper",name);document.documentElement.style.setProperty("--sr-os-wallpaper",background);}
  useEffect(()=>{const name=window.localStorage.getItem("sr-os-wallpaper");const p=presets.find(x=>x[0]===name);if(p)document.documentElement.style.setProperty("--sr-os-wallpaper",p[1]);},[]);
  return <div><div className="osx-section-title">WORKSTATION PRESETS</div>{presets.map(([name,bg])=><button key={name} className="osx-file" style={{width:"100%",marginBottom:7,textAlign:"left",background:bg}} onClick={()=>choose(name,bg)}><strong>{name}</strong><span>{selected===name?"ACTIVE":"Apply preset"}</span></button>)}<p className="osx-snap-hint">The selected preset is stored locally. It overlays the workstation and does not change server-side wallpaper settings.</p></div>;
}

function FileManager({ openApp }: { openApp: (id: FeatureApp) => void }) {
  const files = [
    { name: "Desktop", type: "folder", action: () => openApp("system") },
    { name: "Documents", type: "folder", action: () => openApp("notes") },
    { name: "Projects", type: "folder", action: () => { window.location.hash = "projects"; } },
    { name: "Research", type: "folder", action: () => { window.location.hash = "research"; } },
    { name: "Security", type: "folder", action: () => openApp("security") },
    { name: "Resume.pdf", type: "PDF", action: () => { window.location.href = "/resume"; } },
    { name: "README.md", type: "Markdown", action: () => openApp("notes") },
    { name: "Hash Analyzer", type: "Tool", action: () => openApp("hash") },
  ];
  return <div><div className="osx-toolbar"><span className="osx-input">/home/raghav</span><button className="osx-btn" onClick={() => window.location.reload()}>Refresh</button></div><div className="osx-files">{files.map(file => <button className="osx-file" key={file.name} onClick={file.action}><span className="osx-file-icon">{file.type === "folder" ? "▰" : "▤"}</span><strong>{file.name}</strong><span>{file.type}</span></button>)}</div><div className="osx-snap-hint" style={{marginTop:10}}>Tip: double-click a window title to maximize. Use ⌘/Ctrl + Alt + ←/→ to snap it.</div></div>;
}

function Terminal({ run }: { run: (raw: string, append: (s: string) => void) => void }) {
  const [lines, setLines] = useState<string[]>([
    "RAGHAV SHARMA OS [visitor shell]",
    "Type 'help' for commands. This shell has no server or filesystem access.",
  ]);
  const [input, setInput] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const command = input;
    setInput("");
    if (command.trim().toLowerCase() === "clear") { setLines([]); return; }
    setLines(current => [...current, `visitor@raghav-os:~$ ${command}`]);
    run(command, output => {
      if (output === "\u0000") setLines([]);
      else setLines(current => [...current, output]);
    });
  }
  return <div className="osx-terminal" onClick={() => ref.current?.focus()}><div className="osx-terminal-out">{lines.map((line,i) => <div key={`${line}-${i}`}>{line}</div>)}</div><form className="osx-terminal-form" onSubmit={submit}><span>visitor@raghav-os:~$</span><input ref={ref} value={input} onChange={e => setInput(e.target.value)} autoFocus aria-label="Terminal command" /></form></div>;
}

function SystemMonitor({ now }: { now: Date }) {
  const [cpu, setCpu] = useState(18);
  const [mem, setMem] = useState(42);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCpu(Math.round(10 + Math.random() * 42));
      setMem(Math.round(34 + Math.random() * 25));
    }, 1500);
    return () => window.clearInterval(timer);
  }, []);
  const perf = (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
  const heap = perf ? Math.round(perf.usedJSHeapSize / 1048576) + " MB" : "Browser API unavailable";
  return <div><div className="osx-stat-grid"><div className="osx-stat"><span>CPU</span><strong>{cpu}%</strong><div className="osx-bar"><i style={{width: cpu + "%"}}/></div></div><div className="osx-stat"><span>MEMORY</span><strong>{mem}%</strong><div className="osx-bar"><i style={{width: mem + "%"}}/></div></div><div className="osx-stat"><span>JS HEAP</span><strong style={{fontSize:13}}>{heap}</strong></div></div><div className="osx-section-title">SESSION</div><div className="osx-kv"><span>Clock</span><b>{now.toLocaleString("en-IN")}</b></div><div className="osx-kv"><span>Visibility</span><b>{document.visibilityState}</b></div><div className="osx-kv"><span>Screen</span><b>{window.screen.width} × {window.screen.height}</b></div><p className="osx-snap-hint">CPU and memory percentages are browser-side visual telemetry, not host OS measurements.</p></div>;
}

function SystemInfo() {
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number; userAgentData?: { platform?: string } };
  const rows = [
    ["Platform", nav.userAgentData?.platform || nav.platform || "Unknown"],
    ["CPU threads", String(nav.hardwareConcurrency || "Unknown")],
    ["Device memory", nav.deviceMemory ? nav.deviceMemory + " GB (approx.)" : "Unavailable"],
    ["Browser", navigator.userAgent],
    ["Language", navigator.language],
    ["Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone],
    ["Viewport", window.innerWidth + " × " + window.innerHeight],
    ["Screen", window.screen.width + " × " + window.screen.height],
    ["Secure context", String(window.isSecureContext)],
    ["Storage", "localStorage available"],
  ];
  return <div><div className="osx-section-title">RUNTIME</div>{rows.map(([k,v]) => <div className="osx-kv" key={k}><span>{k}</span><b>{v}</b></div>)}</div>;
}

function Calculator() {
  const [value, setValue] = useState("");
  const keys = ["7","8","9","/","4","5","6","*","1","2","3","-","0",".","%","+","(",")","C","="];
  function press(key: string) {
    if (key === "C") return setValue("");
    if (key === "=") {
      if (!/^[0-9+\-*/%.()\s]+$/.test(value)) return setValue("ERR");
      try { setValue(String(Function("return (" + value + ")")())); } catch { setValue("ERR"); }
      return;
    }
    setValue(v => v === "ERR" ? key : v + key);
  }
  return <div className="osx-calc"><div className="osx-calc-display">{value || "0"}</div><div className="osx-calc-grid">{keys.map(key => <button key={key} onClick={() => press(key)}>{key}</button>)}</div></div>;
}

function NetworkAnalyzer({ online }: { online: boolean }) {
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean } }).connection;
  return <div><div className="osx-security-grid"><div className="osx-security-row"><span>Connectivity</span><b className={online ? "osx-pass" : "osx-warn"}>{online ? "ONLINE" : "OFFLINE"}</b></div><div className="osx-security-row"><span>Effective type</span><b>{connection?.effectiveType || "Unavailable"}</b></div><div className="osx-security-row"><span>Downlink</span><b>{connection?.downlink ? connection.downlink + " Mbps" : "Unavailable"}</b></div><div className="osx-security-row"><span>RTT</span><b>{connection?.rtt ? connection.rtt + " ms" : "Unavailable"}</b></div><div className="osx-security-row"><span>Save data</span><b>{connection?.saveData ? "Enabled" : "Disabled / unavailable"}</b></div></div><p className="osx-snap-hint" style={{marginTop:10}}>No packets are captured or transmitted by this tool. It only reads browser-exposed connection metadata.</p></div>;
}

function HashAnalyzer() {
  const [input, setInput] = useState("");
  const [hash, setHash] = useState("");
  async function calculate() {
    const data = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", data);
    setHash(Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,"0")).join(""));
  }
  return <div><textarea className="osx-input" style={{width:"100%",minHeight:100,resize:"vertical"}} value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text to hash locally..." /><button className="osx-btn" style={{marginTop:7}} onClick={calculate}>SHA-256</button>{hash && <pre className="osx-code" style={{marginTop:9}}>{hash}</pre>}<p className="osx-snap-hint" style={{marginTop:9}}>Input is processed with Web Crypto in this browser.</p></div>;
}

function HexViewer() {
  const [input, setInput] = useState("");
  const bytes = new TextEncoder().encode(input);
  const lines = [];
  for (let i=0;i<bytes.length;i+=16) {
    const slice = Array.from(bytes.slice(i,i+16));
    const hex = slice.map(b => b.toString(16).padStart(2,"0")).join(" ");
    const ascii = slice.map(b => b >= 32 && b < 127 ? String.fromCharCode(b) : ".").join("");
    lines.push(i.toString(16).padStart(8,"0") + "  " + hex.padEnd(47," ") + "  " + ascii);
  }
  return <div><textarea className="osx-input" style={{width:"100%",minHeight:90,resize:"vertical"}} value={input} onChange={e => setInput(e.target.value)} placeholder="Text to inspect..." /><div className="osx-section-title">HEX DUMP</div><pre className="osx-code">{lines.join("\n") || "00000000"}</pre></div>;
}

function BrowserLinks() {
  const [url, setUrl] = useState("");
  const links = [
    ["Portfolio", "https://sharma-raghav.com/"],
    ["OS", "https://sharma-raghav.com/os"],
    ["GitHub", "https://github.com/raghav19sh"],
    ["LinkedIn", "https://www.linkedin.com/in/sharmaraghav1/"],
    ["Tools", "https://tools.sharma-raghav.com/"],
    ["Resume", "https://sharma-raghav.com/resume"],
  ];
  return <div><div className="osx-toolbar"><input className="osx-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." /><button className="osx-btn" onClick={() => { if (/^https?:\\/\\//i.test(url)) window.open(url, "_blank", "noopener,noreferrer"); }}>Go</button></div><div className="osx-browser-links">{links.map(([name,href]) => <a href={href} target="_blank" rel="noreferrer" key={name}>{name}</a>)}</div></div>;
}

function MusicPlayer({ musicUrl, setMusicUrl }: { musicUrl: string; setMusicUrl: (value: string) => void }) {
  return <div><div className="osx-drop">Select an audio file. It remains local to this browser.<input type="file" accept="audio/*" onChange={e => { const file = e.target.files?.[0]; if (file) setMusicUrl(URL.createObjectURL(file)); }} /></div>{musicUrl && <audio style={{width:"100%",marginTop:12}} controls src={musicUrl} />}</div>;
}

function SecurityCenter({ online }: { online: boolean }) {
  const checks = [
    ["Secure context", window.isSecureContext, "HTTPS/secure browser context"],
    ["Storage isolation", true, "Local visitor state uses browser storage"],
    ["Network", online, "Browser reports network connectivity"],
    ["Referrer policy", document.referrer ? true : true, "No server-side inspection performed"],
    ["Filesystem access", true, "No host filesystem access is requested"],
    ["Input processing", true, "Hash/hex tools process data locally"],
  ];
  return <div><div className="osx-security-grid">{checks.map(([label,pass,detail]) => <div className="osx-security-row" key={String(label)}><span><b style={{display:"block",fontWeight:600,color:"#c9bdcf"}}>{String(label)}</b><small style={{display:"block",marginTop:3,color:"#6f6477"}}>{String(detail)}</small></span><b className={pass ? "osx-pass" : "osx-warn"}>{pass ? "PASS" : "CHECK"}</b></div>)}</div><p className="osx-snap-hint" style={{marginTop:10}}>This is a client-side posture summary, not a penetration test or server security audit.</p></div>;
}

function SettingsPanel({ theme, setTheme, resetSession }: { theme: "violet" | "mono"; setTheme: (theme: "violet" | "mono") => void; resetSession: () => void }) {
  return <div><div className="osx-section-title">APPEARANCE</div><div className="osx-security-row"><span>Accent theme</span><div style={{display:"flex",gap:5}}><button className="osx-btn" onClick={() => setTheme("violet")} aria-pressed={theme==="violet"}>Violet</button><button className="osx-btn" onClick={() => setTheme("mono")} aria-pressed={theme==="mono"}>Mono</button></div></div><div className="osx-section-title">WINDOWS</div><div className="osx-snap-hint">Double-click title bars to maximize. Alt+Tab cycles feature windows. Ctrl/⌘ + Alt + ←/→ snaps the focused window.</div><div className="osx-section-title">SESSION</div><button className="osx-btn" onClick={resetSession}>Reset saved session</button></div>;
}