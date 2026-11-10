import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { palette, type, grid, ease, FONT_STACK } from '../theme';
import { BrushStroke } from '../components/BrushStroke';
import { RollSwap } from '../components/KineticText';

/** SHOT 3 — TEXTURE · 150 frames (5.0s)
 *  We go close. Three strokes paint themselves down the frame in sequence,
 *  and a raking highlight sweeps across so the paint catches light like
 *  real impasto. The claim lines roll through while the paint is still wet.
 */
export const Shot3: React.FC = () => {
  const frame = useCurrentFrame();

  const cols = [
    { x: grid.col(1) + 80,  c: palette.gold,    s: 101, d: 4  },
    { x: grid.col(5) + 60,  c: palette.emerald, s: 211, d: 8  },
    { x: grid.col(9) + 40,  c: palette.amber,   s: 307, d: 12 },
  ];

  // light raking across the painted surface
  const rake = interpolate(frame, [40, 120], [-500, 2400], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  const push = interpolate(frame, [0, 150], [1.0, 1.07], { easing: ease.sweep });

  return (
    <AbsoluteFill style={{ backgroundColor: palette.ink }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {/* architectural grid, barely there */}
        <svg
          width={grid.width}
          height={grid.height}
          style={{ position: 'absolute', inset: 0, opacity: 0.075 }}
        >
          {Array.from({ length: 13 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={grid.col(i > 11 ? 11 : i)}
              y1={0}
              x2={grid.col(i > 11 ? 11 : i)}
              y2={grid.height}
              stroke={palette.cream}
              strokeWidth={1}
              opacity={interpolate(frame, [16 + i * 2, 34 + i * 2], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}
            />
          ))}
          {[0.25, 0.5, 0.75].map((p, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={grid.height * p}
              x2={grid.width}
              y2={grid.height * p}
              stroke={palette.cream}
              strokeWidth={1}
              opacity={interpolate(frame, [28 + i * 4, 48 + i * 4], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })}
            />
          ))}
        </svg>

        {/* three vertical strokes, staggered */}
        {cols.map((col) => (
          <BrushStroke
            key={col.s}
            from={[col.x, 90]}
            to={[col.x + 26, 1000]}
            color={col.c}
            thickness={132}
            bristles={78}
            dryness={0.42}
            revealStart={col.d}
            revealDuration={34}
            bow={18}
            seed={col.s}
            opacity={0.95}
          />
        ))}

        {/* raking highlight */}
        <div
          style={{
            position: 'absolute',
            left: rake,
            top: -300,
            width: 420,
            height: 1700,
            background: `linear-gradient(90deg,
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,0.16) 48%,
              rgba(255,255,255,0) 100%)`,
            transform: 'rotate(12deg)',
            mixBlendMode: 'overlay',
            filter: 'blur(12px)',
            pointerEvents: 'none',
          }}
        />

        {/* rolling claim lines */}
        <div
          style={{
            position: 'absolute',
            left: grid.margin,
            top: grid.height / 2 - 70,
            width: grid.usable,
          }}
        >
          <RollSwap
            lines={['HAND-MIXED', 'HAND-LAID', 'HAND-FINISHED']}
            hold={44}
            start={24}
            color={palette.cream}
            style={{ ...type.display, textShadow: '0 8px 60px rgba(0,0,0,0.75)' }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            right: grid.margin,
            bottom: grid.margin,
            ...type.kicker,
            fontFamily: FONT_STACK,
            color: palette.creamDim,
            opacity: interpolate(frame, [34, 50], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          Oil · Impasto · Bespoke
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
