"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";
import {
  createRainState,
  getRainStateElapsed,
  getRainTransitionProgress,
  requestRainState,
} from "./RainStateMachine";

export type CompanionMood =
  | "idle"
  | "listen"
  | "wave"
  | "talk"
  | "think"
  | "laugh"
  | "dance"
  | "walk"
  | "roam"
  | "type";

interface RainCompanionProps {
  mood?: CompanionMood;
}

type BoneMap = {
  pelvis?: THREE.Bone;
  spine1?: THREE.Bone;
  spine2?: THREE.Bone;
  spine3?: THREE.Bone;
  spine4?: THREE.Bone;
  spine5?: THREE.Bone;
  neck1?: THREE.Bone;
  neck2?: THREE.Bone;
  head?: THREE.Bone;
  clavicleL?: THREE.Bone;
  upperArmL?: THREE.Bone;
  lowerArmL?: THREE.Bone;
  handL?: THREE.Bone;
  clavicleR?: THREE.Bone;
  upperArmR?: THREE.Bone;
  lowerArmR?: THREE.Bone;
  handR?: THREE.Bone;
  thighL?: THREE.Bone;
  calfL?: THREE.Bone;
  footL?: THREE.Bone;
  thighR?: THREE.Bone;
  calfR?: THREE.Bone;
  footR?: THREE.Bone;
  leftEye?: THREE.Bone;
  rightEye?: THREE.Bone;
  leftBlink?: THREE.Bone;
  rightBlink?: THREE.Bone;
};

type Pose = {
  headX: number;
  headY: number;
  headZ: number;
  neckY: number;
  neckZ: number;
  spineX: number;
  spineY: number;
  spineZ: number;
  pelvisY: number;
  pelvisZ: number;
  leftArmX: number;
  leftArmY: number;
  leftArmZ: number;
  leftForearmX: number;
  leftForearmZ: number;
  rightArmX: number;
  rightArmY: number;
  rightArmZ: number;
  rightForearmX: number;
  rightForearmZ: number;
  leftLegX: number;
  leftCalfX: number;
  leftFootX: number;
  rightLegX: number;
  rightCalfX: number;
  rightFootX: number;
};

const ZERO_POSE: Pose = {
  headX: 0,
  headY: 0,
  headZ: 0,
  neckY: 0,
  neckZ: 0,
  spineX: 0,
  spineY: 0,
  spineZ: 0,
  pelvisY: 0,
  pelvisZ: 0,
  leftArmX: 0,
  leftArmY: 0,
  leftArmZ: 0,
  leftForearmX: 0,
  leftForearmZ: 0,
  rightArmX: 0,
  rightArmY: 0,
  rightArmZ: 0,
  rightForearmX: 0,
  rightForearmZ: 0,
  leftLegX: 0,
  leftCalfX: 0,
  leftFootX: 0,
  rightLegX: 0,
  rightCalfX: 0,
  rightFootX: 0,
};

const POSE_KEYS = Object.keys(ZERO_POSE) as Array<keyof Pose>;

const BASE_POSE: Pose = { ...ZERO_POSE, leftArmX: 0.025, rightArmX: 0.025, leftForearmX: -0.02, rightForearmX: -0.02 };

