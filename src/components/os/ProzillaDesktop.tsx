"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import {
  Activity, BookOpen, BriefcaseBusiness, Code2, FileText, Folder, FolderOpen,
  Gamepad2, Globe2, Home, Laptop, Maximize2, Minus, Music2, Play, Power,
  Search, Settings, Shield, Terminal, User, Volume2, VolumeX, X, Sparkles,
  Lock, Cpu, Database, Radio, Wrench, BookMarked, PenLine, Eye, Zap
} from "lucide-react";
import type { StatusSnapshot } from "@/lib/data/status";

type AppId =
  | "about" | "research" | "projects" | "security" | "journal" | "knowledge"
  | "learning" | "media" | "system" | "games" | "terminal" | "music"
  | "now" | "timeline" | "reading-room" | "observatory" | "developer-workspace"
  | "changelog" | "soc" | "public-api" | "learning-hub" | "docs" | "privacy"
  | "engineering" | "security-lab" | "settings"
  | "minesweeper" | "wordle" | "ballmaze" | "logicsim";

type Item = { id: AppId; name: string; description: string; icon: typeof Folder; accent: string };
type DesktopApp = { id: AppId; label: string; icon: typeof Folder; accent: string };

const FOLDERS: Record<string, Item[]> = {
  about: [
    { id: "about", name: "profile.md", description: "About Raghav Sharma", icon: User, accent: "#a78bfa" },
    { id: "now", name: "now", description: "Current focus and activity", icon: Activity, accent: "#22d3ee" },
    { id: "timeline", name: "timeline", description: "Career and project timeline", icon: Radio, accent: "#f472b6" },
  ],
  research: [
    { id: "research", name: "research", description: "Research archive", icon: BookOpen, accent: "#8b5cf6" },
    { id: "reading-room", name: "reading-room", description: "Reading and reference material", icon: BookMarked, accent: "#38bdf8" },
    { id: "observatory", name: "observatory", description: "Research observatory", icon: Globe2, accent: "#34d399" },
    { id: "knowledge", name: "knowledge", description: "Knowledge base", icon: BookOpen, accent: "#f59e0b" },
  ],
  projects: [
    { id: "engineering", name: "engineering", description: "Engineering projects and case files", icon: Code2, accent: "#60a5fa" },
    { id: "developer-workspace", name: "developer-workspace", description: "Developer workspace", icon: Laptop, accent: "#a78bfa" },
    { id: "changelog", name: "changelog", description: "System and project changelog", icon: FileText, accent: "#fbbf24" },
  ],
  security: [
    { id: "security-lab", name: "security-lab", description: "Browser security tools", icon: Shield, accent: "#fb7185" },
    { id: "soc", name: "soc", description: "SOC and detection work", icon: Activity, accent: "#f97316" },
    { id: "public-api", name: "public-api", description: "Public API documentation", icon: Globe2, accent: "#22d3ee" },
  ],
  journal: [
    { id: "journal", name: "journal", description: "Journal and notes", icon: PenLine, accent: "#ec4899" },
    { id: "media", name: "media-library", description: "Images, audio and media", icon: FileText, accent: "#14b8a6" },
  ],
  knowledge: [
    { id: "knowledge", name: "knowledge", description: "Knowledge archive", icon: BookOpen, accent: "#f59e0b" },
    { id: "docs", name: "docs", description: "Documentation", icon: FileText, accent: "#38bdf8" },
    { id: "reading-room", name: "reading-room", description: "Reading room", icon: BookMarked, accent: "#8b5cf6" },
  ],
  learning: [
    { id: "learning-hub", name: "learning-hub", description: "Learning hub", icon: Zap, accent: "#facc15" },
    { id: "research", name: "research", description: "Research material", icon: BookOpen, accent: "#8b5cf6" },
  ],
  media: [
    { id: "media", name: "media-library", description: "Images, audio and media", icon: FileText, accent: "#14b8a6" },
    { id: "music", name: "music", description: "Local music player", icon: Music2, accent: "#f472b6" },
  ],
  system: [
    { id: "settings", name: "settings", description: "System preferences", icon: Settings, accent: "#60a5fa" },
    { id: "docs", name: "docs", description: "System documentation", icon: FileText, accent: "#38bdf8" },
    { id: "privacy", name: "privacy", description: "Privacy information", icon: Lock, accent: "#34d399" },
  ],
  games: [
    { id: "minesweeper", name: "Minesweeper", description: "Classic minefield", icon: Gamepad2, accent: "#fb7185" },
    { id: "wordle", name: "Wordle", description: "Five-letter word game", icon: Gamepad2, accent: "#34d399" },
    { id: "ballmaze", name: "Ball Maze", description: "Navigate the maze", icon: Gamepad2, accent: "#38bdf8" },
    { id: "logicsim", name: "Logic Sim", description: "Build logic gates", icon: Gamepad2, accent: "#a78bfa" },
  ],
};

