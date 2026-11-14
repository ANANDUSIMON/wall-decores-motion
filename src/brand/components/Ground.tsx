import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { type Palette, CREAM, W, H } from '../theme';

/**
 * The vibrant ground every graphic scene sits on — three stacked washes
 * rather than one flat fill, so a light background stays alive without
 * anything visibly "animating": a broad atmospheric field (the spec's
 * 45-55%), a subordinate cool structure, and a cream rest zone.
 */
export const Ground: React.FC<{
  pal: Palette;
  /** flips which corner the cool structure occupies */
  mirror?: boolean;
  energy?: number;
}> = ({ pal, mirror = false, energy = 1 }) => {
  const f = useCurrentFrame();
  const [dominant, coDominant, supporting, secondary, highlight] = pal.colors;
  const drift = interpolate(f, [0, 300], [0, 1], { extrapolateRight: 'clamp' });
  const a = mirror ? 100 - drift * 6 : drift * 6;
  const b = mirror ? drift * 8 : 100 - drift * 8;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${mirror ? 200 : 160}deg,
            ${coDominant} 0%, ${dominant} 52%, ${coDominant} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(76% 44% at ${a}% ${mirror ? 16 : 88}%,
            ${supporting} 0%, ${secondary} 38%, transparent 72%)`,
          opacity: 0.85 * energy,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(58% 34% at ${b}% ${mirror ? 80 : 20}%,
            ${highlight} 0%, ${CREAM}00 70%)`,
          opacity: 0.78,
        }}
      />
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: 'multiply' }}>
        <svg width="100%" height="100%">
          <filter id="brand-tooth">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#brand-tooth)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Slowly rotating lotus-petal arcs — ties the graphic scenes to the art. */
export const PetalArcs: React.FC<{
  pal: Palette;
  cx: number;
  cy: number;
  r: number;
  speed?: number;
  opacity?: number;
  petals?: number;
}> = ({ pal, cx, cy, r, speed = 1, opacity = 0.26, petals = 12 }) => {
  const f = useCurrentFrame();
  const rot = (f * 0.14 * speed) % 360;
  const cols = [pal.colors[2], pal.colors[4], pal.colors[3]];
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}>
      <g transform={`rotate(${rot} ${cx} ${cy})`}>
        {Array.from({ length: petals }).map((_, i) => {
          const a = (i / petals) * Math.PI * 2;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx={r * 0.34}
              ry={r * 0.13}
              transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`}
              fill="none"
              stroke={cols[i % cols.length]}
              strokeWidth={2.4}
            />
          );
        })}
      </g>
    </svg>
  );
};

/** Light, warm grain. Overlay blend keeps it from greying the vibrant ground. */
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.035, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
      <svg width="100%" height="100%">
        <filter id={`brand-grain-${f % 48}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            seed={f % 48}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#brand-grain-${f % 48})`} />
      </svg>
    </AbsoluteFill>
  );
};
