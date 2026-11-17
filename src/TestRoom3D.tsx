import { useEffect, useState } from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, delayRender,
  continueRender, cancelRender, staticFile, interpolate, Easing,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { RGBELoader } from "three-stdlib";

type Assets = { hdri: THREE.DataTexture; painting: THREE.Texture };

const useAssets = () => {
  const [handle] = useState(() => delayRender("Loading room assets"));
  const [assets, setAssets] = useState<Assets | null>(null);
  useEffect(() => {
    Promise.all([
      new RGBELoader().loadAsync(staticFile("hdri/studio_small_03_1k.hdr")),
      new THREE.TextureLoader().loadAsync(staticFile("art/yacth.png.png")),
    ])
      .then(([hdri, painting]) => {
        hdri.mapping = THREE.EquirectangularReflectionMapping;
        painting.colorSpace = THREE.SRGBColorSpace;
        painting.anisotropy = 8;
        setAssets({ hdri, painting });
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [handle]);
  return assets;
};

// Moves the camera each frame. Slow, eased dolly towards the painting.
const CameraRig: React.FC<{ frame: number; duration: number }> = ({ frame, duration }) => {
  const camera = useThree((s) => s.camera);
  const opts = {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  };
  const x = interpolate(frame, [0, duration], [1.4, 0.2], opts);
  const y = interpolate(frame, [0, duration], [1.4, 1.6], opts);
  const z = interpolate(frame, [0, duration], [4.8, 1.6], opts);
  camera.position.set(x, y, z);
  camera.lookAt(0, 1.75, -3);
  return null;
};

// Colours taken from the Kerala bedroom reference
const WALL = "#8fa1a6";      // dusty blue-grey
const FLOOR = "#b9b3a8";     // light terrazzo stone
const CEILING = "#5b3a24";   // dark teak
const CABINET = "#c9a87e";   // light oak
const FRAME = "#a9824f";     // wooden frame

export const TestRoom3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const assets = useAssets();
  if (!assets) return null;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 42, near: 0.1, far: 50 }}>
        <CameraRig frame={frame} duration={durationInFrames} />
        <Environment map={assets.hdri} environmentIntensity={0.6} />
        <color attach="background" args={["#d9d4c8"]} />

        {/* Lighting: warm sun through a window on the right, plus a soft fill */}
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[6, 4.5, 1]} intensity={2.2} color="#ffe2b8" castShadow
          shadow-mapSize-width={2048} shadow-mapSize-height={2048}
          shadow-camera-left={-6} shadow-camera-right={6}
          shadow-camera-top={6} shadow-camera-bottom={-6}
        />
        <pointLight position={[0, 2.8, 1]} intensity={4} distance={8} color="#fff4e6" />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[9, 10]} />
          <meshStandardMaterial color={FLOOR} roughness={0.35} metalness={0.05} />
        </mesh>
        {/* Ceiling */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.3, 0]}>
          <planeGeometry args={[9, 10]} />
          <meshStandardMaterial color={CEILING} roughness={0.8} />
        </mesh>
        {/* Back wall */}
        <mesh position={[0, 1.65, -3]} receiveShadow>
          <planeGeometry args={[9, 3.3]} />
          <meshStandardMaterial color={WALL} roughness={0.95} />
        </mesh>
        {/* Left wall */}
        <mesh position={[-4.5, 1.65, 2]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[10, 3.3]} />
          <meshStandardMaterial color={WALL} roughness={0.95} />
        </mesh>
        {/* Right wall, with a glowing window opening */}
        <mesh position={[4.5, 1.65, 2]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[10, 3.3]} />
          <meshStandardMaterial color={WALL} roughness={0.95} />
        </mesh>
        <mesh position={[4.49, 1.7, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[2.2, 2.2]} />
          <meshBasicMaterial color="#fff6e0" toneMapped={false} />
        </mesh>

        {/* Sideboard under the painting, for sense of scale */}
        <mesh position={[0, 0.38, -2.72]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.76, 0.5]} />
          <meshStandardMaterial color={CABINET} roughness={0.6} />
        </mesh>

        {/* Painting: wooden frame plus the canvas */}
        <mesh position={[0, 1.95, -2.96]} castShadow>
          <boxGeometry args={[1.66, 1.66, 0.06]} />
          <meshStandardMaterial color={FRAME} roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.95, -2.925]}>
          <planeGeometry args={[1.58, 1.58]} />
          <meshStandardMaterial map={assets.painting} roughness={0.55} />
        </mesh>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
