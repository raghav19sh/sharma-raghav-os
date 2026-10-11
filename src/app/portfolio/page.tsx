import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github, Mail } from "lucide-react";

export const metadata = {
  title: "Portfolio — Raghav Sharma",
  description: "CV, cybersecurity projects, software tools, and open-source work by Raghav Sharma.",
};

const skills = ["Cybersecurity", "Digital Forensics", "Python", "TypeScript", "Next.js", "Linux", "Networking", "Git", "Media Analysis", "Web Development"];
const projects = [
  { name: "DigiTrust", category: "Digital Trust", detail: "Media and content analysis platform exploring signals that help assess digital trust.", href: "https://github.com/raghav19sh/digital-trust" },
  { name: "Sharma-Raghav OS", category: "Web / Personal OS", detail: "Interactive personal web workspace with project, research, and security sections.", href: "https://github.com/raghav19sh/sharma-raghav-os" },
  { name: "Sharma-Raghav Tools", category: "Web Utilities", detail: "Browser-based utilities for working with images and documents.", href: "https://github.com/raghav19sh/sharma-raghav-tools" },
  { name: "Sign Language Translator", category: "Computer Vision", detail: "Camera-based sign-language translation interface with frontend and model/API integration.", href: "https://github.com/raghav19sh/sign-lang-translator" },
  { name: "QRishing Protection", category: "Application Security", detail: "QR-code phishing research and protection against malicious QR destinations.", href: "https://github.com/raghav19sh/Qishing-qr-phishing" },
  { name: "QR Malware Scanner", category: "Security Tool", detail: "QR-focused scanning project for investigating potentially malicious links and payloads.", href: "https://github.com/raghav19sh/qr-malware-scanner" },
  { name: "SOC Log Parser", category: "Blue Team / Python", detail: "Log-parsing project for security operations and event-investigation workflows.", href: "https://github.com/raghav19sh/soc-log-parser" },
  { name: "SR-Journal", category: "Privacy / Mobile", detail: "Private video-journaling app concept with calendar-based entries and privacy-first storage goals.", href: "https://github.com/raghav19sh/SR-Journal" },
  { name: "Vulnerability Testing", category: "Security Testing", detail: "Repository for vulnerability testing and security experimentation.", href: "https://github.com/raghav19sh/test-vulnerability" },
  { name: "Personal Website", category: "Web / Portfolio", detail: "Source for this domain directory and editorial portfolio.", href: "https://github.com/raghav19sh/sharma-raghav.com" },
  { name: "Android Studio", category: "Android Development", detail: "Android development experiments and related project work.", href: "https://github.com/raghav19sh/androidstudio" },
  { name: "GitHub Profile README", category: "Developer Profile", detail: "Profile documentation and public developer presence.", href: "https://github.com/raghav19sh/raghav19sh" },
  { name: "First Contributions", category: "Open Source", detail: "Repository associated with learning and making open-source contributions.", href: "https://github.com/raghav19sh/first-contributions" },
];

export default function PortfolioPage() {
  return (
    <main className="editorial-cv">
      <header className="ec-header">
        <Link href="/" className="ec-monogram">R<span>.</span>S</Link>
        <span className="ec-header-label">CURRICULUM VITAE <i /> 2026</span>
        <Link href="/" className="ec-back"><ArrowLeft size={13} /> INDEX</Link>
      </header>
      <section className="ec-intro">
        <p className="ec-kicker">CYBERSECURITY & DIGITAL FORENSICS</p>
        <h1>Raghav<br /><em>Sharma.</em></h1>
        <p className="ec-summary">A cybersecurity and digital forensics graduate interested in secure software, practical security research, and tools that strengthen digital trust.</p>
        <div className="ec-contact">
          <a href="mailto:contact@sharma-raghav.com"><Mail size={14} /> contact@sharma-raghav.com</a>
          <a href="https://github.com/raghav19sh" target="_blank" rel="noreferrer"><Github size={14} /> GitHub <ArrowUpRight size={12} /></a>
        </div>
      </section>
      <div className="ec-body">
        <aside className="ec-aside">
          <p>BASED IN</p><strong>India</strong>
          <p>FOCUS</p><strong>Security · Systems · Trust</strong>
          <p>ONLINE</p><a href="https://github.com/raghav19sh" target="_blank" rel="noreferrer">github.com/raghav19sh <ArrowUpRight size={12} /></a>
        </aside>
        <div className="ec-main">
          <section className="ec-section">
            <p className="ec-label"><span>01</span> EDUCATION</p>
            <h2>B.Tech, Computer Science Engineering</h2>
            <p className="ec-meta">Cyber Security and Forensics · MIT ADT University, Pune</p>
          </section>
          <section className="ec-section">
            <p className="ec-label"><span>02</span> EXPERIENCE</p>
            <h2>Business Analyst Virtual Internship</h2>
            <p className="ec-meta">Celonis · Virtual Experience</p>
            <p className="ec-detail">Exposure to process analysis, business workflows, and data-driven improvement.</p>
          </section>
          <section className="ec-section ec-work-section">
            <p className="ec-label"><span>03</span> PROJECTS & REPOSITORIES <span className="ec-count">13</span></p>
            <div className="ec-project-list">
              {projects.map((project, index) => <a className="ec-project" key={project.name} href={project.href} target="_blank" rel="noreferrer"><span className="ec-project-index">{String(index + 1).padStart(2, "0")}</span><span className="ec-project-copy"><span className="ec-project-meta">{project.category}</span><strong>{project.name}</strong><small>{project.detail}</small></span><ArrowUpRight size={15} /></a>)}
            </div>
          </section>
          <section className="ec-section">
            <p className="ec-label"><span>04</span> TECHNICAL SKILLS</p>
            <div className="ec-skills">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
          </section>
        </div>
      </div>
      <footer className="ec-footer"><span>RAGHAV SHARMA</span><span>Open to meaningful work and collaboration</span><a href="mailto:contact@sharma-raghav.com">GET IN TOUCH <ArrowUpRight size={12} /></a></footer>
    </main>
  );
}