const DESKTOP: DesktopApp[] = [
  { id: "about", label: "About", icon: User, accent: "#a78bfa" },
  { id: "research", label: "Research", icon: BookOpen, accent: "#8b5cf6" },
  { id: "projects", label: "Projects", icon: Code2, accent: "#60a5fa" },
  { id: "security", label: "Security Lab", icon: Shield, accent: "#fb7185" },
  { id: "journal", label: "Journal", icon: PenLine, accent: "#ec4899" },
  { id: "knowledge", label: "Knowledge", icon: BookOpen, accent: "#f59e0b" },
  { id: "learning", label: "Learning", icon: Zap, accent: "#facc15" },
  { id: "media", label: "Media", icon: Folder, accent: "#14b8a6" },
  { id: "games", label: "Games", icon: Gamepad2, accent: "#22d3ee" },
  { id: "system", label: "System", icon: Settings, accent: "#38bdf8" },
];

const TITLES: Record<AppId, string> = {
  about:"About", research:"Research OS", projects:"Projects OS", security:"Security Lab",
  journal:"Journal OS", knowledge:"Knowledge OS", learning:"Learning OS", media:"Media OS",
  system:"System", games:"Games", terminal:"Terminal", music:"Music Player", now:"Now",
  timeline:"Timeline", "reading-room":"Reading Room", observatory:"Observatory",
  "developer-workspace":"Developer Workspace", changelog:"Changelog", soc:"SOC Console",
  "public-api":"Public API", "learning-hub":"Learning Hub", docs:"Documentation",
  privacy:"Privacy", engineering:"Engineering", "security-lab":"Security Lab",
  settings:"Settings", minesweeper:"Minesweeper", wordle:"Wordle", ballmaze:"Ball Maze",
  logicsim:"Logic Simulator",
};

const MUSIC = [
  { title:"Soundtrack", src:"/music/soundtrack.mp3" },
  { title:"Für Elise", src:"/music/Fu╠êr Elise.mp3" },
  { title:"Rain Ambient", src:"/music/rain-ambient.mp3" },
];

