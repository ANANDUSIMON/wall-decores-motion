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
 * SHOT 4 — THE WALL · 135 frames (4.5s)
 *
 * The salon hang. Nine pieces, deliberately not on a grid.
 *
 * A grid of equal rectangles reads as a colour chart no matter what is
 * inside it — that is a lesson this film learned the hard way. Real gallery
 * hangs work on a shared centre line with sizes playing against each other,
 * so the eye travels instead of scanning. Every piece here is placed by
 * hand for that reason.
 */

type Spot = { id: string; x: number; y: number; h: number; order: number };

/** Ordered so the eye enters at the large left piece and travels right. */
const WALL: Spot[] = [
  { id: 'b1-dancer-rose', x: 300, y: 512, h: 480, order: 0 },
  { id: 'a1-heliconia-pink', x: 612, y: 394, h: 240, order: 2 },
  { id: 'c3-strata-rust', x: 650, y: 654, h: 190, order: 3 },
  { id: 'a2-reader-stone', x: 286, y: 866, h: 196, order: 5 },
  { id: 'd3-spiral-white', x: 976, y: 494, h: 330, order: 1 },
  { id: 'c2-figures-vermilion', x: 960, y: 754, h: 175, order: 4 },
  { id: 'b2-leaf-green', x: 1332, y: 502, h: 440, order: 2 },
  { id: 'a4-pods-amber', x: 1680, y: 404, h: 235, order: 4 },
  { id: 'd4-pods-burgundy', x: 1680, y: 674, h: 215, order: 6 },
];

export const Shot4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pull back as the wall fills — the move says "there is more of this".
  const camScale = interpolate(frame, [0, 118], [1.1, 1.0], {
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  const poseFor = (s: Spot): ((f: number) => Pose) => (f) => {
    const delay = 2 + s.order * 7;
    const p = spring({
      frame: f - delay,
      fps,
      config: { damping: 16, mass: 0.8, stiffness: 118, overshootClamping: false },
      durationInFrames: 28,
    });
    return {
      x: s.x,
      y: s.y - interpolate(p, [0, 1], [18, 0]),
      scale: interpolate(p, [0, 1], [0.9, 1]),
      lift: 1 - p,
      opacity: interpolate(f, [delay, delay + 6], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    };
  };

  return (
    <AbsoluteFill>
      <Camera scale={camScale}>
        <Layer depth={0}>
          <Wall lightX={0.5} lightY={0.36} lightStrength={0.92} />
        </Layer>

        <Layer depth={1}>
          {WALL.map((s) => (
            <GalleryCanvas
              key={s.id}
              art={s.id}
              h={s.h}
              at={poseFor(s)}
              side={s.x > 960 ? 'left' : 'right'}
            />
          ))}
        </Layer>
      </Camera>

      <div style={{ position: 'absolute', left: grid.margin, top: 64 }}>
        <MaskRise start={62} duration={20} style={{ ...type.heading }}>
          EVERY SURFACE
        </MaskRise>
      </div>

      <div
        style={{
          position: 'absolute',
          right: grid.margin,
          top: 84,
          ...type.annotation,
          fontFamily: FONT_STACK,
          // Gold at 13px vanishes on a warm wall. Graphite holds.
          color: palette.graphite,
          opacity: interpolate(frame, [76, 92], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Residential · Hospitality · Commercial
      </div>
    </AbsoluteFill>
  );
};
