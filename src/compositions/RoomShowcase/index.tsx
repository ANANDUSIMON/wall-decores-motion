import React, { Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useLoader, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

export const ROOM_SHOWCASE_FPS = 24;
export const ROOM_SHOWCASE_DURATION = 216; // 9s at 24fps

const ROOM_WIDTH = 8;
const ROOM_DEPTH = 6;
const WALL_HEIGHT = 4;

/**
 * @remotion/three snapshots one frame at a time server-side, so there is no
 * running RAF loop for useFrame() to tick on. Every value below is derived
 * straight from useCurrentFrame()/interpolate() instead, which is what keeps
 * this safe to render on Lambda.
 */
const CameraRig: React.FC<{ x: number; z: number; lookAt: [number, number, number] }> = ({ x, z, lookAt }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(x, 1.6, z);
    camera.lookAt(...lookAt);
  }, [camera, x, z, lookAt]);
  return null;
};

const repeatTexture = (tex: THREE.Texture, u: number, v: number) => {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(u, v);
  tex.colorSpace = THREE.SRGBColorSpace;
};

const Floor: React.FC = () => {
  const [diffuse, normal, roughness] = useLoader(THREE.TextureLoader, [
    staticFile('textures/floor/diffuse.jpg'),
    staticFile('textures/floor/normal.jpg'),
    staticFile('textures/floor/roughness.jpg'),
  ]);

  useMemo(() => {
    repeatTexture(diffuse, 4, 3);
    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(4, 3);
    roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(4, 3);
  }, [diffuse, normal, roughness]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
      <meshStandardMaterial map={diffuse} normalMap={normal} roughnessMap={roughness} />
    </mesh>
  );
};

const Wall: React.FC<{
  width: number;
  height: number;
  position: [number, number, number];
  rotation: [number, number, number];
}> = ({ width, height, position, rotation }) => {
  const [diffuse, normal] = useLoader(THREE.TextureLoader, [
    staticFile('textures/wall/diffuse.jpg'),
    staticFile('textures/wall/normal.jpg'),
  ]);

  useMemo(() => {
    repeatTexture(diffuse, width / 3, height / 3);
    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(width / 3, height / 3);
  }, [diffuse, normal, width, height]);

  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={diffuse} normalMap={normal} />
    </mesh>
  );
};

/** Placeholder swatch — swap `color` for a real Wall Decores art texture later. */
const PaintingPlaceholder: React.FC<{ position: [number, number, number]; color: string }> = ({
  position,
  color,
}) => (
  <group position={position}>
    <mesh position={[0, 0, 0.02]}>
      <planeGeometry args={[1.3, 1.7]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
    </mesh>
    {/* thin frame */}
    <mesh position={[0, 0, 0.01]}>
      <planeGeometry args={[1.42, 1.82]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
    </mesh>
  </group>
);

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const cameraX = interpolate(frame, [0, durationInFrames], [-1.8, 1.4]);
  const cameraZ = interpolate(frame, [0, durationInFrames], [5.2, 3.6]);

  const backZ = -ROOM_DEPTH / 2;

  return (
    <>
      <CameraRig x={cameraX} z={cameraZ} lookAt={[0, 1.5, backZ]} />

      <Environment files={staticFile('hdri/brown_photostudio_02.hdr')} background={false} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[2, 4, 2]} intensity={0.6} />

      <Floor />
      <Wall width={ROOM_WIDTH} height={WALL_HEIGHT} position={[0, WALL_HEIGHT / 2, backZ]} rotation={[0, 0, 0]} />
      <Wall
        width={ROOM_DEPTH}
        height={WALL_HEIGHT}
        position={[-ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <Wall
        width={ROOM_DEPTH}
        height={WALL_HEIGHT}
        position={[ROOM_WIDTH / 2, WALL_HEIGHT / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      <PaintingPlaceholder position={[-1.4, 1.8, backZ]} color="#c8a870" />
      <PaintingPlaceholder position={[1.4, 1.8, backZ]} color="#1d9e75" />

      <EffectComposer>
        <Bloom intensity={0.25} luminanceThreshold={0.65} luminanceSmoothing={0.2} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.5} />
      </EffectComposer>
    </>
  );
};

export const RoomShowcase: React.FC = () => {
  const { width, height } = useVideoConfig();
  const [handle] = useState(() => delayRender('Loading RoomShowcase 3D assets (HDRI + PBR textures)'));

  useEffect(() => {
    const manager = THREE.DefaultLoadingManager;
    const previousOnLoad = manager.onLoad;
    manager.onLoad = () => {
      continueRender(handle);
      previousOnLoad?.();
    };
    return () => {
      manager.onLoad = previousOnLoad;
    };
  }, [handle]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <ThreeCanvas width={width} height={height} linear flat shadows>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