const pageData: Record<string, { eyebrow:string; title:string; text:string; bullets:string[]; accent:string }> = {
  about:{eyebrow:"PROFILE",title:"Raghav Sharma",text:"Cybersecurity, research and engineering work — presented as a personal operating system.",bullets:["Cybersecurity & Forensics","VAPT and security engineering","Research, documentation and practical labs","Learn by building and verify before assuming"],accent:"#a78bfa"},
  now:{eyebrow:"LIVE STATUS",title:"What I am working on",text:"A compact view of the current workstation focus.",bullets:["Security tooling and detection labs","Personal OS interface and portfolio engineering","Cybersecurity projects and technical writing","Continuous learning"],accent:"#22d3ee"},
  timeline:{eyebrow:"TIMELINE",title:"Project timeline",text:"Milestones and experiments across the portfolio.",bullets:["Portfolio OS evolution","Cybersecurity and SOC projects","Engineering experiments","Research and documentation"],accent:"#f472b6"},
  research:{eyebrow:"RESEARCH OS",title:"Research archive",text:"A workspace for investigations, notes, experiments and security research.",bullets:["Threat research","Malware analysis notes","Security experiments","Technical references"],accent:"#8b5cf6"},
  "reading-room":{eyebrow:"REFERENCE",title:"Reading Room",text:"A quiet space for papers, books, references and material worth revisiting.",bullets:["Research papers","Security references","Technical books","Saved notes"],accent:"#38bdf8"},
  observatory:{eyebrow:"OBSERVATORY",title:"Research Observatory",text:"Watch the signal: projects, experiments and security observations.",bullets:["Detection signals","Research observations","Experiment logs","Emerging techniques"],accent:"#34d399"},
  projects:{eyebrow:"PROJECTS OS",title:"Engineering projects",text:"Projects are treated as case files: objective, implementation, evidence and lessons.",bullets:["Cybersecurity portfolio","Developer tooling","Web applications","Security labs"],accent:"#60a5fa"},
  engineering:{eyebrow:"ENGINEERING",title:"Engineering Case Files",text:"A practical engineering workspace for building and testing systems.",bullets:["Voice Command Operator","Web Scraper","SOC Detection Lab","Network and security tooling"],accent:"#60a5fa"},
  "developer-workspace":{eyebrow:"WORKSPACE",title:"Developer Workspace",text:"A local-style command center for the software behind this OS.",bullets:["Next.js + React","TypeScript","Supabase + PostgreSQL","Vercel deployment"],accent:"#a78bfa"},
  changelog:{eyebrow:"CHANGELOG",title:"System history",text:"Important changes to the Sharma-Raghav OS.",bullets:["Desktop interface","Internal applications","Security hardening","Performance and reliability"],accent:"#fbbf24"},
  security:{eyebrow:"SECURITY",title:"Security Lab",text:"Hands-on defensive and offensive-security learning environments.",bullets:["VAPT methodology","SOC detection","Network analysis","Secure application design"],accent:"#fb7185"},
  "security-lab":{eyebrow:"LAB",title:"Browser Security Tools",text:"Interactive utilities run locally in the browser.",bullets:["Hash playground","Encoding helpers","Security notes","No external redirects"],accent:"#fb7185"},
  soc:{eyebrow:"SOC",title:"Detection Console",text:"A simulated SOC workspace for learning alert triage and investigation.",bullets:["Alert triage","MITRE ATT&CK mapping","Log analysis","Incident notes"],accent:"#f97316"},
  "public-api":{eyebrow:"API",title:"Public API",text:"Documentation and examples for public portfolio endpoints.",bullets:["Read-only public data","JSON responses","Authentication boundaries","Rate-limit aware design"],accent:"#22d3ee"},
  journal:{eyebrow:"JOURNAL",title:"Journal OS",text:"Notes, reflections and working logs.",bullets:["Daily notes","Technical reflections","Lessons learned","Research diary"],accent:"#ec4899"},
  knowledge:{eyebrow:"KNOWLEDGE",title:"Knowledge Base",text:"Articles, essays, case studies and technical notes.",bullets:["Cybersecurity concepts","Engineering notes","Case studies","Reference material"],accent:"#f59e0b"},
  learning:{eyebrow:"LEARNING",title:"Learning OS",text:"A structured learning space for skills and experiments.",bullets:["Cybersecurity fundamentals","Networking","Programming","Languages and communication"],accent:"#facc15"},
  "learning-hub":{eyebrow:"HUB",title:"Learning Hub",text:"Choose a subject, build something and record the evidence.",bullets:["Study","Practice","Build","Document"],accent:"#facc15"},
  media:{eyebrow:"MEDIA",title:"Media Library",text:"Local media and visual resources for the OS.",bullets:["Audio","Images","Project media","Local-only playback"],accent:"#14b8a6"},
  docs:{eyebrow:"DOCS",title:"Documentation",text:"System documentation and operating notes.",bullets:["Architecture","Usage","Security model","Deployment notes"],accent:"#38bdf8"},
  privacy:{eyebrow:"PRIVACY",title:"Privacy",text:"The portfolio is designed to minimize unnecessary data collection.",bullets:["Visitor preferences stay in the browser","Security tools run locally","Admin functionality is protected","No game redirects"],accent:"#34d399"},
  settings:{eyebrow:"SYSTEM",title:"Settings",text:"Control visitor-side presentation preferences.",bullets:["Reduce motion","Theme preferences","Local browser settings","Read-only visitor session"],accent:"#38bdf8"},
};

