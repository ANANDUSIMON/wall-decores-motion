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
import { WipeText, GrowLine } from '../components/KineticText';

/**
 * SHOT 6 — LOCK-UP · 135 frames (4.5s)
 *
 * The last painting travels out of frame and leaves the wall clear, and the
 * name is wiped into the space it vacated. Letting the piece do the clearing
 * rather than cutting to an empty wall is what ties the end back to the
 * beginning — the film opened on an empty wall too.
 *
 * Then it holds. A lock-up that keeps moving has nothing to lock onto.
 */
export const Shot6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const camScale = interpolate(frame, [0, 60], [1.05, 1.0], {
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  /** Travels out left, taking the previous shot's energy with it. */
  const departing: (f: number) => Pose = (f) => {
    const p = spring({
      frame: f - 4,
      fps,
      config: { damping: 22, mass: 1.2, stiffness: 58 },
      durationInFrames: 44,
    });
    return {
      x: interpolate(p, [0, 1], [820, -720]),
      y: 498,
      scale: interpolate(p, [0, 1], [1, 0.96]),
      rotate: interpolate(p, [0, 1], [0, -1.8]),
      lift: p * 0.7,
      opacity: interpolate(p, [0.55, 0.95], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    };
  };

  const subOp = interpolate(frame, [62, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subY = interpolate(frame, [62, 80], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });
  const contactOp = interpolate(frame, [86, 104], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <Camera scale={camScale}>
        <Layer depth={0}>
          <Wall lightX={0.5} lightY={0.44} lightStrength={1} floorBounce={0.7} />
        </Layer>

        <Layer depth={1}>
          <GalleryCanvas art="c3-strata-rust" h={506} at={departing} side="right" />
        </Layer>
      </Camera>

      {/* the name, wiped into the cleared wall */}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <WipeText
          start={38}
          duration={26}
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: '0.1em',
            color: palette.ink,
            whiteSpace: 'nowrap',
          }}
        >
          WALL DECORES
        </WipeText>

        <div
          style={{
            marginTop: 34,
            transform: `translateY(${subY.toFixed(2)}px)`,
            opacity: subOp,
            fontFamily: FONT_STACK,
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: '0.46em',
            textTransform: 'uppercase',
            color: palette.gold,
          }}
        >
          Artisan · Collectives
        </div>
      </AbsoluteFill>

      <GrowLine
        x={grid.width / 2}
        y={grid.height / 2 + 128}
        width={190}
        color={palette.gold}
        start={70}
        duration={20}
        thickness={1}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 78,
          textAlign: 'center',
          ...type.annotation,
          fontFamily: FONT_STACK,
          color: palette.graphite,
          opacity: contactOp,
        }}
      >
        walldecores.com · @wall_decores_artisan · 9037790012
      </div>
    </AbsoluteFill>
  );
};
