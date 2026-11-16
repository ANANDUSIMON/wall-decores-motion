import React, { useMemo } from 'react';
import { staticFile } from 'remotion';
import { ease } from '../theme';
import { lerpHex, pop, prog, seeded } from '../motion';
import { markColor, pointAt, type Painting, type ScheduledMark } from './kit';

type Bristle = { dx: number; dy: number; w: number; light: boolean };

const bristlesFor = (marks: ScheduledMark[], seed: number): Bristle[][] => {
  const rnd = seeded(seed);
  return marks.map((s) => {
    const a = pointAt(s.d, 0);
    const b = pointAt(s.d, s.length);
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    return [0, 1, 2, 3, 4].map((j) => {
      const off = (rnd() - 0.5) * 0.8 * s.width;
      return { dx: nx * off, dy: ny * off, w: Math.max(1.2, s.width * (0.04 + rnd() * 0.05)), light: j % 2 === 0 };
    });
  });
};

const reveal = (p: number) => ({
  pathLength: 1,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeDasharray: '1 1',
  strokeDashoffset: 1 - p,
});

const Bristles: React.FC<{ m: ScheduledMark; p: number; color: string; b: Bristle[]; opacity: number }> = ({ m, p, color, b, opacity }) => (
  <>
    {b.map((x, i) => (
      <path
        key={i}
        d={m.d}
        {...reveal(p)}
        stroke={x.light ? lerpHex(color, '#ffffff', 0.3) : lerpHex(color, '#000000', 0.22)}
        strokeWidth={x.w}
        opacity={opacity}
        transform={`translate(${x.dx.toFixed(2)} ${x.dy.toFixed(2)})`}
      />
    ))}
  </>
);

/**
 * A painting rendered at frame f. Washes get a loose rough edge, designed
 * shapes a whisper of it, and a cotton weave sits on top. `uid` keeps SVG
 * ids unique when several paintings are on screen at once.
 */
export const PaintedCanvas: React.FC<{
  painting: Painting;
  f: number;
  uid: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** render as finished regardless of frame (palette board) */
  complete?: boolean;
  weave?: boolean;
}> = ({ painting, f, uid, x, y, w, h, complete = false, weave = true }) => {
  const bristles = useMemo(() => bristlesFor(painting.marks, uid.length * 7 + 3), [painting, uid]);
  const items = painting.marks.map((m, i) => ({ m, i, p: complete ? 1 : prog(f, m.start, m.end - m.start, ease.paint) }));
  if (!complete && f < painting.marks[0].start) return null;

  return (
    <svg x={x} y={y} width={w} height={h} viewBox="0 0 800 400" overflow="hidden">
      <defs>
        <filter id={`${uid}-rough`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${uid}-fine`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="1" seed="6" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {weave && (
          // Static cotton-weave grain. Baked once to a PNG instead of an
          // feTurbulence filter: the noise never changes frame to frame, but
          // an SVG filter is re-rasterized by the renderer on every single
          // frame regardless — a tiled image costs that once, not 3,600 times.
          <pattern id={`${uid}-weave`} patternUnits="userSpaceOnUse" width={256} height={256}>
            <image href={staticFile('weave-noise.png')} x={0} y={0} width={256} height={256} preserveAspectRatio="none" />
          </pattern>
        )}
      </defs>

      <g filter={`url(#${uid}-rough)`}>
        {items
          .filter((x) => x.m.kind === 'wash' && x.p > 0)
          .map(({ m, i, p }) => (
            <g key={m.id} opacity={m.opacity ?? 1}>
              <path d={m.d} {...reveal(p)} stroke={m.color} strokeWidth={m.width} />
              {m.width > 12 && <Bristles m={m} p={p} color={m.color!} b={bristles[i]} opacity={0.5} />}
            </g>
          ))}
      </g>

      <g filter={`url(#${uid}-fine)`}>
        {items
          .filter((x) => x.m.kind === 'reveal' && x.p > 0)
          .map(({ m, i, p }) => {
            const gradId = `${uid}-g-${m.id}`;
            const fill = typeof m.fill === 'string' ? m.fill : `url(#${gradId})`;
            return (
              <g key={m.id}>
                <defs>
                  <mask id={`${uid}-m-${m.id}`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={1200} height={800}>
                    <path d={m.d} {...reveal(p)} stroke="#fff" strokeWidth={m.width} />
                  </mask>
                  <clipPath id={`${uid}-c-${m.id}`}>
                    <path d={m.shape} />
                  </clipPath>
                  {m.fill && typeof m.fill !== 'string' && (
                    <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1={m.fill.x1} y1={m.fill.y1} x2={m.fill.x2} y2={m.fill.y2}>
                      <stop offset="0" stopColor={m.fill.grad[0]} />
                      <stop offset="0.5" stopColor={m.fill.grad[1]} />
                      <stop offset="1" stopColor={m.fill.grad[2]} />
                    </linearGradient>
                  )}
                </defs>
                <g mask={`url(#${uid}-m-${m.id})`}>
                  <path d={m.shape} fill={fill} />
                  {m.texture !== false && (
                    <g clipPath={`url(#${uid}-c-${m.id})`}>
                      <Bristles m={m} p={1} color={markColor(m)} b={bristles[i]} opacity={0.3} />
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        {items
          .filter((x) => x.m.kind === 'line' && x.p > 0)
          .map(({ m, p }) => (
            <path key={m.id} d={m.d} {...reveal(p)} stroke={m.color} strokeWidth={m.width} opacity={m.opacity ?? 1} />
          ))}
        {painting.dots.map((d, i) => {
          const k = complete ? 1 : pop(f, d.at, 11);
          if (k <= 0.01) return null;
          return <circle key={i} cx={d.x} cy={d.y} r={d.r * k} fill={d.color} />;
        })}
      </g>

      {weave && <rect x={0} y={0} width={800} height={400} fill={`url(#${uid}-weave)`} opacity={0.12} style={{ mixBlendMode: 'multiply' }} />}
    </svg>
  );
};
