"use client";

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
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let ripple = 0;
    let rippleX = 0;
    let rippleY = 0;

    type Particle = { x: number; y: number; z: number; size: number; phase: number };
    type Dust = { x: number; y: number; z: number; size: number; speed: number; phase: number };

    const particles: Particle[] = [];
    const dust: Dust[] = [];
    const count = 720;
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const a = i * golden;
      particles.push({
        x: Math.cos(a) * r,
        y,
        z: Math.sin(a) * r,
        size: 0.68 + (i % 5) * 0.11,
        phase: i * 0.37,
      });
    }

    for (let i = 0; i < 110; i++) {
      const a = (i / 110) * Math.PI * 2 + i * 0.91;
      const radius = 1.03 + (i % 17) / 17 * 0.36;
      dust.push({
        x: Math.cos(a) * radius,
        y: ((i * 37) % 100) / 100 * 1.7 - 0.85,
        z: Math.sin(a) * radius,
        size: 0.3 + (i % 4) * 0.18,
        speed: 0.04 + (i % 7) * 0.007,
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

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const onClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      rippleX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      rippleY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      ripple = 1;
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      pointerX += (targetX - pointerX) * 0.035;
      pointerY += (targetY - pointerY) * 0.035;
      ripple *= 0.94;

      const cx = width * 0.5;
      const cy = height * 0.49;
      const radius = Math.min(width, height) * 0.285;
      const rot = t * 0.25 + pointerX * 0.16;
      const breathe = Math.sin(t * 1.05) * 0.026 + Math.sin(t * 0.52 + 1.4) * 0.017;

      const shadow = ctx.createRadialGradient(cx, cy + radius * 1.02, 0, cx, cy + radius * 1.02, radius * 0.82);
      shadow.addColorStop(0, "rgba(100,110,135,0.17)");
      shadow.addColorStop(1, "rgba(100,110,135,0)");
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.ellipse(cx, cy + radius * 1.02, radius * 0.72, radius * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();

      const projected: { x: number; y: number; z: number; size: number; alpha: number }[] = [];

      for (const p of particles) {
        const wobble = 1 + breathe + Math.sin(p.phase + t * 1.18) * 0.019;
        let x = p.x * wobble;
        let y = p.y * (1 + Math.sin(t * 0.88) * 0.019);
        let z = p.z * wobble;

        const c = Math.cos(rot);
        const ss = Math.sin(rot);
        const rx = x * c - z * ss;
        const rz = x * ss + z * c;
        x = rx;
        z = rz;

        // Cursor behaves like a soft magnetic field.
        const dx = pointerX * 0.18;
        const dy = pointerY * 0.13;
        const influence = Math.max(0, 1 - Math.hypot(x - dx, y - dy) / 1.45);
        x += pointerX * influence * 0.075;
        y += pointerY * influence * 0.055;

        // Click ripple travels through the jelly.
        if (ripple > 0.01) {
          const dist = Math.hypot(x - rippleX * 0.75, y - rippleY * 0.75);
          const wave = Math.exp(-Math.pow((dist - (1 - ripple) * 1.2) / 0.09, 2));
          x += (x - rippleX) * wave * 0.055;
          y += (y - rippleY) * wave * 0.055;
        }

        x += Math.sin(t * 0.98 + y * 4 + p.phase) * 0.012;
        y += Math.sin(t * 1.2 + x * 3 + p.phase) * 0.012;

        const depth = (z + 1) / 2;
        projected.push({
          x: cx + x * radius,
          y: cy + y * radius,
          z,
          size: p.size * (0.60 + depth * 0.78),
          alpha: 0.10 + depth * 0.75,
        });
      }

      projected.sort((a, b) => a.z - b.z);
      for (const p of projected) {
        ctx.fillStyle = `rgba(105, 115, 138, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const d of dust) {
        const angle = d.phase + t * d.speed;
        const x = d.x * Math.cos(angle * 0.15) - d.z * Math.sin(angle * 0.15);
        const y = d.y + Math.sin(t * 0.52 + d.phase) * 0.025;
        const z = d.x * Math.sin(angle * 0.15) + d.z * Math.cos(angle * 0.15);
        const drift = 1 + Math.sin(t * 0.66 + d.phase) * 0.08;
        const px = cx + x * radius * drift;
        const py = cy + y * radius * drift;
        const depth = (z + 1) / 2;
        const alpha = 0.025 + depth * 0.08;
        ctx.fillStyle = `rgba(120, 130, 150, ${alpha})`;
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
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
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
