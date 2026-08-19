"use client";

import { useEffect, useRef, useState } from "react";
import { LowPolyCat3D } from "./LowPolyCat3D";

// Safety net only — the intro normally ends when the cat finishes
// walking across the screen at its constant speed. This just guards
// against the walk callback never firing for some reason.
const INTRO_FALLBACK_DURATION = 16000;
const INTRO_KEY = "rsos-cat-intro-v1";
const INTRO_INTERVAL_MS = 24 * 60 * 60 * 1000; // once per day

export function LowPolyCatIntro() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"intro" | "exit">("intro");
  const [ready, setReady] = useState(false);

  const finishing = useRef(false);

  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const params = new URLSearchParams(window.location.search);

    const reset =
      params.get("intro") === "reset" ||
      params.get("cat") === "reset";

    const force =
      params.get("intro") === "1" ||
      params.get("intro") === "true" ||
      params.get("cat") === "1";

    if (reset) {
      localStorage.removeItem(INTRO_KEY);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }

    const lastShown = Number(localStorage.getItem(INTRO_KEY) ?? 0);
    const seenRecently = Date.now() - lastShown < INTRO_INTERVAL_MS;

    if (!force && seenRecently) {
      return;
    }

    finishing.current = false;

    setPhase("intro");
    setVisible(true);

    document.documentElement.classList.add("rsos-cat-intro-active");

    const start = window.setTimeout(() => {
      setReady(true);
    }, 100);

    const finish = () => {
      if (finishing.current) return;

      finishing.current = true;

      localStorage.setItem(INTRO_KEY, String(Date.now()));

      setPhase("exit");

      window.setTimeout(() => {
        document.documentElement.classList.remove(
          "rsos-cat-intro-active"
        );

        setVisible(false);
      }, 900);
    };

    const finishTimer = window.setTimeout(
      finish,
      INTRO_FALLBACK_DURATION
    );

    (
      window as Window & {
        __rsosCatIntroFinish?: () => void;
      }
    ).__rsosCatIntroFinish = finish;

    return () => {
      window.clearTimeout(start);
      window.clearTimeout(finishTimer);

      delete (
        window as Window & {
          __rsosCatIntroFinish?: () => void;
        }
      ).__rsosCatIntroFinish;

      document.documentElement.classList.remove(
        "rsos-cat-intro-active"
      );
    };
  }, []);

  if (!visible) return null;

  const handleWalkComplete = () => {
    (
      window as Window & {
        __rsosCatIntroFinish?: () => void;
      }
    ).__rsosCatIntroFinish?.();
  };

  return (
    <div
      className={`cat-intro ${
        phase === "exit" ? "cat-intro--exit" : ""
      }`}
    >
      {/* Atmosphere */}
      <div className="cat-intro__sky" />
      <div className="cat-intro__glow" />
      <div className="cat-intro__grain" />

      {/* Tiny floating particles */}
      <div className="cat-intro__particles">
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            key={index}
            style={{
              "--i": index,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Scene — real 3D low-poly cat, walking left to right at a
          constant speed. It renders once `ready` so the intro overlay
          has faded in first. */}
      <div className="cat-intro__scene">
        {ready && <LowPolyCat3D onComplete={handleWalkComplete} />}
      </div>

      {/* Text */}
      <div className="cat-intro__identity">
        <div className="cat-intro__monogram">
          R.S
        </div>

        <div className="cat-intro__name">
          RAGHAV SHARMA
        </div>

        <div className="cat-intro__subtitle">
          CYBERSECURITY · SYSTEMS · DIGITAL FORENSICS
        </div>
      </div>

      <div className="cat-intro__hint">
        <span>WELCOME</span>
        <span>TO MY WORLD</span>
      </div>

      <button
        type="button"
        className="cat-intro__skip"
        onClick={() => {
          (
            window as Window & {
              __rsosCatIntroFinish?: () => void;
            }
          ).__rsosCatIntroFinish?.();
        }}
      >
        ENTER
      </button>
    </div>
  );
}