const POSES: Record<CompanionMood, Pose> = {
  idle: BASE_POSE,

  listen: {
    ...BASE_POSE,
    headY: -0.22,
    headZ: -0.06,
    neckY: -0.08,
    spineY: -0.035,
    spineX: -0.025,
    rightArmX: 0.08,
    leftArmX: 0.04,
  },

  type: {
    ...BASE_POSE,
    headY: -0.25,
    headX: 0.035,
    neckY: -0.1,
    spineX: -0.07,
    spineY: -0.035,
    rightArmX: 0.16,
    leftArmX: 0.1,
  },

  think: {
    ...BASE_POSE,
    headY: 0.18,
    headZ: 0.12,
    neckY: 0.08,
    neckZ: 0.04,
    spineX: -0.025,
    spineZ: 0.025,
    rightArmX: 0.12,
    rightForearmX: -0.22,
    rightForearmZ: -0.12,
  },

  talk: {
    ...BASE_POSE,
    headY: -0.08,
    neckY: -0.045,
    spineX: -0.02,
    leftArmX: 0.12,
    rightArmX: 0.15,
    leftForearmX: -0.05,
    rightForearmX: -0.06,
  },

  laugh: {
    ...BASE_POSE,
    headZ: 0.09,
    spineX: 0.05,
    spineZ: 0.035,
    pelvisZ: 0.025,
    leftArmX: 0.16,
    rightArmX: 0.16,
  },

  wave: {
    ...BASE_POSE,
    headY: -0.12,
    headZ: -0.04,
    spineY: -0.025,
    rightArmX: -0.2,
    rightArmZ: -1.05,
    rightForearmX: -0.42,
    rightForearmZ: -0.18,
  },

  dance: {
    ...BASE_POSE,
    spineX: 0.08,
    pelvisZ: 0.06,
    leftArmX: -0.18,
    leftArmZ: 0.72,
    rightArmX: -0.18,
    rightArmZ: -0.72,
    leftForearmX: -0.18,
    rightForearmX: -0.18,
  },

  walk: {
    ...BASE_POSE,
    spineX: 0.025,
    leftArmX: -0.28,
    rightArmX: 0.28,
    leftLegX: 0.22,
    rightLegX: -0.22,
    leftCalfX: -0.16,
    rightCalfX: 0.16,
  },

  roam: {
    ...BASE_POSE,
    headY: -0.12,
    spineY: -0.025,
    leftArmX: -0.12,
    rightArmX: 0.12,
    leftLegX: 0.16,
    rightLegX: -0.16,
  },
};

function findBone(root: THREE.Object3D, prefixes: string[]) {
  let result: THREE.Bone | undefined;

  root.traverse((object) => {
    if (result || !(object instanceof THREE.Bone)) return;

    const name = object.name.toLowerCase();

    if (prefixes.some((prefix) => name.startsWith(prefix))) {
      result = object;
    }
  });

  return result;
}

function buildBoneMap(root: THREE.Object3D): BoneMap {
  return {
    pelvis: findBone(root, ["pelvis_"]),
    spine1: findBone(root, ["spine_01_"]),
    spine2: findBone(root, ["spine_02_"]),
    spine3: findBone(root, ["spine_03_"]),
    spine4: findBone(root, ["spine_04_"]),
    spine5: findBone(root, ["spine_05_"]),
    neck1: findBone(root, ["neck_01_"]),
    neck2: findBone(root, ["neck_02_"]),
    head: findBone(root, ["head_"]),
    clavicleL: findBone(root, ["clavicle_l_"]),
    upperArmL: findBone(root, ["upperarm_l_"]),
    lowerArmL: findBone(root, ["lowerarm_l_"]),
    handL: findBone(root, ["hand_l_"]),
    clavicleR: findBone(root, ["clavicle_r_"]),
    upperArmR: findBone(root, ["upperarm_r_"]),
    lowerArmR: findBone(root, ["lowerarm_r_"]),
    handR: findBone(root, ["hand_r_"]),
    thighL: findBone(root, ["thigh_l_"]),
    calfL: findBone(root, ["calf_l_"]),
    footL: findBone(root, ["foot_l_"]),
    thighR: findBone(root, ["thigh_r_"]),
    calfR: findBone(root, ["calf_r_"]),
    footR: findBone(root, ["foot_r_"]),
    leftEye: findBone(root, ["l_eye_ball_"]),
    rightEye: findBone(root, ["r_eye_ball_"]),
    leftBlink: findBone(root, ["l_eye_blink_"]),
    rightBlink: findBone(root, ["r_eye_blink_"]),
  };
}

function applyEulerOffset(
  bone: THREE.Bone | undefined,
  x = 0,
  y = 0,
  z = 0
) {
  if (!bone) return;
  bone.rotation.x += x;
  bone.rotation.y += y;
  bone.rotation.z += z;
}

