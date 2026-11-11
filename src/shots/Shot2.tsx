import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { palette, type, grid, ease, FONT_STACK } from '../theme';
import { Wall } from '../components/Wall';
import { Camera, Layer } from '../components/Camera';
import { GalleryCanvas, type Pose } from '../components/GalleryCanvas';
import { MaskRise } from '../components/KineticText';

/**
 * SHOT 2 — THE HANG · 150 frames (5.0s)
 *
 * Five paintings going up on the wall. They do not drop in from the sky —
 * they arrive the way a piece actually gets hung: lifted slightly off the
 * wall, nudged into place, then set down. The whole illusion lives in the
 * shadow, which starts wide and soft and tightens as each piece settles.
 *
 * The camera drifts right across the shot, and the paintings move faster
 * than the wall behind them. That parallax is what makes a flat composition
 * read as a room.
 */

type Hang = {
  id: string;
  x: number;
  y: number;
  h: number;
  delay: number;
  rot: number;
  side: 'left' | 'right' | 'none';
};

/**
 * Chosen for contrast against the wall as much as for composition. On ink you
 * can hang anything; on warm white the pale pieces recede until the wall
 * looks half empty, so the strong ones carry the shot and exactly one quiet
 * piece is kept as a breather.
 */
const HANG: Hang[] = [
  { id: 'c3-strata-rust', x: 400, y: 432, h: 250, delay: 0, rot: 0, side: 'right' },
  { id: 'd4-pods-burgundy', x: 422, y: 754, h: 262, delay: 9, rot: 0, side: 'right' },
  { id: 'b2-leaf-green', x: 880, y: 560, h: 520, delay: 18, rot: 0, side: 'right' },
  { id: 'c4-seascape-silver', x: 1358, y: 420, h: 232, delay: 27, rot: 0, side: 'left' },
  { id: 'd1-origami-red', x: 1378, y: 738, h: 276, delay: 36, rot: 0, side: 'left' },
];

export const Shot2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Picks up where shot 1's push left off, settles, then drifts right.
  const camScale = interpolate(frame, [0, 40, 150], [1.035, 1.0, 1.012], {
    extrapolateRight: 'clamp',
    easing: ease.drift,
  });
  const camX = interpolate(frame, [0, 150], [-22, 56], {
    extrapolateRight: 'clamp',
    easing: ease.drift,
  });

  const poseFor = (p: Hang): ((f: number) => Pose) => (f) => {
    const s = spring({
      frame: f - p.delay,
      fps,
      config: { damping: 17, mass: 0.95, stiffness: 96, overshootClamping: false },
      durationInFrames: 34,
    });
    return {
      x: p.x,
      // nudged down into place over the last few pixels
      y: p.y - interpolate(s, [0, 1], [26, 0]),
      scale: interpolate(s, [0, 1], [0.945, 1]),
      rotate: interpolate(s, [0, 1], [p.rot - 0.9, p.rot]),
      lift: 1 - s,
      opacity: interpolate(f, [p.delay, p.delay + 7], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    };
  };

  return (
    <AbsoluteFill>
      <Camera x={camX} scale={camScale}>
        <Layer depth={0}>
          <Wall lightX={0.46} lightY={0.38} />
        </Layer>

        <Layer depth={1}>
          {HANG.map((p) => (
            <GalleryCanvas
              key={p.id}
              art={p.id}
              h={p.h}
              at={poseFor(p)}
              side={p.side}
            />
          ))}
        </Layer>

        {/* Sized down from the full display cut: at 116px the second line
            landed within a few pixels of the top-left canvas, and type that
            nearly touches an image reads as a mistake rather than a choice. */}
        <Layer depth={1.4}>
          <div style={{ position: 'absolute', left: grid.margin, top: 60 }}>
            <MaskRise start={74} duration={22} style={{ ...type.displaySm, fontSize: 92 }}>
              FIVE YEARS
            </MaskRise>
            <MaskRise
              start={83}
              duration={22}
              color={palette.gold}
              style={{ ...type.displaySm, fontSize: 92 }}
            >
              ONE STUDIO
            </MaskRise>
          </div>
        </Layer>
      </Camera>

      <div
        style={{
          position: 'absolute',
          right: grid.margin,
          bottom: 72,
          ...type.annotation,
          fontFamily: FONT_STACK,
          color: palette.muted,
          opacity: interpolate(frame, [104, 120], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Oil · Impasto · Texture
      </div>
    </AbsoluteFill>
  );
};
