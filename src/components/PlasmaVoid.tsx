"use client";

import { useEffect, useRef } from "react";

export default function PlasmaVoid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let frame = 0;
    let raf = 0;
    let particles: { angle: number; radius: number; speed: number; size: number; phase: number }[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(1100, Math.max(420, Math.floor((width * height) / 1800)));
      particles = Array.from({ length: count }, (_, i) => ({
        angle: Math.random() * Math.PI * 2,
        radius: 35 + Math.random() * Math.min(width, height) * 0.46,
        speed: (0.00025 + Math.random() * 0.00085) * (Math.random() > 0.5 ? 1 : -1),
        size: 0.35 + Math.random() * 1.3,
        phase: i * 0.17 + Math.random() * 6,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width * 0.69;
      const cy = height * 0.37;
      const scale = Math.min(width, height);
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.55);
      halo.addColorStop(0, "rgba(116,31,57,0.12)");
      halo.addColorStop(0.35, "rgba(72,20,40,0.09)");
      halo.addColorStop(1, "rgba(10,9,10,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        const t = frame * p.speed;
        const wave = Math.sin(t * 2 + p.phase) * 13 + Math.cos(t + p.phase * 0.7) * 8;
        const r = p.radius + wave;
        const a = p.angle + t * 0.9 + Math.sin(t + p.phase) * 0.12;
        const x = cx + Math.cos(a) * r * 1.14;
        const y = cy + Math.sin(a) * r * 0.72;
        const alpha = 0.12 + (0.5 + 0.5 * Math.sin(a * 3 + p.phase)) * 0.5;
        ctx.fillStyle = `rgba(${170 + Math.floor(35 * Math.sin(p.phase))},${50 + Math.floor(24 * Math.sin(p.phase * 0.6))},${78 + Math.floor(30 * Math.cos(p.phase))},${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      const voidGradient = ctx.createRadialGradient(cx, cy, 4, cx, cy, scale * 0.22);
      voidGradient.addColorStop(0, "rgba(4,3,5,0.92)");
      voidGradient.addColorStop(0.55, "rgba(7,5,8,0.66)");
      voidGradient.addColorStop(1, "rgba(7,5,8,0)");
      ctx.fillStyle = voidGradient;
      ctx.beginPath();
      ctx.ellipse(cx, cy, scale * 0.23, scale * 0.16, -0.22, 0, Math.PI * 2);
      ctx.fill();
      frame += 1;
      if (!reduceMotion) raf = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="plasma-void-canvas" aria-hidden="true" />;
}
