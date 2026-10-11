import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github, Mail } from "lucide-react";

export const metadata = {
  title: "Portfolio — Raghav Sharma",
  description: "A concise CV and selected cybersecurity and software projects by Raghav Sharma.",
};

const skills = ["Cybersecurity", "Digital Forensics", "Python", "TypeScript", "Next.js", "Linux", "Networking", "Git"];

const projects = [
  { name: "DigiTrust", detail: "Digital trust and media analysis platform.", href: "https://digitrust.sharma-raghav.com" },
  { name: "Sharma-Raghav OS", detail: "A personal web workspace for projects and research.", href: "https://sharma-raghav.com/os" },
  { name: "QRishing Protection", detail: "QR-code phishing detection and user protection project.", href: "https://github.com/raghav19sh" },
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
        <p className="ec-summary">I’m a cybersecurity and digital forensics graduate interested in secure software, practical security research, and tools that strengthen digital trust.</p>
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
          <section className="ec-section">
            <p className="ec-label"><span>03</span> SELECTED WORK</p>
            {projects.map((project) => <a className="ec-project" key={project.name} href={project.href} target="_blank" rel="noreferrer"><span><strong>{project.name}</strong><small>{project.detail}</small></span><ArrowUpRight size={15} /></a>)}
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
