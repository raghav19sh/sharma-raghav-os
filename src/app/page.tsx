import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Raghav Sharma — Cybersecurity Portfolio & Tools",
  description:
    "Explore Raghav Sharma's cybersecurity portfolio, research, projects, security lab, and browser-based utility tools.",
};

const options = [
  {
    href: "/os",
    eyebrow: "01 / PORTFOLIO",
    title: "Portfolio",
    description:
      "Explore cybersecurity projects, research, security work, and the interactive portfolio workstation.",
    action: "Open Portfolio",
  },
  {
    href: "https://tools.sharma-raghav.com",
    eyebrow: "02 / TOOLS",
    title: "Tools",
    description:
      "Use browser-based utilities for images, PDFs, calculations, developer tasks, conversions, and more.",
    action: "Open Tools",
  },
  {
    href: "https://digitrust.sharma-raghav.com",
    eyebrow: "03 / DIGITAL TRUST",
    title: "DigiTrust",
    description:
      "Analyze online claims with transparent trust signals across fact checks, coverage, domain reputation, and language.",
    action: "Open DigiTrust",
  },
];

export default function HomePage() {
  return (
    <main className="entry-page">
      <div className="entry-grid" aria-hidden="true" />
      <div className="entry-glow entry-glow-one" aria-hidden="true" />
      <div className="entry-glow entry-glow-two" aria-hidden="true" />

      <a className="entry-contact-widget" href="tel:+918605532112" aria-label="Call Raghav Sharma">
        <span className="entry-contact-label">DIRECT CONTACT</span>
        <strong>+91 86055 32112</strong>
        <span className="entry-contact-action">CALL ↗</span>
      </a>

      <section className="entry-shell">
        <div className="entry-brand">
          <span className="entry-mark">RS</span>
          <span>SHARMA-RAGHAV</span>
        </div>

        <div className="entry-copy">
          <span className="entry-kicker">CYBERSECURITY • ENGINEERING • TOOLS</span>
          <h1>Raghav Sharma</h1>
          <p>
            Explore my cybersecurity portfolio, research, practical projects, and a collection
            of browser-based tools built for everyday work.
          </p>
        </div>

        <div className="entry-options">
          {options.map((option) => (
            <Link className="entry-option" href={option.href} key={option.href}>
              <div className="entry-option-top">
                <span>{option.eyebrow}</span>
                <span className="entry-arrow">↗</span>
              </div>
              <div className="entry-option-main">
                <h2>{option.title}</h2>
                <p>{option.description}</p>
              </div>
              <span className="entry-action">{option.action}</span>
            </Link>
          ))}
        </div>

        <div className="entry-info">
          <div>
            <span>PORTFOLIO</span>
            <strong>Projects · Research · Security Lab</strong>
          </div>
          <div>
            <span>TOOLS</span>
            <strong>Images · PDFs · Calculators · Developer</strong>
          </div>
          <div>
            <span>DIGITRUST</span>
            <strong>Trust Signals · Fact Checks · Coverage</strong>
          </div>
        </div>

        <div className="entry-footer">
          <span>RAGHAV SHARMA</span>
          <span>SHARMA-RAGHAV.COM</span>
        </div>
      </section>
    </main>
  );
}
