"use client";

import Link from "next/link";
import { ArrowUpRight, Code2, FileText, Wrench, ShieldCheck, Github, Mail, Moon } from "lucide-react";
import PlasmaVoid from "@/components/PlasmaVoid";

const destinations = [
  { name: "OS", path: "/os", domain: "sharma-raghav.com/os", icon: Code2 },
  { name: "Portfolio", path: "/portfolio", domain: "sharma-raghav.com/portfolio", icon: FileText },
  { name: "Tools", path: "https://tools.sharma-raghav.com", domain: "tools.sharma-raghav.com", icon: Wrench },
  { name: "DigiTrust", path: "https://digitrust.sharma-raghav.com", domain: "digitrust.sharma-raghav.com", icon: ShieldCheck },
  { name: "GitHub", path: "https://github.com/raghav19sh", domain: "github.com/raghav19sh", icon: Github },
  { name: "Contact", path: "mailto:contact@sharma-raghav.com", domain: "contact@sharma-raghav.com", icon: Mail },
];

export default function HomePage() {
  return (
    <main className="dark-minimal-home">
      <PlasmaVoid />
      <header className="dm-header">
        <Link href="/" className="dm-brand">RAGHAV SHARMA</Link>
        <nav aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/os">OS</Link>
          <Link href="/portfolio">Portfolio</Link>
          <a href="mailto:contact@sharma-raghav.com">Contact</a>
          <span className="dm-theme-mark" aria-label="Dark theme"><Moon size={14} /></span>
        </nav>
      </header>

      <section className="dm-hero">
        <p className="dm-index">PERSONAL WEBSPACE <span>/ 01</span></p>
        <div className="dm-hero-copy">
          <p className="dm-kicker">CYBERSECURITY · DIGITAL TRUST · SOFTWARE</p>
          <h1>Build.<br />Explore.<br /><em>Secure.</em></h1>
          <p className="dm-description">A collection of tools, experiments, and projects at the intersection of security and technology.</p>
        </div>
        <p className="dm-void-caption">SYSTEMS / RESEARCH / OPEN SOURCE</p>
      </section>

      <section className="dm-destinations" aria-label="Websites and projects">
        {destinations.map((item, index) => {
          const Icon = item.icon;
          const external = item.path.startsWith("http") || item.path.startsWith("mailto:");
          const inner = <><span className="dm-card-index">0{index + 1}</span><span className="dm-card-icon"><Icon size={18} strokeWidth={1.5} /></span><span className="dm-card-copy"><strong>{item.name}</strong><small>{item.domain}</small></span><ArrowUpRight className="dm-card-arrow" size={16} /></>;
          return external
            ? <a className="dm-card" key={item.name} href={item.path} target={item.path.startsWith("http") ? "_blank" : undefined} rel={item.path.startsWith("http") ? "noreferrer" : undefined}>{inner}</a>
            : <Link className="dm-card" key={item.name} href={item.path}>{inner}</Link>;
        })}
      </section>

      <footer className="dm-footer">
        <span><i /> INDIA · INDEPENDENT PROJECTS</span>
        <span>© {new Date().getFullYear()} RAGHAV SHARMA</span>
      </footer>
    </main>
  );
}
