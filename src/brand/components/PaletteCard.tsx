import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { type Palette, FONT_STACK, CREAM } from '../theme';
import { Swatch } from './Type';

/** One palette card for S3 — name, then its 5 swatches popping in sequence. */
export const PaletteCard: React.FC<{
  pal: Palette;
  delay: number;
  x: number;
  y: number;
}> = ({ pal, delay, x, y }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 16, mass: 0.8, stiffness: 110 }, durationInFrames: 34 });
  const tx = interpolate(s, [0, 1], [-220, 0]);
  const op = interpolate(f - delay, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateX(${tx.toFixed(2)}px)`,
        opacity: op,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          fontFamily: FONT_STACK,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: CREAM,
        }}
      >
        {pal.id} · {pal.name}
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        {pal.colors.map((hex, i) => (
          <Swatch key={hex} hex={hex} pct={pal.area[i]} delay={delay + 14 + i * 6} size={78} labelColor={CREAM} />
        ))}
      </div>
    </div>
  );
};