export default function ProzillaDesktop({ status }: { status: StatusSnapshot }) {
  const [booting,setBooting]=useState(true);
  const [open,setOpen]=useState<AppId[]>([]);
  const [active,setActive]=useState<AppId|null>(null);
  const [maximized,setMaximized]=useState(false);
  const [search,setSearch]=useState(false);
  const [query,setQuery]=useState("");
  const [time,setTime]=useState(new Date());

  useEffect(()=>{const a=setTimeout(()=>setBooting(false),1800);const b=setInterval(()=>setTime(new Date()),1000);return()=>{clearTimeout(a);clearInterval(b)}},[]);

  const launch=(id:AppId)=>{setOpen(v=>v.includes(id)?v:[...v,id]);setActive(id)};
  const close=(id:AppId)=>{setOpen(v=>v.filter(x=>x!==id));setActive(v=>v===id?null:v)};
  const files=FOLDERS[active??""]??[];
  const filtered=files.filter(x=>x.name.toLowerCase().includes(query.toLowerCase())||x.description.toLowerCase().includes(query.toLowerCase()));

  if(booting)return <BootScreen onSkip={()=>setBooting(false)}/>;

  return <div style={{minHeight:"100vh",background:"radial-gradient(circle at 15% 15%,#35206b 0,#12152e 32%,#080b18 72%)",color:"#f8fafc",fontFamily:"ui-sans-serif,system-ui"}}>
    <div style={{position:"fixed",inset:0,pointerEvents:"none",background:"radial-gradient(circle at 80% 10%,rgba(34,211,238,.16),transparent 28%),radial-gradient(circle at 80% 80%,rgba(236,72,153,.13),transparent 30%)"}}/>
    <header style={{height:54,display:"flex",alignItems:"center",gap:18,padding:"0 18px",background:"rgba(8,11,24,.84)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(255,255,255,.1)",position:"relative",zIndex:10}}>
      <button onClick={()=>launch("system")} style={{display:"flex",alignItems:"center",gap:10,border:0,background:"none",color:"white",cursor:"pointer",fontWeight:800}}>
        <span style={{width:30,height:30,borderRadius:9,display:"grid",placeItems:"center",background:"linear-gradient(135deg,#8b5cf6,#ec4899)",boxShadow:"0 0 24px rgba(139,92,246,.45)"}}>RS</span> Raghav Sharma OS
      </button>
      <span style={{opacity:.45,fontSize:12,flex:1}}>/home/raghav · PERSONAL WORKSTATION</span>
      <span style={{fontSize:11,color:status.database==="ok"?"#34d399":"#fbbf24"}}>● {status.database==="ok"?"ONLINE":"DEGRADED"}</span>
      <span style={{fontSize:12,opacity:.7}}>{time.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>
      <button onClick={()=>setSearch(v=>!v)} style={iconButton}><Search size={16}/></button>
    </header>

    <main style={{position:"relative",minHeight:"calc(100vh - 54px)",padding:"26px 24px 96px"}}>
      <div style={{fontSize:11,opacity:.45,display:"flex",alignItems:"center",gap:6,marginBottom:18}}><FolderOpen size={12}/> /home/raghav/Desktop</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(92px,1fr))",gap:14,maxWidth:760}}>
        {DESKTOP.map(a=><DesktopIcon key={a.id} app={a} onClick={()=>launch(a.id)}/>)}
      </div>

      {search&&<div style={{position:"absolute",top:18,right:22,width:300,padding:12,borderRadius:16,background:"rgba(15,18,38,.96)",border:"1px solid rgba(255,255,255,.14)",boxShadow:"0 20px 60px rgba(0,0,0,.45)",zIndex:30}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}><Search size={15}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find apps..." style={inputStyle}/></div>
        <div style={{marginTop:10,display:"grid",gap:5}}>{DESKTOP.filter(a=>a.label.toLowerCase().includes(query.toLowerCase())).map(a=><button key={a.id} onClick={()=>{launch(a.id);setSearch(false)}} style={searchItem}><a.icon size={15} color={a.accent}/>{a.label}</button>)}</div>
      </div>}

      {open.map(id=><OSWindow key={id} id={id} active={active===id} maximized={maximized&&active===id} onActivate={()=>setActive(id)} onClose={()=>close(id)} onMinimize={()=>setActive(null)} onMaximize={()=>setMaximized(v=>!v)}>
        {FOLDERS[id]&&<FolderApp id={id} items={filtered} onOpen={launch} query={query} setQuery={setQuery}/>}
        {id==="about"&&<PageApp id="about"/>}{id==="research"&&<PageApp id="research"/>}{id==="projects"&&<PageApp id="projects"/>}
        {id==="security"&&<PageApp id="security"/>}{id==="journal"&&<PageApp id="journal"/>}{id==="knowledge"&&<PageApp id="knowledge"/>}
        {id==="learning"&&<PageApp id="learning"/>}{id==="media"&&<PageApp id="media"/>}{id==="system"&&<PageApp id="system"/>}
        {!FOLDERS[id]&&id!=="about"&&id!=="research"&&id!=="projects"&&id!=="security"&&id!=="journal"&&id!=="knowledge"&&id!=="learning"&&id!=="media"&&id!=="system"&&id!=="terminal"&&id!=="music"&&id!=="games"&&<PageApp id={id}/>}
        {id==="games"&&<FolderApp id="games" items={FOLDERS.games} onOpen={launch} query="" setQuery={()=>{}}/>}
        {id==="terminal"&&<TerminalApp onOpen={launch}/>}
        {id==="music"&&<MusicApp/>}
        {id==="minesweeper"&&<Minesweeper/>}{id==="wordle"&&<Wordle/>}{id==="ballmaze"&&<BallMaze/>}{id==="logicsim"&&<LogicSim/>}
      </OSWindow>)}
    </main>

    <nav style={{position:"fixed",bottom:16,left:"50%",transform:"translateX(-50%)",display:"flex",gap:7,padding:8,borderRadius:20,background:"rgba(11,14,30,.86)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,.13)",boxShadow:"0 18px 55px rgba(0,0,0,.4)",zIndex:50}}>
      <DockButton icon={<Home size={17}/>} onClick={()=>launch("system")} title="System"/>
      <DockButton icon={<Terminal size={17}/>} onClick={()=>launch("terminal")} title="Terminal"/>
      <DockButton icon={<Music2 size={17}/>} onClick={()=>launch("music")} title="Music"/>
      <DockButton icon={<Gamepad2 size={17}/>} onClick={()=>launch("games")} title="Games"/>
      <DockButton icon={<Search size={17}/>} onClick={()=>setSearch(v=>!v)} title="Search"/>
    </nav>
  </div>;
}

