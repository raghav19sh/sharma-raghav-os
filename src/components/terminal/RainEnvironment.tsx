"use client";

import type { ReactNode } from "react";

interface RainEnvironmentProps {
  children?: ReactNode;
}

export function RainEnvironment({
  children,
}: RainEnvironmentProps) {
  return (
    <div className="rain-environment">
      {/* REAL MOVING NIGHT SCENE */}
      <video
        className="rain-environment__video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/rain-night-background.jpg"
        aria-hidden="true"
      >
        <source
          src="/rain/rainy-night.mp4"
          type="video/mp4"
        />
      </video>

      {/* Cinematic color grading */}
      <div
        className="rain-environment__grade"
        aria-hidden="true"
      />

      {/* Atmospheric depth */}
      <div
        className="rain-environment__mist"
        aria-hidden="true"
      />

      {/* Very subtle foreground droplets.
          The actual rain comes from the video. */}
      <div
        className="rain-environment__foreground-rain"
        aria-hidden="true"
      />

      {/* Cinematic vignette */}
      <div
        className="rain-environment__vignette"
        aria-hidden="true"
      />

      {/* Character / future environment actors */}
      <div className="rain-environment__actors">
        {children}
      </div>
    </div>
  );
}