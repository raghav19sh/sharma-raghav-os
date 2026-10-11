"use client";

import Link from "next/link";
import { ArrowUpRight, Globe2, Mail, Github, Code2, FileText, ShieldCheck, Wrench } from "lucide-react";

const destinations = [
  { name: "OS", host: "sharma-raghav.com/os", description: "Interactive personal operating system", href: "/os", icon: Code2, type: "INTERNAL" },
  { name: "PORTFOLIO", host: "sharma-raghav.com/portfolio", description: "CV, skills and selected work", href: "/portfolio", icon: FileText, type: "INTERNAL" },
  { name: "TOOLS", host: "tools.sharma-raghav.com", description: "Browser-based utilities", href: "https://tools.sharma-raghav.com", icon: Wrench, type: "SUBDOMAIN" },
  { name: "DIGITRUST", host: "digitrust.sharma-raghav.com", description: "Digital trust and media analysis", href: "https://digitrust.sharma-raghav.com", icon: ShieldCheck, type: "SUBDOMAIN" },
  { name: "GITHUB", host: "github.com/raghav19sh", description: "Repositories and open-source projects", href: "https://github.com/raghav19sh", icon: Github, type: "EXTERNAL" },
];

export default function HomePage() {
  return (
    <main className="directory-home">
      <header className="directory-header">
        <Link href="/" className="directory-wordmark">R<span>.</span>S</Link>
        <span className="directory-header-note">PERSONAL WEB DIRECTORY</span>
        <a className="directory-contact" href="mailto:contact@sharma-raghav.com">CONTACT <ArrowUpRight size={14} /></a>
      </header>

      <section className="directory-intro">
        <p className="directory-kicker">RAGHAV SHARMA <span>·</span> DIGITAL SPACE</p>
        <h1>One place.<br /><span>Every destination.</span></h1>
        <p className="directory-subtitle">A simple index of my work, tools and projects across the web.</p>
      </section>

      <section className="directory-list-section" aria-label="Domains and websites">
        <div className="directory-list-heading"><span>DESTINATION</span><span>DESCRIPTION</span><span>TYPE</span><span /></div>
        {destinations.map((item, index) => {
          const Icon = item.icon;
          const external = item.href.startsWith("http");
          const content = <>
            <span className="directory-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="directory-name"><span className="directory-icon"><Icon size={17} strokeWidth={1.7} /></span><span><strong>{item.name}</strong><small>{item.host}</small></span></span>
            <span className="directory-description">{item.description}</span>
            <span className="directory-type">{item.type}</span>
            <span className="directory-arrow"><ArrowUpRight size={16} /></span>
          </>;
          return external
            ? <a className="directory-row" href={item.href} key={item.name} target="_blank" rel="noreferrer">{content}</a>
            : <Link className="directory-row" href={item.href} key={item.name}>{content}</Link>;
        })}
      </section>

      <footer className="directory-footer">
        <span>SHARMA-RAGHAV.COM</span>
        <span><Globe2 size={13} /> INDEPENDENT WEB PROJECTS</span>
        <a href="mailto:contact@sharma-raghav.com"><Mail size={13} /> CONTACT</a>
      </footer>
    </main>
  );
}
