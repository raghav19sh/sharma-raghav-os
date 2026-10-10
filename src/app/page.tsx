"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const destinations = [
  {
    number: "01",
    label: "PERSONAL WORKSTATION",
    title: "Portfolio",
    description: "Projects, security research, experiments, and the systems behind them.",
    href: "/os",
    action: "Launch workspace",
    mark: "↗",
    className: "arch-card-work",
  },
  {
    number: "02",
    label: "SMALL UTILITIES · BIG USE",
    title: "Tools",
    description: "Browser-based utilities for images, PDFs, conversions, and developer tasks.",
    href: "https://tools.sharma-raghav.com",
    action: "Browse tools",
    mark: "⌘",
    className: "arch-card-tools",
  },
  {
    number: "03",
    label: "DIGITAL TRUST",
    title: "DigiTrust",
    description: "Explore signals that help evaluate online claims, sources, and domains.",
    href: "https://digitrust.sharma-raghav.com",
    action: "Explore project",
    mark: "◎",
    className: "arch-card-trust",
  },
];

export default function HomePage() {
  const [now, setNow] = useState<Date | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 1000);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const onMotionChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    media.addEventListener("change", onMotionChange);
    return () => {
      window.clearInterval(timer);
      media.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <main className={`arch-home${reducedMotion ? " arch-reduced-motion" : ""}`}>
      <div className="arch-noise" aria-hidden="true" />
      <header className="arch-nav">
        <Link className="arch-brand" href="/" aria-label="Raghav Sharma home">
          <span className="arch-logo">r<span>.</span></span>
          <span className="arch-brand-copy">
            <strong>RAGHAV SHARMA</strong>
            <small>INDEPENDENT / SECURITY + SOFTWARE</small>
          </span>
        </Link>
        <nav className="arch-nav-links" aria-label="Main navigation">
          <Link href="/os">Workspace <span>↗</span></Link>
          <a href="https://tools.sharma-raghav.com">Tools <span>↗</span></a>
          <a href="https://digitrust.sharma-raghav.com">DigiTrust <span>↗</span></a>
        </nav>
        <div className="arch-clock" aria-label="Local time">
          <span className="arch-clock-dot" />
          <span>{now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}</span>
        </div>
      </header>

      <section className="arch-hero">
        <div className="arch-hero-copy">
          <div className="arch-prompt"><span>raghav@sharma-raghav</span><b>:</b><i>~</i><em>$ whoami</em></div>
          <p className="arch-eyebrow">CYBERSECURITY <span>✳</span> ENGINEERING <span>✳</span> OPEN WEB</p>
          <h1>Curious by nature.<br /><span>Secure by design.</span></h1>
          <p className="arch-intro">
            I build practical tools, explore how systems break, and work on ideas that make the digital world more trustworthy.
          </p>
          <div className="arch-hero-actions">
            <Link className="arch-button-primary" href="/os">Enter workspace <span>↗</span></Link>
            <a className="arch-button-secondary" href="#projects">Explore projects <span>↓</span></a>
          </div>
          <div className="arch-terminal-line">
            <span className="arch-terminal-check">✓</span>
            <span>Building, breaking, learning — one system at a time.</span>
            <span className="arch-cursor" aria-hidden="true" />
          </div>
        </div>

        <div className="arch-visual" aria-label="Abstract animated orbital system">
          <div className="arch-visual-label arch-label-top"><span>FIG. 01</span> SYSTEMS IN MOTION</div>
          <div className="arch-orbit arch-orbit-one"><span className="arch-node arch-node-cyan" /></div>
          <div className="arch-orbit arch-orbit-two"><span className="arch-node arch-node-lime" /></div>
          <div className="arch-orbit arch-orbit-three"><span className="arch-node arch-node-white" /></div>
          <div className="arch-core"><span>SR</span></div>
          <div className="arch-crosshair arch-crosshair-h" />
          <div className="arch-crosshair arch-crosshair-v" />
          <div className="arch-coordinate arch-coordinate-left">37° 46' 49.2"N</div>
          <div className="arch-coordinate arch-coordinate-right">SYSTEM / 001</div>
          <div className="arch-visual-label arch-label-bottom"><span className="arch-signal" /> IDEAS → EXPERIMENTS → IMPACT</div>
        </div>
      </section>

      <section className="arch-section" id="projects">
        <div className="arch-section-heading">
          <div>
            <p className="arch-eyebrow">DIRECTORIES / 01—03</p>
            <h2>Pick a direction<span>.</span></h2>
          </div>
          <p className="arch-section-note">A few corners of my digital workspace.<br />Choose one to explore.</p>
        </div>
        <div className="arch-cards">
          {destinations.map((item) => (
            <Link className={`arch-card ${item.className}`} href={item.href} key={item.number}>
              <div className="arch-card-meta"><span>{item.number} / {item.label}</span><span className="arch-card-mark">{item.mark}</span></div>
              <div className="arch-card-art" aria-hidden="true">
                {item.number === "01" ? <div className="arch-art-terminal"><span>~/workspace</span><b>$</b><i /><i /><i /></div> : item.number === "02" ? <div className="arch-art-tools"><span>▧</span><span>⌁</span><span>↔</span><span>▤</span></div> : <div className="arch-art-trust"><span>◎</span><i /><b /></div>}
              </div>
              <div className="arch-card-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <div className="arch-card-action">{item.action}<span>↗</span></div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="arch-footer">
        <span>© {now ? now.getFullYear() : "2026"} RAGHAV SHARMA</span>
        <span className="arch-footer-center"><i /> DESIGNED TO KEEP EXPLORING</span>
        <a href="mailto:contact@sharma-raghav.com">GET IN TOUCH ↗</a>
      </footer>
    </main>
  );
}
