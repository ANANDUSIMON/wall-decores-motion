import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { ease } from '../theme';
import { mulberry32, gaussian } from '../lib/motion';

type Props = {
  /** two endpoints of the stroke spine, in px, within the 1920x1080 frame */
  from: [number, number];
  to: [number, number];
  color: string;
  /** stroke thickness at its widest */
  thickness?: number;
  /** how many bristles make up the stroke */
  bristles?: number;
  /** 0 = loaded wet brush, 1 = nearly dry, lots of skipped gaps */
  dryness?: number;
  /** frame the paint-on reveal begins */
  revealStart?: number;
  /** frames the reveal takes */
  revealDuration?: number;
  /** bow in the spine, px of perpendicular offset at the midpoint */
  bow?: number;
  seed?: number;
  opacity?: number;
};

/**
 * A bristle-simulated brush stroke that paints itself on.
 *
 * This is the After Effects matte-reveal technique: the stroke is drawn in
 * full, then a mask sweeps along its direction to reveal it. Because the
 * reveal follows the spine rather than a straight screen-aligned wipe, the
 * stroke reads as *painted*, not faded in.
 *
 * Texture comes from 40-80 independent tapered bristles sharing one bezier
 * spine, each with its own perpendicular offset, opacity and length. Dropping
 * a fraction of them mid-path produces the skip and scatter of a dry brush.
 */
export const BrushStroke: React.FC<Props> = ({
  from,
  to,
  color,
  thickness = 46,
  bristles = 62,
  dryness = 0.35,
  revealStart = 0,
  revealDuration = 20,
  bow = 0,
  seed = 7,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();

  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  // unit perpendicular
  const px = -dy / len;
  const py = dx / len;
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  const uid = React.useMemo(
    () => `bs-${seed}-${Math.round(x1)}-${Math.round(y1)}`,
    [seed, x1, y1]
  );

  const strands = React.useMemo(() => {
    const rnd = mulberry32(seed * 104729);
    return Array.from({ length: bristles }, () => {
      const off = gaussian(rnd) * (thickness / 2);
      // each bristle enters and leaves at a slightly different point
      const t0 = Math.max(0, gaussian(rnd) * 0.06);
      const t1 = Math.min(1, 1 - Math.abs(gaussian(rnd)) * 0.09);
      // dry brush: skip a slice of the middle on some bristles
      const skip = rnd() < dryness * 0.4;
      const skipAt = 0.25 + rnd() * 0.45;
      const skipLen = 0.04 + rnd() * 0.12;
      return {
        off,
        t0,
        t1,
        w: (0.5 + rnd() * 1.6) * (1 - Math.abs(off) / (thickness * 0.9)),
        op: 0.28 + rnd() * 0.72,
        wobble: gaussian(rnd) * 5.5,
        skip,
        skipAt,
        skipLen,
        dead: rnd() < dryness * 0.16,
      };
    }).filter((s) => !s.dead);
  }, [bristles, thickness, dryness, seed]);

  const reveal = interpolate(
    frame,
    [revealStart, revealStart + revealDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.entrance }
  );

  if (reveal <= 0) return null;

  /** point along the bowed spine at t, offset perpendicular by `off` */
  const pt = (t: number, off: number, wobble: number) => {
    // quadratic bow
    const bx = x1 + dx * t + px * bow * 4 * t * (1 - t);
    const by = y1 + dy * t + py * bow * 4 * t * (1 - t);
    // taper: thick in the middle, thin at the ends
    const taper = Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
    const w = wobble * Math.sin(t * Math.PI * 2.2);
    return [
      bx + px * (off * (0.35 + 0.65 * taper) + w),
      by + py * (off * (0.35 + 0.65 * taper) + w),
    ];
  };

  const pathFor = (s: typeof strands[number], a: number, b: number) => {
    const steps = 14;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = a + ((b - a) * i) / steps;
      const [cx, cy] = pt(t, s.off, s.wobble);
      d += `${i === 0 ? 'M' : 'L'}${cx.toFixed(2)},${cy.toFixed(2)} `;
    }
    return d;
  };

  // The reveal mask is a rect rotated to the stroke's own angle, growing
  // along the spine — so paint appears to flow from one end to the other.
  const maskLen = len + thickness * 2;
  const maskW = thickness * 3;

  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
    >
      <defs>
        <clipPath id={`${uid}-clip`}>
          <rect
            x={x1 - thickness}
            y={y1 - maskW / 2}
            width={maskLen * reveal}
            height={maskW}
            transform={`rotate(${angleDeg} ${x1} ${y1})`}
          />
        </clipPath>
        <filter id={`${uid}-tex`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035 0.9"
            numOctaves={3}
            seed={seed}
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale={thickness * 0.14}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      <g
        clipPath={`url(#${uid}-clip)`}
        filter={`url(#${uid}-tex)`}
        opacity={opacity}
      >
        {strands.map((s, i) => {
          const segs: [number, number][] = s.skip
            ? [
                [s.t0, s.skipAt],
                [s.skipAt + s.skipLen, s.t1],
              ]
            : [[s.t0, s.t1]];
          return segs.map(([a, b], j) =>
            b <= a ? null : (
              <path
                key={`${i}-${j}`}
                d={pathFor(s, a, b)}
                stroke={color}
                strokeWidth={Math.max(0.4, s.w)}
                strokeLinecap="butt"
                fill="none"
                opacity={s.op}
              />
            )
          );
        })}
      </g>
    </svg>
  );
};
