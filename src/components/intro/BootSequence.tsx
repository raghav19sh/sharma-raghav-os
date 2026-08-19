"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_KEY = "rsos-boot-sequence-v1";

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

type BootWindow = Window & {
  __rsosBootFinish?: () => void;
};

export function BootSequence() {
  const [visible, setVisible] = useState(false);

  const [phase, setPhase] = useState<
    "assemble" | "walk" | "exit"
  >("assemble");

  const finishing = useRef(false);

  useEffect(() => {
    /*
     * INTRO ONLY RUNS ON THE HOMEPAGE
     */
    if (window.location.pathname !== "/") {
      return;
    }

    const params = new URLSearchParams(
      window.location.search
    );

    /*
     * DEVELOPMENT CONTROLS
     *
     * ?intro=reset
     * Clears the session flag and plays the intro.
     *
     * ?intro=1
     * Forces the intro for this visit.
     */
    const resetRequested =
      params.get("intro") === "reset";

    const forceRequested =
      params.get("intro") === "1" ||
      params.get("intro") === "true";

    /*
     * RESET INTRO
     */
    if (resetRequested) {
      window.sessionStorage.removeItem(BOOT_KEY);

      /*
       * Remove the query parameter after processing it.
       */
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }

    /*
     * NORMAL SESSION BEHAVIOR
     *
     * If the intro has already played during this
     * browser session, don't show it again.
     */
    if (
      !forceRequested &&
      window.sessionStorage.getItem(BOOT_KEY) === "1"
    ) {
      return;
    }

    /*
     * START INTRO
     */
    finishing.current = false;

    setPhase("assemble");
    setVisible(true);

    document.documentElement.classList.add(
      "rsos-boot-active"
    );

    /*
     * FINISH INTRO
     */
    const finish = () => {
      if (finishing.current) {
        return;
      }

      finishing.current = true;

      /*
       * Mark as seen immediately.
       */
      window.sessionStorage.setItem(
        BOOT_KEY,
        "1"
      );

      /*
       * Start exit animation.
       */
      setPhase("exit");

      /*
       * Give the exit animation time to complete.
       */
      window.setTimeout(() => {
        document.documentElement.classList.remove(
          "rsos-boot-active"
        );

        setVisible(false);
      }, 720);
    };

    /*
     * Expose finish temporarily so the penguin
     * animation and SKIP button can use it.
     */
    const bootWindow = window as BootWindow;

    bootWindow.__rsosBootFinish = finish;

    /*
     * FRAGMENT ASSEMBLY
     *
     * After 1.85 seconds the penguin starts walking.
     */
    const walkTimer = window.setTimeout(() => {
      if (!finishing.current) {
        setPhase("walk");
      }
    }, 1850);

    /*
     * SAFETY FALLBACK
     *
     * If animationend doesn't fire for some reason,
     * the intro still finishes.
     */
    const fallbackTimer = window.setTimeout(() => {
      finish();
    }, 9800);

    /*
     * CLEANUP
     */
    return () => {
      window.clearTimeout(walkTimer);
      window.clearTimeout(fallbackTimer);

      if (
        bootWindow.__rsosBootFinish === finish
      ) {
        delete bootWindow.__rsosBootFinish;
      }

      document.documentElement.classList.remove(
        "rsos-boot-active"
      );
    };
  }, []);

  /*
   * ENTER SYSTEM
   */
  function enter() {
    const bootWindow = window as BootWindow;

    if (bootWindow.__rsosBootFinish) {
      bootWindow.__rsosBootFinish();
    }
  }

  /*
   * PENGUIN FINISHED WALKING
   */
  function onPenguinAnimationEnd(
    event: React.AnimationEvent<HTMLDivElement>
  ) {
    if (
      event.animationName ===
      "rsosPenguinWalk"
    ) {
      enter();
    }
  }

  /*
   * Don't render anything when intro is inactive.
   */
  if (!visible) {
    return null;
  }

  return (
    <div
      className={`rsos-boot rsos-boot--${phase}`}
      role="dialog"
      aria-label="R.S OS introduction"
    >
      {/* BACKGROUND EFFECTS */}
      <div className="rsos-boot__grain" />
      <div className="rsos-boot__grid" />

      {/* TOP STATUS */}
      <div className="rsos-boot__top">
        <span>R.S OS</span>

        <span>
          INITIALIZING SYSTEM
        </span>
      </div>

      {/* MAIN STAGE */}
      <div className="rsos-boot__stage">

        {/* LOGO FRAGMENTS */}
        <div
          className="rsos-boot__fragments"
          aria-hidden="true"
        >
          {PIECES.map(
            (piece, index) => (
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
            )
          )}

          <span className="rsos-boot__core" />
        </div>

        {/* IDENTITY */}
        <div className="rsos-boot__identity">

          <div className="rsos-boot__monogram">
            R.S
          </div>

          <div className="rsos-boot__name">
            RAGHAV SHARMA
          </div>

          <div className="rsos-boot__descriptor">
            CYBERSECURITY · SYSTEMS · DIGITAL FORENSICS
          </div>

        </div>

        {/* PENGUIN */}
        <div
          className="rsos-boot__penguin"
          onAnimationEnd={
            onPenguinAnimationEnd
          }
          aria-hidden="true"
        >
          <div className="rsos-boot__penguin-shadow" />

          <svg
            className="rsos-boot__penguin-svg"
            viewBox="0 0 300 420"
            role="presentation"
          >

            {/* BODY */}

            <polygon
              className="penguin-white"
              points="
                149,52
                193,86
                214,150
                208,239
                185,315
                151,349
                116,318
                91,243
                91,153
                108,91
              "
            />

            <polygon
              className="penguin-black"
              points="
                149,52
                193,86
                180,125
                151,143
                119,126
                108,91
              "
            />

            <polygon
              className="penguin-black"
              points="
                91,153
                119,126
                151,143
                143,224
                112,255
                91,243
              "
            />

            <polygon
              className="penguin-dark"
              points="
                151,143
                180,125
                208,150
                208,239
                183,264
                143,224
              "
            />

            <polygon
              className="penguin-gray"
              points="
                112,255
                143,224
                183,264
                185,315
                151,349
                116,318
              "
            />

            {/* FACE */}

            <polygon
              className="penguin-face"
              points="
                129,70
                154,57
                183,78
                176,105
                151,116
                126,101
              "
            />

            <polygon
              className="penguin-beak"
              points="
                176,80
                218,91
                178,103
              "
            />

            <circle
              className="penguin-eye"
              cx="168"
              cy="77"
              r="5"
            />

            {/* LEFT FLIPPER */}

            <polygon
              className="
                penguin-flipper
                penguin-flipper-left
              "
              points="
                102,145
                72,193
                55,255
                83,239
                111,188
              "
            />

            {/* RIGHT FLIPPER */}

            <polygon
              className="
                penguin-flipper
                penguin-flipper-right
              "
              points="
                195,145
                227,194
                244,251
                215,237
                186,188
              "
            />

            {/* LEFT FOOT */}

            <g className="
              penguin-foot
              penguin-foot-left
            ">
              <polygon
                points="
                  113,311
                  82,347
                  121,352
                  143,334
                "
              />
            </g>

            {/* RIGHT FOOT */}

            <g className="
              penguin-foot
              penguin-foot-right
            ">
              <polygon
                points="
                  171,315
                  164,350
                  211,346
                  189,327
                "
              />
            </g>

            {/* FACETS */}

            <polygon
              className="penguin-facet"
              points="
                119,126
                151,143
                143,185
                112,166
              "
            />

            <polygon
              className="penguin-facet"
              points="
                180,125
                208,150
                176,177
                151,143
              "
            />

            <polygon
              className="penguin-facet-light"
              points="
                143,224
                176,177
                183,221
              "
            />

          </svg>
        </div>

        {/* WALK STATUS */}

        <div className="rsos-boot__walk-caption">
          <span>R.S OS</span>
          <span>ENTERING SYSTEM</span>
        </div>

      </div>

      {/* SKIP */}

      <button
        className="rsos-boot__skip"
        onClick={enter}
        type="button"
      >
        SKIP INTRO
      </button>

      {/* PROGRESS */}

      <div
        className="rsos-boot__progress"
        aria-hidden="true"
      >
        <span />
      </div>

    </div>
  );
}