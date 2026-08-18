"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const RAIN_PATHS = ["/ai-terminal", "/rain-terminal"];

export function RainAudio() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  const isRainTerminal = RAIN_PATHS.some((path) => pathname === path);

  async function start() {
    const audio = audioRef.current;
    if (!audio || !isRainTerminal) return;

    audio.volume = 0.16;
    audio.loop = true;

    try {
      await audio.play();
      setEnabled(true);
    } catch {
      // Browser autoplay policy may require a user gesture.
      setEnabled(false);
    }
  }

  function stop() {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setEnabled(false);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.16;
    audio.loop = true;

    if (isRainTerminal) {
      void start();
    } else {
      stop();
    }
  }, [isRainTerminal, pathname]);

  useEffect(() => {
    if (!isRainTerminal) return;

    const resumeFromGesture = () => {
      void start();
    };

    window.addEventListener("pointerdown", resumeFromGesture, { passive: true });
    window.addEventListener("keydown", resumeFromGesture);

    return () => {
      window.removeEventListener("pointerdown", resumeFromGesture);
      window.removeEventListener("keydown", resumeFromGesture);
    };
  }, [isRainTerminal]);

  useEffect(() => {
    return () => stop();
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        src="/music/rain-ambient.mp3"
        aria-hidden="true"
      />

      {isRainTerminal && (
        <button
          type="button"
          className="rain-audio-toggle"
          onClick={() => {
            if (enabled) stop();
            else void start();
          }}
          aria-label={enabled ? "Mute rain ambience" : "Enable rain ambience"}
        >
          <span className={`rain-audio-toggle__dot ${enabled ? "is-on" : ""}`} />
          {enabled ? "RAIN ON" : "RAIN"}
        </button>
      )}
    </>
  );
}
