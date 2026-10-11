"use client";

import { useEffect, useRef } from "react";

export default function PlasmaVoid() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.className = "plasma-void-webgl";
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);

    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
      import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
      import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

      const canvas = document.querySelector(".plasma-void-webgl");
      if (!canvas || !canvas.isConnected) throw new Error("Particle canvas unavailable");

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);
      const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
      camera.position.set(0, 0, 150);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0xffffff, 1);

      const world = new THREE.Group();
      scene.add(world);

      // Many long, clearly visible black strands — not tiny dots or tetrahedrons.
      const strandCount = window.innerWidth < 700 ? 34 : 58;
      const pointsPerStrand = 220;
      const strandGeometries = [];
      const strandMaterials = [];
      const strands = [];

      for (let s = 0; s < strandCount; s++) {
        const positions = new Float32Array(pointsPerStrand * 3);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.72 + (s % 4) * 0.07
        });
        const line = new THREE.Line(geometry, material);
        line.frustumCulled = false;
        world.add(line);
        strandGeometries.push(geometry);
        strandMaterials.push(material);
        strands.push({ positions, phase: (s / strandCount) * Math.PI * 2, radius: 24 + (s % 13) * 3.5 });
      }

      const clock = new THREE.Clock();
      let raf = 0;
      let disposed = false;

      function animate() {
        if (disposed || !canvas.isConnected) return;
        raf = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        strands.forEach((strand, s) => {
          const { positions, phase, radius } = strand;
          for (let i = 0; i < pointsPerStrand; i++) {
            const u = i / (pointsPerStrand - 1);
            const angle = u * Math.PI * 4.5 + phase;
            const envelope = 0.55 + 0.45 * Math.sin(u * Math.PI);
            const waveA = Math.sin(angle * 1.15 + t * (0.55 + s * 0.003) + phase) * (8 + s % 7);
            const waveB = Math.cos(angle * 0.72 - t * 0.38 + phase * 1.7) * (7 + s % 5);
            const x = Math.cos(angle + Math.sin(t * 0.18 + phase) * 0.45) * radius + waveA;
            const y = Math.sin(angle * 0.82 + phase * 0.18) * radius * 0.68 + waveB;
            const z = Math.sin(angle * 0.56 + t * 0.24 + phase) * 35 * envelope;
            const idx = i * 3;
            positions[idx] = x;
            positions[idx + 1] = y;
            positions[idx + 2] = z;
          }
          strandGeometries[s].attributes.position.needsUpdate = true;
        });

        world.rotation.z = Math.sin(t * 0.12) * 0.08;
        world.rotation.y = Math.sin(t * 0.09) * 0.22;
        renderer.render(scene, camera);
      }

      function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener("resize", onResize);
      animate();

      window.addEventListener("pagehide", () => {
        disposed = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        strandGeometries.forEach((geometry) => geometry.dispose());
        strandMaterials.forEach((material) => material.dispose());
        renderer.dispose();
      }, { once: true });
    `;
    document.body.appendChild(script);

    return () => {
      script.remove();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="plasma-void-host" aria-hidden="true" />;
}