const iconButton:CSSProperties={border:0,background:"rgba(255,255,255,.06)",color:"white",width:34,height:34,borderRadius:10,display:"grid",placeItems:"center",cursor:"pointer"};
const inputStyle:CSSProperties={flex:1,background:"transparent",border:0,outline:0,color:"white",fontSize:13};
const searchItem:CSSProperties={border:0,background:"rgba(255,255,255,.04)",color:"white",padding:"8px 10px",borderRadius:9,textAlign:"left",display:"flex",gap:9,alignItems:"center",cursor:"pointer"};

function DesktopIcon({app,onClick}:{app:DesktopApp;onClick:()=>void}){return <button onClick={onClick} style={{border:0,background:"transparent",color:"white",cursor:"pointer",padding:10,borderRadius:16}}><div style={{width:58,height:58,margin:"auto",display:"grid",placeItems:"center",borderRadius:17,background:`linear-gradient(135deg,${app.accent}44,${app.accent}12)`,border:`1px solid ${app.accent}66`,boxShadow:`0 8px 25px ${app.accent}22`}}><app.icon size={28} color={app.accent}/></div><div style={{fontSize:12,fontWeight:700,marginTop:7}}>{app.label}</div></button>}

function DockButton({icon,onClick,title}:{icon:ReactNode;onClick:()=>void;title:string}){return <button title={title} onClick={onClick} style={{...iconButton,width:40,height:40}}>{icon}</button>}

function OSWindow({id,active,maximized,onActivate,onClose,onMinimize,onMaximize,children}:{id:AppId;active:boolean;maximized:boolean;onActivate:()=>void;onClose:()=>void;onMinimize:()=>void;onMaximize:()=>void;children:ReactNode}){return <section onMouseDown={onActivate} style={{position:"fixed",zIndex:active?40:20,left:maximized?12:"8%",top:maximized?66:"12%",width:maximized?"calc(100% - 24px)": "84%",height:maximized?"calc(100% - 150px)":"70%",minWidth:330,minHeight:300,background:"rgba(10,13,28,.97)",border:"1px solid rgba(255,255,255,.13)",borderRadius:18,boxShadow:active?"0 30px 100px rgba(0,0,0,.6)":"0 18px 55px rgba(0,0,0,.35)",overflow:"hidden",backdropFilter:"blur(18px)"}}>
  <div style={{height:44,display:"flex",alignItems:"center",padding:"0 12px",background:"linear-gradient(90deg,rgba(139,92,246,.18),rgba(34,211,238,.08))",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
    <div style={{display:"flex",alignItems:"center",gap:9,fontWeight:800,fontSize:13,flex:1}}><Sparkles size={14} color="#a78bfa"/>{TITLES[id]}</div>
    <button onClick={onMinimize} style={windowButton}><Minus size={14}/></button><button onClick={onMaximize} style={windowButton}><Maximize2 size={13}/></button><button onClick={onClose} style={windowButton}><X size={14}/></button>
  </div>
  <div style={{height:"calc(100% - 44px)",overflow:"auto"}}>{children}</div>
</section>}

const windowButton:CSSProperties={border:0,background:"transparent",color:"rgba(255,255,255,.7)",width:30,height:30,display:"grid",placeItems:"center",cursor:"pointer",borderRadius:8};

function FolderApp({id,items,onOpen,query,setQuery}:{id:string;items:Item[];onOpen:(id:AppId)=>void;query:string;setQuery:(s:string)=>void}){return <div style={{padding:22}}>
  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}><FolderOpen size={20} color="#a78bfa"/><div><div style={{fontSize:11,opacity:.45}}>/home/raghav/{id}</div><h2 style={{margin:"3px 0",fontSize:22}}>{TITLES[id as AppId]??id}</h2></div></div>
  {id!=="games"&&<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Filter files..." style={{...inputStyle,background:"rgba(255,255,255,.05)",padding:"10px 12px",borderRadius:10,width:"100%",marginBottom:14}}/>}
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12}}>
    {items.map(x=><button key={x.id} onClick={()=>onOpen(x.id)} style={{textAlign:"left",border:`1px solid ${x.accent}55`,background:`linear-gradient(145deg,${x.accent}14,rgba(255,255,255,.025))`,color:"white",borderRadius:14,padding:16,cursor:"pointer",minHeight:125}}>
      <x.icon size={24} color={x.accent}/><div style={{fontWeight:800,marginTop:12}}>{x.name}</div><div style={{fontSize:12,opacity:.55,marginTop:5}}>{x.description}</div><div style={{fontSize:10,color:x.accent,marginTop:12}}>OPEN WINDOW →</div>
    </button>)}
  </div>
</div>}

