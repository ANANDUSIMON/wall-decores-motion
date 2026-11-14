import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { ease } from '../theme';
import { lerpHex, pop, prog, roleColor, seeded } from '../motion';
import { Layer } from './primitives';
import { CANVAS } from './geometry';
import { DOTS, SCHEDULE, pointAt, type Paint, type ScheduledMark } from './strokes';

export const paintColor = (frame: number, p: Paint) => (p.role ? roleColor(frame, p.role) : (p.color ?? '#000000'));

/** The colour loaded on the brush for a mark. */
export const markColor = (frame: number, m: ScheduledMark) => {
  if (m.paint) return paintColor(frame, m.paint);
  if (m.fill && 'grad' in m.fill) return paintColor(frame, m.fill.grad[1]);
  if (m.fill) return paintColor(frame, m.fill as Paint);
  return '#000000';
};

/** Bristle hairlines: offsets perpendicular to the mark's overall direction. */
const useBristles = () =>
  useMemo(() => {
    const rnd = seeded(31);
    return SCHEDULE.map((s) => {
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
  }, []);

type Bristles = ReturnType<typeof useBristles>[number];

const reveal = (p: number) => ({
  pathLength: 1,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeDasharray: '1 1',
  strokeDashoffset: 1 - p,
});

const BristleLines: React.FC<{ m: ScheduledMark; p: number; color: string; b: Bristles; opacity: number }> = ({ m, p, color, b, opacity }) => (
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

const Wash: React.FC<{ m: ScheduledMark; p: number; f: number; b: Bristles }> = ({ m, p, f, b }) => {
  if (p <= 0) return null;
  const c = markColor(f, m);
  return (
    <g opacity={m.opacity ?? 1}>
      <path d={m.d} {...reveal(p)} stroke={c} strokeWidth={m.width} />
      {m.width > 12 && <BristleLines m={m} p={p} color={c} b={b} opacity={0.5} />}
    </g>
  );
};

const Reveal: React.FC<{ m: ScheduledMark; p: number; f: number; b: Bristles }> = ({ m, p, f, b }) => {
  if (p <= 0 || !m.shape || !m.fill) return null;
  const mid = markColor(f, m);
  const fillRef =
    'grad' in m.fill ? `url(#vf-g-${m.id})` : paintColor(f, m.fill as Paint);
  return (
    <g>
      <defs>
        <mask id={`vf-m-${m.id}`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={1200} height={800}>
          <path d={m.d} {...reveal(p)} stroke="#fff" strokeWidth={m.width} />
        </mask>
        <clipPath id={`vf-c-${m.id}`}>
          <path d={m.shape} />
        </clipPath>
        {'grad' in m.fill && (
          <linearGradient id={`vf-g-${m.id}`} gradientUnits="userSpaceOnUse" x1={m.fill.x1} y1={m.fill.y1} x2={m.fill.x2} y2={m.fill.y2}>
            <stop offset="0" stopColor={paintColor(f, m.fill.grad[0])} />
            <stop offset="0.5" stopColor={paintColor(f, m.fill.grad[1])} />
            <stop offset="1" stopColor={paintColor(f, m.fill.grad[2])} />
          </linearGradient>
        )}
      </defs>
      <g mask={`url(#vf-m-${m.id})`}>
        <path d={m.shape} fill={fillRef} />
        {m.texture !== false && (
          <g clipPath={`url(#vf-c-${m.id})`}>
            <BristleLines m={m} p={1} color={mid} b={b} opacity={0.3} />
          </g>
        )}
      </g>
    </g>
  );
};

/**
 * The painting: a nested 800x400 SVG mapped onto the canvas on the back wall.
 * Ground washes get heavier edge roughness (loose, painterly); the designed
 * shapes get only a whisper of it so petals stay crisp; a cotton-weave
 * texture sits on top of everything.
 */
export const Painting: React.FC = () => {
  const f = useCurrentFrame();
  const bristles = useBristles();
  if (f < SCHEDULE[0].start) return null;

  const items = SCHEDULE.map((m, i) => ({ m, i, p: prog(f, m.start, m.end - m.start, ease.paint) }));

  return (
    <Layer>
      <svg x={CANVAS.x} y={CANVAS.y} width={CANVAS.w} height={CANVAS.h} viewBox="0 0 800 400" overflow="hidden">
        <defs>
          <filter id="vf-rough" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="vf-rough-fine" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="1" seed="6" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="vf-weave" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="9" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        <g filter="url(#vf-rough)">
          {items.filter((x) => x.m.kind === 'wash').map(({ m, i, p }) => (
            <Wash key={m.id} m={m} p={p} f={f} b={bristles[i]} />
          ))}
        </g>

        <g filter="url(#vf-rough-fine)">
          {items.filter((x) => x.m.kind === 'reveal').map(({ m, i, p }) => (
            <Reveal key={m.id} m={m} p={p} f={f} b={bristles[i]} />
          ))}
          {items.filter((x) => x.m.kind === 'line').map(({ m, p }) =>
            p > 0 ? <path key={m.id} d={m.d} {...reveal(p)} stroke={markColor(f, m)} strokeWidth={m.width} /> : null,
          )}
          {DOTS.map((d, i) => {
            const k = pop(f, d.at, 11);
            if (k <= 0.01) return null;
            return <circle key={i} cx={d.x} cy={d.y} r={d.r * k} fill={paintColor(f, d.paint)} />;
          })}
        </g>

        <rect x={0} y={0} width={800} height={400} filter="url(#vf-weave)" opacity={0.13} style={{ mixBlendMode: 'multiply' }} />
      </svg>
    </Layer>
  );
};
