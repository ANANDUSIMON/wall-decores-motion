import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { COLORS, LAYOUT, T, ease } from '../theme';
import { lerp, prog } from '../motion';
import { RoomStructure } from './RoomStructure';
import { Furniture } from './Furniture';
import { CanvasMount } from './CanvasMount';
import { Painting } from './Painting';
import { Brush } from './Brush';
import { CANVAS_CENTER } from './geometry';

/** Only pay the motion-blur cost while something is actually moving fast. */
const BlurWhile: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f >= from && f <= to) {
    return (
      <CameraMotionBlur shutterAngle={200} samples={6}>
        {children}
      </CameraMotionBlur>
    );
  }
  return <>{children}</>;
};

/** Zoom level 0 (whole room) → 1 (canvas fills the window). */
const zoomAt = (f: number) =>
  prog(f, T.zoomIn[0], T.zoomIn[1] - T.zoomIn[0], ease.inOut) -
  prog(f, T.zoomOut[0], T.zoomOut[1] - T.zoomOut[0], ease.inOut);

/**
 * The room lives inside a rounded "viewport" window, so even when the camera
 * pushes into the painting, the headline, captions and HUD always sit on
 * clean cream — text never fights the illustration.
 */
export const Room: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.viewportIn) return null;

  // Viewport geometry (shrinks into a framed card for the sign-off)
  const shrink = prog(f, T.shrink[0], T.shrink[1] - T.shrink[0], ease.inOut);
  const v = LAYOUT.viewport;
  const size = lerp(v.size, 700, shrink);
  const x = lerp(v.x, (1080 - 700) / 2, shrink);
  const y = lerp(v.y, 290, shrink);

  const enter = prog(f, T.viewportIn, 30, ease.heavy);

  // Camera
  const z = zoomAt(f);
  const u = size / 1000;
  const cx = CANVAS_CENTER.x * u;
  const cy = CANVAS_CENTER.y * u;
  const s = lerp(1, 2.4, z);
  const tx = lerp(cx, size / 2, z);
  const ty = lerp(cy, size / 2, z);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: 28,
        overflow: 'hidden',
        background: COLORS.paper,
        boxShadow: `0 0 0 2px ${COLORS.hairline}, 0 30px 60px rgba(23,18,13,${0.1 * enter})`,
        opacity: enter,
        transform: `scale(${0.94 + 0.06 * enter})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '0 0',
          transform: `translate(${tx}px, ${ty}px) scale(${s}) translate(${-cx}px, ${-cy}px)`,
        }}
      >
        <RoomStructure />
        <BlurWhile from={T.furnitureStart} to={T.furnitureStart + 130}>
          <Furniture />
        </BlurWhile>
        <CanvasMount />
        <Painting />
        <Brush />
      </div>
    </div>
  );
};
