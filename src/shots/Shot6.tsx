import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { palette, type, grid, ease, FONT_STACK } from '../theme';
import { BrushStroke } from '../components/BrushStroke';
import { GrowLine } from '../components/KineticText';

/** SHOT 6 — BRAND LOCK-UP · 90 frames (3.0s)
 *  Back to ink. A wide gold stroke sweeps through centre frame and the name
 *  is revealed in its wake — the matte-reveal technique doing the one job it
 *  does better than any fade: making type look painted on. Then stillness.
 */
export const Shot6: React.FC = () => {
  const frame = useCurrentFrame();

  const SWEEP_START = 4;
  const SWEEP_LEN = 24;

  // The name is revealed by a mask that trails the stroke's leading edge.
  const strokeProgress = interpolate(
    frame,
    [SWEEP_START, SWEEP_START + SWEEP_LEN],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.entrance }
  );
  const nameReveal = interpolate(
    frame,
    [SWEEP_START + 5, SWEEP_START + SWEEP_LEN + 4],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.entrance }
  );

  const subUp = interpolate(frame, [38, 54], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.entrance,
  });
  const subOp = interpolate(frame, [38, 54], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const contactOp = interpolate(frame, [56, 72], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // faint warm glow behind the lock-up
  const glow = interpolate(frame, [4, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: palette.ink }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 54% 40% at 50% 48%,
            rgba(212,178,106,${glow * 0.14}) 0%,
            rgba(212,178,106,0) 72%)`,
        }}
      />

      {/* the sweeping stroke */}
      <BrushStroke
        from={[60, grid.height / 2 + 6]}
        to={[1880, grid.height / 2 - 10]}
        color={palette.gold}
        thickness={150}
        bristles={76}
        dryness={0.34}
        revealStart={SWEEP_START}
        revealDuration={SWEEP_LEN}
        bow={14}
        seed={1313}
        opacity={0.5}
      />

      {/* WALL DECORES — revealed in the stroke's wake */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          clipPath: `inset(0 ${(1 - nameReveal) * 100}% 0 0)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 34,
            fontFamily: FONT_STACK,
            fontSize: 104,
            fontWeight: 900,
            letterSpacing: '0.12em',
            color: palette.cream,
            textShadow: `0 0 70px rgba(212,178,106,${glow * 0.5})`,
            whiteSpace: 'nowrap',
          }}
        >
          <span>WALL</span>
          <span style={{ width: 90, display: 'inline-block' }} />
          <span>DECORES</span>
        </div>
      </div>

      {/* hairline growing outward between the two words */}
      <GrowLine
        x={grid.width / 2}
        y={grid.height / 2 - 2}
        width={84}
        color={palette.gold}
        start={30}
        duration={14}
        thickness={2}
      />

      {/* ARTISAN · COLLECTIVES */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 268,
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            color: palette.gold,
            transform: `translateY(${subUp}px)`,
            opacity: subOp,
          }}
        >
          Artisan · Collectives
        </div>
      </div>

      {/* contact */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: grid.margin,
          textAlign: 'center',
          ...type.annotation,
          fontFamily: FONT_STACK,
          color: palette.creamDim,
          opacity: contactOp,
        }}
      >
        walldecores.com · @wall_decores_artisan · 9037790012
      </div>
    </AbsoluteFill>
  );
};