function applyPose(bones: BoneMap, pose: Pose) {
  applyEulerOffset(bones.head, pose.headX, pose.headY, pose.headZ);
  applyEulerOffset(bones.neck1, 0, pose.neckY, pose.neckZ);
  applyEulerOffset(bones.neck2, 0, pose.neckY * 0.65, pose.neckZ * 0.65);

  applyEulerOffset(
    bones.spine3,
    pose.spineX * 0.55,
    pose.spineY * 0.55,
    pose.spineZ * 0.55
  );
  applyEulerOffset(
    bones.spine4,
    pose.spineX * 0.7,
    pose.spineY * 0.7,
    pose.spineZ * 0.7
  );
  applyEulerOffset(
    bones.spine5,
    pose.spineX,
    pose.spineY,
    pose.spineZ
  );

  applyEulerOffset(bones.pelvis, 0, pose.pelvisY, pose.pelvisZ);

  applyEulerOffset(
    bones.upperArmL,
    pose.leftArmX,
    pose.leftArmY,
    pose.leftArmZ
  );
  applyEulerOffset(
    bones.lowerArmL,
    pose.leftForearmX,
    0,
    pose.leftForearmZ
  );
  applyEulerOffset(
    bones.upperArmR,
    pose.rightArmX,
    pose.rightArmY,
    pose.rightArmZ
  );
  applyEulerOffset(
    bones.lowerArmR,
    pose.rightForearmX,
    0,
    pose.rightForearmZ
  );

  applyEulerOffset(bones.thighL, pose.leftLegX);
  applyEulerOffset(bones.calfL, pose.leftCalfX);
  applyEulerOffset(bones.footL, pose.leftFootX);

  applyEulerOffset(bones.thighR, pose.rightLegX);
  applyEulerOffset(bones.calfR, pose.rightCalfX);
  applyEulerOffset(bones.footR, pose.rightFootX);
}

function lerpPoseInto(current: Pose, target: Pose, alpha: number): Pose {
  POSE_KEYS.forEach((key) => {
    current[key] = THREE.MathUtils.lerp(current[key], target[key], alpha);
  });
  return current;
}

