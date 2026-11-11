import React from 'react';
import { AbsoluteFill } from 'remotion';
import { palette } from '../theme';

/**
 * The gallery wall everything hangs on.
 *
 * Three things stop a light background reading as "blank page":
 *   a light pool, so there is somewhere the light is coming from;
 *   a fall into the corners, so the wall has a far edge;
 *   a faint plaster grain, so the surface has a material.
 *
 * Together they cost almost nothing to render and are the difference between
 * a white wall and white paper.
 */
export const Wall: React.FC<{
  /** where the light lands, as a fraction of the frame */
  lightX?: number;
  lightY?: number;
  /** how hard the light is — higher is more dramatic, lower more even */
  lightStrength?: number;
  /** warm bounce from a floor at the bottom of frame */
  floorBounce?: number;
}> = ({ lightX = 0.5, lightY = 0.42, lightStrength = 1, floorBounce = 0.6 }) => (
  <AbsoluteFill style={{ backgroundColor: palette.wall }}>
    {/* the pool of light */}
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 68% 58% at ${(lightX * 100).toFixed(
          1
        )}% ${(lightY * 100).toFixed(1)}%,
          ${palette.wallLift} 0%,
          ${palette.wall} 46%,
          ${palette.wallShade} 88%,
          ${palette.wallDeep} 100%)`,
        opacity: lightStrength,
      }}
    />

    {/* warm bounce rising off the floor */}
    <AbsoluteFill
      style={{
        background: `linear-gradient(to top,
          rgba(196,166,118,0.16) 0%,
          rgba(196,166,118,0.05) 16%,
          rgba(196,166,118,0) 34%)`,
        opacity: floorBounce,
      }}
    />

    {/* plaster grain — very fine, very faint; it only has to break the
        flatness, never to be noticed */}
    <svg
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0, opacity: 0.1 }}
    >
      <filter id="wall-plaster">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.62"
          numOctaves={4}
          seed={7}
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect
        width="100%"
        height="100%"
        filter="url(#wall-plaster)"
        style={{ mixBlendMode: 'multiply' }}
      />
    </svg>
  </AbsoluteFill>
);
