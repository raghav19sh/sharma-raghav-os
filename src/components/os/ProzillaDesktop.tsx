"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  Activity, ArrowLeft, ArrowUp, BookOpen, Code2, FileImage, FileText, Folder,
  FolderOpen, Gamepad2, HardDrive, Home, Image as ImageIcon, Info, LayoutGrid,
  Lock, Maximize2, Minus, Monitor, Music2, Palette, Play, Search, Settings,
  Shield, Terminal, User, Volume2, VolumeX, X, Zap, ChevronDown
} from "lucide-react";
import type { StatusSnapshot } from "@/lib/data/status";

type AppId =
  | "about" | "research" | "projects" | "security" | "journal" | "knowledge" | "learning"
  | "media" | "system" | "games" | "terminal" | "music" | "files" | "settings"
  | "document" | "image-viewer" | "minesweeper" | "wordle" | "ballmaze" | "logicsim"
  | "now" | "timeline" | "reading-room" | "observatory" | "developer-workspace"
  | "changelog" | "soc" | "public-api" | "learning-hub" | "docs" | "privacy"
  | "engineering" | "security-lab";

type Win = { id: AppId; minimized: boolean; maximized: boolean; offset: number };
type VFile = { name: string; kind: "folder" | "document" | "image" | "audio" | "app"; description: string; app?: AppId; src?: string };

const C = { deep:"#12070A", bg:"#1B090E", bg2:"#2A0D14", wine:"#5B1020", burg:"#8F2638", light:"#B54A60", cream:"#F8EFEC", muted:"#BDA9AE", green:"#74D69A", amber:"#E8B86D" };

const ICONS: Partial<Record<AppId,string>> = {
  files:"/os/icons/file-explorer.svg", settings:"/os/icons/settings.svg", terminal:"/os/icons/terminal.svg",
  music:"/os/icons/media-viewer.svg", document:"/os/icons/text-editor.svg", "image-viewer":"/os/icons/media-viewer.svg",
  minesweeper:"/os/icons/minesweeper.svg", wordle:"/os/icons/wordle.svg", ballmaze:"/os/icons/ball-maze.svg", logicsim:"/os/icons/logic-sim.svg"
};

const APPS: {id:AppId;label:string;category:string}[] = [
  {id:"files",label:"Files",category:"System"},{id:"about",label:"About",category:"Portfolio"},
  {id:"research",label:"Research",category:"Portfolio"},{id:"projects",label:"Projects",category:"Portfolio"},
  {id:"security",label:"Security Lab",category:"Security"},{id:"journal",label:"Journal",category:"Portfolio"},
  {id:"knowledge",label:"Knowledge",category:"Portfolio"},{id:"learning",label:"Learning",category:"Portfolio"},
  {id:"media",label:"Media",category:"Media"},{id:"games",label:"Games",category:"Games"},
  {id:"settings",label:"Settings",category:"System"},{id:"terminal",label:"Terminal",category:"System"}
];

const TITLES: Record<AppId,string> = {
  about:"About",research:"Research",projects:"Projects",security:"Security Lab",journal:"Journal",
  knowledge:"Knowledge",learning:"Learning",media:"Media",system:"System",games:"Games",terminal:"Terminal",
  music:"Music Player",files:"Files",settings:"Settings",document:"Document Viewer","image-viewer":"Image Viewer",
  minesweeper:"Minesweeper",wordle:"Wordle",ballmaze:"Ball Maze",logicsim:"Logic Simulator",
  now:"Now",timeline:"Timeline","reading-room":"Reading Room",observatory:"Observatory",
  "developer-workspace":"Developer Workspace",changelog:"Changelog",soc:"SOC Console","public-api":"Public API",
  "learning-hub":"Learning Hub",docs:"Documentation",privacy:"Privacy",engineering:"Engineering","security-lab":"Browser Security Tools"
};

const FILES: Record<string,VFile[]> = {
  "~":[
    {name:"Desktop",kind:"folder",description:"Applications and shortcuts"},
    {name:"Documents",kind:"folder",description:"Research and notes"},
    {name:"Pictures",kind:"folder",description:"Wallpapers and visual assets"},
    {name:"Music",kind:"folder",description:"Local audio"},
    {name:"System",kind:"folder",description:"Settings and system information"}
  ],
  "~/Desktop": APPS.map(function(a){ return {name:a.label,kind:"app",description:a.category,app:a.id}; }),
  "~/Documents":[
    {name:"about.md",kind:"document",description:"Profile and principles",app:"document"},
    {name:"research.md",kind:"document",description:"Research archive",app:"document"},
    {name:"projects.md",kind:"document",description:"Engineering projects",app:"document"},
    {name:"security-lab.md",kind:"document",description:"Security lab notes",app:"document"},
    {name:"architecture.md",kind:"document",description:"OS architecture notes",app:"document"}
  ],
  "~/Pictures":[
    {name:"burgundy-wallpaper.svg",kind:"image",description:"Local OS wallpaper",app:"image-viewer",src:"/os/wallpaper.svg"},
    {name:"file-explorer.svg",kind:"image",description:"Files application icon",app:"image-viewer",src:"/os/icons/file-explorer.svg"},
    {name:"settings.svg",kind:"image",description:"Settings application icon",app:"image-viewer",src:"/os/icons/settings.svg"}
  ],
  "~/Music":[
    {name:"soundtrack.mp3",kind:"audio",description:"Local soundtrack",app:"music"},
    {name:"Für Elise.mp3",kind:"audio",description:"Local piano track",app:"music"},
    {name:"rain-ambient.mp3",kind:"audio",description:"Local ambient track",app:"music"}
  ],
  "~/System":[
    {name:"settings.app",kind:"app",description:"Appearance and accessibility",app:"settings"},
    {name:"privacy.md",kind:"document",description:"Privacy information",app:"privacy"},
    {name:"system.md",kind:"document",description:"System information",app:"system"}
  ]
};

const DOCS: Record<string,string[]> = {
  "about.md":["# About Raghav Sharma","Cybersecurity & Forensics","Security engineering, VAPT, SOC/detection work and practical labs.","Education","BTech in Computer Science Engineering — Cyber Security & Forensics.","Principles","Build. Verify. Document. Improve.","Contact","contact@sharma-raghav.com"],
  "research.md":["# Research Archive","Threat research","Investigations, security notes, experiments and technical references.","Reading Room","Papers, books and references worth revisiting.","Observatory","Security observations and experiment logs."],
  "projects.md":["# Engineering Projects","Voice Command Operator","Voice-driven desktop experiment.","Web Scraper","Data collection and parsing tooling.","SOC Detection Lab","Wazuh, Sysmon and detection engineering workspace."],
  "security-lab.md":["# Security Lab","VAPT","Web and network security testing methodology.","SOC","Alert triage, log analysis and MITRE ATT&CK mapping.","Secure Engineering","Authentication, authorization, secrets and defensive controls."],
  "architecture.md":["# Raghav Sharma OS","Runtime","Next.js 15, React 19 and TypeScript.","Data","Existing Supabase authentication and database-backed content remain the source of truth.","Desktop","Internal apps, dedicated viewers and local games."]
};

