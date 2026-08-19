"use client";

import { useEffect, useRef, useState } from "react";

const INTRO_DURATION = 10000;
const INTRO_KEY = "rsos-cat-intro-v1";
const INTRO_INTERVAL_MS = 24 * 60 * 60 * 1000; // once per day

export function LowPolyCatIntro() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"intro" | "exit">("intro");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
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
      INTRO_DURATION
    );

    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    (
      window as Window & {
        __rsosCatIntroFinish?: () => void;
      }
    ).__rsosCatIntroFinish = finish;

    return () => {
      window.clearTimeout(start);
      window.clearTimeout(finishTimer);

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

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

  const rotateY = mouse.x * 10;
  const rotateX = mouse.y * -7;

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

      {/* Scene */}
      <div className="cat-intro__scene">
        <div
          className="cat-intro__cat"
          style={{
            transform: `
              translateY(${ready ? "0" : "35px"})
              rotateX(${rotateX}deg)
              rotateY(${rotateY}deg)
            `,
          }}
        >
          {/* Tail */}
          <div className="cat-tail">
            <div className="cat-tail__segment" />
            <div className="cat-tail__tip" />
          </div>

          {/* Body */}
          <div className="cat-body">
            <div className="cat-body__front" />
            <div className="cat-body__side" />
            <div className="cat-body__belly" />
          </div>

          {/* Back legs */}
          <div className="cat-leg cat-leg--back-left">
            <span />
          </div>

          <div className="cat-leg cat-leg--back-right">
            <span />
          </div>

          {/* Front legs */}
          <div className="cat-leg cat-leg--front-left">
            <span />
          </div>

          <div className="cat-leg cat-leg--front-right">
            <span />
          </div>

          {/* Neck */}
          <div className="cat-neck" />

          {/* Head */}
          <div className="cat-head">
            <div className="cat-head__front" />
            <div className="cat-head__side" />

            {/* Ears */}
            <div className="cat-ear cat-ear--left">
              <span />
            </div>

            <div className="cat-ear cat-ear--right">
              <span />
            </div>

            {/* Eyes */}
            <div className="cat-eye cat-eye--left">
              <span />
            </div>

            <div className="cat-eye cat-eye--right">
              <span />
            </div>

            {/* Nose */}
            <div className="cat-nose" />

            {/* Whiskers */}
            <div className="cat-whiskers cat-whiskers--left">
              <span />
              <span />
              <span />
            </div>

            <div className="cat-whiskers cat-whiskers--right">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        {/* Ground */}
        <div className="cat-intro__ground">
          <div className="cat-intro__shadow" />
        </div>
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