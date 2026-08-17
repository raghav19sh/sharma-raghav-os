"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * ACCESSIBILITY FIX (audit finding C, PLAN.md):
 * the previous version put `aria-hidden="true"` on the outer <svg> while
 * `role="link" tabIndex={0}` callouts lived inside it — those links were
 * unreachable by screen readers, and SVG focus semantics are inconsistent
 * across browsers even when aria-hidden is removed. Fixed two ways here:
 *   1. The four destinations are real, semantic <a> elements in an
 *      always-present (not visually hidden) list under the globe — this is
 *      the actual accessible path, not a fallback nobody uses.
 *   2. Because the real links now exist outside the SVG, the SVG itself
 *      can safely stay aria-hidden — it's purely decorative once the real
 *      navigation lives in HTML.
 */

const toRad = (d: number) => (d * Math.PI) / 180;

function fibonacciSphere(n: number) {
  const pts: { phi: number; lambda: number }[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    pts.push({ phi: Math.asin(y) * (180 / Math.PI), lambda: Math.atan2(x, z) * (180 / Math.PI) });
  }
  return pts;
}
const FIB_POINTS = fibonacciSphere(150);

function project(phi: number, lambda: number, rotation: number, cx: number, cy: number, r: number) {
  const lamR = toRad(lambda - rotation);
  const phiR = toRad(phi);
  const x3 = Math.cos(phiR) * Math.sin(lamR);
  const y3 = Math.sin(phiR);
  const z3 = Math.cos(phiR) * Math.cos(lamR);
  return { x: cx + r * x3, y: cy - r * y3, z: z3 };
}

const GCX = 300, GCY = 232, GR = 104;

const MODULES = [
  { title: "Research OS", desc: "Papers, drafts and citation graph.", href: "/research" },
  { title: "Security Lab", desc: "Interactive tools and threat intel.", href: "/security-lab" },
  { title: "Engineering OS", desc: "Projects, releases and deployments.", href: "/engineering" },
  { title: "Observatory", desc: "Live analytics and platform health.", href: "/observatory" },
];

function GlobeDots({ reduced }: { reduced: boolean }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setRotation((r) => (r + 0.5) % 360), 50);
    return () => clearInterval(id);
  }, [reduced]);

  const dots = useMemo(
    () => FIB_POINTS.map((p) => project(p.phi, p.lambda, rotation, GCX, GCY, GR)).filter((p) => p.z > 0.04),
    [rotation]
  );

  return (
    <>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={0.9 + d.z * 1.7} fill="var(--globe-dot)" opacity={0.25 + d.z * 0.65} />
      ))}
    </>
  );
}

export function HeroGlobe({ countries }: { countries?: number }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      const stored = window.localStorage.getItem("sr-os-reduced-motion");
      setReduced(stored === "true" || mq.matches);
    };

    apply();
    const mediaHandler = () => apply();
    const storageHandler = (event: StorageEvent) => {
      if (event.key === "sr-os-reduced-motion") apply();
    };
    const motionHandler = () => apply();

    mq.addEventListener("change", mediaHandler);
    window.addEventListener("storage", storageHandler);
    window.addEventListener("sr-os-motion-change", motionHandler);
    return () => {
      mq.removeEventListener("change", mediaHandler);
      window.removeEventListener("storage", storageHandler);
      window.removeEventListener("sr-os-motion-change", motionHandler);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Decorative only — the real navigation is the list below, which is
          why this whole subtree can be aria-hidden without losing anything
          for assistive tech. */}
      <svg viewBox="0 0 600 460" className="w-full h-auto max-w-[560px] overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id="globeLit" cx="34%" cy="30%" r="75%">
            <stop offset="0%" stopColor="var(--globe-lit)" />
            <stop offset="55%" stopColor="var(--globe-mid)" />
            <stop offset="100%" stopColor="var(--globe-dark)" />
          </radialGradient>
        </defs>
        <circle cx={GCX} cy={GCY} r={GR} fill="url(#globeLit)" stroke="var(--border-strong)" strokeWidth="1" />
        <GlobeDots reduced={reduced} />
      </svg>

      {countries !== undefined && (
        <p className="text-[12px] text-text-2 mt-1">
          {countries} {countries === 1 ? "country" : "countries"} in visitor analytics — see{" "}
          <a href="/observatory" className="underline">Observatory</a>.
        </p>
      )}

      {/* The real, accessible navigation. Always visible — not a
          screen-reader-only fallback — because a visible list of four
          module links is genuinely useful on its own, independent of the
          decorative sphere above it. */}
      <nav aria-label="Explore platform modules" className="w-full mt-4">
        <ul className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
          {MODULES.map((m) => (
            <li key={m.href}>
              <a
                href={m.href}
                className="block rounded-[10px] border border-border bg-surface px-3.5 py-3 hover:border-lavender transition-colors duration-fast"
              >
                <span className="block text-[12.5px] font-semibold text-text-1">{m.title}</span>
                <span className="block text-[11.5px] text-text-2 mt-0.5">{m.desc}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
