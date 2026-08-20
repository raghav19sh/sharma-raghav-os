"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Walk tuning. WALK_SPEED is the single source of truth for how fast the
 * cat moves — the leg/tail/body cycle is derived from elapsed time using
 * the same constant, so the stride never drifts out of sync with the
 * translation no matter the frame rate.
 */
const WALK_SPEED = 1.55; // world units / second, constant, no easing
const STRIDE_RATE = 5.4; // gait cycles per world-unit of travel
const START_X = -7.2;
const END_X = 7.2;

const FUR_BLACK = "#111111"; // uniform matte coat — the only color used
const FUR_BLACK_SOFT = "#1a1a1a"; // pads/tail-tip, subtle separation only

function furMaterial(color: string = FUR_BLACK, roughness = 0.55) {
  return (
    <meshStandardMaterial
      color={color}
      flatShading
      roughness={roughness}
      metalness={0.08}
    />
  );
}

/** A single low-poly leg: a hip pivot group containing an offset,
 * faceted limb so rotating the group swings the leg from the hip. */
function Leg({
  pivot,
  legRef,
}: {
  pivot: [number, number, number];
  legRef: React.RefObject<THREE.Group>;
}) {
  return (
    <group position={pivot} ref={legRef}>
      <mesh position={[0, -0.34, 0]} rotation={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.68, 4]} />
        {furMaterial()}
      </mesh>
      <mesh position={[0, -0.66, 0.03]} castShadow>
        <boxGeometry args={[0.16, 0.1, 0.22]} />
        {furMaterial(FUR_BLACK_SOFT)}
      </mesh>
    </group>
  );
}

