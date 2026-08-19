import React from "react";

type Theme =
  | "minimal"
  | "cartoon"
  | "neumorphism"
  | "space"
  | "glass"
  | "dark-elegant"
  | "ocean";

type Props = { theme?: string | null };

/**
 * The hero visual is intentionally theme-specific.
 * Minimal Light keeps the original revolving globe; every other theme gets
 * a visual object that belongs to that theme rather than a generic globe.
 */
function MinimalGlobe() {
  return (
    <div className="theme-visual theme-visual-minimal" aria-hidden="true">
      <div className="minimal-globe-core">
        <span className="minimal-rib rib-1" />
        <span className="minimal-rib rib-2" />
        <span className="minimal-rib rib-3" />
        <span className="minimal-rib rib-4" />
        <span className="minimal-rib rib-5" />
        <span className="minimal-rib rib-6" />
        <span className="minimal-rib rib-7" />
        <span className="minimal-rib rib-8" />
        <span className="minimal-rib rib-9" />
        <span className="minimal-rib rib-10" />
        <span className="minimal-rib rib-11" />
        <span className="minimal-globe-highlight" />
      </div>
    </div>
  );
}

function CartoonVisual() {
  return (
    <div className="theme-visual theme-visual-cartoon" aria-hidden="true">
      <div className="cartoon-cloud cloud-a" />
      <div className="cartoon-cloud cloud-b" />
      <div className="cartoon-hill hill-a" />
      <div className="cartoon-hill hill-b" />
      <div className="cartoon-satellite" />
      <div className="cartoon-terminal">
        <span>&gt; TERMINAL</span>
        <b>user@rsos:~$ whoami</b>
        <strong>Raghav Sharma</strong>
      </div>
      <div className="cartoon-shield">✓</div>
      <div className="cartoon-person">
        <div className="person-head" />
        <div className="person-body" />
        <div className="person-arm person-arm-left" />
        <div className="person-arm person-arm-right" />
      </div>
      <div className="cartoon-signal signal-a" />
      <div className="cartoon-signal signal-b" />
    </div>
  );
}

function NeumorphismVisual() {
  return (
    <div className="theme-visual theme-visual-neumorphism" aria-hidden="true">
      <div className="neo-disc">
        <div className="neo-shield" aria-hidden="true">
          <span>✓</span>
        </div>
      </div>
      <div className="neo-ring neo-ring-a" />
      <div className="neo-ring neo-ring-b" />
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
      <div className="space-astronaut">
        <div className="astronaut-helmet" />
        <div className="astronaut-pack" />
        <div className="astronaut-body" />
        <div className="astronaut-leg astronaut-leg-a" />
        <div className="astronaut-leg astronaut-leg-b" />
      </div>
      <div className="space-orbit" />
    </div>
  );
}

function GlassVisual() {
  return (
    <div className="theme-visual theme-visual-glass" aria-hidden="true">
      <div className="glass-haze haze-a" />
      <div className="glass-sphere">
        <div className="glass-meridian meridian-a" />
        <div className="glass-meridian meridian-b" />
        <div className="glass-meridian meridian-c" />
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
        <span className="facet-line facet-line-a" />
        <span className="facet-line facet-line-b" />
        <span className="facet-line facet-line-c" />
        <span className="facet-line facet-line-d" />
      </div>
      <div className="dark-orbit dark-orbit-a" />
      <div className="dark-orbit dark-orbit-b" />
      <div className="dark-spark spark-a" />
      <div className="dark-spark spark-b" />
    </div>
  );
}

function OceanVisual() {
  return (
    <div className="theme-visual theme-visual-ocean" aria-hidden="true">
      <div className="ocean-rays" />
      <div className="ocean-globe">
        <span /><span /><span /><span /><span />
        <div className="ocean-reef reef-a" />
        <div className="ocean-reef reef-b" />
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
    case "cartoon": return <CartoonVisual />;
    case "neumorphism": return <NeumorphismVisual />;
    case "space": return <SpaceVisual />;
    case "glass": return <GlassVisual />;
    case "dark-elegant": return <DarkElegantVisual />;
    case "ocean": return <OceanVisual />;
    case "minimal":
    default: return <MinimalGlobe />;
  }
}

export default HeroThemeVisual;