export default function ProzillaDesktop({status}:{status:StatusSnapshot}) {
  const [boot,setBoot] = useState(true);
  const [windows,setWindows] = useState<Win[]>([]);
  const [active,setActive] = useState<AppId|null>(null);
  const [searchOpen,setSearchOpen] = useState(false);
  const [query,setQuery] = useState("");
  const [clock,setClock] = useState(new Date());
  const [reduced,setReduced] = useState(false);

  useEffect(function(){
    const a=window.setTimeout(function(){setBoot(false)},1500);
    const b=window.setInterval(function(){setClock(new Date())},1000);
    setReduced(localStorage.getItem("rsos-reduced-motion")==="1");
    return function(){window.clearTimeout(a);window.clearInterval(b)};
  },[]);

  const launch=function(id:AppId){
    setWindows(function(current){
      if(current.some(function(w){return w.id===id})){
        return current.map(function(w){return w.id===id?{...w,minimized:false}:w});
      }
      return current.concat({id:id,minimized:false,maximized:false,offset:current.length%6});
    });
    setActive(id);
  };
  const close=function(id:AppId){setWindows(function(v){return v.filter(function(w){return w.id!==id})});setActive(function(v){return v===id?null:v})};
  const minimize=function(id:AppId){setWindows(function(v){return v.map(function(w){return w.id===id?{...w,minimized:true}:w})});setActive(function(v){return v===id?null:v})};
  const maximize=function(id:AppId){setWindows(function(v){return v.map(function(w){return w.id===id?{...w,maximized:!w.maximized,minimized:false}: {...w,maximized:false}})});setActive(id)};

  const results=useMemo(function(){
    const q=query.trim().toLowerCase();
    return q?APPS.filter(function(a){return a.label.toLowerCase().includes(q)||a.category.toLowerCase().includes(q)}):APPS;
  },[query]);

  if(boot) return <BootScreen onSkip={function(){setBoot(false)}}/>;

  return <div style={os}>
    <img src="/os/wallpaper.svg" alt="" style={wallpaper} />
    <div style={shade} />
    <header style={topbar}>
      <button onClick={function(){launch("system")}} style={brand}><span style={mark}>RS</span><span>RAGHAV SHARMA OS</span></button>
      <span style={path}>/home/raghav · personal workstation</span>
      <span style={{color:status.database==="ok"?C.green:C.amber}}>● {status.database==="ok"?"DATABASE ONLINE":"DATABASE DEGRADED"}</span>
      <span style={{opacity:.7}}>{clock.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>
      <button onClick={function(){setSearchOpen(function(v){return !v})}} style={topBtn} aria-label="Search"><Search size={16}/></button>
    </header>

    <main style={workspace}>
      <div style={desktopPath}><FolderOpen size={12}/> /home/raghav/Desktop</div>
      <div style={desktopGrid}>
        {APPS.map(function(app){
          return <button key={app.id} onDoubleClick={function(){launch(app.id)}} onClick={function(){setActive(app.id)}} style={desktopIcon}>
            <span style={desktopIconFrame}>{ICONS[app.id]?<img src={ICONS[app.id]} alt="" style={iconImg}/>:<Fallback id={app.id}/>}</span>
            <span>{app.label}</span>
          </button>
        })}
      </div>
      <div style={welcome}><div style={eyebrow}>SECURE PERSONAL WORKSTATION</div><h1 style={welcomeTitle}>Raghav Sharma <span>OS</span></h1><p style={welcomeText}>CYBERSECURITY · RESEARCH · ENGINEERING · SYSTEMS</p></div>

      {searchOpen && <div style={searchPanel}>
        <div style={searchWrap}><Search size={15}/><input autoFocus value={query} onChange={function(e){setQuery(e.target.value)}} placeholder="Search applications..." style={searchInput}/></div>
        <div style={searchLabel}>APPLICATIONS</div>
        {results.map(function(app){return <button key={app.id} onClick={function(){launch(app.id);setSearchOpen(false)}} style={searchResult}>{ICONS[app.id]?<img src={ICONS[app.id]} alt="" style={{width:25,height:25}}/>:<Fallback id={app.id}/>}<span>{app.label}</span><small style={{marginLeft:"auto",opacity:.4}}>{app.category}</small></button>})}
      </div>}

      {windows.filter(function(w){return !w.minimized}).map(function(w){
        return <Window state={w} key={w.id} active={active===w.id} reduced={reduced}
          onFocus={function(){setActive(w.id)}} onClose={function(){close(w.id)}} onMinimize={function(){minimize(w.id)}} onMaximize={function(){maximize(w.id)}} onOpen={launch}/>;
      })}
    </main>

    <nav style={dock} aria-label="OS dock">
      <DockItem title="Files" active={active==="files"} onClick={function(){launch("files")}}><img src={ICONS.files} alt="" style={dockImg}/></DockItem>
      <DockItem title="Terminal" active={active==="terminal"} onClick={function(){launch("terminal")}}><img src={ICONS.terminal} alt="" style={dockImg}/></DockItem>
      <DockItem title="Music" active={active==="music"} onClick={function(){launch("music")}}><img src={ICONS.music} alt="" style={dockImg}/></DockItem>
      <DockItem title="Games" active={active==="games"} onClick={function(){launch("games")}}><img src={ICONS.minesweeper} alt="" style={dockImg}/></DockItem>
      <DockItem title="Settings" active={active==="settings"} onClick={function(){launch("settings")}}><img src={ICONS.settings} alt="" style={dockImg}/></DockItem>
      <DockItem title="Search" active={searchOpen} onClick={function(){setSearchOpen(function(v){return !v})}}><Search size={18}/></DockItem>
    </nav>
    <div style={statusBar}><span>RSOS 2.2 · BURGUNDY EDITION</span><span>{windows.filter(function(w){return !w.minimized}).length} active windows</span></div>
  </div>;
}

function Fallback({id}:{id:AppId}) {
  const I=id==="about"?User:id==="research"?BookOpen:id==="projects"?Code2:id==="security"?Shield:id==="games"?Gamepad2:id==="settings"?Settings:id==="learning"?Zap:id==="media"?ImageIcon:id==="journal"?FileText:Folder;
  return <I size={29}/>;
}

function DockItem({title,active,onClick,children}:{title:string;active:boolean;onClick:()=>void;children:ReactNode}) {
  return <button title={title} aria-label={title} onClick={onClick} style={{...dockBtn,...(active?dockActive:{})}}>{children}{active&&<i style={dockDot}/>}</button>;
}

function Window({state,active,reduced,onFocus,onClose,onMinimize,onMaximize,onOpen}:{state:Win;active:boolean;reduced:boolean;onFocus:()=>void;onClose:()=>void;onMinimize:()=>void;onMaximize:()=>void;onOpen:(id:AppId)=>void}) {
  const style:CSSProperties=state.maximized?{...win,left:10,top:54,width:"calc(100% - 20px)",height:"calc(100% - 105px)",zIndex:80}:{...win,left:"calc(5% + "+String(state.offset*25)+"px)",top:"calc(8% + "+String(state.offset*18)+"px)",width:"min(940px,88vw)",height:"min(680px,76vh)",zIndex:active?80:70};
  return <section onMouseDown={onFocus} style={style} aria-label={TITLES[state.id]}>
    <div style={winBar}><div style={winTitle}>{ICONS[state.id]?<img src={ICONS[state.id]} alt="" style={{width:22,height:22}}/>:<span style={glyph}>{state.id.slice(0,2).toUpperCase()}</span>}<strong>{TITLES[state.id]}</strong><small>RAGHAV OS</small></div><div>{[
      ["Minimize",Minus,onMinimize],["Maximize",Maximize2,onMaximize],["Close",X,onClose]
    ].map(function(item){const label=item[0] as string;const Icon=item[1] as typeof X;const action=item[2] as ()=>void;return <button key={label} aria-label={label} onClick={function(e){e.stopPropagation();action()}} style={winControl}><Icon size={14}/></button>})}</div></div>
    <div style={{...winBody,scrollBehavior:reduced?"auto":"smooth"}}>
      {state.id==="files"?<FilesApp onOpen={onOpen}/>:
       state.id==="settings"?<SettingsApp reduced={reduced}/>:
       state.id==="document"?<DocumentApp onOpen={onOpen}/>:
       state.id==="image-viewer"?<ImageApp/>:
       state.id==="terminal"?<TerminalApp onOpen={onOpen}/>:
       state.id==="music"?<MusicApp/>:
       state.id==="games"?<GamesApp onOpen={onOpen}/>:
       state.id==="minesweeper"?<Minesweeper/>:
       state.id==="wordle"?<Wordle/>:
       state.id==="ballmaze"?<BallMaze/>:
       state.id==="logicsim"?<LogicSim/>:
       <PortfolioApp id={state.id}/>}
    </div>
  </section>;
}

function FilesApp({onOpen}:{onOpen:(id:AppId)=>void}) {
  const [path,setPath]=useState("~/Desktop"); const [selected,setSelected]=useState("");
  const items=FILES[path]??FILES["~"]!;
  const parent=path==="~"?"~":path.slice(0,path.lastIndexOf("/"))||"~";
  const open=function(f:VFile){
    if(f.kind==="folder"){const next="~/"+f.name;if(FILES[next])setPath(next);return}
    if(f.app)onOpen(f.app);
  };
  return <div style={filesApp}>
    <div style={fileToolbar}>
      <Toolbar title="Back" disabled={path==="~"} onClick={function(){setPath(parent)}}><ArrowLeft size={15}/></Toolbar>
      <Toolbar title="Home" onClick={function(){setPath("~")}}><Home size={15}/></Toolbar>
      <Toolbar title="Up" disabled={path==="~"} onClick={function(){setPath(parent)}}><ArrowUp size={15}/></Toolbar>
      <div style={pathBox}>{path}</div>
      <Toolbar title="Search" onClick={function(){setSelected("")}}><Search size={15}/></Toolbar>
    </div>
    <div style={fileLayout}>
      <aside style={fileSide}><div style={sideLabel}>PLACES</div>{[
        ["Home","~",Home],["Desktop","~/Desktop",Monitor],["Documents","~/Documents",FileText],["Pictures","~/Pictures",ImageIcon],["Music","~/Music",Music2],["System","~/System",Settings]
      ].map(function(row){const name=row[0] as string;const route=row[1] as string;const I=row[2] as typeof Home;return <button key={route} onClick={function(){setPath(route)}} style={{...sideBtn,...(route===path?sideActive:{})}}><I size={15}/>{name}</button>})}<div style={storage}><HardDrive size={14}/><span>Local storage</span><b>42% used</b><div style={storageBar}><i/></div></div></aside>
      <div style={fileMain}><div style={fileMeta}><span>{items.length} items</span><span>{selected?"Selected: "+selected:"Virtual portfolio filesystem"}</span></div><div style={fileGrid}>{items.map(function(f){return <button key={f.name} onClick={function(){setSelected(f.name)}} onDoubleClick={function(){open(f)}} style={{...fileCard,...(selected===f.name?fileSelected:{})}}><FileVisual f={f}/><strong>{f.name}</strong><small>{f.description}</small></button>})}</div></div>
    </div>
  </div>;
}

function Toolbar({title,disabled,onClick,children}:{title:string;disabled?:boolean;onClick:()=>void;children:ReactNode}) { return <button title={title} aria-label={title} disabled={disabled} onClick={onClick} style={{...toolBtn,opacity:disabled?.25:.8}}>{children}</button>; }

function FileVisual({f}:{f:VFile}) {
  if(f.kind==="folder")return <div style={{...fileVisual,background:"rgba(232,184,109,.15)",color:C.amber}}><FolderOpen size={31}/></div>;
  if(f.kind==="image")return <div style={{...fileVisual,background:"rgba(181,74,96,.15)",color:C.light}}><FileImage size={31}/></div>;
  if(f.kind==="audio")return <div style={{...fileVisual,background:"rgba(116,214,154,.12)",color:C.green}}><Music2 size={30}/></div>;
  if(f.kind==="app"&&f.app&&ICONS[f.app])return <div style={{...fileVisual,background:"rgba(181,74,96,.15)"}}><img src={ICONS[f.app]} alt="" style={{width:42,height:42}}/></div>;
  return <div style={{...fileVisual,background:"rgba(181,74,96,.10)",color:C.light}}><FileText size={31}/></div>;
}

function SettingsApp({reduced}:{reduced:boolean}) {
  const [tab,setTab]=useState("Appearance");
  const nav=[["Appearance",Palette],["Desktop",Monitor],["Apps",LayoutGrid],["About",Info]];
  return <div style={settingsApp}><aside style={settingsSide}>{nav.map(function(row){const label=row[0] as string;const I=row[1] as typeof Palette;return <button key={label} onClick={function(){setTab(label)}} style={{...settingsBtn,...(tab===label?settingsActive:{})}}><I size={17}/>{label}</button>})}</aside><section style={settingsContent}><div style={crumb}>Settings <ChevronDown size={12}/> {tab}</div>
    {tab==="Appearance"&&<><h2>Appearance</h2><p style={muted}>Burgundy is the system theme.</p><div style={option}><b>Theme</b><div style={themePreview}><strong>Deep Burgundy</strong><span>#12070A · #8F2638 · #A52A3A</span></div></div><div style={option}><b>Wallpaper</b><div style={wallPreview}><img src="/os/wallpaper.svg" alt="Burgundy cyber wallpaper"/></div></div></>}
    {tab==="Desktop"&&<><h2>Desktop</h2><p style={muted}>Window and accessibility preferences.</p><button onClick={function(){localStorage.setItem("rsos-reduced-motion",reduced?"0":"1");window.location.reload()}} style={settingRow}><span>Reduced motion</span><span style={{...toggle,background:reduced?C.burg:"#421723"}}><i style={{left:reduced?20:3}}/></span></button><div style={settingChips}><span>Multi-window</span><span>Focus on click</span><span>Dock apps</span></div></>}
    {tab==="Apps"&&<><h2>Applications</h2><p style={muted}>Installed local applications.</p><div style={installed}>{APPS.map(function(app){return <div key={app.id} style={installedCard}>{ICONS[app.id]?<img src={ICONS[app.id]} alt="" style={{width:34,height:34}}/>:<Fallback id={app.id}/>}<strong>{app.label}</strong><small>{app.category}</small></div>})}</div></>}
    {tab==="About"&&<><h2>Raghav Sharma OS</h2><p style={muted}>Personal cybersecurity workstation built around the existing portfolio backend.</p><div style={aboutBox}><b>Version</b><span>2.2 Burgundy Edition</span><b>Runtime</b><span>Next.js 15 · React 19</span><b>Session</b><span style={{color:C.green}}>Visitor ready</span></div></>}
  </section></div>;
}

function DocumentApp({onOpen}:{onOpen:(id:AppId)=>void}) {
  const docs=["about.md","research.md","projects.md","security-lab.md","architecture.md"]; const [doc,setDoc]=useState(docs[0]);
  const lines=DOCS[doc]??DOCS["about.md"]!;
  return <div style={docApp}><div style={docToolbar}>{docs.slice(0,4).map(function(d){return <button key={d} onClick={function(){setDoc(d)}} style={tab(d===doc)}>{d}</button>})}<button onClick={function(){onOpen("files")}} style={docOpen}><Folder size={13}/> Open Files</button></div><article style={article}><small>~/Documents/{doc}</small>{lines.map(function(line,i){return i===0?<h1 key={line}>{line.replace("# ","")}</h1>:i%2===1?<h3 key={line}>{line}</h3>:<p key={line}>{line}</p>})}</article></div>;
}

function ImageApp() {
  const [src,setSrc]=useState("/os/wallpaper.svg"); const [zoom,setZoom]=useState(1);
  return <div style={imageApp}><div style={imageTools}><button onClick={function(){setZoom(function(v){return Math.max(.5,v-.1)})}} style={miniBtn}>−</button><span>{Math.round(zoom*100)}%</span><button onClick={function(){setZoom(function(v){return Math.min(2,v+.1)})}} style={miniBtn}>+</button><select value={src} onChange={function(e){setSrc(e.target.value);setZoom(1)}} style={select}><option value="/os/wallpaper.svg">Burgundy Wallpaper</option><option value="/os/icons/file-explorer.svg">Files Icon</option><option value="/os/icons/settings.svg">Settings Icon</option></select></div><div style={imageCanvas}><img src={src} alt="Local OS visual" style={{width:String(zoom*100)+"%",height:String(zoom*100)+"%",objectFit:"contain",maxWidth:"100%",maxHeight:"100%"}}/></div></div>;
}

function TerminalApp({onOpen}:{onOpen:(id:AppId)=>void}) {
  const [input,setInput]=useState(""); const [lines,setLines]=useState(["RAGHAV SHARMA OS terminal","Type 'help' for commands."]);
  const execute=function(){const c=input.trim().toLowerCase();const map:Record<string,AppId>={files:"files",about:"about",research:"research",projects:"projects",security:"security",games:"games",music:"music",settings:"settings",knowledge:"knowledge",learning:"learning",journal:"journal",media:"media"};if(!c)return;if(c==="clear"){setLines([])}else if(c==="help"){setLines(function(v){return v.concat("$ help","files about research projects security games music settings knowledge learning journal media clear")})}else if(map[c]){onOpen(map[c]);setLines(function(v){return v.concat("$ "+input,"Opening application...")})}else{setLines(function(v){return v.concat("$ "+input,"command not found")})}setInput("")};
  return <div style={terminal}><div style={termHead}><span>● local-shell</span><span>internal application launcher</span></div><div style={termOut}>{lines.map(function(x,i){return <div key={i}>{x}</div>})}</div><div style={termIn}><span>raghav@os:~$</span><input autoFocus value={input} onChange={function(e){setInput(e.target.value)}} onKeyDown={function(e){if(e.key==="Enter")execute()}}/></div></div>;
}

function MusicApp() {
  const tracks=[{title:"Soundtrack",src:"/music/soundtrack.mp3"},{title:"Für Elise",src:"/music/Fu╠êr Elise.mp3"},{title:"Rain Ambient",src:"/music/rain-ambient.mp3"}] as const;
  const audio=useRef<HTMLAudioElement>(null); const [track,setTrack]=useState(0); const [mutedAudio,setMutedAudio]=useState(false); const current=tracks[track]??tracks[0];
  return <div style={music}><div style={disc}><Music2 size={42}/></div><h2>{current.title}</h2><p style={muted}>Local audio · no external streaming</p><audio ref={audio} controls muted={mutedAudio} src={current.src} onEnded={function(){setTrack(function(v){return (v+1)%tracks.length})}} style={{width:"min(520px,100%)",margin:"18px 0"}}/><div style={musicBtns}><button onClick={function(){setTrack(function(v){return (v+tracks.length-1)%tracks.length})}} style={circle}>‹</button><button onClick={function(){audio.current?.play()}} style={{...circle,background:C.burg}}><Play size={15}/></button><button onClick={function(){audio.current?.pause()}} style={circle}>Ⅱ</button><button onClick={function(){setMutedAudio(function(v){return !v})}} style={circle}>{mutedAudio?<VolumeX size={16}/>:<Volume2 size={16}/>}</button><button onClick={function(){setTrack(function(v){return (v+1)%tracks.length})}} style={circle}>›</button></div></div>;
}

function GamesApp({onOpen}:{onOpen:(id:AppId)=>void}) {
  const games:[AppId,string,string][]=[["minesweeper","Minesweeper",ICONS.minesweeper!],["wordle","Wordle",ICONS.wordle!],["ballmaze","Ball Maze",ICONS.ballmaze!],["logicsim","Logic Simulator",ICONS.logicsim!]];
  return <div style={{padding:22}}><div style={appIntro}><Gamepad2 size={22}/><div><h2>Games</h2><span>Local apps · no external redirects</span></div></div><div style={gameGrid}>{games.map(function(g){return <button key={g[0]} onClick={function(){onOpen(g[0])}} style={gameCard}><img src={g[2]} alt="" style={{width:72,height:72}}/><strong>{g[1]}</strong><small>OPEN WINDOW →</small></button>})}</div></div>;
}

function PortfolioApp({id}:{id:AppId}) {
  const data:Record<string,{ey:string;title:string;text:string;items:string[]}>={
    about:{ey:"PROFILE",title:"Raghav Sharma",text:"Cybersecurity, research and engineering work presented as a personal operating system.",items:["Cybersecurity & Forensics","VAPT and security engineering","Research and technical writing","Build · Verify · Document"]},
    research:{ey:"RESEARCH OS",title:"Research Archive",text:"Investigations, references, experiments and security research.",items:["Threat research","Reading room","Observatory","Research notes"]},
    projects:{ey:"PROJECTS OS",title:"Engineering Projects",text:"Projects organized as case files.",items:["Voice Command Operator","Web Scraper","SOC Detection Lab","Developer Workspace"]},
    security:{ey:"SECURITY",title:"Security Lab",text:"Hands-on defensive and application-security work.",items:["VAPT","SOC / detection","Network analysis","Secure application design"]},
    journal:{ey:"JOURNAL",title:"Journal OS",text:"Working logs, reflections and lessons learned.",items:["Daily notes","Technical reflections","Research diary","Lessons learned"]},
    knowledge:{ey:"KNOWLEDGE",title:"Knowledge Base",text:"Articles, documentation and technical notes.",items:["Cybersecurity concepts","Engineering notes","Case studies","References"]},
    learning:{ey:"LEARNING",title:"Learning OS",text:"Study, practice and building.",items:["Cybersecurity","Networking","Programming","Languages"]},
    media:{ey:"MEDIA",title:"Media Library",text:"Local media and visual resources.",items:["Local audio","Wallpapers","Application icons","Project media"]},
    system:{ey:"SYSTEM",title:"System Information",text:"Raghav Sharma OS overview.",items:["Next.js 15","React 19","Supabase + PostgreSQL","Vercel deployment"]},
    now:{ey:"CURRENT",title:"Now",text:"Current workstation focus.",items:["Security tooling","OS engineering","Cybersecurity projects","Continuous learning"]},
    timeline:{ey:"TIMELINE",title:"Timeline",text:"Milestones and experiments.",items:["Portfolio OS evolution","Security projects","Engineering experiments","Research"]},
    "reading-room":{ey:"REFERENCE",title:"Reading Room",text:"Papers, books and references.",items:["Research papers","Security references","Technical books","Saved notes"]},
    observatory:{ey:"OBSERVATORY",title:"Research Observatory",text:"Security observations and experiment logs.",items:["Signals","Observations","Experiment logs","Emerging techniques"]},
    "developer-workspace":{ey:"WORKSPACE",title:"Developer Workspace",text:"Software and infrastructure behind the OS.",items:["Next.js","TypeScript","Supabase","Vercel"]},
    changelog:{ey:"CHANGELOG",title:"System History",text:"Important workstation changes.",items:["Desktop rebuild","Internal apps","Security hardening","Reliability"]},
    soc:{ey:"SOC",title:"Detection Console",text:"Alert triage and investigation practice.",items:["Alert triage","MITRE ATT&CK","Log analysis","Incident notes"]},
    "public-api":{ey:"API",title:"Public API",text:"Read-only public portfolio endpoints.",items:["JSON responses","Public data","Auth boundaries","Rate-limit aware"]},
    "learning-hub":{ey:"HUB",title:"Learning Hub",text:"Study, practice, build and document.",items:["Study","Practice","Build","Document"]},
    docs:{ey:"DOCS",title:"Documentation",text:"Architecture and operating notes.",items:["Architecture","Usage","Security model","Deployment"]},
    privacy:{ey:"PRIVACY",title:"Privacy",text:"Visitor-side privacy information.",items:["Preferences stay in the browser","Security tools run locally","Admin remains protected","No external games"]},
    engineering:{ey:"ENGINEERING",title:"Engineering Case Files",text:"Practical software and security projects.",items:["Voice Command Operator","Web Scraper","SOC Detection Lab","Security tooling"]},
    "security-lab":{ey:"LAB",title:"Browser Security Tools",text:"Interactive local utilities.",items:["Encoding helpers","Hash playground","Security notes","Local-only tooling"]}
  };
  const d=data[id]??data.about;
  return <div style={portfolio}><div style={portfolioHero}><div style={bigBadge}>{ICONS[id]?<img src={ICONS[id]} alt="" style={{width:43,height:43}}/>:<Fallback id={id}/>}</div><div><div style={eyebrow}>{d.ey}</div><h1 style={pageTitle}>{d.title}</h1></div></div><p style={pageText}>{d.text}</p><div style={portfolioGrid}>{d.items.map(function(x,i){return <div key={x} style={portfolioCard}><span>0{i+1}</span><strong>{x}</strong></div>})}</div></div>;
}

function Minesweeper(){const n=9,m=12;const make=function(){const b=Array.from({length:n*n},function(){return{mine:false,open:false,flag:false}});let k=0;while(k<m){const i=Math.floor(Math.random()*b.length);if(b[i]&&!b[i].mine){b[i].mine=true;k++}}return b};const [board,setBoard]=useState(make);const [lost,setLost]=useState(false);const [won,setWon]=useState(false);const around=function(i:number){const r=Math.floor(i/n),c=i%n,a:number[]=[];for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){const R=r+y,Cc=c+x;if((x||y)&&R>=0&&R<n&&Cc>=0&&Cc<n)a.push(R*n+Cc)}return a};const reveal=function(i:number){const selected=board[i];if(!selected||lost||won||selected.open||selected.flag)return;const next=board.map(function(v){return{...v}});if(next[i]!.mine){setBoard(next.map(function(v){return v.mine?{...v,open:true}:v}));setLost(true);return}const q=[i],seen=new Set<number>();while(q.length){const x=q.shift()!;if(seen.has(x))continue;const cell=next[x];if(!cell||cell.mine||cell.flag)continue;seen.add(x);cell.open=true;const a=around(x);if(a.every(function(y){return !next[y]?.mine}))a.forEach(function(y){q.push(y)})}setBoard(next);if(next.every(function(v){return v.mine||v.open}))setWon(true)};return <GameShell title="Minesweeper" reset={function(){setBoard(make());setLost(false);setWon(false)}}><div style={{display:"grid",gridTemplateColumns:"repeat(9,37px)",gap:3,width:"max-content"}}>{board.map(function(v,i){const num=around(i).filter(function(x){return board[x]?.mine}).length;return <button key={i} onClick={function(){reveal(i)}} onContextMenu={function(e){e.preventDefault();if(!v.open)setBoard(function(cur){return cur.map(function(c,j){return j===i?{...c,flag:!c.flag}:c})})}} style={{width:37,height:37,border:0,borderRadius:5,background:v.open?"#3A151E":"#60202E",color:v.mine?"#E8B86D":C.cream,fontWeight:800}}>{v.open?(v.mine?"✹":num||""):v.flag?"⚑":""}</button>})}</div><p style={gameHint}>{lost?"Mine triggered.":won?"Board cleared — you win.":"Left click reveal · right click flag"}</p></GameShell>}

function Wordle(){const words=["CRANE","SHARE","LIGHT","MOUSE","PLANT","WORLD","TRUST","STACK","BRAVE","ROVER"];const random=function(){return words[Math.floor(Math.random()*words.length)]??"CRANE"};const [target,setTarget]=useState(random);const [guess,setGuess]=useState("");const [rows,setRows]=useState<string[]>([]);const submit=function(){const g=guess.toUpperCase();if(g.length===5&&rows.length<6){setRows(function(v){return v.concat(g)});setGuess("")}};return <GameShell title="Wordle" reset={function(){setTarget(random());setGuess("");setRows([])}}><div style={{display:"grid",gap:5,width:"max-content"}}>{Array.from({length:6},function(_,r){return <div key={r} style={{display:"grid",gridTemplateColumns:"repeat(5,44px)",gap:5}}>{Array.from({length:5},function(_,c){const l=rows[r]?.[c]??"";const bg=!l?"#2A0D14":l===target[c]?"#6E1626":target.includes(l)?"#846529":"#43212A";return <div key={c} style={{width:44,height:44,display:"grid",placeItems:"center",borderRadius:5,background:bg,fontWeight:800}}>{l}</div>})}</div>})}</div><div style={{display:"flex",gap:8,marginTop:14}}><input maxLength={5} value={guess} onChange={function(e){setGuess(e.target.value.replace(/[^a-z]/gi,""))}} onKeyDown={function(e){if(e.key==="Enter")submit()}} style={gameInput}/><button onClick={submit} style={gameGo}>GO</button></div><p style={gameHint}>{rows.includes(target)?"Solved.":rows.length>=6?"Word: "+target:"Five letters · Enter to submit"}</p></GameShell>}

function BallMaze(){const walls=new Set(["1,0","1,1","3,1","3,2","0,3","2,3","4,3"]);const [p,setP]=useState({x:0,y:0});useEffect(function(){const h=function(e:KeyboardEvent){let dx=0,dy=0;if(e.key==="ArrowUp")dy=-1;if(e.key==="ArrowDown")dy=1;if(e.key==="ArrowLeft")dx=-1;if(e.key==="ArrowRight")dx=1;if(!dx&&!dy)return;setP(function(v){const x=Math.max(0,Math.min(4,v.x+dx)),y=Math.max(0,Math.min(4,v.y+dy));return walls.has(String(x)+","+String(y))?v:{x,y}})};window.addEventListener("keydown",h);return function(){window.removeEventListener("keydown",h)}},[]);return <GameShell title="Ball Maze" reset={function(){setP({x:0,y:0})}}><div style={{display:"grid",gridTemplateColumns:"repeat(5,52px)",gap:4,width:"max-content"}}>{Array.from({length:25},function(_,i){const x=i%5,y=Math.floor(i/5),wall=walls.has(String(x)+","+String(y));return <div key={i} style={{width:52,height:52,display:"grid",placeItems:"center",borderRadius:7,background:wall?"#3A101A":"#1B090E",border:"1px solid rgba(255,255,255,.08)"}}>{p.x===x&&p.y===y?"●":x===4&&y===4?"◎":""}</div>})}</div><p style={gameHint}>{p.x===4&&p.y===4?"Maze complete.":"Use arrow keys to reach ◎."}</p></GameShell>}

function LogicSim(){const [a,setA]=useState(false),[b,setB]=useState(false),[g,setG]=useState("AND");const out=g==="AND"?a&&b:g==="OR"?a||b:g==="XOR"?a!==b:!a;return <GameShell title="Logic Simulator" reset={function(){setA(false);setB(false);setG("AND")}}><div style={{display:"flex",gap:9,flexWrap:"wrap"}}><button onClick={function(){setA(function(v){return !v})}} style={logicBtn(a)}>INPUT A: {a?1:0}</button><button disabled={g==="NOT"} onClick={function(){setB(function(v){return !v})}} style={logicBtn(b)}>INPUT B: {b?1:0}</button><select value={g} onChange={function(e){setG(e.target.value)}} style={selectStyle}><option>AND</option><option>OR</option><option>XOR</option><option>NOT</option></select></div><div style={logicOut}><div style={logicEq}><span>{a?1:0}</span><b>{g}</b><span>{g==="NOT"?"—":b?1:0}</span></div><div style={{opacity:.4,fontSize:10,marginTop:9}}>OUTPUT</div><strong style={{fontSize:36,color:out?C.green:C.amber}}>{out?1:0}</strong></div></GameShell>}

function GameShell({title,children,reset}:{title:string;children:ReactNode;reset:()=>void}){const icon=title==="Minesweeper"?ICONS.minesweeper:title==="Wordle"?ICONS.wordle:title==="Ball Maze"?ICONS.ballmaze:ICONS.logicsim;return <div style={gameShell}><div style={appIntro}>{icon&&<img src={icon} alt="" style={{width:36,height:36}}/>}<div><h2>{title}</h2><span>LOCAL GAME</span></div></div>{children}<button onClick={reset} style={newGame}>NEW GAME</button></div>}

function BootScreen({onSkip}:{onSkip:()=>void}){const [n,setN]=useState(0);const logs=["initializing kernel","mounting /home/raghav","loading local applications","starting security services","loading research modules","mounting local media","checking database","starting desktop","user session ready"];useEffect(function(){const t=window.setInterval(function(){setN(function(v){return Math.min(logs.length,v+1)})},140);return function(){window.clearInterval(t)}},[logs.length]);return <div style={boot}><div style={{width:"min(760px,100%)"}}><div style={{...mark,width:70,height:70,borderRadius:15,fontSize:19}}>RS</div><h1 style={{fontSize:"clamp(32px,5vw,60px)",margin:"18px 0 5px"}}>RAGHAV SHARMA OS</h1><div style={{opacity:.4,letterSpacing:".18em"}}>BURGUNDY PERSONAL WORKSTATION</div><div style={{marginTop:25}}>{logs.slice(0,n).map(function(x,i){return <div key={x} style={{margin:"5px 0",opacity:.75}}>[{String(i).padStart(2,"0")}] {x} <span style={{color:C.green}}>OK</span></div>})}</div><button onClick={onSkip} style={newGame}>SKIP BOOT</button></div></div>}

const os:CSSProperties={position:"fixed",inset:0,overflow:"hidden",background:C.deep,color:C.cream,fontFamily:"ui-sans-serif,system-ui,sans-serif"};
const wallpaper:CSSProperties={position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"};
const shade:CSSProperties={position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(18,7,10,.20),rgba(18,7,10,.48))"};
const topbar:CSSProperties={position:"relative",zIndex:90,height:48,display:"flex",alignItems:"center",gap:14,padding:"0 13px",background:"rgba(18,7,10,.87)",borderBottom:"1px solid rgba(242,190,200,.12)",backdropFilter:"blur(18px)",fontSize:11};
const brand:CSSProperties={display:"flex",alignItems:"center",gap:8,border:0,background:"transparent",color:"inherit",fontWeight:800,cursor:"pointer"};
const mark:CSSProperties={width:26,height:26,borderRadius:7,display:"grid",placeItems:"center",background:C.burg,color:"#fff",fontWeight:900,boxShadow:"0 0 28px rgba(165,42,58,.35)"};
const path:CSSProperties={flex:1,opacity:.38};
const topBtn:CSSProperties={width:30,height:30,border:0,borderRadius:7,background:"rgba(255,255,255,.06)",color:"inherit",display:"grid",placeItems:"center",cursor:"pointer"};
const workspace:CSSProperties={position:"relative",zIndex:5,height:"calc(100vh - 48px)"};
const desktopPath:CSSProperties={position:"absolute",top:15,left:18,display:"flex",alignItems:"center",gap:6,fontSize:10,opacity:.4};
const desktopGrid:CSSProperties={position:"absolute",left:15,top:46,width:245,display:"grid",gridTemplateColumns:"repeat(2,96px)",gap:9};
const desktopIcon:CSSProperties={width:92,minHeight:88,border:0,background:"transparent",color:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:6,borderRadius:12,cursor:"pointer",padding:6,textShadow:"0 2px 6px rgba(0,0,0,.5)"};
const desktopIconFrame:CSSProperties={width:57,height:57,borderRadius:15,display:"grid",placeItems:"center",background:"linear-gradient(145deg,rgba(255,255,255,.18),rgba(143,38,56,.30))",border:"1px solid rgba(255,215,223,.22)",boxShadow:"0 10px 25px rgba(0,0,0,.25)"};
const iconImg:CSSProperties={width:43,height:43,objectFit:"contain"};
const welcome:CSSProperties={position:"absolute",left:"28%",top:"27%",maxWidth:720,pointerEvents:"none"};
const eyebrow:CSSProperties={fontSize:10,letterSpacing:".22em",color:"#E0A0AC",fontWeight:800};
const welcomeTitle:CSSProperties={margin:"10px 0 0",fontSize:"clamp(48px,7vw,94px)",lineHeight:.9,letterSpacing:"-.06em",fontWeight:850};
const welcomeText:CSSProperties={marginTop:18,opacity:.45,fontSize:11,letterSpacing:".12em"};
const searchPanel:CSSProperties={position:"absolute",zIndex:100,top:12,right:15,width:"min(400px,calc(100vw - 28px))",padding:11,borderRadius:12,background:"rgba(27,9,14,.98)",border:"1px solid rgba(214,122,139,.22)",boxShadow:"0 28px 80px rgba(0,0,0,.55)"};
const searchWrap:CSSProperties={display:"flex",alignItems:"center",gap:8,padding:"9px 10px",background:"rgba(255,255,255,.05)",borderRadius:8};
const searchInput:CSSProperties={flex:1,border:0,outline:0,background:"transparent",color:"inherit",font:"inherit",fontSize:12};
const searchLabel:CSSProperties={fontSize:9,letterSpacing:".14em",opacity:.35,padding:"11px 3px 5px"};
const searchResult:CSSProperties={width:"100%",display:"flex",alignItems:"center",gap:8,border:0,background:"transparent",color:"inherit",padding:8,borderRadius:7,cursor:"pointer",textAlign:"left"};
const win:CSSProperties={position:"fixed",minWidth:320,minHeight:300,overflow:"hidden",borderRadius:12,background:"rgba(21,7,11,.98)",border:"1px solid rgba(220,142,157,.27)",boxShadow:"0 35px 110px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.025)"};
const winBar:CSSProperties={height:44,display:"flex",alignItems:"center",paddingLeft:10,background:"linear-gradient(90deg,rgba(143,38,56,.36),rgba(91,16,32,.15))",borderBottom:"1px solid rgba(255,255,255,.08)"};
const winTitle:CSSProperties={display:"flex",alignItems:"center",gap:8,flex:1,fontSize:12};
const winTitleSmall:CSSProperties={fontSize:9,opacity:.3};
const glyph:CSSProperties={width:22,height:22,display:"grid",placeItems:"center",borderRadius:5,background:"rgba(255,255,255,.07)",fontSize:8};
const winControl:CSSProperties={width:36,height:36,border:0,background:"transparent",color:"inherit",display:"inline-grid",placeItems:"center",cursor:"pointer",opacity:.72};
const winBody:CSSProperties={height:"calc(100% - 44px)",overflow:"auto",background:"rgba(24,9,13,.98)"};
const dock:CSSProperties={position:"fixed",zIndex:95,left:"50%",bottom:14,transform:"translateX(-50%)",display:"flex",gap:4,padding:6,borderRadius:14,background:"rgba(18,7,10,.91)",border:"1px solid rgba(214,122,139,.22)",boxShadow:"0 22px 65px rgba(0,0,0,.5)",backdropFilter:"blur(22px)"};
const dockBtn:CSSProperties={position:"relative",width:42,height:42,border:0,borderRadius:9,background:"transparent",color:"inherit",display:"grid",placeItems:"center",cursor:"pointer"};
const dockActive:CSSProperties={background:"rgba(143,38,56,.25)"};
const dockDot:CSSProperties={position:"absolute",bottom:4,width:4,height:4,borderRadius:99,background:"#E19AA8"};
const dockImg:CSSProperties={width:27,height:27};
const statusBar:CSSProperties={position:"fixed",zIndex:96,left:0,right:0,bottom:0,height:18,padding:"0 9px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(12,4,7,.9)",borderTop:"1px solid rgba(255,255,255,.07)",fontSize:8,opacity:.58};
const filesApp:CSSProperties={height:"100%",display:"flex",flexDirection:"column"};
const fileToolbar:CSSProperties={height:50,display:"flex",alignItems:"center",gap:6,padding:"0 9px",background:"rgba(255,255,255,.035)",borderBottom:"1px solid rgba(255,255,255,.07)"};
const toolBtn:CSSProperties={width:31,height:31,border:0,borderRadius:7,background:"transparent",color:"inherit",display:"grid",placeItems:"center",cursor:"pointer"};
const pathBox:CSSProperties={flex:1,padding:"8px 10px",background:"rgba(255,255,255,.045)",borderRadius:7,font:"11px ui-monospace,monospace",opacity:.78};
const fileLayout:CSSProperties={display:"flex",flex:1,minHeight:0};
const fileSide:CSSProperties={width:178,padding:9,background:"rgba(255,255,255,.024)",borderRight:"1px solid rgba(255,255,255,.06)",display:"flex",flexDirection:"column",gap:3};
const sideLabel:CSSProperties={fontSize:9,letterSpacing:".16em",opacity:.35,padding:"5px 8px 7px"};
const sideBtn:CSSProperties={display:"flex",alignItems:"center",gap:8,border:0,background:"transparent",color:"inherit",padding:"8px",borderRadius:7,cursor:"pointer",textAlign:"left",fontSize:11};
const sideActive:CSSProperties={background:"rgba(143,38,56,.27)",color:"#F0CAD0"};
const storage:CSSProperties={marginTop:"auto",padding:9,borderRadius:8,background:"rgba(255,255,255,.035)",display:"grid",gridTemplateColumns:"auto 1fr",gap:5,fontSize:9};
const storageBar:CSSProperties={gridColumn:"1 / -1",height:4,borderRadius:99,background:"#32121B",overflow:"hidden"};
const fileMain:CSSProperties={flex:1,minWidth:0,overflow:"auto"};
const fileMeta:CSSProperties={height:32,padding:"0 12px",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:9,opacity:.43,borderBottom:"1px solid rgba(255,255,255,.05)"};
const fileGrid:CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:9,padding:12};
const fileCard:CSSProperties={minHeight:143,textAlign:"left",border:"1px solid rgba(255,255,255,.07)",borderRadius:9,background:"rgba(255,255,255,.025)",color:"inherit",padding:11,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:7};
const fileSelected:CSSProperties={background:"rgba(143,38,56,.19)",border:"1px solid rgba(214,122,139,.42)"};
const fileVisual:CSSProperties={width:54,height:54,borderRadius:11,display:"grid",placeItems:"center"};
const settingsApp:CSSProperties={height:"100%",display:"flex"};
const settingsSide:CSSProperties={width:185,padding:10,background:"rgba(255,255,255,.024)",borderRight:"1px solid rgba(255,255,255,.06)"};
const settingsBtn:CSSProperties={width:"100%",display:"flex",alignItems:"center",gap:9,border:0,background:"transparent",color:"inherit",padding:10,borderRadius:8,cursor:"pointer",fontSize:11,textAlign:"left"};
const settingsActive:CSSProperties={background:"rgba(143,38,56,.3)"};
const settingsContent:CSSProperties={flex:1,overflow:"auto",padding:20};
const crumb:CSSProperties={display:"flex",alignItems:"center",gap:4,fontSize:9,opacity:.4,marginBottom:17};
const muted:CSSProperties={opacity:.52,fontSize:12,lineHeight:1.6};
const option:CSSProperties={padding:"15px 0",borderBottom:"1px solid rgba(255,255,255,.06)"};
const themePreview:CSSProperties={padding:15,borderRadius:9,marginTop:9,background:"linear-gradient(135deg,#12070A,#8F2638)",display:"grid",gap:4};
const wallPreview:CSSProperties={height:110,borderRadius:9,overflow:"hidden",marginTop:9};
const settingRow:CSSProperties={width:"100%",border:0,background:"rgba(255,255,255,.035)",color:"inherit",padding:12,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",fontSize:12};
const toggle:CSSProperties={position:"relative",display:"block",width:38,height:22,borderRadius:99};
const settingChips:CSSProperties={display:"flex",flexWrap:"wrap",gap:7,marginTop:15};
const installed:CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:8};
const installedCard:CSSProperties={padding:12,borderRadius:9,background:"rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.06)",display:"grid",gridTemplateColumns:"40px 1fr",alignItems:"center",gap:7};
const aboutBox:CSSProperties={display:"grid",gridTemplateColumns:"120px 1fr",gap:8,padding:15,borderRadius:9,background:"rgba(255,255,255,.035)"};
const docApp:CSSProperties={height:"100%",display:"flex",flexDirection:"column"};
const docToolbar:CSSProperties={height:44,display:"flex",alignItems:"center",gap:4,padding:"0 9px",background:"rgba(255,255,255,.025)",borderBottom:"1px solid rgba(255,255,255,.06)"};
const tab=function(active:boolean):CSSProperties{return{border:0,borderBottom:"2px solid "+(active?C.burg:"transparent"),background:"transparent",color:"inherit",padding:"11px 8px",cursor:"pointer",fontSize:10}};
const docOpen:CSSProperties={marginLeft:"auto",border:0,borderRadius:7,background:"rgba(143,38,56,.19)",color:"#EFCAD1",padding:"8px 10px",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",gap:4};
const article:CSSProperties={maxWidth:780,padding:"28px clamp(18px,4vw,52px)",fontFamily:"ui-sans-serif,system-ui,sans-serif",lineHeight:1.8};
const imageApp:CSSProperties={height:"100%",display:"flex",flexDirection:"column"};
const imageTools:CSSProperties={height:45,display:"flex",alignItems:"center",justifyContent:"center",gap:8,borderBottom:"1px solid rgba(255,255,255,.06)",fontSize:10};
const miniBtn:CSSProperties={width:27,height:27,border:0,borderRadius:6,background:"rgba(255,255,255,.07)",color:"inherit",cursor:"pointer"};
const selectStyle:CSSProperties={border:0,borderRadius:7,background:"#32121B",color:"inherit",padding:"7px 9px",fontSize:10};
const imageCanvas:CSSProperties={flex:1,minHeight:0,display:"grid",placeItems:"center",padding:18,overflow:"auto",background:"repeating-conic-gradient(#211015 0 25%,#1B090E 0 50%) 50% / 18px 18px"};
const terminal:CSSProperties={height:"100%",display:"flex",flexDirection:"column",background:"#080405",color:"#B9E6C7",font:"12px/1.75 ui-monospace,monospace"};
const termHead:CSSProperties={padding:"10px 13px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between",fontSize:9,opacity:.6};
const termOut:CSSProperties={flex:1,overflow:"auto",padding:15};
const termIn:CSSProperties={padding:"12px 15px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:8};
const music:CSSProperties={minHeight:"100%",display:"flex",flexDirection:"column",alignItems:"center",padding:25,textAlign:"center"};
const disc:CSSProperties={width:132,height:132,borderRadius:"50%",display:"grid",placeItems:"center",background:"conic-gradient(#5B1020,#A52A3A,#6E1626,#5B1020)",boxShadow:"0 25px 75px rgba(143,38,56,.32)"};
const musicBtns:CSSProperties={display:"flex",gap:7};
const circle:CSSProperties={width:37,height:37,border:0,borderRadius:"50%",background:"rgba(255,255,255,.07)",color:"inherit",display:"grid",placeItems:"center",cursor:"pointer"};
const gamesStyle:CSSProperties={padding:22};
const appIntro:CSSProperties={display:"flex",alignItems:"center",gap:10,marginBottom:20,color:"#E0A0AC"};
const gameGrid:CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:10};
const gameCard:CSSProperties={minHeight:192,border:"1px solid rgba(214,122,139,.16)",borderRadius:11,background:"linear-gradient(145deg,rgba(143,38,56,.16),rgba(255,255,255,.03))",color:"inherit",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:9,cursor:"pointer"};
const portfolio:CSSProperties={padding:25};
const portfolioHero:CSSProperties={display:"flex",alignItems:"center",gap:14};
const bigBadge:CSSProperties={width:56,height:56,borderRadius:15,display:"grid",placeItems:"center",background:"rgba(143,38,56,.24)",border:"1px solid rgba(214,122,139,.24)"};
const pageTitle:CSSProperties={margin:"3px 0",fontSize:28};
const pageText:CSSProperties={maxWidth:820,fontSize:14,lineHeight:1.8,opacity:.7,margin:"20px 0"};
const portfolioGrid:CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:9};
const portfolioCard:CSSProperties={padding:16,borderRadius:10,background:"rgba(255,255,255,.035)",border:"1px solid rgba(214,122,139,.12)",display:"grid",gap:7};
const gameShell:CSSProperties={padding:23};
const gameHint:CSSProperties={opacity:.52,fontSize:11};
const gameInput:CSSProperties={width:175,border:"1px solid rgba(214,122,139,.22)",borderRadius:8,background:"#210B11",color:"inherit",padding:10,outline:0};
const gameGo:CSSProperties={border:0,borderRadius:8,background:C.burg,color:"#fff",padding:"0 14px",cursor:"pointer"};
const newGame:CSSProperties={marginTop:18,border:0,borderRadius:8,background:C.burg,color:"#fff",padding:"9px 13px",cursor:"pointer",fontSize:10,letterSpacing:".12em"};
const logicBtn=function(on:boolean):CSSProperties{return{border:0,borderRadius:8,background:on?"#6E1626":"#32121B",color:"inherit",padding:"11px 13px",cursor:"pointer"}};
const logicOut:CSSProperties={marginTop:27,padding:22,borderRadius:12,background:"linear-gradient(145deg,rgba(143,38,56,.22),rgba(91,16,32,.08))",border:"1px solid rgba(214,122,139,.15)"};
const logicEq:CSSProperties={display:"flex",alignItems:"center",justifyContent:"center",gap:16,fontSize:24};
const boot:CSSProperties={position:"fixed",inset:0,zIndex:9999,background:"#090405",color:"#EFDDE0",font:"12px/1.7 ui-monospace,monospace",display:"grid",placeItems:"center",padding:30};
