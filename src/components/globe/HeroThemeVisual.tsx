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
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let start = performance.now();

    type Particle = { x: number; y: number; z: number; size: number; phase: number };
    type Dust = { x: number; y: number; z: number; size: number; speed: number; phase: number };

    const particles: Particle[] = [];
    const dust: Dust[] = [];

    // Fibonacci distribution gives an even, organic-looking point cloud.
    const count = 760;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const a = i * golden;
      particles.push({
        x: Math.cos(a) * r,
        y,
        z: Math.sin(a) * r,
        size: 0.7 + (i % 5) * 0.12,
        phase: i * 0.37,
      });
    }

    for (let i = 0; i < 150; i++) {
      const a = (i / 150) * Math.PI * 2 + i * 0.91;
      const radius = 1.02 + (i % 17) / 17 * 0.34;
      dust.push({
        x: Math.cos(a) * radius,
        y: ((i * 37) % 100) / 100 * 1.7 - 0.85,
        z: Math.sin(a) * radius,
        size: 0.35 + (i % 4) * 0.22,
        speed: 0.05 + (i % 7) * 0.008,
        phase: i * 0.83,
      });
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.49;
      const radius = Math.min(width, height) * 0.285;
      const rot = t * 0.28;
      const breathe = Math.sin(t * 1.15) * 0.025 + Math.sin(t * 0.57 + 1.4) * 0.018;

      // Soft contact shadow: keeps the object feeling physical without making it a solid sphere.
      const shadow = ctx.createRadialGradient(cx, cy + radius * 1.02, 0, cx, cy + radius * 1.02, radius * 0.82);
      shadow.addColorStop(0, "rgba(120,130,155,0.18)");
      shadow.addColorStop(1, "rgba(120,130,155,0)");
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.ellipse(cx, cy + radius * 1.02, radius * 0.72, radius * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();

      const projected: { x: number; y: number; z: number; size: number; alpha: number }[] = [];

      for (const p of particles) {
        // Organic radial deformation makes the point cloud subtly squash and swell like slime.
        const wobble = 1 + breathe + Math.sin(p.phase + t * 1.25) * 0.018;
        let x = p.x * wobble;
        let y = p.y * (1 + Math.sin(t * 0.9) * 0.018);
        let z = p.z * wobble;

        const c = Math.cos(rot);
        const s = Math.sin(rot);
        const rx = x * c - z * s;
        const rz = x * s + z * c;
        x = rx;
        z = rz;

        // Very gentle side-to-side jelly deformation.
        x += Math.sin(t * 1.05 + y * 4 + p.phase) * 0.012;
        y += Math.sin(t * 1.25 + x * 3 + p.phase) * 0.012;

        const depth = (z + 1) / 2;
        projected.push({
          x: cx + x * radius,
          y: cy + y * radius,
          z,
          size: p.size * (0.62 + depth * 0.75),
          alpha: 0.12 + depth * 0.72,
        });
      }

      projected.sort((a, b) => a.z - b.z);
      for (const p of projected) {
        ctx.fillStyle = `rgba(110, 120, 145, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // A restrained halo of particles gives the sphere a dusty trail instead of a clean CGI edge.
      for (const d of dust) {
        const angle = d.phase + t * d.speed;
        const x = d.x * Math.cos(angle * 0.16) - d.z * Math.sin(angle * 0.16);
        const z = d.x * Math.sin(angle * 0.16) + d.z * Math.cos(angle * 0.16);
        const y = d.y + Math.sin(t * 0.55 + d.phase) * 0.025;
        const drift = 1 + Math.sin(t * 0.7 + d.phase) * 0.08;
        const px = cx + x * radius * drift;
        const py = cy + y * radius * drift;
        const edge = Math.max(0, 1 - Math.hypot(x, y) / 1.7);
        const alpha = 0.035 + edge * 0.10;
        ctx.fillStyle = `rgba(130, 140, 160, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, d.size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="theme-visual theme-visual-minimal" aria-hidden="true">
      <canvas ref={canvasRef} className="minimal-jelly-canvas" />
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
