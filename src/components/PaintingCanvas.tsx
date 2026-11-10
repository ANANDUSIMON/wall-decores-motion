import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { palette } from '../theme';
import {
  mulberry32,
  shutterSamples,
  velocityOf,
  BLUR_THRESHOLD,
  clamp,
} from '../lib/motion';

type Props = {
  /** resting centre position */
  x: number;
  y: number;
  width: number;
  height: number;
  /** frames to wait before this canvas starts falling */
  delay?: number;
  /** base colour of the painted surface */
  color?: string;
  /** secondary colour mixed into the impasto */
  accent?: string;
  /** resting rotation in degrees */
  rotate?: number;
  /** texture randomiser — same seed, same texture, every render */
  seed?: number;
  /** how far above frame it starts */
  dropFrom?: number;
  /** heavier = slower, weightier fall */
  mass?: number;
};

/**
 * A stretched canvas that drops into frame with real weight.
 *
 * The fall is spring-driven, so it overshoots and settles the way a hung
 * canvas actually does. Motion blur is sampled from the fall curve itself:
 * while velocity is high we composite several sub-frame copies, which smears
 * the canvas vertically exactly as a real shutter would.
 */
export const PaintingCanvas: React.FC<Props> = ({
  x,
  y,
  width,
  height,
  delay = 0,
  color = palette.emerald,
  accent = palette.emeraldDeep,
  rotate = 0,
  seed = 1,
  dropFrom = 1400,
  mass = 1.3,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- the fall curve -------------------------------------------------
  const yAt = (f: number) => {
    const p = spring({
      frame: f - delay,
      fps,
      config: { damping: 15, mass, stiffness: 95, overshootClamping: false },
      durationInFrames: 42,
    });
    return interpolate(p, [0, 1], [-dropFrom, 0]);
  };

  const rotAt = (f: number) => {
    const p = spring({
      frame: f - delay,
      fps,
      config: { damping: 11, mass: mass * 0.8, stiffness: 70 },
      durationInFrames: 50,
    });
    // tips slightly on the way down, straightens as it settles
    return interpolate(p, [0, 1], [rotate - 7, rotate]);
  };

  const velocity = velocityOf(yAt, frame);
  const blurring = velocity > BLUR_THRESHOLD;

  // More samples the faster it moves — up to a 10-sample smear.
  const sampleCount = blurring
    ? Math.round(clamp(velocity / 14, 3, 10))
    : 1;
  const samples = shutterSamples(frame, sampleCount, 0.85);

  // --- the painted surface --------------------------------------------
  /**
   * Palette-knife marks, not soft blobs.
   *
   * Round translucent ellipses read as bokeh, not paint. Real impasto is
   * directional: long, narrow, hard-edged slabs laid at a consistent angle
   * with a lit top edge and a shadowed bottom one. Keeping every mark within
   * ±22 degrees of a dominant angle is what makes it look worked by one hand.
   */
  const impasto = React.useMemo(() => {
    const r = mulberry32(seed * 7919);
    const dominant = -34 + r() * 68;
    return Array.from({ length: 26 }, () => {
      const rot = dominant + (r() - 0.5) * 44;
      return {
        cx: r() * 110 - 5,
        cy: r() * 110 - 5,
        rx: 22 + r() * 46,
        ry: 2.2 + r() * 5.5,
        rot,
        op: 0.10 + r() * 0.22,
        light: r() > 0.46,
      };
    });
  }, [seed]);

  const settle = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, mass, stiffness: 95 },
    durationInFrames: 42,
  });

  // Shadow tightens and darkens as the canvas comes to rest.
  const shadowBlur = interpolate(settle, [0, 1], [90, 28]);
  const shadowY = interpolate(settle, [0, 1], [70, 18]);
  const shadowOp = interpolate(settle, [0, 1], [0.15, 0.55]);

  const surface = (ghostAge: number) => (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(142deg, ${color} 0%, ${accent} 100%)`,
        boxShadow:
          ghostAge === 0
            ? `0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowOp}),
               inset 0 1px 0 rgba(255,255,255,0.14),
               inset 0 -1px 0 rgba(0,0,0,0.25)`
            : 'none',
      }}
    >
      {/* impasto — layered translucent strokes reading as built-up paint */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0 }}
      >
        {impasto.map((b, i) => (
          <ellipse
            key={i}
            cx={b.cx}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            transform={`rotate(${b.rot} ${b.cx} ${b.cy})`}
            fill={b.light ? '#ffffff' : '#000000'}
            opacity={b.op * (b.light ? 0.5 : 0.65)}
            style={{ mixBlendMode: b.light ? 'soft-light' : 'multiply' }}
          />
        ))}
      </svg>

      {/* canvas weave */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, opacity: 0.16 }}
      >
        <filter id={`weave-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves={3}
            seed={seed}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter={`url(#weave-${seed})`}
          style={{ mixBlendMode: 'multiply' }}
        />
      </svg>

      {/* raking highlight — light catching the texture ridges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(118deg,
            rgba(255,255,255,0.22) 0%,
            rgba(255,255,255,0.04) 32%,
            rgba(0,0,0,0.0) 58%,
            rgba(0,0,0,0.18) 100%)`,
        }}
      />

      {/* stretcher edge */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      />
    </div>
  );

  return (
    <>
      {samples.map((s, i) => {
        const sy = yAt(s.f);
        const sr = rotAt(s.f);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - width / 2,
              top: y - height / 2,
              transform: `translateY(${sy}px) rotate(${sr}deg)`,
              opacity: s.opacity,
              // Ghosts sit behind the leading edge and read as a smear.
              mixBlendMode: s.age === 0 ? 'normal' : 'screen',
              filter:
                s.age === 0
                  ? 'none'
                  : `blur(${(0.6 + s.age * 1.8).toFixed(2)}px)`,
              willChange: 'transform',
            }}
          >
            {surface(s.age)}
          </div>
        );
      })}
    </>
  );
};
