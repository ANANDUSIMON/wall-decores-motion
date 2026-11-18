import React, { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig,
  delayRender, continueRender, cancelRender,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Environment, RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { RGBELoader } from "three-stdlib";
import { loadFont } from "@remotion/google-fonts/CormorantGaramond";

const { fontFamily } = loadFont("normal", { weights: ["400", "600"], subsets: ["latin"] });

export const ROOM_FPS = 30;
export const ROOM_DURATION = 900; // 30 seconds

type V3 = [number, number, number];
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ───────── COLOURS (taken from the Kerala bedroom reference) ─────────
const C = {
  wall: "#8d9ea0", floorTint: "#dcd6cc", ceilingTint: "#6b4a33", beam: "#3b2618",
  fascia: "#ece9e2", skirting: "#9a948a", oak: "#c9a876", oakDark: "#a8875c",
  frame: "#b08a55", doorWood: "#4a2f1f", linen: "#f3f0ea", navy: "#1d2a44",
  stone: "#cfc6b6", lampShade: "#f4efe6",
};

// ───────── ASSET FILES ─────────
const PATHS = {
  hdri: "hdri/room.hdr",
  painting: "art/yacht.png",
  floorDiff: "textures/floor-stone/diffuse.jpg",
  floorNor: "textures/floor-stone/normal.jpg",
  floorRough: "textures/floor-stone/roughness.jpg",
  wallNor: "textures/wall-plaster/normal.jpg",
  woodDiff: "textures/wood-dark/diffuse.jpg",
  woodNor: "textures/wood-dark/normal.jpg",
};
type Assets = Record<keyof typeof PATHS, THREE.Texture>;

export type Quality = "full" | "medium" | "low";

const useAssets = (anisotropy: number) => {
  const [handle] = useState(() =>
    delayRender("Loading room assets", { timeoutInMilliseconds: 120000 }),
  );
  const [assets, setAssets] = useState<Assets | null>(null);
  useEffect(() => {
    const tex = new THREE.TextureLoader();
    const keys = Object.keys(PATHS) as (keyof typeof PATHS)[];
    Promise.all(
      keys.map((k) =>
        k === "hdri"
          ? new RGBELoader().loadAsync(staticFile(PATHS[k]))
          : tex.loadAsync(staticFile(PATHS[k])),
      ),
    )
      .then((list) => {
        const a = Object.fromEntries(keys.map((k, i) => [k, list[i]])) as Assets;
        a.hdri.mapping = THREE.EquirectangularReflectionMapping;
        (["painting", "floorDiff", "woodDiff"] as const).forEach(
          (k) => (a[k].colorSpace = THREE.SRGBColorSpace),
        );
        (["floorDiff", "floorNor", "floorRough"] as const).forEach((k) => {
          a[k].wrapS = a[k].wrapT = THREE.RepeatWrapping;
          a[k].repeat.set(4, 4);
        });
        (["woodDiff", "woodNor"] as const).forEach((k) => {
          a[k].wrapS = a[k].wrapT = THREE.RepeatWrapping;
          a[k].repeat.set(1, 6);
        });
        a.wallNor.wrapS = a.wallNor.wrapT = THREE.RepeatWrapping;
        a.wallNor.repeat.set(3, 1.2);
        Object.values(a).forEach((t) => (t.anisotropy = anisotropy));
        setAssets(a);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);
  return assets;
};

// ───────── PROCEDURAL TEXTURES (seeded, so every frame is identical) ─────────
const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const makeCanvas = (
  w: number, h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  blurPx = 0,
) => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d")!, w, h);
  if (!blurPx) return c;
  const b = document.createElement("canvas");
  b.width = w; b.height = h;
  const g = b.getContext("2d")!;
  g.filter = `blur(${blurPx}px)`;
  g.drawImage(c, 0, 0);
  return b;
};

// Tropical garden seen through the window and doorway
const useGardenTexture = () =>
  useMemo(() => {
    const t = new THREE.CanvasTexture(makeCanvas(1024, 1024, (g, w, h) => {
      const r = rng(7);
      const sky = g.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#eef5dc"); sky.addColorStop(1, "#8fb35e");
      g.fillStyle = sky; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 300; i++) {
        const x = r() * w, y = r() * h, rad = 20 + r() * 90;
        g.fillStyle = `hsla(${85 + r() * 35},${45 + r() * 25}%,${32 + r() * 38}%,${0.35 + r() * 0.45})`;
        g.beginPath();
        g.ellipse(x, y, rad, rad * (0.3 + r() * 0.5), r() * Math.PI, 0, Math.PI * 2);
        g.fill();
      }
    }, 3));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

// Leaf pattern the sunlight shines through (creates the dappled wall shadows)
const useDappleTexture = () =>
  useMemo(() => {
    const t = new THREE.CanvasTexture(makeCanvas(1024, 1024, (g, w, h) => {
      const r = rng(42);
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#000000";
      for (let i = 0; i < 160; i++) {
        const x = r() * w, y = r() * h, rad = 10 + r() * 42;
        g.globalAlpha = 0.5 + r() * 0.5;
        g.beginPath();
        g.ellipse(x, y, rad, rad * 0.42, r() * Math.PI, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
    }, 7));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

// Fine quilt-stitch lines for the bedspread
const useQuiltBump = () =>
  useMemo(() => {
    const t = new THREE.CanvasTexture(makeCanvas(512, 512, (g, w, h) => {
      g.fillStyle = "#808080"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#4a4a4a";
      for (let x = 0; x < w; x += 14) g.fillRect(x, 0, 2, h);
    }, 1));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    return t;
  }, []);

// ───────── CAMERA: 3 cinematic shots ─────────
type Shot = { from: number; to: number; pos: [V3, V3]; look: [V3, V3]; fov: [number, number]; arc: number };
const SHOTS: Shot[] = [
  // 1. Establishing: wide, gentle curving glide
  { from: 0, to: 300, pos: [[-2.9, 1.55, 5.4], [-0.6, 1.45, 4.3]], look: [[0.9, 1.35, -3], [0.0, 1.6, -3]], fov: [42, 40], arc: 0.35 },
  // 2. Detail: low glide past the vase, tilting up to the painting
  { from: 300, to: 600, pos: [[-3.2, 0.95, -0.4], [-1.6, 1.15, -1.35]], look: [[-1.0, 0.75, -2.8], [-0.2, 1.7, -3]], fov: [34, 34], arc: 0.15 },
  // 3. Hero: from behind the bed, pushing in on the painting
  { from: 600, to: 900, pos: [[3.4, 1.5, 3.3], [0.25, 1.85, 0.9]], look: [[1.0, 1.3, -2.5], [-0.15, 1.95, -3]], fov: [40, 36], arc: -0.4 },
];
const lerp3 = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t,
];

const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const shot = SHOTS.find((s) => frame >= s.from && frame < s.to) ?? SHOTS[SHOTS.length - 1];
  const t = interpolate(frame, [shot.from, shot.to - 1], [0, 1], {
    ...CLAMP, easing: Easing.bezier(0.42, 0, 0.25, 1),
  });
  const p = lerp3(shot.pos[0], shot.pos[1], t);
  // curved path instead of a straight line
  const dx = shot.pos[1][0] - shot.pos[0][0];
  const dz = shot.pos[1][2] - shot.pos[0][2];
  const len = Math.hypot(dx, dz) || 1;
  const bow = Math.sin(Math.PI * t) * shot.arc;
  p[0] += (-dz / len) * bow;
  p[2] += (dx / len) * bow;
  // very subtle handheld sway (driven by frame, so it's deterministic)
  p[1] += Math.sin(frame * 0.071) * 0.005 + Math.sin(frame * 0.137) * 0.003;
  const l = lerp3(shot.look[0], shot.look[1], t);
  camera.position.set(p[0], p[1], p[2]);
  camera.fov = shot.fov[0] + (shot.fov[1] - shot.fov[0]) * t;
  camera.updateProjectionMatrix();
  camera.lookAt(l[0], l[1], l[2]);
  return null;
};

// ───────── PROPS ─────────
const vaseProfile = [[0, 0], [0.09, 0], [0.12, 0.06], [0.14, 0.16], [0.12, 0.26], [0.07, 0.33], [0.065, 0.38], [0.075, 0.4]]
  .map(([x, y]) => new THREE.Vector2(x, y));
const bowlProfile = [[0, 0], [0.08, 0], [0.16, 0.03], [0.2, 0.08], [0.19, 0.085], [0.15, 0.045], [0.0, 0.025]]
  .map(([x, y]) => new THREE.Vector2(x, y));

const Heliconia: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.3, 0]} castShadow>
      <cylinderGeometry args={[0.008, 0.01, 0.6, 8]} />
      <meshStandardMaterial color="#4f6b2c" roughness={0.7} />
    </mesh>
    {Array.from({ length: 6 }).map((_, i) => {
      const side = i % 2 ? 1 : -1;
      return (
        <mesh key={i} position={[side * 0.05, 0.3 + i * 0.055, 0]} rotation={[0, 0, side * -1.1]} castShadow>
          <coneGeometry args={[0.025, 0.13, 10]} />
          <meshStandardMaterial color={`hsl(${8 + i * 4}, 85%, ${46 + i * 2}%)`} roughness={0.5} />
        </mesh>
      );
    })}
    {([[-0.16, 0.38, 0.03, 0.7], [0.18, 0.42, -0.02, -0.8], [0.02, 0.5, 0.1, 0.2]] as const).map(
      ([x, y, z, rz], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.2, 0, rz]} scale={[0.055, 0.3, 0.012]} castShadow>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#2f5a26" roughness={0.6} />
        </mesh>
      ),
    )}
  </group>
);

const Flowers: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.07, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.14, 20]} />
      <meshStandardMaterial color="#dfe9e6" transparent opacity={0.35} roughness={0.05} />
    </mesh>
    {([[0, 0.24, 0], [0.05, 0.21, 0.03], [-0.05, 0.22, -0.02], [0.02, 0.27, -0.04], [-0.03, 0.26, 0.04]] as const).map(
      (p, i) => (
        <mesh key={i} position={p as unknown as V3}>
          <sphereGeometry args={[0.028, 12, 10]} />
          <meshStandardMaterial color="#fbfaf4" roughness={0.8} />
        </mesh>
      ),
    )}
  </group>
);