function PageApp({id}:{id:string}){const d=pageData[id]??{eyebrow:"APP",title:TITLES[id as AppId]??id,text:"Internal OS application.",bullets:["Available inside the operating system","Local window interface","No external redirect"],accent:"#a78bfa"};return <div style={{padding:26}}>
  <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{width:52,height:52,borderRadius:16,display:"grid",placeItems:"center",background:`linear-gradient(135deg,${d.accent}44,${d.accent}10)`,border:`1px solid ${d.accent}66`}}><Sparkles size={24} color={d.accent}/></div><div><div style={{fontSize:10,letterSpacing:2,color:d.accent,fontWeight:800}}>{d.eyebrow}</div><h1 style={{margin:"3px 0",fontSize:26}}>{d.title}</h1></div></div>
  <p style={{fontSize:14,lineHeight:1.7,opacity:.7,maxWidth:780,margin:"20px 0"}}>{d.text}</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>{d.bullets.map((b,i)=><div key={b} style={{padding:18,borderRadius:14,background:"rgba(255,255,255,.035)",border:`1px solid ${d.accent}33`}}><div style={{fontSize:11,color:d.accent}}>0{i+1}</div><strong style={{display:"block",marginTop:8}}>{b}</strong><span style={{fontSize:11,opacity:.45}}>Internal OS module</span></div>)}</div>
</div>}

function TerminalApp({onOpen}:{onOpen:(id:AppId)=>void}){const [cmd,setCmd]=useState("");const [lines,setLines]=useState(["Raghav Sharma OS terminal","Type help for commands."]);const run=()=>{const c=cmd.trim().toLowerCase();if(!c)return;let out=`raghav@os:~$ ${cmd}`;if(c==="help")out+="\\ncommands: about research projects security games music settings clear";else if(c==="clear"){setLines([]);setCmd("");return}else if(c==="about"||c==="research"||c==="projects"||c==="security"||c==="games"||c==="music"||c==="settings"){onOpen(c as AppId);out+="\\nopening internal window..."}else out+="\\ncommand not found";setLines(v=>[...v,...out.split("\\n")]);setCmd("")};return <div style={{padding:20,height:"100%",background:"#05070f",fontFamily:"ui-monospace,monospace",color:"#86efac"}}><div style={{opacity:.7,marginBottom:14}}>LOCAL PORTFOLIO SHELL</div>{lines.map((x,i)=><div key={i} style={{margin:"5px 0"}}>{x}</div>)}<div style={{display:"flex",gap:8,marginTop:14}}><span>raghav@os:~$</span><input autoFocus value={cmd} onChange={e=>setCmd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()} style={{...inputStyle,color:"#86efac"}}/></div></div>}

function MusicApp(){const ref=useRef<HTMLAudioElement>(null);const [track,setTrack]=useState(0);const [playing,setPlaying]=useState(false);const [muted,setMuted]=useState(false);const toggle=async()=>{if(!ref.current)return;if(ref.current.paused){try{await ref.current.play();setPlaying(true)}catch{}}else{ref.current.pause();setPlaying(false)}};return <div style={{padding:28,textAlign:"center"}}><div style={{width:130,height:130,borderRadius:"50%",margin:"10px auto 22px",display:"grid",placeItems:"center",background:"conic-gradient(#8b5cf6,#ec4899,#22d3ee,#8b5cf6)",boxShadow:"0 0 70px rgba(139,92,246,.3)"}}><div style={{width:105,height:105,borderRadius:"50%",display:"grid",placeItems:"center",background:"#11152a"}}><Music2 size={42}/></div></div><h2>{MUSIC[track].title}</h2><p style={{opacity:.5}}>Local media · no external streaming</p><audio ref={ref} src={MUSIC[track].src} muted={muted} onEnded={()=>setTrack(v=>(v+1)%MUSIC.length)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}/><div style={{display:"flex",justifyContent:"center",gap:8,margin:20}}><button style={pill} onClick={()=>setTrack(v=>(v+MUSIC.length-1)%MUSIC.length)}>‹</button><button style={{...pill,width:52}} onClick={toggle}>{playing?"Ⅱ":<Play size={17}/>}</button><button style={pill} onClick={()=>setTrack(v=>(v+1)%MUSIC.length)}>›</button><button style={pill} onClick={()=>setMuted(v=>!v)}>{muted?<VolumeX size={16}/>:<Volume2 size={16}/>}</button></div>{MUSIC.map((m,i)=><button key={m.src} onClick={()=>setTrack(i)} style={{display:"block",width:"100%",padding:11,border:0,borderRadius:10,background:i===track?"rgba(139,92,246,.18)":"transparent",color:"white",textAlign:"left",cursor:"pointer"}}>{i+1}. {m.title}</button>)}</div>}
const pill:CSSProperties={border:0,borderRadius:12,width:42,height:42,display:"grid",placeItems:"center",background:"rgba(255,255,255,.08)",color:"white",cursor:"pointer"};

