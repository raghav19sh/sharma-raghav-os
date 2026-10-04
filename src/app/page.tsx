import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Raghav Sharma",
  description: "Choose between Raghav Sharma's cybersecurity portfolio and online tools.",
};

const options = [
  {
    href: "/os",
    eyebrow: "01 / PORTFOLIO",
    title: "Portfolio",
    description: "Enter the cybersecurity workstation.",
    action: "Open OS",
  },
  {
    href: "https://tools.sharma-raghav.com",
    eyebrow: "02 / TOOLS",
    title: "Tools",
    description: "Useful online utilities for everyday work.",
    action: "Open Tools",
  },
];

export default function HomePage() {
  return (
    <main className="entry-page">
      <div className="entry-grid" aria-hidden="true" />
      <div className="entry-glow entry-glow-one" aria-hidden="true" />
      <div className="entry-glow entry-glow-two" aria-hidden="true" />

      <section className="entry-shell">
        <div className="entry-brand">
          <span className="entry-mark">RS</span>
          <span>SHARMA-RAGHAV</span>
        </div>

        <div className="entry-copy">
          <span className="entry-kicker">SELECT DESTINATION</span>
          <h1>What are you looking for?</h1>
          <p>Choose a workspace to continue.</p>
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

        <div className="entry-footer">
          <span>RAGHAV SHARMA</span>
          <span>SECURITY • ENGINEERING • TOOLS</span>
        </div>
      </section>
    </main>
  );
}