const Curtain: React.FC<{ position: V3; width: number; height: number }> = ({ position, width, height }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, 90, 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(x * 14) * 0.045 + Math.sin(x * 5.3) * 0.025);
    }
    g.computeVertexNormals();
    return g;
  }, [width, height]);
  return (
    <mesh geometry={geo} position={position} rotation={[0, -Math.PI / 2, 0]}>
      <meshStandardMaterial color="#fbf8f1" transparent opacity={0.55} roughness={1}
        side={THREE.DoubleSide} emissive="#fff3dc" emissiveIntensity={0.35} />
    </mesh>
  );
};

// ───────── THE ROOM ─────────
const Room: React.FC<{ a: Assets; shadowMapSize: number }> = ({ a, shadowMapSize }) => {
  const garden = useGardenTexture();
  const dapple = useDappleTexture();
  const quilt = useQuiltBump();
  const sunTarget = useMemo(() => new THREE.Object3D(), []);
  const wallMat = (
    <meshStandardMaterial color={C.wall} roughness={0.95} normalMap={a.wallNor}
      normalScale={new THREE.Vector2(0.35, 0.35)} />
  );
  const gardenGlow = new THREE.Color(1.45, 1.45, 1.35);

  return (
    <>
      {/* LIGHTING */}
      <Environment map={a.hdri} environmentIntensity={0.35} />
      <ambientLight intensity={0.1} color="#fff4e6" />
      <hemisphereLight args={["#dfe8ea", "#8a7a66", 0.35]} />
      <primitive object={sunTarget} position={[1.6, 1.3, -3]} />
      <spotLight
        position={[8.5, 3.8, -1.3]} target={sunTarget} map={dapple}
        angle={0.42} penumbra={0.5} decay={0} intensity={2.4} color="#ffd9a8"
        castShadow shadow-mapSize-width={shadowMapSize} shadow-mapSize-height={shadowMapSize}
        shadow-bias={-0.0004} shadow-normalBias={0.02}
      />
      <directionalLight position={[4, 3, 2]} intensity={0.5} color="#ffeedd" />
      <directionalLight position={[-4, 2, 0]} intensity={0.2} color="#dbe6ff" />
      <pointLight position={[4.15, 0.8, -0.6]} intensity={1.5} distance={2.5} decay={2} color="#ffd9a0" />

      {/* FLOOR: polished stone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1.75]} receiveShadow>
        <planeGeometry args={[9, 9.5]} />
        <meshStandardMaterial map={a.floorDiff} normalMap={a.floorNor} roughnessMap={a.floorRough}
          color={C.floorTint} roughness={0.6} metalness={0.02} envMapIntensity={0.8} />
      </mesh>

      {/* WALLS */}
      <mesh position={[0, 1.7, -3]} receiveShadow>
        <planeGeometry args={[9, 3.4]} />{wallMat}
      </mesh>
      <mesh position={[-4.5, 1.7, 1.75]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[9.5, 3.4]} />{wallMat}
      </mesh>
      <mesh position={[4.5, 1.7, 1.75]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[9.5, 3.4]} />{wallMat}
      </mesh>
      <mesh position={[0, 1.7, 6.5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[9, 3.4]} />{wallMat}
      </mesh>
      {/* white band at top of back wall + stone skirting */}
      <mesh position={[0, 3.225, -2.985]}>
        <boxGeometry args={[9, 0.35, 0.03]} />
        <meshStandardMaterial color={C.fascia} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.04, -2.99]}>
        <boxGeometry args={[9, 0.08, 0.02]} />
        <meshStandardMaterial color={C.skirting} roughness={0.6} />
      </mesh>

      {/* CEILING: dark wood planks + beams */}
      <mesh position={[0, 3.4, 1.75]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 9.5]} />
        <meshStandardMaterial map={a.woodDiff} normalMap={a.woodNor} color={C.ceilingTint} roughness={0.8} />
      </mesh>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[-4.05 + i * 0.9, 3.33, 1.75]}>
          <boxGeometry args={[0.1, 0.14, 9.5]} />
          <meshStandardMaterial color={C.beam} roughness={0.75} />
        </mesh>
      ))}

      {/* LEFT DOORWAY to the garden */}
      <mesh position={[-4.48, 1.2, -1.65]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.22, 2.34]} />
        <meshBasicMaterial map={garden} color={gardenGlow} />
      </mesh>
      {([[-2.3], [-1.0]] as const).map(([z], i) => (
        <mesh key={i} position={[-4.46, 1.2, z]} castShadow>
          <boxGeometry args={[0.08, 2.4, 0.12]} />
          <meshStandardMaterial color={C.doorWood} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[-4.46, 2.4, -1.65]}>
        <boxGeometry args={[0.08, 0.12, 1.42]} />
        <meshStandardMaterial color={C.doorWood} roughness={0.6} />
      </mesh>

      {/* RIGHT WINDOW: garden, wood mullions (they cast the bar shadows), sill, curtains */}
      <mesh position={[4.48, 1.95, -1.5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.6, 2.3]} />
        <meshBasicMaterial map={garden} color={gardenGlow} />
      </mesh>
      {[-2.8, -2.15, -1.5, -0.85, -0.2].map((z, i) => (
        <mesh key={i} position={[4.45, 1.95, z]} castShadow>
          <boxGeometry args={[0.06, 2.3, 0.06]} />
          <meshStandardMaterial color={C.doorWood} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[4.42, 0.8, -1.5]} castShadow>
        <boxGeometry args={[0.18, 0.06, 2.7]} />
        <meshStandardMaterial color={C.doorWood} roughness={0.6} />
      </mesh>
      <Curtain position={[4.36, 1.75, -0.45]} width={1.3} height={3.0} />
      <Curtain position={[4.36, 1.75, -2.75]} width={0.5} height={3.0} />

      {/* SIDEBOARD (oak) */}
      <mesh position={[-0.15, 0.025, -2.74]}>
        <boxGeometry args={[3.3, 0.05, 0.42]} />
        <meshStandardMaterial color="#6e5a42" roughness={0.7} />
      </mesh>
      <RoundedBox args={[3.4, 0.62, 0.48]} radius={0.015} smoothness={4}
        position={[-0.15, 0.36, -2.74]} castShadow receiveShadow>
        <meshStandardMaterial color={C.oak} roughness={0.55} />
      </RoundedBox>
      {[-0.85, 0, 0.85].map((x, i) => (
        <mesh key={i} position={[-0.15 + x, 0.36, -2.497]}>
          <boxGeometry args={[0.006, 0.56, 0.004]} />
          <meshStandardMaterial color={C.oakDark} roughness={0.7} />
        </mesh>
      ))}

      {/* VASE + HELICONIA + BOWL on the sideboard */}
      <mesh position={[-1.45, 0.67, -2.75]} castShadow>
        <latheGeometry args={[vaseProfile, 48]} />
        <meshStandardMaterial color={C.stone} roughness={0.85} />
      </mesh>
      <Heliconia position={[-1.45, 1.05, -2.75]} />
      <mesh position={[-0.9, 0.67, -2.72]} castShadow>
        <latheGeometry args={[bowlProfile, 48]} />
        <meshStandardMaterial color="#7a4e2c" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* THE PAINTING: wood frame + yacht canvas */}
      <mesh position={[-0.15, 1.95, -2.975]} castShadow>
        <boxGeometry args={[1.68, 1.68, 0.05]} />
        <meshStandardMaterial color={C.frame} roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh position={[-0.15, 1.95, -2.948]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshStandardMaterial map={a.painting} roughness={0.6} />
      </mesh>

      {/* BED: slatted headboard against the right wall */}
      {Array.from({ length: 27 }).map((_, i) => (
        <mesh key={i} position={[4.42, 0.95, -0.15 + i * 0.07]} castShadow>
          <boxGeometry args={[0.05, 1.0, 0.05]} />
          <meshStandardMaterial color={C.oak} roughness={0.6} />
        </mesh>
      ))}
      <RoundedBox args={[2.1, 0.32, 1.9]} radius={0.04} position={[3.35, 0.2, 0.8]} castShadow receiveShadow>
        <meshStandardMaterial color={C.linen} roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[2.12, 0.28, 1.96]} radius={0.06} position={[3.33, 0.5, 0.8]} castShadow receiveShadow>
        <meshStandardMaterial color={C.linen} roughness={0.95} bumpMap={quilt} bumpScale={2} />
      </RoundedBox>
      <mesh position={[2.55, 0.5, 0.8]}>
        <boxGeometry args={[0.12, 0.29, 1.985]} />
        <meshStandardMaterial color={C.navy} roughness={0.9} />
      </mesh>
      <RoundedBox args={[0.6, 0.05, 1.98]} radius={0.02} position={[3.0, 0.665, 0.8]} castShadow>
        <meshStandardMaterial color="#f7f3ea" roughness={1} />
      </RoundedBox>
      {([[0.35], [1.25]] as const).map(([z], i) => (
        <RoundedBox key={i} args={[0.22, 0.45, 0.75]} radius={0.09} smoothness={5}
          position={[4.2, 0.85, z]} rotation={[0, 0, 0.18]} castShadow>
          <meshStandardMaterial color="#fbfaf6" roughness={1} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.14, 0.42, 0.48]} radius={0.06} smoothness={5}
        position={[4.0, 0.84, 0.9]} rotation={[0, 0, -0.2]} castShadow>
        <meshStandardMaterial color={C.navy} roughness={0.95} />
      </RoundedBox>

      {/* NIGHTSTAND + MUSHROOM LAMP + FLOWERS */}
      <RoundedBox args={[0.5, 0.5, 0.45]} radius={0.015} position={[4.15, 0.25, -0.6]} castShadow receiveShadow>
        <meshStandardMaterial color={C.oak} roughness={0.55} />
      </RoundedBox>
      <mesh position={[4.15, 0.64, -0.6]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.28, 32]} />
        <meshStandardMaterial color={C.stone} roughness={0.8} />
      </mesh>
      <mesh position={[4.15, 0.8, -0.6]} castShadow>
        <sphereGeometry args={[0.2, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={C.lampShade} roughness={0.9} emissive="#ffe2b0"
          emissiveIntensity={1.2} side={THREE.DoubleSide} />
      </mesh>
      <Flowers position={[3.95, 0.5, -0.78]} />
    </>
  );
};

// ───────── MAIN COMPOSITION ─────────
export const TestRoomCinematic30: React.FC<{ quality?: Quality }> = ({ quality = "full" }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const anisotropy = quality === "full" ? 16 : 4;
  const shadowMapSize = quality === "full" ? 2048 : 1024;
  const assets = useAssets(anisotropy);
  if (!assets) return null;

  // fade in, dip to black between shots, fade out
  const black = Math.max(
    interpolate(frame, [0, 24], [1, 0], CLAMP),
    interpolate(frame, [290, 300, 312], [0, 1, 0], CLAMP),
    interpolate(frame, [590, 600, 612], [0, 1, 0], CLAMP),
    interpolate(frame, [876, 900], [0, 1], CLAMP),
  );
  const titleOpacity = interpolate(frame, [760, 800, 862, 886], [0, 1, 1, 0], CLAMP);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas width={width} height={height} shadows flat={quality !== "low"} dpr={1}
        gl={{ antialias: false, outputColorSpace: THREE.SRGBColorSpace }}
        camera={{ fov: 40, near: 0.05, far: 60, position: [0, 1.5, 5] }}>
        <CameraRig frame={frame} />
        <Room a={assets} shadowMapSize={shadowMapSize} />
        {quality !== "low" && (
          <EffectComposer multisampling={quality === "full" ? 4 : 0} enableNormalPass={false}>
            <Bloom intensity={0.35} luminanceThreshold={0.85} luminanceSmoothing={0.2}
              mipmapBlur={quality === "full"} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            <Vignette offset={0.3} darkness={0.45} eskil={false} />
          </EffectComposer>
        )}
      </ThreeCanvas>

      {/* end title */}
      <AbsoluteFill style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0) 40%)",
        opacity: titleOpacity,
      }} />
      <div style={{
        position: "absolute", left: 120, bottom: 110, color: "#fbf7ef", fontFamily,
        opacity: titleOpacity, textShadow: "0 2px 24px rgba(0,0,0,0.35)",
        translate: `0px ${interpolate(frame, [760, 820], [18, 0], { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) })}px`,
      }}>
        <div style={{ fontSize: 84, letterSpacing: "0.18em", fontWeight: 600 }}>WALL DECORES</div>
        <div style={{ fontSize: 30, letterSpacing: "0.08em", marginTop: 8, opacity: 0.9 }}>
          Handcrafted canvas art · Angamaly, Kerala
        </div>
      </div>

      <AbsoluteFill style={{ backgroundColor: "#000", opacity: black }} />
    </AbsoluteFill>
  );
};