function GameShell({title,children,reset}:{title:string;children:ReactNode;reset:()=>void}){return <div style={{padding:24,minHeight:"100%",background:"radial-gradient(circle at 70% 20%,rgba(139,92,246,.15),transparent 30%)"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><Gamepad2 color="#22d3ee"/><h2 style={{margin:0}}>{title}</h2><span style={{fontSize:10,color:"#34d399",marginLeft:6}}>LOCAL</span></div>{children}<button onClick={reset} style={{...pill,width:"auto",padding:"0 15px",marginTop:18}}>New Game</button></div>}

function Minesweeper(){const N=8,M=10;const make=()=>{const a=Array.from({length:N*N},()=>({m:false,o:false,f:false}));let n=0;while(n<M){const i=Math.floor(Math.random()*a.length);if(!a[i].m){a[i].m=true;n++}}return a};const [b,setB]=useState(make);const [lost,setLost]=useState(false);const adj=(i:number)=>{const r=Math.floor(i/N),c=i%N,a:number[]=[];for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){const R=r+y,C=c+x;if((x||y)&&R>=0&&R<N&&C>=0&&C<N)a.push(R*N+C)}return a};const reveal=(i:number)=>{if(lost||b[i].o||b[i].f)return;const n=b.map(x=>({...x}));if(n[i].m){n.forEach(x=>{if(x.m)x.o=true});setB(n);setLost(true);return}const q=[i],seen=new Set<number>();while(q.length){const x=q.shift()!;if(seen.has(x)||n[x].m||n[x].f)continue;seen.add(x);n[x].o=true;if(adj(x).filter(z=>n[z].m).length===0)q.push(...adj(x))}setB(n)};return <GameShell title="Minesweeper" reset={()=>{setB(make());setLost(false)}}><div style={{display:"grid",gridTemplateColumns:`repeat(${N},42px)`,gap:3,width:"max-content"}}>{b.map((x,i)=>{const num=adj(i).filter(z=>b[z].m).length;return <button key={i} onClick={()=>reveal(i)} onContextMenu={e=>{e.preventDefault();setB(v=>v.map((q,j)=>j===i?{...q,f:!q.f}:q))}} style={{width:42,height:42,border:"1px solid rgba(255,255,255,.08)",borderRadius:7,background:x.o?"#182039":"#242b4a",color:x.m?"#fb7185":"#e2e8f0",fontWeight:800}}>{x.o?(x.m?"✹":num||""):x.f?"⚑":""}</button>})}</div><p style={{opacity:.55}}>{lost?"Mine hit — reset and try again.":"Left click reveal · right click flag"}</p></GameShell>}

function Wordle(){const words=["CRANE","SHARE","LIGHT","MOUSE","PLANT","WORLD","TRUST","STACK"];const [target,setTarget]=useState(words[Math.floor(Math.random()*words.length)]);const [guess,setGuess]=useState("");const [rows,setRows]=useState<string[]>([]);const submit=()=>{if(guess.length===5&&rows.length<6){setRows(v=>[...v,guess.toUpperCase()]);setGuess("")}};return <GameShell title="Wordle" reset={()=>{setRows([]);setGuess("");setTarget(words[Math.floor(Math.random()*words.length)])}}><div style={{display:"grid",gap:5,width:"max-content"}}>{Array.from({length:6},(_,r)=><div key={r} style={{display:"grid",gridTemplateColumns:"repeat(5,48px)",gap:5}}>{Array.from({length:5},(_,i)=>{const g=rows[r]?.[i]??"";const bg=g?(g===target[i]?"#15803d":target.includes(g)?"#a16207":"#334155"):"#182039";return <div key={i} style={{width:48,height:48,display:"grid",placeItems:"center",borderRadius:7,background:bg,fontWeight:800}}>{g}</div>})}</div>)}</div><div style={{display:"flex",gap:8,marginTop:14}}><input maxLength={5} value={guess} onChange={e=>setGuess(e.target.value.replace(/[^a-z]/gi,""))} onKeyDown={e=>e.key==="Enter"&&submit()} style={{...inputStyle,background:"rgba(255,255,255,.06)",padding:11,borderRadius:9}}/><button onClick={submit} style={pill}>GO</button></div><p style={{opacity:.55}}>{rows.includes(target)?"Solved!":rows.length>=6?`Word: ${target}`:"Guess a five-letter word."}</p></GameShell>}

function BallMaze(){const walls=new Set(["1,0","1,1","3,1","3,2","0,3","2,3","4,3"]);const [p,setP]=useState({x:0,y:0});const move=(dx:number,dy:number)=>setP(v=>{const x=Math.max(0,Math.min(4,v.x+dx)),y=Math.max(0,Math.min(4,v.y+dy));return walls.has(`${x},${y}`)?v:{x,y}});useEffect(()=>{const h=(e:KeyboardEvent)=>{if(e.key==="ArrowUp")move(0,-1);if(e.key==="ArrowDown")move(0,1);if(e.key==="ArrowLeft")move(-1,0);if(e.key==="ArrowRight")move(1,0)};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h)});return <GameShell title="Ball Maze" reset={()=>setP({x:0,y:0})}><div style={{display:"grid",gridTemplateColumns:"repeat(5,55px)",gap:4,width:"max-content"}}>{Array.from({length:25},(_,i)=>{const x=i%5,y=Math.floor(i/5),wall=walls.has(`${x},${y}`);return <div key={i} style={{width:55,height:55,display:"grid",placeItems:"center",borderRadius:8,background:wall?"#171b30":"#10162a",border:"1px solid rgba(255,255,255,.08)"}}>{p.x===x&&p.y===y?"●":x===4&&y===4?"◎":""}</div>})}</div><p style={{opacity:.55}}>Use arrow keys to reach ◎.</p></GameShell>}

