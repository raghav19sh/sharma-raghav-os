import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github, Mail, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Portfolio — Raghav Sharma",
  description: "Minimal CV and selected cybersecurity and software projects by Raghav Sharma.",
};

const skills = ["Cybersecurity", "Digital Forensics", "Python", "TypeScript", "Next.js", "Linux", "Networking", "Git"];

const projects = [
  { name: "DigiTrust", detail: "Digital trust and media analysis platform.", href: "https://digitrust.sharma-raghav.com" },
  { name: "Sharma-Raghav OS", detail: "Personal web workspace for projects, research and security tools.", href: "https://sharma-raghav.com/os" },
  { name: "QRishing Protection", detail: "Project exploring QR-code phishing detection and user protection.", href: "https://github.com/raghav19sh" },
];

export default function PortfolioPage() {
  return (
    <main className="cv-page">
      <header className="cv-header">
        <Link href="/" className="cv-wordmark">R<span>.</span>S</Link>
        <span>CURRICULUM VITAE / 2026</span>
        <Link href="/" className="cv-back"><ArrowLeft size={14} /> INDEX</Link>
      </header>

      <section className="cv-intro">
        <p className="cv-kicker">CYBERSECURITY · SOFTWARE</p>
        <h1>Raghav Sharma</h1>
        <p className="cv-summary">Cybersecurity and Digital Forensics graduate interested in secure software, security research, and practical tools that improve digital trust.</p>
        <div className="cv-contact-row">
          <a href="mailto:contact@sharma-raghav.com"><Mail size={14} /> contact@sharma-raghav.com</a>
          <a href="https://github.com/raghav19sh" target="_blank" rel="noreferrer"><Github size={14} /> GitHub <ArrowUpRight size={12}/></a>
          <span><ShieldCheck size={14} /> Cybersecurity & Forensics</span>
        </div>
      </section>

      <div className="cv-columns">
        <section className="cv-section">
          <p className="cv-section-label">01 / EDUCATION</p>
          <div className="cv-item">
            <h2>B.Tech — Computer Science Engineering</h2>
            <p className="cv-item-meta">Specialization: Cyber Security and Forensics</p>
            <p className="cv-item-detail">MIT ADT University, Pune</p>
          </div>
        </section>

        <section className="cv-section">
          <p className="cv-section-label">02 / EXPERIENCE</p>
          <div className="cv-item">
            <h2>Business Analyst Virtual Internship</h2>
            <p className="cv-item-meta">Celonis · Virtual Experience</p>
            <p className="cv-item-detail">Exposure to process analysis, business workflows, and data-driven improvement.</p>
          </div>
        </section>

        <section className="cv-section cv-project-section">
          <p className="cv-section-label">03 / SELECTED PROJECTS</p>
          {projects.map((project) => (
            <a className="cv-project" key={project.name} href={project.href} target="_blank" rel="noreferrer">
              <span><strong>{project.name}</strong><small>{project.detail}</small></span>
              <ArrowUpRight size={15} />
            </a>
          ))}
        </section>

        <section className="cv-section">
          <p className="cv-section-label">04 / TECHNICAL SKILLS</p>
          <div className="cv-skills">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
        </section>
      </div>

      <footer className="cv-footer">
        <span>RAGHAV SHARMA / PORTFOLIO</span>
        <span>For opportunities and collaboration</span>
        <a href="mailto:contact@sharma-raghav.com">GET IN TOUCH <ArrowUpRight size={12}/></a>
      </footer>
    </main>
  );
}
