import React from 'react';
import { useCurrentFrame } from 'remotion';
import { fonts } from '../theme';
import { riseIn } from '../motion';

export type Swatch = { hex: string; percent: number };

export type SwatchRowProps = {
  name: string;
  swatches: Swatch[];
  delay?: number;
  stagger?: number;
  color: string;
  width?: number;
};

/**
 * Animated colour dots with hex + canvas-area % underneath, staggered in.
 * Labels always render in `color` (ink on paper, per the brief — never
 * white-on-cream).
 */
export const SwatchRow: React.FC<SwatchRowProps> = ({ name, swatches, delay = 0, stagger = 6, color, width = 820 }) => {
  const frame = useCurrentFrame();
  const { opacity: nameOpacity, translateY: nameY } = riseIn(frame, delay, 14, 12);

  return (
    <div style={{ width }}>
      <div
        style={{
          opacity: nameOpacity,
          transform: `translateY(${nameY}px)`,
          fontFamily: fonts.mono,
          fontSize: 14,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color,
          marginBottom: 14,
        }}
      >
        {name}
      </div>
      <div style={{ display: 'flex', gap: 28 }}>
        {swatches.map((swatch, i) => {
          const { opacity, translateY } = riseIn(frame, delay + 10 + i * stagger, 14, 12);
          return (
            <div key={swatch.hex} style={{ opacity, transform: `translateY(${translateY}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: swatch.hex, border: '1px solid rgba(23,18,13,0.15)' }} />
              <div style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: '0.06em', color, textAlign: 'center' }}>
                <div>{swatch.hex.toUpperCase()}</div>
                <div style={{ opacity: 0.65 }}>{swatch.percent}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