function LogicSim(){const [a,setA]=useState(false),[b,setB]=useState(false),[g,setG]=useState("AND");const out=g==="AND"?a&&b:g==="OR"?a||b:g==="XOR"?a!==b:!a;return <GameShell title="Logic Simulator" reset={()=>{setA(false);setB(false);setG("AND")}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button onClick={()=>setA(!a)} style={{...pill,width:"auto",padding:"0 14px",background:a?"#166534":"rgba(255,255,255,.08)"}}>A: {a?1:0}</button><button disabled={g==="NOT"} onClick={()=>setB(!b)} style={{...pill,width:"auto",padding:"0 14px"}}>B: {b?1:0}</button><select value={g} onChange={e=>setG(e.target.value)} style={{background:"#182039",color:"white",border:0,borderRadius:10,padding:"0 12px"}}><option>AND</option><option>OR</option><option>XOR</option><option>NOT</option></select></div><div style={{marginTop:30,padding:25,borderRadius:18,background:"linear-gradient(135deg,rgba(139,92,246,.2),rgba(34,211,238,.1))",fontSize:22}}>{g} OUTPUT → <strong>{out?1:0}</strong></div></GameShell>}

function BootScreen({onSkip}:{onSkip:()=>void}){const [n,setN]=useState(0);useEffect(()=>{const t=setInterval(()=>setN(v=>Math.min(9,v+1)),160);return()=>clearInterval(t)},[]);const logs=["initializing kernel","mounting /home/raghav","loading research modules","starting security services","loading local games","mounting media","checking database","starting desktop","user session ready"];return <div style={{minHeight:"100vh",background:"#050713",color:"#a78bfa",fontFamily:"ui-monospace,monospace",display:"grid",placeItems:"center",padding:30}}><div style={{width:"min(720px,100%)"}}><div style={{fontSize:56,fontWeight:900,letterSpacing:-4,color:"white"}}>RS</div><h1 style={{color:"white"}}>RAGHAV SHARMA OS</h1>{logs.slice(0,n).map((x,i)=><div key={x} style={{margin:"7px 0",opacity:.7}}>[ {String(i).padStart(2,"0")} ] {x}... <span style={{color:"#34d399"}}>OK</span></div>)}<div style={{height:4,background:"#161b35",marginTop:25,borderRadius:5}}><div style={{width:`${n/9*100}%`,height:"100%",background:"linear-gradient(90deg,#8b5cf6,#ec4899,#22d3ee)",borderRadius:5}}/></div><button onClick={onSkip} style={{marginTop:20,...pill,width:"auto",padding:"0 15px"}}>SKIP BOOT</button></div></div>}