function CameraFraming() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 3.9, 9.2);
    camera.lookAt(0, 3.85, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

function RainCharacter({ mood }: { mood: CompanionMood }) {
  const groupRef = useRef<THREE.Group>(null);
  const rainStateRef = useRef(createRainState(mood));
  const currentPoseRef = useRef<Pose>({ ...ZERO_POSE });
  const walkDistanceRef = useRef(0);

  const { scene } = useGLTF("/rain/rain-character.glb");

  const character = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      const geometryBox = new THREE.Box3().setFromObject(object);
      const geometrySize = new THREE.Vector3();
      geometryBox.getSize(geometrySize);

      const isThinWidePlatform =
        geometrySize.y < 0.25 &&
        geometrySize.x > 1.5 &&
        geometrySize.z > 1.5;

      if (isThinWidePlatform) {
        object.visible = false;
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if (
          material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshPhysicalMaterial
        ) {
          material.roughness = Math.max(material.roughness, 0.68);
          material.metalness *= 0.35;
        }
      });
    });

    return clone;
  }, [scene]);

  const normalized = useMemo(() => {
    const box = new THREE.Box3().setFromObject(character);
    const size = new THREE.Vector3();
    box.getSize(size);

    const height = Math.max(size.y, 0.001);
    const targetHeight = 5.8;

    character.scale.setScalar(targetHeight / height);

    const scaledBox = new THREE.Box3().setFromObject(character);
    const scaledCenter = new THREE.Vector3();
    scaledBox.getCenter(scaledCenter);

    character.position.x -= scaledCenter.x;
    character.position.z -= scaledCenter.z;
    character.position.y -= scaledBox.min.y;

    return character;
  }, [character]);

  const bones = useMemo(() => buildBoneMap(normalized), [normalized]);

  const restRotations = useMemo(() => {
    const map = new Map<THREE.Bone, THREE.Quaternion>();

    Object.values(bones).forEach((bone) => {
      if (bone) map.set(bone, bone.quaternion.clone());
    });

    return map;
  }, [bones]);



  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const group = groupRef.current;

    if (rainStateRef.current.current !== mood) {
      rainStateRef.current = requestRainState(
        rainStateRef.current,
        mood,
        time
      );
    }

    const activeMood = rainStateRef.current.current;
    const transitionProgress =
      getRainTransitionProgress(
        rainStateRef.current,
        time
      );
    const stateElapsed =
      getRainStateElapsed(
        rainStateRef.current,
        time
      );

    const transitionEase =
      transitionProgress * transitionProgress *
      (3 - 2 * transitionProgress);

    const previousPose =
      POSES[rainStateRef.current.previous];

    const requestedPose =
      POSES[activeMood];

    const poseTarget =
      transitionProgress < 1
        ? {
            ...previousPose,
          }
        : requestedPose;

    if (transitionProgress < 1) {
      lerpPoseInto(
        poseTarget,
        requestedPose,
        transitionEase
      );
    }

    const poseAlpha =
      1 - Math.exp(
        -delta * (5.5 + transitionEase * 4)
      );

    lerpPoseInto(
      currentPoseRef.current,
      poseTarget,
      poseAlpha
    );

    restRotations.forEach((rotation, bone) => {
      bone.quaternion.copy(rotation);
    });

    let pose = currentPoseRef.current;

    /*
     * ------------------------------------------------
     * CONTINUOUS LIFE
     * ------------------------------------------------
     *
     * These movements are deliberately small but
     * clearly visible: breathing, weight shifts,
     * head micro-motion and posture changes.
     */

    const breath = Math.sin(time * 1.25) * 0.035;
    const weight = Math.sin(time * 0.48) * 0.045;
    const headMicro = Math.sin(time * 0.62) * 0.024;

    applyPose(bones, pose);

    if (bones.spine5) {
      applyEulerOffset(bones.spine5, breath, weight, 0);
    }

    if (bones.head) {
      applyEulerOffset(
        bones.head,
        headMicro,
        0,
        Math.sin(time * 0.42) * 0.018
      );
    }

    /*
     * ------------------------------------------------
     * EYE TRACKING + BLINKING
     * ------------------------------------------------
     *
     * The imported rig contains dedicated eye and
     * eyelid bones. We use them for subtle attention
     * and natural blinking without changing geometry.
     */

    const eyeLook =
      activeMood === "listen" || activeMood === "type"
        ? -0.055
        : activeMood === "think"
          ? 0.06
          : 0;

    applyEulerOffset(
      bones.leftEye,
      Math.sin(time * 0.55) * 0.012,
      eyeLook,
      0
    );
    applyEulerOffset(
      bones.rightEye,
      Math.sin(time * 0.55) * 0.012,
      eyeLook,
      0
    );

    const blinkCycle = time % 4.8;
    let blink = 0;

    if (blinkCycle > 4.42 && blinkCycle < 4.68) {
      const p = (blinkCycle - 4.42) / 0.26;
      blink = Math.sin(p * Math.PI);
    }

    applyEulerOffset(
      bones.leftBlink,
      -0.28 * blink,
      0,
      0
    );
    applyEulerOffset(
      bones.rightBlink,
      -0.28 * blink,
      0,
      0
    );

    /*
     * ------------------------------------------------
     * MOOD-SPECIFIC MOTION
     * ------------------------------------------------
     */

    switch (activeMood) {
      case "listen": {
        const attentive = Math.sin(time * 1.8) * 0.018;
        applyEulerOffset(bones.head, attentive, 0, 0);
        applyEulerOffset(bones.spine5, -0.012, 0, attentive * 0.4);
        break;
      }

      case "type": {
        const focused = Math.sin(time * 2.1) * 0.012;
        applyEulerOffset(bones.head, focused, -0.035, 0);
        applyEulerOffset(bones.spine5, -0.035, 0, 0);
        break;
      }

      case "think": {
        const thinking = Math.sin(time * 0.9) * 0.025;
        applyEulerOffset(bones.head, thinking, thinking * 0.4, 0);
        applyEulerOffset(bones.spine5, 0, thinking * 0.25, 0);
        break;
      }

      case "talk": {
        const speech = Math.sin(time * 5.2);
        const speech2 = Math.sin(time * 2.6);
        applyEulerOffset(bones.head, speech * 0.018, speech2 * 0.012, 0);
        applyEulerOffset(bones.spine5, speech2 * 0.012, 0, speech * 0.008);
        applyEulerOffset(bones.upperArmL, 0, 0, speech2 * 0.035);
        applyEulerOffset(bones.upperArmR, 0, 0, -speech2 * 0.035);
        break;
      }

      case "laugh": {
        const laugh = Math.abs(Math.sin(time * 5.6));
        applyEulerOffset(bones.spine5, laugh * 0.07, 0, Math.sin(time * 5.6) * 0.035);
        applyEulerOffset(bones.head, laugh * 0.045, 0, Math.sin(time * 5.6) * 0.035);
        break;
      }

      case "wave": {
        const wave = Math.sin((stateElapsed + 0.15) * 7.2);
        const waveSmall = Math.sin((stateElapsed + 0.15) * 3.6);
        applyEulerOffset(bones.upperArmR, 0, 0, wave * 0.14);
        applyEulerOffset(bones.lowerArmR, wave * 0.18, 0, waveSmall * 0.12);
        applyEulerOffset(bones.handR, 0, waveSmall * 0.2, 0);
        break;
      }

      case "dance": {
        const beat = Math.sin((stateElapsed + 0.1) * 4.4);
        const beat2 = Math.sin((stateElapsed + 0.1) * 8.8);
        applyEulerOffset(bones.spine5, beat * 0.08, beat * 0.07, beat2 * 0.045);
        applyEulerOffset(bones.pelvis, 0, beat2 * 0.06, beat * 0.05);
        applyEulerOffset(bones.upperArmL, beat2 * 0.08, 0, beat2 * 0.12);
        applyEulerOffset(bones.upperArmR, -beat2 * 0.08, 0, -beat2 * 0.12);
        break;
      }

      case "walk":
      case "roam": {
        const stride = Math.sin(time * 5.2);
        const strideOpposite = Math.sin(time * 5.2 + Math.PI);

        applyEulerOffset(bones.thighL, stride * 0.22);
        applyEulerOffset(bones.thighR, strideOpposite * 0.22);
        applyEulerOffset(bones.calfL, -Math.max(0, stride) * 0.18);
        applyEulerOffset(bones.calfR, -Math.max(0, strideOpposite) * 0.18);

        applyEulerOffset(bones.upperArmL, strideOpposite * 0.16);
        applyEulerOffset(bones.upperArmR, stride * 0.16);

        if (activeMood === "walk" || activeMood === "roam") {
          walkDistanceRef.current += delta * 0.42;

          const travel =
            Math.sin(walkDistanceRef.current * 0.55) * 0.85;

          group.position.x = 2.65 + travel;
          group.position.y =
            0.45 + Math.abs(Math.sin(time * 5.2)) * 0.025;
          group.rotation.y =
            -0.12 +
            Math.cos(walkDistanceRef.current * 0.55) * 0.12;
        }

        break;
      }

      default:
        break;
    }

    /*
     * ------------------------------------------------
     * AUTONOMOUS IDLE PERSONALITY
     * ------------------------------------------------
     *
     * Rain occasionally looks around while idle.
     * She remains calm and never hijacks an active
     * terminal interaction.
     */

    if (activeMood === "idle") {
      const cycle = time % 18;

      if (cycle > 10 && cycle < 12.5) {
        applyEulerOffset(
          bones.head,
          Math.sin((cycle - 10) * 2.1) * 0.025,
          -0.18,
          0.02
        );
      } else if (cycle > 15 && cycle < 16.8) {
        applyEulerOffset(
          bones.head,
          -0.025,
          0.14,
          -0.025
        );
      }
    }

    /*
     * ------------------------------------------------
     * GROUP-LEVEL MOVEMENT
     * ------------------------------------------------
     */

    if (activeMood !== "walk" && activeMood !== "roam") {
      const idleCycle = time % 24;
      const autonomousShift =
        activeMood === "idle" &&
        idleCycle > 18 &&
        idleCycle < 21
          ? Math.sin(((idleCycle - 18) / 3) * Math.PI) * 0.18
          : 0;

      group.position.x = 2.65 + autonomousShift;
      group.position.y =
        0.45 +
        Math.sin(time * 1.35) * 0.028;

      group.rotation.y = -0.12;
      group.rotation.z =
        Math.sin(time * 0.55) * 0.012;

      if (activeMood === "laugh") {
        group.position.y += Math.abs(Math.sin(time * 5.6)) * 0.045;
      }

      if (activeMood === "dance") {
        group.position.y += Math.abs(Math.sin(time * 4.4)) * 0.055;
        group.rotation.y += Math.sin(time * 2.2) * 0.08;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalized} />
    </group>
  );
}

function CharacterFallback() {
  return null;
}

export function RainCompanion({
  mood = "idle",
}: RainCompanionProps) {
  return (
    <div
      className={`rain-companion rain-companion--${mood}`}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 5,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <Canvas
        className="rain-companion__canvas"
        dpr={[1, 1.5]}
        camera={{
          position: [0, 2.9, 9.2],
          fov: 30,
          near: 0.1,
          far: 100,
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <CameraFraming />
        <ambientLight intensity={0.65} color="#b9d0dc" />
        <hemisphereLight
          intensity={0.55}
          color="#dbeafe"
          groundColor="#0b1220"
        />
        <directionalLight
          position={[2, 4, 5]}
          intensity={0.9}
          color="#d9e9ef"
        />
        <pointLight
          position={[-2.5, 3.5, -1]}
          intensity={0.35}
          distance={7}
          color="#6ea6bd"
        />
        <pointLight
          position={[2, 2.5, 4]}
          intensity={0.3}
          distance={7}
          color="#c7dce5"
        />

        <Suspense fallback={<CharacterFallback />}>
          <RainCharacter mood={mood} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/rain/rain-character.glb");
