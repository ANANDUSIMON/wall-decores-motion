import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from 'remotion';
import { PALETTES as ROOMS, FONT, TYPE, BRAND, ease, W, H } from '../theme';

/* ------------------------------------------------------------------ */
/*  Mini room thumbnail                                                */
/* ------------------------------------------------------------------ */
const MiniRoom: React.FC<{
  palette: (typeof ROOMS)[number];
  index: number;
  progress: number;
}> = ({ palette, index, progress }) => {
  const delay = index * 0.12;
  const p = interpolate(progress, [delay, delay + 0.25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  const tw = 280; // thumbnail width
  const th = 180;
  const gap = 40;
  const totalW = 5 * tw + 4 * gap;
  const startX = (W - totalW) / 2;
  const x = startX + index * (tw + gap);
  const y = 120;

  const r = palette.room;
  const c = palette.painting;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: tw,
        height: th,
        borderRadius: 12,
        overflow: 'hidden',
        opacity: p,
        transform: `scale(${interpolate(p, [0, 1], [0.8, 1])}) translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      <svg width={tw} height={th} viewBox={`0 0 ${tw} ${th}`}>
        {/* Wall */}
        <rect x={0} y={0} width={tw} height={th * 0.67} fill={r.wall} />
        {/* Accent wall */}
        <rect x={0} y={0} width={tw * 0.35} height={th * 0.67} fill={r.wallAccent} opacity={0.5} />
        {/* Floor */}
        <rect x={0} y={th * 0.67} width={tw} height={th * 0.33} fill={r.floor} />
        {/* Baseboard */}
        <rect x={0} y={th * 0.65} width={tw} height={4} fill={r.trim} />
        {/* Mini painting */}
        <rect x={tw * 0.55} y={th * 0.15} width={tw * 0.3} height={th * 0.35} rx={2} fill="#2A2118" />
        <rect x={tw * 0.55 + 3} y={th * 0.15 + 3} width={tw * 0.3 - 6} height={th * 0.35 - 6} fill={c.bg} />
        <circle cx={tw * 0.7} cy={th * 0.3} r={12} fill={c.primary} opacity={0.8} />
        <circle cx={tw * 0.65} cy={th * 0.35} r={8} fill={c.secondary} opacity={0.6} />
        {/* Mini sofa */}
        <rect x={tw * 0.1} y={th * 0.48} width={tw * 0.4} height={th * 0.15} rx={4} fill={r.furniture} />
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Swatch row for one room                                            */
/* ------------------------------------------------------------------ */
const SwatchRow: React.FC<{
  palette: (typeof ROOMS)[number];
  index: number;
  progress: number;
}> = ({ palette, index, progress }) => {
  const delay = index * 0.12 + 0.15;
  const p = interpolate(progress, [delay, delay + 0.25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  const tw = 280;
  const gap = 40;
  const totalW = 5 * tw + 4 * gap;
  const startX = (W - totalW) / 2;
  const x = startX + index * (tw + gap);
  const y = 320;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: tw,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
      }}
    >
      {/* Room name */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 600,
          color: BRAND.ink,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          textAlign: 'center',
        }}
      >
        {palette.name}
      </div>
      {/* Subject */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 11,
          color: '#8E857A',
          textAlign: 'center',
        }}
      >
        {palette.subject}
      </div>
      {/* Swatches */}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        {palette.swatches.map((color, i) => {
          const sd = i * 0.08;
          const sp = interpolate(p, [sd, sd + 0.3], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                background: color,
                transform: `scale(${sp})`,
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Connecting lines                                                   */
/* ------------------------------------------------------------------ */
const ConnectLine: React.FC<{
  index: number;
  progress: number;
}> = ({ index, progress }) => {
  const delay = index * 0.12 + 0.1;
  const p = interpolate(progress, [delay, delay + 0.2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const tw = 280;
  const gap = 40;
  const totalW = 5 * tw + 4 * gap;
  const startX = (W - totalW) / 2;
  const cx = startX + index * (tw + gap) + tw / 2;

  return (
    <line
      x1={cx}
      y1={300}
      x2={cx}
      y2={320}
      stroke={BRAND.gold}
      strokeWidth={1.5}
      opacity={p * 0.4}
      strokeDasharray={`${20 * p} ${20 * (1 - p)}`}
    />
  );
};

/* ------------------------------------------------------------------ */
/*  Main PaletteShowcase                                               */
/* ------------------------------------------------------------------ */
interface PaletteShowcaseProps {
  from: number;
  to: number;
}

export const PaletteShowcase: React.FC<PaletteShowcaseProps> = ({ from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;

  const dur = to - from;
  const local = frame - from;
  const norm = local / dur;

  const progress = interpolate(norm, [0, 0.7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  const exitP = interpolate(norm, [0.85, 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Title
  const titleP = interpolate(norm, [0.02, 0.15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  // Bottom text
  const bottomP = interpolate(norm, [0.5, 0.7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  return (
    <AbsoluteFill
      style={{
        background: '#F5F0E8',
        opacity: interpolate(norm, [0, 0.03, 0.9, 1], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      {/* Section title */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: titleP * exitP,
          transform: `translateY(${interpolate(titleP, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            ...TYPE.label,
            color: '#8E857A',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Colour Composition
        </div>
        <div
          style={{
            fontFamily: FONT,
            ...TYPE.headline,
            color: BRAND.ink,
          }}
        >
          5 Rooms · 5 Palettes
        </div>
      </div>

      {/* Mini rooms */}
      {ROOMS.map((room, i) => (
        <MiniRoom key={i} palette={room} index={i} progress={progress * exitP} />
      ))}

      {/* Connection lines SVG */}
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        {ROOMS.map((_, i) => (
          <ConnectLine key={i} index={i} progress={progress * exitP} />
        ))}
      </svg>

      {/* Swatch rows */}
      {ROOMS.map((room, i) => (
        <SwatchRow key={i} palette={room} index={i} progress={progress * exitP} />
      ))}

      {/* Bottom tagline */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: bottomP * exitP,
          transform: `translateY(${interpolate(bottomP, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            ...TYPE.subhead,
            color: BRAND.ink,
            marginBottom: 12,
          }}
        >
          Every painting crafted to complement its space
        </div>
        <div
          style={{
            fontFamily: FONT,
            ...TYPE.caption,
            color: '#8E857A',
          }}
        >
          Custom colour matching · Interior consultation · Artisan quality
        </div>
      </div>

      {/* Film grain overlay */}
      <svg
        width={W}
        height={H}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', opacity: 0.03 }}
      >
        <filter id="pGrain">
          <feTurbulence baseFrequency="0.75" numOctaves="4" type="fractalNoise" />
        </filter>
        <rect width="100%" height="100%" filter="url(#pGrain)" />
      </svg>
    </AbsoluteFill>
  );
};
