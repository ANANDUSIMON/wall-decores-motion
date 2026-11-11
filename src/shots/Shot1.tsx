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
 * SHOT 1 — ARRIVAL · 105 frames (3.5s)
 *
 * An empty wall, and one painting arriving on it. Holding on emptiness for
 * the first second is what buys the arrival its weight; fill the frame
 * immediately and there is nothing for the move to land against.
 */
export const Shot1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow push in. Barely perceptible, which is the point — it keeps the
  // frame alive without ever announcing itself.
  const camScale = interpolate(frame, [0, 105], [1.0, 1.035], {
    extrapolateRight: 'clamp',
    easing: ease.drift,
  });
  const camX = interpolate(frame, [0, 105], [0, -22], {
    extrapolateRight: 'clamp',
    easing: ease.drift,
  });

  /** The painting slides in from the left and settles against the wall. */
  const hero: (f: number) => Pose = (f) => {
    const p = spring({
      frame: f - 12,
      fps,
      config: { damping: 19, mass: 1.1, stiffness: 72, overshootClamping: false },
      durationInFrames: 46,
    });
    return {
      x: interpolate(p, [0, 1], [-300, 660]),
      y: 496,
      scale: interpolate(p, [0, 1], [0.95, 1]),
      rotate: interpolate(p, [0, 1], [-1.4, 0]),
      lift: 1 - p,
      opacity: interpolate(f, [12, 20], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    };
  };

  const rule = interpolate(frame, [4, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  const kickerOp = interpolate(frame, [62, 78], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Camera x={camX} scale={camScale}>
        <Layer depth={0}>
          <Wall lightX={0.38} lightY={0.4} lightStrength={1} />
        </Layer>

        {/* the gold rule that sets the eye level for the whole film */}
        <Layer depth={0.35}>
          <div
            style={{
              position: 'absolute',
              left: grid.margin,
              top: 566,
              width: (grid.usable + 180) * rule,
              height: 1,
              backgroundColor: palette.gold,
              opacity: 0.4,
            }}
          />
        </Layer>

        {/* Deep green ground with hot pink — the piece with the most contrast
            against a warm white wall. A pale painting on a pale wall simply
            disappears, however well it is lit. */}
        <Layer depth={1}>
          <GalleryCanvas art="a1-heliconia-pink" h={620} at={hero} side="right" />
        </Layer>

        {/* editorial block on the right, well clear of the painting */}
        <Layer depth={1.25}>
          <div style={{ position: 'absolute', left: 1180, top: 382 }}>
            <MaskRise start={48} duration={24} style={{ ...type.heading }}>
              Handmade
            </MaskRise>
            <MaskRise
              start={56}
              duration={24}
              color={palette.gold}
              style={{ ...type.heading }}
            >
              wall art
            </MaskRise>
            <div
              style={{
                marginTop: 28,
                width: 300,
                ...type.body,
                fontFamily: FONT_STACK,
                color: palette.graphite,
                opacity: kickerOp,
              }}
            >
              Original canvases, made one at a time for the wall they are going on.
            </div>
          </div>
        </Layer>
      </Camera>

      <div
        style={{
          position: 'absolute',
          left: grid.margin,
          bottom: 72,
          ...type.kicker,
          fontFamily: FONT_STACK,
          color: palette.muted,
          opacity: kickerOp,
        }}
      >
        Angamaly · Kerala
      </div>
    </AbsoluteFill>
  );
};
