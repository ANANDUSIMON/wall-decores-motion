import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { palette, type, grid, ease, FONT_STACK } from '../theme';
import { PaintingCanvas } from '../components/PaintingCanvas';
import { MaskRise } from '../components/KineticText';

/** SHOT 2 — THE DROP · 150 frames (5.0s)
 *  The hero shot. Five canvases fall into frame with real weight, staggered
 *  so the eye tracks left to right. Motion blur comes off the fall curve
 *  itself, so the smear is honest — fast canvases streak, settled ones are
 *  razor sharp. Type lands only once the paint has stopped moving.
 */
export const Shot2: React.FC = () => {
  const frame = useCurrentFrame();

  const canvases = [
    { x: 300,  y: 470, w: 240, h: 320, d: 0,  c: palette.emerald, a: palette.emeraldDeep, r: -3, s: 11 },
    { x: 620,  y: 560, w: 300, h: 400, d: 7,  c: palette.gold,    a: '#9a7b3c',           r: 2,  s: 23 },
    { x: 980,  y: 440, w: 340, h: 460, d: 14, c: palette.amber,   a: palette.amberDeep,   r: -2, s: 37 },
    { x: 1360, y: 580, w: 270, h: 360, d: 21, c: palette.teal,    a: '#14615f',           r: 4,  s: 51 },
    { x: 1660, y: 470, w: 210, h: 290, d: 28, c: palette.rose,    a: '#8e2f50',           r: -5, s: 67 },
  ];

  // Floor shadow pool darkens as canvases settle.
  const pool = interpolate(frame, [20, 60], [0, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Slow pull-back once everything has landed.
  const scale = interpolate(frame, [55, 150], [1.06, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: palette.ink }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        {/* warm pool of light the canvases land into */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 60% 44% at 50% 62%,
              rgba(212,178,106,${0.1 + pool * 0.12}) 0%,
              rgba(0,0,0,0) 70%)`,
          }}
        />

        {canvases.map((c) => (
          <PaintingCanvas
            key={c.s}
            x={c.x}
            y={c.y}
            width={c.w}
            height={c.h}
            delay={c.d}
            color={c.c}
            accent={c.a}
            rotate={c.r}
            seed={c.s}
            dropFrom={1500}
            mass={1.1 + (c.h / 460) * 0.5}
          />
        ))}

        {/* contact shadows on the floor line */}
        {canvases.map((c) => (
          <div
            key={`sh-${c.s}`}
            style={{
              position: 'absolute',
              left: c.x - c.w * 0.6,
              top: c.y + c.h / 2 - 8,
              width: c.w * 1.2,
              height: 26,
              background: `radial-gradient(ellipse at center, rgba(0,0,0,${pool}) 0%, rgba(0,0,0,0) 72%)`,
              filter: 'blur(6px)',
            }}
          />
        ))}

        {/* type lands after the paint stops */}
        <div
          style={{
            position: 'absolute',
            left: grid.margin,
            bottom: grid.margin + 10,
          }}
        >
          <MaskRise
            start={62}
            duration={20}
            color={palette.cream}
            style={{ ...type.displaySm }}
          >
            FIVE YEARS
          </MaskRise>
          <MaskRise
            start={70}
            duration={20}
            color={palette.gold}
            style={{ ...type.displaySm }}
          >
            ONE STUDIO
          </MaskRise>
        </div>

        <div
          style={{
            position: 'absolute',
            right: grid.margin,
            bottom: grid.margin + 16,
            ...type.kicker,
            fontFamily: FONT_STACK,
            color: palette.creamDim,
            opacity: interpolate(frame, [86, 100], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          Handcrafted · Kerala
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
