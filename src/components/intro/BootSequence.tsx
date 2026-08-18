"use client";

import { useEffect, useState } from "react";

const PIECES = [
  { x: 8, y: 18, r: -18, d: 0 },
  { x: 21, y: 10, r: 22, d: 60 },
  { x: 36, y: 17, r: -34, d: 120 },
  { x: 63, y: 13, r: 28, d: 180 },
  { x: 79, y: 22, r: -12, d: 240 },
  { x: 90, y: 36, r: 40, d: 300 },
  { x: 12, y: 48, r: 34, d: 90 },
  { x: 27, y: 40, r: -24, d: 150 },
  { x: 72, y: 43, r: 18, d: 210 },
  { x: 86, y: 55, r: -30, d: 270 },
  { x: 7, y: 72, r: 16, d: 330 },
  { x: 23, y: 78, r: -38, d: 30 },
  { x: 41, y: 72, r: 20, d: 210 },
  { x: 60, y: 78, r: -16, d: 270 },
  { x: 77, y: 72, r: 32, d: 330 },
  { x: 92, y: 78, r: -26, d: 150 },
];

export function BootSequence() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"assemble" | "hold" | "exit">("assemble");

  useEffect(() => {
    // The cinematic boot belongs only to the public homepage.
    if (window.location.pathname !== "/") return;

    const key = "rsos-boot-sequence-v1";
    if (window.sessionStorage.getItem(key)) return;

    setVisible(true);
    document.documentElement.classList.add("rsos-boot-active");

    const holdTimer = window.setTimeout(() => setPhase("hold"), 2200);
    const exitTimer = window.setTimeout(() => setPhase("exit"), 3900);
    const removeTimer = window.setTimeout(() => {
      window.sessionStorage.setItem(key, "1");
      document.documentElement.classList.remove("rsos-boot-active");
      setVisible(false);
    }, 4850);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
      document.documentElement.classList.remove("rsos-boot-active");
    };
  }, []);

  function enter() {
    window.sessionStorage.setItem("rsos-boot-sequence-v1", "1");
    document.documentElement.classList.remove("rsos-boot-active");
    setPhase("exit");
    window.setTimeout(() => setVisible(false), 650);
  }

  if (!visible) return null;

  return (
    <div
      className={`rsos-boot rsos-boot--${phase}`}
      role="dialog"
      aria-label="R.S OS introduction"
    >
      <div className="rsos-boot__grain" />
      <div className="rsos-boot__grid" />

      <div className="rsos-boot__center">
        <div className="rsos-boot__fragments" aria-hidden="true">
          {PIECES.map((piece, index) => (
            <span
              key={index}
              className="rsos-boot__piece"
              style={
                {
                  "--x": `${piece.x}%`,
                  "--y": `${piece.y}%`,
                  "--r": `${piece.r}deg`,
                  "--delay": `${piece.d}ms`,
                } as React.CSSProperties
              }
            />
          ))}
          <span className="rsos-boot__core" />
        </div>

        <div className="rsos-boot__identity">
          <div className="rsos-boot__monogram">R.S</div>
          <div className="rsos-boot__name">RAGHAV SHARMA</div>
          <div className="rsos-boot__descriptor">
            CYBERSECURITY · SYSTEMS · DIGITAL FORENSICS
          </div>
        </div>
      </div>

      <div className="rsos-boot__top">
        <span>R.S OS</span>
        <span>INITIALIZING SYSTEM</span>
      </div>

      <button className="rsos-boot__enter" onClick={enter} type="button">
        <span>ENTER SYSTEM</span>
        <span className="rsos-boot__arrow">↗</span>
      </button>

      <div className="rsos-boot__progress" aria-hidden="true">
        <span />
      </div>

      <button className="rsos-boot__skip" onClick={enter} type="button">
        SKIP INTRO
      </button>
    </div>
  );
}
