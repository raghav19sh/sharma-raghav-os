"use client";

import { type ReactElement } from "react";
import {
  App,
  AppsConfig,
  Desktop,
  ModalsView,
  ProzillaOS,
  Taskbar,
  WindowsView,
  fileExplorer,
  mediaViewer,
  settings,
  terminal,
  textEditor,
} from "prozilla-os";
import { calculator } from "prozilla-os";
import { logicSim } from "@prozilla-os/logic-sim";
import { ballMaze } from "@prozilla-os/ball-maze";
import { minesweeper } from "@prozilla-os/minesweeper";
import { wordle } from "@prozilla-os/wordle";
import { Skin, Theme } from "@prozilla-os/skins";

type PortfolioAppProps = Record<string, unknown> & {
  section: keyof typeof SECTIONS;
};

type Section = {
  title: string;
  eyebrow: string;
  intro: string;
  items: string[];
};

const SECTIONS = {
  about: {
    eyebrow: "PROFILE",
    title: "About Raghav Sharma",
    intro: "Cybersecurity, research and engineering work presented through a personal operating system.",
    items: ["Cybersecurity & Forensics", "VAPT and security engineering", "Research and technical writing", "Projects built to verify practical skill"],
  },
  research: {
    eyebrow: "RESEARCH OS",
    title: "Research Archive",
    intro: "A workspace for security research, investigations, experiments and technical notes.",
    items: ["Threat research", "Research observations", "Reading room", "Technical investigations"],
  },
  engineering: {
    eyebrow: "ENGINEERING",
    title: "Engineering Workspace",
    intro: "Software, infrastructure and security projects arranged as case files.",
    items: ["Voice Command Operator", "Web Scraper", "SOC Detection Lab", "Network and security tooling"],
  },
  security: {
    eyebrow: "SECURITY LAB",
    title: "Security Operations",
    intro: "Hands-on defensive security, application security and detection engineering.",
    items: ["VAPT methodology", "SOC / detection", "Network analysis", "Secure application design"],
  },
  journal: {
    eyebrow: "JOURNAL OS",
    title: "Journal",
    intro: "Working logs, reflections and lessons learned.",
    items: ["Daily notes", "Technical reflections", "Research diary", "Lessons learned"],
  },
  knowledge: {
    eyebrow: "KNOWLEDGE",
    title: "Knowledge Base",
    intro: "Technical writing, documentation, case studies and reference material.",
    items: ["Cybersecurity concepts", "Engineering notes", "Case studies", "Reference material"],
  },
  learning: {
    eyebrow: "LEARNING",
    title: "Learning Hub",
    intro: "Study, practice, build and document.",
    items: ["Cybersecurity", "Networking", "Programming", "Languages"],
  },
  soc: {
    eyebrow: "SOC",
    title: "Detection Console",
    intro: "A workspace for alert triage, investigation practice and incident documentation.",
    items: ["Alert triage", "MITRE ATT&CK", "Log analysis", "Incident notes"],
  },
  now: {
    eyebrow: "CURRENT",
    title: "Now",
    intro: "Current workstation focus and active areas of work.",
    items: ["Security tooling", "OS engineering", "Cybersecurity projects", "Continuous learning"],
  },
  timeline: {
    eyebrow: "TIMELINE",
    title: "Timeline",
    intro: "Milestones across the portfolio, engineering work and research.",
    items: ["Portfolio OS evolution", "Security projects", "Engineering experiments", "Research"],
  },
  docs: {
    eyebrow: "DOCS",
    title: "Documentation",
    intro: "Architecture, deployment and operating notes for the personal OS.",
    items: ["Next.js 15", "Supabase + PostgreSQL", "Authentication model", "Deployment"],
  },
  privacy: {
    eyebrow: "PRIVACY",
    title: "Privacy",
    intro: "Visitor-side privacy and local preference information.",
    items: ["Preferences stay in the browser", "Security tools run locally", "Admin routes remain protected", "No external game redirects"],
  },
  "public-api": {
    eyebrow: "API",
    title: "Public API",
    intro: "Read-only public portfolio endpoints and integration notes.",
    items: ["Public data", "JSON responses", "Authentication boundaries", "Rate-limit aware design"],
  },
} satisfies Record<string, Section>;

