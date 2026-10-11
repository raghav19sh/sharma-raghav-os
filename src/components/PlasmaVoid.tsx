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

    // Use the same Three.js version as the supplied export. The module script is
    // intentionally isolated from Next's server bundle because Three.js runs only in the browser.
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
      import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
      import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
      import { EffectComposer } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js";
      import { RenderPass } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js";
      import { UnrealBloomPass } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js";

      const canvas = document.querySelector(".plasma-void-webgl");
      if (!canvas || !canvas.isConnected) throw new Error("Particle canvas unavailable");
      const COUNT = window.innerWidth < 700 ? 9000 : 20000;
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0xffffff, 0.01);
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
      camera.position.set(0, 0, 100);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0xffffff, 1);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.35;

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
      bloom.strength = 1.8;
      bloom.radius = 0.4;
      bloom.threshold = 0;
      composer.addPass(bloom);

      const dummy = new THREE.Object3D();
      const color = new THREE.Color();
      const target = new THREE.Vector3();
      const geometry = new THREE.TetrahedronGeometry(0.25);
      const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const mesh = new THREE.InstancedMesh(geometry, material, COUNT);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(mesh);

      const positions = Array.from({ length: COUNT }, () => new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      ));
      for (let i = 0; i < COUNT; i++) mesh.setColorAt(i, new THREE.Color(0x000000));

      const clock = new THREE.Clock();
      let raf = 0;
      let disposed = false;
      const animate = () => {
        if (disposed || !canvas.isConnected) return;
        raf = requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        const scale = 90, spread = 1, flow = 0.8, morph = 0.45;
        for (let i = 0; i < COUNT; i++) {
          const t = i / COUNT;
          const theta = t * Math.PI * 40;
          const r0 = 0.35 + 0.65 * Math.sqrt(t);
          const w1 = Math.sin(theta * 0.7 + time * 0.25);
          const w2 = Math.sin(theta * 1.9 - time * 0.17);
          const w3 = Math.cos(theta * 3.3 + time * 0.11);
          const attract = r0 * (1 + 0.25 * w1 + 0.12 * w2 * w3);
          const bend = 0.8 * Math.sin(theta * 0.5 + time * 0.2) + 0.3 * Math.sin(theta * 2.7 - time * 0.13);
          const x = scale * attract * Math.cos(theta + bend * spread);
          const y = scale * attract * Math.sin(theta + bend * spread);
          const z = scale * (0.55 * Math.sin(theta * 0.55) + 0.28 * Math.sin(theta * 1.73 + time * 0.22) + 0.15 * Math.cos(theta * 4.1));
          const swirl = flow * Math.sin(Math.sqrt(x * x + y * y) * 0.06 - time * 0.8);
          target.set(x + swirl * y * 0.12, y - swirl * x * 0.12, z + scale * morph * 0.18 * Math.sin(theta * 0.9 + time * 0.35));
          color.setHex(0x000000);
          positions[i].lerp(target, 0.1);
          dummy.position.copy(positions[i]);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          mesh.setColorAt(i, color);
        }
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        controls.update();
        composer.render();
      };
      animate();

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize);
      window.addEventListener("pagehide", () => {
        disposed = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        controls.dispose();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        composer.dispose();
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
