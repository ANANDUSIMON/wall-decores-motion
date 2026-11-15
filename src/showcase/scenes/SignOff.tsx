import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from 'remotion';
import { FONT, TYPE, BRAND, ease, W, H } from '../theme';

/* ------------------------------------------------------------------ */
/*  Decorative brush strokes (SVG)                                     */
/* ------------------------------------------------------------------ */
const BrushDeco: React.FC<{ progress: number }> = ({ progress }) => {
  const strokes = [
    { x: 200, y: 480, w: 260, rot: -8, delay: 0.1 },
    { x: 1460, y: 500, w: 240, rot: 6, delay: 0.15 },
    { x: 350, y: 600, w: 180, rot: -4, delay: 0.2 },
    { x: 1320, y: 620, w: 200, rot: 5, delay: 0.25 },
  ];

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    >
      {strokes.map((s, i) => {
        const p = interpolate(progress, [s.delay, s.delay + 0.35], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: ease.brush,
        });
        return (
          <g key={i} transform={`rotate(${s.rot} ${s.x} ${s.y})`} opacity={p * 0.12}>
            <rect
              x={s.x - (s.w * p) / 2}
              y={s.y - 4}
              width={s.w * p}
              height={8}
              rx={4}
              fill={BRAND.gold}
            />
          </g>
        );
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Main SignOff                                                        */
/* ------------------------------------------------------------------ */
interface SignOffProps {
  from: number;
  to: number;
}

export const SignOff: React.FC<SignOffProps> = ({ from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;

  const dur = to - from;
  const local = frame - from;
  const norm = local / dur;

  // Brand name
  const brandP = interpolate(norm, [0.05, 0.25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  // Divider
  const divP = interpolate(norm, [0.2, 0.4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  // Tagline
  const tagP = interpolate(norm, [0.3, 0.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  // Contact
  const contactP = interpolate(norm, [0.45, 0.65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  // Decorative brush strokes
  const brushP = interpolate(norm, [0.1, 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Gentle exit
  const exitP = interpolate(norm, [0.9, 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Background subtle gradient pulse
  const pulse = interpolate(norm, [0, 0.5, 1], [0, 0.03, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: BRAND.cream,
        opacity: interpolate(norm, [0, 0.04, 0.92, 1], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND.gold}${Math.round(pulse * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      <BrushDeco progress={brushP} />

      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
      >
        {/* Brand name */}
        <div
          style={{
            fontFamily: FONT,
            ...TYPE.brand,
            color: BRAND.ink,
            opacity: brandP * exitP,
            transform: `translateY(${interpolate(brandP, [0, 1], [30, 0])}px)`,
            letterSpacing: 8,
          }}
        >
          WALL DECORES
        </div>

        {/* Gold divider */}
        <div
          style={{
            width: interpolate(divP, [0, 1], [0, 320]),
            height: 2,
            background: BRAND.gold,
            marginTop: 20,
            marginBottom: 20,
            opacity: divP * exitP,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontFamily: FONT,
            ...TYPE.tagline,
            color: BRAND.gold,
            opacity: tagP * exitP,
            transform: `translateY(${interpolate(tagP, [0, 1], [20, 0])}px)`,
          }}
        >
          Artisan · Collectives
        </div>

        {/* Contact info */}
        <div
          style={{
            marginTop: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            opacity: contactP * exitP,
            transform: `translateY(${interpolate(contactP, [0, 1], [20, 0])}px)`,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              ...TYPE.contact,
              color: '#8E857A',
              letterSpacing: 2,
            }}
          >
            walldecores.com
          </div>
          <div
            style={{
              fontFamily: FONT,
              ...TYPE.contact,
              color: '#8E857A',
              letterSpacing: 2,
            }}
          >
            @wall_decores_artisan
          </div>
          <div
            style={{
              fontFamily: FONT,
              ...TYPE.contact,
              color: '#8E857A',
              letterSpacing: 2,
            }}
          >
            9037790012
          </div>
        </div>
      </div>

      {/* Film grain */}
      <svg
        width={W}
        height={H}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0.03 }}
      >
        <filter id="sGrain">
          <feTurbulence baseFrequency="0.7" numOctaves="4" type="fractalNoise" />
        </filter>
        <rect width="100%" height="100%" filter="url(#sGrain)" />
      </svg>
    </AbsoluteFill>
  );
};
