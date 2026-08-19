"use client";

import { useEffect, useRef, useState } from "react";

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
  const [phase, setPhase] = useState<"assemble" | "walk" | "exit">("assemble");
  const finishing = useRef(false);

  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const key = "rsos-boot-sequence-v1";
    if (window.sessionStorage.getItem(key)) return;

    setVisible(true);
    document.documentElement.classList.add("rsos-boot-active");

    // Give the fragments time to form before the penguin starts its journey.
    const walkTimer = window.setTimeout(() => setPhase("walk"), 1850);

    // Safety fallback. The animationend handler normally finishes the intro
    // exactly when the penguin exits the right side of the viewport.
    const fallbackTimer = window.setTimeout(() => finish(), 9800);

    function finish() {
      if (finishing.current) return;
      finishing.current = true;
      window.sessionStorage.setItem(key, "1");
      setPhase("exit");

      window.setTimeout(() => {
        document.documentElement.classList.remove("rsos-boot-active");
        setVisible(false);
      }, 720);
    }

    (window as Window & { __rsosBootFinish?: () => void }).__rsosBootFinish = finish;

    return () => {
      window.clearTimeout(walkTimer);
      window.clearTimeout(fallbackTimer);
      delete (window as Window & { __rsosBootFinish?: () => void }).__rsosBootFinish;
      document.documentElement.classList.remove("rsos-boot-active");
    };
  }, []);

  function enter() {
    const finish = (window as Window & { __rsosBootFinish?: () => void }).__rsosBootFinish;
    if (finish) finish();
  }

  function onPenguinAnimationEnd(event: React.AnimationEvent<HTMLDivElement>) {
    if (event.animationName === "rsosPenguinWalk") {
      enter();
    }
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

      <div className="rsos-boot__top">
        <span>R.S OS</span>
        <span>INITIALIZING SYSTEM</span>
      </div>

      <div className="rsos-boot__stage">
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

        <div
          className="rsos-boot__penguin"
          onAnimationEnd={onPenguinAnimationEnd}
          aria-hidden="true"
        >
          <div className="rsos-boot__penguin-shadow" />
          <svg
            className="rsos-boot__penguin-svg"
            viewBox="0 0 300 420"
            role="presentation"
          >
            {/* Low-poly penguin silhouette */}
            <polygon className="penguin-white" points="149,52 193,86 214,150 208,239 185,315 151,349 116,318 91,243 91,153 108,91" />
            <polygon className="penguin-black" points="149,52 193,86 180,125 151,143 119,126 108,91" />
            <polygon className="penguin-black" points="91,153 119,126 151,143 143,224 112,255 91,243" />
            <polygon className="penguin-dark" points="151,143 180,125 208,150 208,239 183,264 143,224" />
            <polygon className="penguin-gray" points="112,255 143,224 183,264 185,315 151,349 116,318" />

            {/* Face */}
            <polygon className="penguin-face" points="129,70 154,57 183,78 176,105 151,116 126,101" />
            <polygon className="penguin-beak" points="176,80 218,91 178,103" />
            <circle className="penguin-eye" cx="168" cy="77" r="5" />

            {/* Flippers */}
            <polygon className="penguin-flipper penguin-flipper-left" points="102,145 72,193 55,255 83,239 111,188" />
            <polygon className="penguin-flipper penguin-flipper-right" points="195,145 227,194 244,251 215,237 186,188" />

            {/* Feet — animated independently to sell the walk */}
            <g className="penguin-foot penguin-foot-left">
              <polygon points="113,311 82,347 121,352 143,334" />
            </g>
            <g className="penguin-foot penguin-foot-right">
              <polygon points="171,315 164,350 211,346 189,327" />
            </g>

            {/* Facets */}
            <polygon className="penguin-facet" points="119,126 151,143 143,185 112,166" />
            <polygon className="penguin-facet" points="180,125 208,150 176,177 151,143" />
            <polygon className="penguin-facet-light" points="143,224 176,177 183,221" />
          </svg>
        </div>

        <div className="rsos-boot__walk-caption">
          <span>R.S OS</span>
          <span>ENTERING SYSTEM</span>
        </div>
      </div>

      <button className="rsos-boot__skip" onClick={enter} type="button">
        SKIP INTRO
      </button>

      <div className="rsos-boot__progress" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