function PortfolioWindow({ section }: PortfolioAppProps): ReactElement {
  const value = SECTIONS[section] ?? SECTIONS.about;
  return (
    <div className="rsos-portfolio-window">
      <div className="rsos-portfolio-heading">
        <span>{value.eyebrow}</span>
        <h1>{value.title}</h1>
        <p>{value.intro}</p>
      </div>
      <div className="rsos-portfolio-grid">
        {value.items.map((item, index) => (
          <article key={item} className="rsos-portfolio-card">
            <small>{String(index + 1).padStart(2, "0")}</small>
            <strong>{item}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}

function AppLink(name: string, id: string, icon: string, section?: keyof typeof SECTIONS) {
  return new App(name, id, PortfolioWindow, section ? { section } : undefined)
    .setIconUrl(icon)
    .setShowDesktopIcon(true);
}

const about = AppLink("About", "about-raghav", "/os/icons/file-text.svg", "about");
const research = AppLink("Research OS", "research-raghav", "/os/icons/file-code.svg", "research");
const engineering = AppLink("Engineering", "engineering-raghav", "/os/icons/file-code.svg", "engineering");
const security = AppLink("Security Lab", "security-raghav", "/os/icons/file-info.svg", "security");
const journal = AppLink("Journal OS", "journal-raghav", "/os/icons/file-text.svg", "journal");
const knowledge = AppLink("Knowledge", "knowledge-raghav", "/os/icons/file-text.svg", "knowledge");
const learning = AppLink("Learning", "learning-raghav", "/os/icons/file-info.svg", "learning");
const soc = AppLink("SOC Console", "soc-raghav", "/os/icons/file-code.svg", "soc");

function configureApps() {
  fileExplorer
    .setName("Files")
    .setIconUrl("/os/icons/file-explorer.svg")
    .setShowDesktopIcon(true)
    .setPinnedByDefault(true);

  terminal
    .setName("Terminal")
    .setIconUrl("/os/icons/terminal.svg")
    .setShowDesktopIcon(true)
    .setPinnedByDefault(true);

  settings
    .setName("Settings")
    .setIconUrl("/os/icons/settings.svg")
    .setPinnedByDefault(true);

  mediaViewer
    .setName("Media Viewer")
    .setIconUrl("/os/icons/media-viewer.svg");

  textEditor
    .setName("Document Viewer")
    .setIconUrl("/os/icons/text-editor.svg");

  calculator
    .setName("Calculator")
    .setShowDesktopIcon(false)
    .setPinnedByDefault(false);

  logicSim
    .setName("Logic Simulator")
    .setIconUrl("/os/icons/logic-sim.svg")
    .setShowDesktopIcon(true);

  minesweeper
    .setName("Minesweeper")
    .setIconUrl("/os/icons/minesweeper.svg")
    .setShowDesktopIcon(true);

  wordle
    .setName("Wordle")
    .setIconUrl("/os/icons/wordle.svg")
    .setShowDesktopIcon(true);

  ballMaze
    .setName("Ball Maze")
    .setIconUrl("/os/icons/ball-maze.svg")
    .setShowDesktopIcon(true);

  about.setPinnedByDefault(false);
  research.setPinnedByDefault(false);
  engineering.setPinnedByDefault(false);
  security.setPinnedByDefault(false);
  journal.setPinnedByDefault(false);
  knowledge.setPinnedByDefault(false);
  learning.setPinnedByDefault(false);
  soc.setPinnedByDefault(false);

  return new AppsConfig({
    apps: [
      fileExplorer,
      terminal,
      settings,
      mediaViewer,
      textEditor,
      calculator,
      logicSim,
      minesweeper,
      wordle,
      ballMaze,
      about,
      research,
      engineering,
      security,
      journal,
      knowledge,
      learning,
      soc,
    ],
  });
}

function makeSkin() {
  return new Skin({
    baseUrl: "/",
    systemIcon: "/os/icons/settings.svg",
    defaultTheme: Theme.Dark,
    defaultWallpaper: "/os/wallpaper.svg",
    wallpapers: ["/os/wallpaper.svg"],
    fileIcons: {
      generic: "/os/icons/file-text.svg",
      text: "/os/icons/file-text.svg",
      info: "/os/icons/file-info.svg",
      code: "/os/icons/file-code.svg",
      external: "/os/icons/file.svg",
      video: "/os/icons/file-video.svg",
      audio: "/os/icons/file-audio.svg",
    },
    folderIcons: {
      generic: "/os/icons/folder.svg",
      images: "/os/icons/folder-images.svg",
      text: "/os/icons/folder-text.svg",
      link: "/os/icons/folder.svg",
      video: "/os/icons/folder-video.svg",
      audio: "/os/icons/folder-audio.svg",
    },
  });
}

const apps = configureApps();
const skin = makeSkin();

const loadData = (root: any) => {
  const home = root.navigateToFolder("~/") ?? root;
  const createFolder = (name: string, files: Array<[string, string]>) => {
    let folder = home.findSubFolder(name);
    if (folder == null) {
      home.createFolder(name, (created: any) => { folder = created; });
    }
    files.forEach(([fileName, content]) => {
      folder?.createFile(fileName.replace(/\.[^.]+$/, ""), "md", (file: any) => file.setContent(content));
    });
  };

  createFolder("Research", [
    ["Research.md", "# Research Archive\n\nThreat research, investigations, experiments and technical notes."],
    ["Reading-Room.md", "# Reading Room\n\nPapers, books and references worth revisiting."],
    ["Observatory.md", "# Observatory\n\nResearch observations and experiment logs."],
  ]);

  createFolder("Engineering", [
    ["Projects.md", "# Engineering Projects\n\nVoice Command Operator, Web Scraper, SOC Detection Lab and practical tooling."],
    ["Developer-Workspace.md", "# Developer Workspace\n\nNext.js, TypeScript, Supabase, PostgreSQL and deployment infrastructure."],
  ]);

  createFolder("Security", [
    ["Security-Lab.md", "# Security Lab\n\nVAPT, SOC detection, network analysis and secure engineering."],
    ["SOC.md", "# SOC Console\n\nAlert triage, MITRE ATT&CK mapping, log analysis and incident notes."],
  ]);

  home.createFolder("Documents");
  home.createFolder("Pictures");
  home.createFolder("Music");

  const documents = root.navigateToFolder("~/Documents");
  documents?.createFile("About-Raghav", "md", (file: any) => file.setContent("# About Raghav Sharma\n\nCybersecurity & Forensics.\n\nBuild. Verify. Document. Improve.\n\ncontact@sharma-raghav.com"));
  documents?.createFile("Research", "md", (file: any) => file.setContent("# Research\n\nSecurity research, investigations, reading and observations."));
  documents?.createFile("Projects", "md", (file: any) => file.setContent("# Projects\n\nVoice Command Operator, Web Scraper, SOC Detection Lab."));
  documents?.createFile("Privacy", "md", (file: any) => file.setContent("# Privacy\n\nVisitor-side preferences remain local. Admin functionality remains protected."));

  const pictures = root.navigateToFolder("~/Pictures");
  pictures?.createFile("Burgundy-Wallpaper", "svg", (file: any) => file.setSource("/os/wallpaper.svg"));

  const music = root.navigateToFolder("~/Music");
  music?.createFile("Soundtrack", "mp3", (file: any) => file.setSource("/music/soundtrack.mp3"));
  music?.createFile("Für-Elise", "mp3", (file: any) => file.setSource("/music/Fu╠êr Elise.mp3"));
  music?.createFile("Rain-Ambient", "mp3", (file: any) => file.setSource("/music/rain-ambient.mp3"));

  let desktop = home.findSubFolder("Desktop");
  if (desktop == null) home.createFolder("Desktop", (created: any) => { desktop = created; });
  const desktopApps = [fileExplorer, terminal, settings, logicSim, minesweeper, wordle, ballMaze, about, research, engineering, security, journal, knowledge, learning, soc];
  desktopApps.forEach((app) => {
    if (!desktop?.findFile(app.name)) {
      desktop?.createFile(app.name, undefined, (file: any) => file.setSource("app://"+app.id).setIconUrl(app.iconUrl));
    }
  });
};

export default function ProzillaSiteOS(): ReactElement {
  return (
    <div className="rsos-root">
      <ProzillaOS
        systemName="Raghav Sharma OS"
        tagLine="Cybersecurity · Research · Engineering"
        skin={skin}
        config={{
          apps: apps,
          desktop: { defaultIconSize: 1, defaultIconDirection: 0 },
          virtualDrive: {
            defaultData: {
              includePicturesFolder: false,
              includeDocumentsFolder: false,
              includeDesktopFolder: false,
              includeSourceTree: false,
              includeAppsFolder: false,
              includeScriptsFolder: false,
              includeAudioFolder: false,
              includeVideoFolder: false,
              loadData,
            },
          },
        }}
      >
        <Taskbar />
        <WindowsView />
        <ModalsView />
        <Desktop />
      </ProzillaOS>
    </div>
  );
}
