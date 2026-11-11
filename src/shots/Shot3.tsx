import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { palette, type, grid, ease, FONT_STACK } from '../theme';
import { Wall } from '../components/Wall';
import { Camera, Layer } from '../components/Camera';
import { GalleryCanvas, type Pose } from '../components/GalleryCanvas';
import { RollSwap, MaskRise } from '../components/KineticText';

/**
 * SHOT 3 — TEXTURE · 135 frames (4.5s)
 *
 * The one shot that has to do the selling. Everything else in the film can
 * be said in words; this is the only place the viewer can see that the
 * surface is built up rather than printed, and the way to show that is to
 * get close and move slowly.
 *
 * The push is deliberately small — 18% over four and a half seconds. A big
 * zoom is a web animation; a slow creep is a camera on a dolly, and it is
 * also what keeps the image sharp rather than magnifying it into mush.
 */
export const Shot3: React.FC = () => {
  const frame = useCurrentFrame();

  const camScale = interpolate(frame, [0, 135], [1.0, 1.18], {
    extrapolateRight: 'clamp',
    easing: ease.drift,
  });
  // Drifting while pushing is what stops it feeling like a zoom.
  const camX = interpolate(frame, [0, 135], [40, -34], {
    extrapolateRight: 'clamp',
    easing: ease.drift,
  });
  const camY = interpolate(frame, [0, 135], [12, -16], {
    extrapolateRight: 'clamp',
    easing: ease.drift,
  });

  /** Already hung — it only breathes. */
  const hero: (f: number) => Pose = (f) => ({
    x: 672,
    y: 540,
    scale: interpolate(f, [0, 135], [1.0, 1.035], {
      extrapolateRight: 'clamp',
      easing: ease.drift,
    }),
    lift: 0,
    opacity: interpolate(f, [0, 6], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  });

  const annotationOp = interpolate(frame, [96, 112], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Camera x={camX} y={camY} scale={camScale}>
        <Layer depth={0}>
          <Wall lightX={0.3} lightY={0.34} lightStrength={1} floorBounce={0.4} />
        </Layer>

        {/* Bleeds off the top and bottom of frame, so it reads as the camera
            being close rather than the painting being small. */}
        <Layer depth={1}>
          <GalleryCanvas art="a3-bloom-white" h={1010} at={hero} side="right" />
        </Layer>

        <Layer depth={1.5}>
          <div style={{ position: 'absolute', left: 1210, top: 418 }}>
            <RollSwap
              words={['HAND-MIXED', 'HAND-LAID', 'HAND-FINISHED']}
              start={14}
              hold={34}
              swap={12}
              style={{ ...type.heading, fontSize: 50 }}
            />
            <div style={{ marginTop: 26 }}>
              <MaskRise
                start={30}
                duration={22}
                color={palette.graphite}
                style={{ ...type.body, width: 400 }}
              >
                Built up in layers with a knife, not printed onto a surface.
              </MaskRise>
            </div>
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
          opacity: annotationOp,
        }}
      >
        Oil · Impasto · Bespoke
      </div>
    </AbsoluteFill>
  );
};
