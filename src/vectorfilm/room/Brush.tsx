import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

import { COLORS, ease } from '../theme';
import { lerp, prog } from '../motion';
import { Layer } from './primitives';
import { CANVAS } from './geometry';
import { SCHEDULE, pointAt, tangentAt } from './strokes';
import { markColor as strokeColor } from './Painting';

/**
 * A vector paintbrush that rides the tip of whichever stroke is being laid
 * down. Between strokes it lifts and travels to the next start point, so the
 * painting visibly happens *by hand* rather than wiping on.
 */
export const Brush: React.FC = () => {
  const f = useCurrentFrame();

  const ends = useMemo(
    () =>
      SCHEDULE.map((s) => ({
        a: pointAt(s.d, 0),
        b: pointAt(s.d, s.length),
      })),
    [],
  );

  const first = SCHEDULE[0];
  const last = SCHEDULE[SCHEDULE.length - 1];
  const enterAt = first.start - 36;
  const exitEnd = last.end + 50;
  if (f < enterAt || f > exitEnd) return null;

  let x = 0;
  let y = 0;
  let lift = 0;
  let tilt = 0;
  let color = strokeColor(f, first);

  const offscreen = { x: 980, y: -260 };

  if (f < first.start) {
    const t = prog(f, enterAt, 36, ease.heavy);
    x = lerp(offscreen.x, ends[0].a.x, t);
    y = lerp(offscreen.y, ends[0].a.y, t);
    lift = 1 - t;
  } else if (f > last.end) {
    const t = prog(f, last.end, 50, ease.exit);
    const e = ends[ends.length - 1].b;
    x = lerp(e.x, offscreen.x, t);
    y = lerp(e.y, offscreen.y, t);
    lift = t;
    color = strokeColor(f, last);
  } else {
    const i = SCHEDULE.findIndex((s) => f >= s.start && f <= s.end);
    if (i >= 0) {
      const s = SCHEDULE[i];
      const p = prog(f, s.start, s.end - s.start, ease.paint);
      const pt = pointAt(s.d, Math.max(0.01, p * s.length));
      const tg = tangentAt(s.d, Math.max(0.01, p * s.length));
      x = pt.x;
      y = pt.y;
      tilt = Math.atan2(tg.y, tg.x) * (180 / Math.PI);
      color = strokeColor(f, s);
    } else {
      // in the gap: lift and travel to the next stroke
      const next = SCHEDULE.findIndex((s) => s.start > f);
      const prev = next - 1;
      const t = interpolate(f, [SCHEDULE[prev].end, SCHEDULE[next].start], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: ease.inOut,
      });
      x = lerp(ends[prev].b.x, ends[next].a.x, t);
      y = lerp(ends[prev].b.y, ends[next].a.y, t);
      lift = Math.sin(t * Math.PI);
      color = strokeColor(f, SCHEDULE[next]);
    }
  }

  // Handle leans up-right; a little sway follows the stroke direction.
  const sway = Math.max(-12, Math.min(12, tilt * 0.08));
  const angle = 28 + sway;
  const liftPx = lift * 26;

  return (
    <Layer>
      <svg x={CANVAS.x} y={CANVAS.y} width={CANVAS.w} height={CANVAS.h} viewBox="0 0 800 400" overflow="visible">
        <g transform={`translate(${x} ${y - liftPx}) rotate(${angle}) scale(0.95)`}>
          {/* soft contact shadow */}
          <ellipse cx={0} cy={6} rx={18} ry={6} fill="#000" opacity={0.18 * (1 - lift)} />
          {/* bristle tuft, loaded with the current colour */}
          <path d="M-15 -4 Q-20 -42 -13 -78 L13 -78 Q20 -42 15 -4 Q0 8 -15 -4 Z" fill="#D8C3A0" />
          <path d="M-15 -4 Q-19 -26 -16 -40 L16 -40 Q19 -26 15 -4 Q0 8 -15 -4 Z" fill={color} />
          <path d="M-6 -6 L-8 -70 M4 -6 L5 -72" stroke="#000" strokeOpacity={0.12} strokeWidth={2} />
          {/* ferrule */}
          <rect x={-15} y={-124} width={30} height={48} rx={3} fill="#BDB6AA" />
          <rect x={-15} y={-108} width={30} height={5} fill="#9C9488" />
          {/* handle */}
          <path d="M-13 -124 L-7 -360 Q0 -372 7 -360 L13 -124 Z" fill={COLORS.ink} />
          <path d="M-7 -360 Q0 -372 7 -360 L6 -330 L-6 -330 Z" fill={COLORS.coral} />
        </g>
      </svg>
    </Layer>
  );
};
