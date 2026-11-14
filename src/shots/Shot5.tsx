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
import { MaskRise, Dimension } from '../components/KineticText';
import { LottieAccent } from '../components/LottieAccent';

/**
 * SHOT 5 — MADE TO SIZE · 120 frames (4.0s)
 *
 * The commercial argument, made visually. Measurement brackets draw
 * themselves around a single piece — the drawing-office gesture that says
 * this is manufactured to a wall rather than picked off a shelf.
 *
 * It works because it is restrained: thin grey lines, small type, one
 * painting. The moment it gets decorative it stops reading as a spec and
 * starts reading as an infographic.
 */
export const Shot5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const camScale = interpolate(frame, [0, 120], [1.0, 1.05], {
    extrapolateRight: 'clamp',
    easing: ease.drift,
  });

  const W = 762; // c3-strata-rust at h 506, aspect 1.506
  const H = 506;
  const CX = 952;
  const CY = 476;

  const hero: (f: number) => Pose = (f) => {
    const p = spring({
      frame: f - 2,
      fps,
      config: { damping: 18, mass: 0.9, stiffness: 100 },
      durationInFrames: 30,
    });
    return {
      x: CX,
      y: CY,
      scale: interpolate(p, [0, 1], [0.94, 1]),
      lift: 1 - p,
      opacity: interpolate(f, [2, 9], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    };
  };

  return (
    <AbsoluteFill>
      <Camera scale={camScale}>
        <Layer depth={0}>
          <Wall lightX={0.42} lightY={0.4} lightStrength={0.95} />
        </Layer>

        <Layer depth={1}>
          <GalleryCanvas art="c3-strata-rust" h={H} at={hero} side="right" />

          {/* the brackets, drawn after the piece has settled */}
          <Dimension
            x={CX}
            y={CY - H / 2 - 46}
            length={W}
            label="1800 mm"
            start={38}
            duration={22}
          />
          <Dimension
            x={CX + W / 2 + 46}
            y={CY}
            length={H}
            label="1200 mm"
            vertical
            start={50}
            duration={22}
          />
        </Layer>
      </Camera>

      {/* dust catching the light over the spec drawing — ambient, not a
          message, so it stays well under the text */}
      <LottieAccent name="dust-particles" loop style={{ opacity: 0.35 }} />

      <div style={{ position: 'absolute', left: grid.margin, bottom: 206 }}>
        <MaskRise start={62} duration={22} style={{ ...type.heading }}>
          MADE TO
        </MaskRise>
        <MaskRise
          start={70}
          duration={22}
          color={palette.gold}
          style={{ ...type.heading }}
        >
          YOUR WALL
        </MaskRise>
      </div>

      <div
        style={{
          position: 'absolute',
          left: grid.margin,
          bottom: 72,
          width: 420,
          ...type.body,
          fontSize: 19,
          fontFamily: FONT_STACK,
          color: palette.graphite,
          opacity: interpolate(frame, [88, 104], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Any size, any palette. Specified with your designer, painted to order.
      </div>
    </AbsoluteFill>
  );
};
