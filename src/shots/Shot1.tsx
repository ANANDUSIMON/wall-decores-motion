import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { palette, type, grid, ease, FONT_STACK } from '../theme';
import { BrushStroke } from '../components/BrushStroke';
import { GrowLine } from '../components/KineticText';

/** SHOT 1 — COLD OPEN · 90 frames (3.0s)
 *  Ink. A gold hairline opens the frame, a loaded brush swipes across it and
 *  wipes in a warm field, three light bars rake past. Restraint on purpose:
 *  the film has 23 seconds to get loud, this is the inhale.
 */
export const Shot1: React.FC = () => {
  const frame = useCurrentFrame();

  const swipeReveal = 16;

  // the warm field wiped in by the brush
  const fieldW = interpolate(frame, [18, 44], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.entrance,
  });

  const kickerUp = interpolate(frame, [48, 64], [26, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.entrance,
  });
  const kickerOp = interpolate(frame, [48, 64], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // slow 1.0 -> 1.04 breath on the whole shot
  const breathe = interpolate(frame, [0, 90], [1, 1.04], {
    easing: ease.sweep,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: palette.ink }}>
      <AbsoluteFill style={{ transform: `scale(${breathe})` }}>
        {/* warm field, revealed behind the swipe */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(118deg, ${palette.inkLift} 0%, #231a12 46%, ${palette.ink} 100%)`,
            clipPath: `polygon(0 0, ${fieldW * 118}% 0, ${
              fieldW * 118 - 34
            }% 100%, 0 100%)`,
          }}
        />

        {/* light bars raking across */}
        {[0, 1, 2].map((i) => {
          const x = interpolate(
            frame,
            [10 + i * 7, 58 + i * 7],
            [-400, 2300],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.cinematic }
          );
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: -200,
                width: 2 + i * 1.5,
                height: 1500,
                background: palette.goldBright,
                opacity: 0.1 + i * 0.05,
                transform: 'rotate(23deg)',
                filter: `blur(${2 + i * 3}px)`,
                boxShadow: `0 0 40px ${palette.gold}`,
              }}
            />
          );
        })}

        {/* the opening hairline */}
        <GrowLine
          x={grid.width / 2}
          y={grid.height / 2}
          width={grid.width - grid.margin * 2}
          color={palette.gold}
          start={2}
          duration={12}
          thickness={1}
        />

        {/* the swipe */}
        <BrushStroke
          from={[160, 300]}
          to={[1800, 860]}
          color={palette.gold}
          thickness={78}
          bristles={74}
          dryness={0.3}
          revealStart={16}
          revealDuration={swipeReveal}
          bow={30}
          seed={3}
          opacity={0.92}
        />

        {/* vertical rule dropping to the 1/3 line */}
        <GrowLine
          x={grid.col(4)}
          y={0}
          width={grid.height * 0.34}
          color={palette.gold}
          start={30}
          duration={14}
          thickness={1}
          vertical
        />

        {/* kicker */}
        <div
          style={{
            position: 'absolute',
            left: grid.margin,
            bottom: grid.margin,
            ...type.kicker,
            fontFamily: FONT_STACK,
            color: palette.creamDim,
            transform: `translateY(${kickerUp}px)`,
            opacity: kickerOp,
          }}
        >
          Angamaly · Kerala
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
