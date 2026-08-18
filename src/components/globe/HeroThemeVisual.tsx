import React from "react";

type Theme =
  | "minimal"
  | "cartoon"
  | "neumorphism"
  | "space"
  | "glass"
  | "dark-elegant"
  | "ocean";

type Props = {
  theme?: string | null;
};

function MinimalGlobe() {
  return (
    <div className="theme-visual theme-visual-minimal" aria-hidden="true">
      <div className="minimal-globe-core">
        <div className="minimal-globe-lat lat-a" />
        <div className="minimal-globe-lat lat-b" />
        <div className="minimal-globe-lat lat-c" />
        <div className="minimal-globe-long long-a" />
        <div className="minimal-globe-long long-b" />
        <div className="minimal-globe-long long-c" />
      </div>
      <div className="minimal-orbit orbit-a" />
      <div className="minimal-orbit orbit-b" />
      <div className="minimal-orbit orbit-c" />
    </div>
  );
}

function CartoonVisual() {
  return (
    <div className="theme-visual theme-visual-cartoon" aria-hidden="true">
      <div className="cartoon-cloud cloud-a" />
      <div className="cartoon-cloud cloud-b" />
      <div className="cartoon-terminal">
        <span>&gt; TERMINAL</span>
        <strong>SYSTEM SECURE</strong>
      </div>
      <div className="cartoon-person">
        <div className="person-head" />
        <div className="person-body" />
      </div>
      <div className="cartoon-signal signal-a" />
      <div className="cartoon-signal signal-b" />
    </div>
  );
}

function NeumorphismVisual() {
  return (
    <div className="theme-visual theme-visual-neumorphism" aria-hidden="true">
      <div className="neo-orbit neo-orbit-a" />
      <div className="neo-orbit neo-orbit-b" />
      <div className="neo-shield">✓</div>
      <div className="neo-dot neo-dot-a" />
      <div className="neo-dot neo-dot-b" />
    </div>
  );
}

function SpaceVisual() {
  return (
    <div className="theme-visual theme-visual-space" aria-hidden="true">
      <div className="space-stars" />
      <div className="space-planet" />
      <div className="space-moon" />
      <div className="space-astronaut">◉</div>
      <div className="space-orbit" />
    </div>
  );
}

function GlassVisual() {
  return (
    <div className="theme-visual theme-visual-glass" aria-hidden="true">
      <div className="glass-sphere">
        <span /><span /><span /><span /><span /><span />
      </div>
      <div className="glass-orbit glass-orbit-a" />
      <div className="glass-orbit glass-orbit-b" />
    </div>
  );
}

function DarkElegantVisual() {
  return (
    <div className="theme-visual theme-visual-dark" aria-hidden="true">
      <div className="dark-halo" />
      <div className="dark-faceted">
        <span /><span /><span /><span />
      </div>
      <div className="dark-orbit dark-orbit-a" />
      <div className="dark-orbit dark-orbit-b" />
    </div>
  );
}

function OceanVisual() {
  return (
    <div className="theme-visual theme-visual-ocean" aria-hidden="true">
      <div className="ocean-rays" />
      <div className="ocean-globe">
        <span /><span /><span /><span /><span />
      </div>
      <div className="ocean-bubble bubble-a" />
      <div className="ocean-bubble bubble-b" />
      <div className="ocean-bubble bubble-c" />
      <div className="ocean-fish fish-a">›</div>
      <div className="ocean-fish fish-b">‹</div>
    </div>
  );
}

export function HeroThemeVisual({ theme }: Props) {
  switch (theme as Theme) {
    case "cartoon":
      return <CartoonVisual />;
    case "neumorphism":
      return <NeumorphismVisual />;
    case "space":
      return <SpaceVisual />;
    case "glass":
      return <GlassVisual />;
    case "dark-elegant":
      return <DarkElegantVisual />;
    case "ocean":
      return <OceanVisual />;
    case "minimal":
    default:
      // The geographic/orbiting globe exists ONLY in Minimal Light.
      return <MinimalGlobe />;
  }
}

export default HeroThemeVisual;