function CatRig() {
  const group = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const tail1 = useRef<THREE.Group>(null!);
  const tail2 = useRef<THREE.Group>(null!);
  const frontLeft = useRef<THREE.Group>(null!);
  const frontRight = useRef<THREE.Group>(null!);
  const backLeft = useRef<THREE.Group>(null!);
  const backRight = useRef<THREE.Group>(null!);

  const traveled = useRef(0);
  const finished = useRef(false);

  useFrame((_, rawDelta) => {
    if (finished.current) return;

    // Clamp delta so a dropped/first frame can't cause a jump —
    // this keeps the constant-speed walk truly constant.
    const delta = Math.min(rawDelta, 1 / 30);

    traveled.current += WALK_SPEED * delta;

    const x = START_X + traveled.current;

    if (x >= END_X) {
      group.current.position.x = END_X;
      finished.current = true;
      return;
    }

    group.current.position.x = x;

    const phase = traveled.current * STRIDE_RATE;
    const swing = Math.sin(phase);
    const swingOpp = Math.sin(phase + Math.PI);
    const amp = 0.42;

    // Diagonal trot gait: front-left/back-right swing together,
    // front-right/back-left swing on the opposite half of the cycle.
    if (frontLeft.current) frontLeft.current.rotation.x = swing * amp;
    if (backRight.current) backRight.current.rotation.x = swing * amp;
    if (frontRight.current) frontRight.current.rotation.x = swingOpp * amp;
    if (backLeft.current) backLeft.current.rotation.x = swingOpp * amp;

    // Body bobs twice per full stride cycle (once per footfall).
    const bob = Math.abs(Math.sin(phase)) * 0.05;
    if (body.current) body.current.position.y = 0.98 + bob;
    if (head.current) {
      head.current.position.y = 1.32 + bob * 0.6;
      head.current.rotation.z = Math.sin(phase) * 0.03;
    }

    // Tail wags at its own lazy rate, independent of stride.
    const t = traveled.current;
    if (tail1.current) tail1.current.rotation.y = Math.sin(t * 2.1) * 0.35;
    if (tail2.current) tail2.current.rotation.y = Math.sin(t * 2.1 + 0.6) * 0.4;
  });

  const legPivots = useMemo(
    () => ({
      frontLeft: [0.62, 0.62, 0.32] as [number, number, number],
      frontRight: [0.62, 0.62, -0.32] as [number, number, number],
      backLeft: [-0.55, 0.62, 0.32] as [number, number, number],
      backRight: [-0.55, 0.62, -0.32] as [number, number, number],
    }),
    []
  );

  return (
    <group ref={group} position={[START_X, 0, 0]}>
      {/* Body — stretched octahedron: a sharp faceted ridge along the
          spine and belly, the signature look of these low-poly statues */}
      <group ref={body} position={[0, 0.98, 0]}>
        <mesh scale={[1.7, 0.95, 1.05]} castShadow receiveShadow>
          <octahedronGeometry args={[0.55, 0]} />
          {furMaterial()}
        </mesh>
      </group>

      {/* Chest / haunch wedge, angular front */}
      <mesh
        position={[0.55, 0.78, 0]}
        scale={[0.75, 1.1, 0.95]}
        castShadow
      >
        <octahedronGeometry args={[0.34, 0]} />
        {furMaterial(FUR_BLACK_SOFT)}
      </mesh>

      {/* Neck */}
      <mesh position={[0.72, 1.12, 0]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.22, 0.3, 0.5, 5]} />
        {furMaterial()}
      </mesh>

      {/* Head */}
      <group ref={head} position={[1.05, 1.32, 0]}>
        <mesh scale={[1.15, 1, 1]} castShadow receiveShadow>
          <octahedronGeometry args={[0.4, 0]} />
          {furMaterial()}
        </mesh>

        {/* Ears — sharp low-poly pyramids */}
        <mesh position={[0.1, 0.42, 0.22]} rotation={[0.2, 0, -0.1]} castShadow>
          <coneGeometry args={[0.17, 0.36, 4]} />
          {furMaterial()}
        </mesh>
        <mesh position={[0.1, 0.42, -0.22]} rotation={[-0.2, 0, -0.1]} castShadow>
          <coneGeometry args={[0.17, 0.36, 4]} />
          {furMaterial()}
        </mesh>

        {/* Snout — a single angular wedge, no separate color */}
        <mesh position={[0.5, -0.08, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <coneGeometry args={[0.16, 0.32, 4]} />
          {furMaterial()}
        </mesh>

        {/* Eyes — small recessed facets, same material as the coat */}
        <mesh position={[0.28, 0.1, 0.17]} scale={[0.5, 0.7, 0.5]}>
          <octahedronGeometry args={[0.08, 0]} />
          {furMaterial(FUR_BLACK_SOFT)}
        </mesh>
        <mesh position={[0.28, 0.1, -0.17]} scale={[0.5, 0.7, 0.5]}>
          <octahedronGeometry args={[0.08, 0]} />
          {furMaterial(FUR_BLACK_SOFT)}
        </mesh>
      </group>

      {/* Tail: two-segment chain for a natural taper + wag */}
      <group position={[-0.85, 1.1, 0]} rotation={[0, 0, 0.7]}>
        <group ref={tail1}>
          <mesh position={[0, -0.28, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.13, 0.56, 4]} />
            {furMaterial()}
          </mesh>
          <group ref={tail2} position={[0, -0.56, 0]} rotation={[0, 0, -0.35]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.1, 0.42, 4]} />
              {furMaterial(FUR_BLACK_SOFT)}
            </mesh>
          </group>
        </group>
      </group>

      {/* Legs */}
      <Leg pivot={legPivots.frontLeft} legRef={frontLeft} />
      <Leg pivot={legPivots.frontRight} legRef={frontRight} />
      <Leg pivot={legPivots.backLeft} legRef={backLeft} />
      <Leg pivot={legPivots.backRight} legRef={backRight} />

      {/* Contact shadow, travels with the cat */}
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.85, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.38} />
      </mesh>
    </group>
  );
}

function Ground() {
  return (
    <mesh
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[40, 12]} />
      <shadowMaterial opacity={0.25} />
    </mesh>
  );
}

function WalkScene({ onComplete }: { onComplete: () => void }) {
  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight
        position={[3, 6, 6]}
        intensity={2.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Rim light from behind-above so the black facets separate from
          the dark backdrop instead of disappearing into it. */}
      <directionalLight position={[-6, 4, -3]} intensity={1.1} color="#dfe8ff" />
      <directionalLight position={[0, 1.5, 6]} intensity={0.4} color="#ffffff" />

      <Ground />
      <CatCompletionWatcher onComplete={onComplete} />
    </>
  );
}

/** Separate component so the completion check runs every frame without
 * re-rendering the whole rig, driven off the same clock as CatRig. */
function CatCompletionWatcher({ onComplete }: { onComplete: () => void }) {
  const elapsed = useRef(0);
  const fired = useRef(false);

  const totalDistance = END_X - START_X;
  const walkDuration = totalDistance / WALK_SPEED;

  useFrame((_, delta) => {
    if (fired.current) return;

    elapsed.current += Math.min(delta, 1 / 30);

    if (elapsed.current >= walkDuration) {
      fired.current = true;
      onComplete();
    }
  });

  return <CatRig />;
}

export function LowPolyCat3D({ onComplete }: { onComplete: () => void }) {
  return (
    <Canvas
      className="cat-intro__canvas"
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 2.1, 8.4], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
    >
      <WalkScene onComplete={onComplete} />
    </Canvas>
  );
}
