import React, { useMemo } from 'react';
import { interpolate } from 'remotion';
import { INK, BRAND, ease } from '../theme';
import { lerp, prog } from '../motion';
import { markColor, pointAt, tangentAt, type Painting } from './kit';

/** The brush itself, tip at (0,0), handle up and to the right. */
export const BrushGraphic: React.FC<{ x: number; y: number; color: string; tilt?: number; lift?: number; scale?: number }> = ({
  x,
  y,
  color,
  tilt = 0,
  lift = 0,
  scale = 1,
}) => {
  const sway = Math.max(-12, Math.min(12, tilt * 0.08));
  const angle = 28 + sway;
  return (
    <g transform={`translate(${x} ${y - lift * 26 * scale}) rotate(${angle}) scale(${0.95 * scale})`}>
      <ellipse cx={0} cy={6} rx={18} ry={6} fill="#000" opacity={0.18 * (1 - lift)} />
      <path d="M-15 -4 Q-20 -42 -13 -78 L13 -78 Q20 -42 15 -4 Q0 8 -15 -4 Z" fill="#D8C3A0" />
      <path d="M-15 -4 Q-19 -26 -16 -40 L16 -40 Q19 -26 15 -4 Q0 8 -15 -4 Z" fill={color} />
      <path d="M-6 -6 L-8 -70 M4 -6 L5 -72" stroke="#000" strokeOpacity={0.12} strokeWidth={2} />
      <rect x={-15} y={-124} width={30} height={48} rx={3} fill="#BDB6AA" />
      <rect x={-15} y={-108} width={30} height={5} fill="#9C9488" />
      <path d="M-13 -124 L-7 -360 Q0 -372 7 -360 L13 -124 Z" fill={INK} />
      <path d="M-7 -360 Q0 -372 7 -360 L6 -330 L-6 -330 Z" fill={BRAND.gold} />
    </g>
  );
};

/** Brush riding the active stroke of a painting (in 800x400 canvas space). */
export const PaintingBrush: React.FC<{ painting: Painting; f: number; x: number; y: number; w: number; h: number }> = ({
  painting,
  f,
  x: X,
  y: Y,
  w,
  h,
}) => {
  const S = painting.marks;
  const ends = useMemo(() => S.map((s) => ({ a: pointAt(s.d, 0), b: pointAt(s.d, s.length) })), [S]);
  const first = S[0];
  const last = S[S.length - 1];
  const enterAt = first.start - 36;
  const exitEnd = last.end + 50;
  if (f < enterAt || f > exitEnd) return null;

  const off = { x: 1000, y: -300 };
  let x = 0;
  let y = 0;
  let lift = 0;
  let tilt = 0;
  let color = markColor(first);

  if (f < first.start) {
    const t = prog(f, enterAt, 36, ease.heavy);
    x = lerp(off.x, ends[0].a.x, t);
    y = lerp(off.y, ends[0].a.y, t);
    lift = 1 - t;
  } else if (f > last.end) {
    const t = prog(f, last.end, 50, ease.exit);
    const e = ends[ends.length - 1].b;
    x = lerp(e.x, off.x, t);
    y = lerp(e.y, off.y, t);
    lift = t;
    color = markColor(last);
  } else {
    const i = S.findIndex((s) => f >= s.start && f <= s.end);
    if (i >= 0) {
      const s = S[i];
      const p = prog(f, s.start, s.end - s.start, ease.paint);
      const L = Math.max(0.01, p * s.length);
      const pt = pointAt(s.d, L);
      const tg = tangentAt(s.d, L);
      x = pt.x;
      y = pt.y;
      tilt = Math.atan2(tg.y, tg.x) * (180 / Math.PI);
      color = markColor(s);
    } else {
      const next = S.findIndex((s) => s.start > f);
      const prev = next - 1;
      const t = interpolate(f, [S[prev].end, S[next].start], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: ease.inOut,
      });
      x = lerp(ends[prev].b.x, ends[next].a.x, t);
      y = lerp(ends[prev].b.y, ends[next].a.y, t);
      lift = Math.sin(t * Math.PI);
      color = markColor(S[next]);
    }
  }

  return (
    <svg x={X} y={Y} width={w} height={h} viewBox="0 0 800 400" overflow="visible">
      <BrushGraphic x={x} y={y} color={color} tilt={tilt} lift={lift} />
    </svg>
  );
};
