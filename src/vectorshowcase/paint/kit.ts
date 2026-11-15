import { getLength, getPointAtLength, getTangentAtLength } from '@remotion/paths';

/**
 * Paint kit — the same three-mark brush language as VectorFilm, but with
 * plain colours so each painting can be composed for its own room.
 *
 * Every painting lives in an 800 x 400 canvas space (2:1).
 *   'wash'   the brush stroke IS the paint (grounds, skies)
 *   'reveal' the brush stroke is a MASK uncovering a designed shape
 *   'line'   thin linework (gold deco lines, veins, foam) drawn on last
 */
export type Grad = { grad: [string, string, string]; x1: number; y1: number; x2: number; y2: number };
export type Fill = string | Grad;

export type Mark = {
  id: string;
  kind: 'wash' | 'reveal' | 'line';
  d: string;
  width: number;
  color?: string;
  shape?: string;
  fill?: Fill;
  weight?: number;
  opacity?: number;
  texture?: boolean;
};

export type Dot = { x: number; y: number; r: number; color: string; delay: number };
export type ScheduledMark = Mark & { start: number; end: number; length: number };
export type ScheduledDot = Dot & { at: number };
export type Painting = { marks: ScheduledMark[]; dots: ScheduledDot[]; end: number };

export const pointAt = (d: string, len: number) => getPointAtLength(d, len) ?? { x: 0, y: 0 };
export const tangentAt = (d: string, len: number) => getTangentAtLength(d, len) ?? { x: 1, y: 0 };

const f1 = (n: number) => n.toFixed(1);
export const P = (x: number, y: number) => `${f1(x)} ${f1(y)}`;

export const circle = (cx: number, cy: number, r: number) =>
  `M${f1(cx - r)} ${f1(cy)} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 Z`;

export const ring = (cx: number, cy: number, r: number) =>
  `M${f1(cx - r)} ${f1(cy)} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`;

export const spiral = (cx: number, cy: number, r: number, turns = 2.4) => {
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = (i / 80) * turns * Math.PI * 2;
    const rr = 4 + (r * 0.92 * i) / 80;
    pts.push(P(cx + Math.cos(t) * rr, cy + Math.sin(t) * rr));
  }
  return `M${pts.join(' L')}`;
};

export const zigzag = (x0: number, x1: number, y0: number, y1: number, rows: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= rows; i++) {
    const y = y0 + ((y1 - y0) * i) / rows;
    pts.push(i % 2 === 0 ? P(x0, y) : P(x1, y));
    pts.push(i % 2 === 0 ? P(x1, y) : P(x0, y));
  }
  return `M${pts.join(' L')}`;
};

export const ellipse = (cx: number, cy: number, rx: number, ry: number, rot: number, notch = false) => {
  const pts: string[] = [];
  const r = (rot * Math.PI) / 180;
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    const n = notch && Math.abs(Math.sin((t - Math.PI / 2) / 2)) < 0.09 ? 0.55 : 1;
    const x = Math.cos(t) * rx * n;
    const y = Math.sin(t) * ry * n;
    pts.push(P(cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)));
  }
  return `M${pts.join(' L')} Z`;
};

/** Petal / leaf: pointed almond from a base point at angle a (0 = up). */
export const petal = (bx: number, by: number, a: number, len: number, w: number, belly = 0.18) => {
  const r = (a * Math.PI) / 180;
  const dx = Math.sin(r);
  const dy = -Math.cos(r);
  const nx = -dy;
  const ny = dx;
  const tip = { x: bx + dx * len, y: by + dy * len };
  const at = (t: number, s: number) => P(bx + dx * len * t + nx * s, by + dy * len * t + ny * s);
  const shape =
    `M${P(bx, by)} C ${at(belly, w * 1.05)} ${at(0.72, w * 0.95)} ${P(tip.x, tip.y)} ` +
    `C ${at(0.72, -w * 0.95)} ${at(belly, -w * 1.05)} ${P(bx, by)} Z`;
  const spine = `M${P(bx, by)} L${P(tip.x, tip.y)}`;
  /** point along the spine (t) offset sideways (s) — for veins */
  const off = (t: number, s: number) => ({ x: bx + dx * len * t + nx * s, y: by + dy * len * t + ny * s });
  return { shape, spine, tip, off };
};

/** Half-annulus (rainbow band) centred on (cx, cy), opening downward. */
export const halfBand = (cx: number, cy: number, ro: number, ri: number) =>
  ri <= 0
    ? `M${f1(cx - ro)} ${f1(cy)} A${ro} ${ro} 0 0 1 ${f1(cx + ro)} ${f1(cy)} Z`
    : `M${f1(cx - ro)} ${f1(cy)} A${ro} ${ro} 0 0 1 ${f1(cx + ro)} ${f1(cy)} L${f1(cx + ri)} ${f1(cy)} A${ri} ${ri} 0 0 0 ${f1(cx - ri)} ${f1(cy)} Z`;

export const arc = (cx: number, cy: number, r: number) => `M${f1(cx - r)} ${f1(cy)} A${r} ${r} 0 0 1 ${f1(cx + r)} ${f1(cy)}`;

const GAP = 2;

/**
 * Lay marks one after another between [start, end] so one brush paints the
 * whole picture. Durations follow sqrt(path length) × weight, scaled to fit.
 */
export const schedule = (marks: Mark[], dots: Dot[], start: number, end: number): Painting => {
  const lens = marks.map((m) => getLength(m.d));
  const raw = marks.map((m, i) => Math.max(8, Math.sqrt(lens[i]) * 1.15 * (m.weight ?? 1)));
  const budget = end - start - GAP * marks.length;
  const scale = budget / raw.reduce((a, b) => a + b, 0);
  let t = start;
  const out = marks.map((m, i) => {
    const dur = Math.max(5, Math.round(raw[i] * scale));
    const s = { ...m, start: t, end: t + dur, length: lens[i] };
    t += dur + GAP;
    return s;
  });
  return { marks: out, dots: dots.map((d) => ({ ...d, at: t + d.delay })), end: t };
};

/** Colour loaded on the brush for a mark (used by the brush tip). */
export const markColor = (m: Mark) => {
  if (m.color) return m.color;
  if (m.fill && typeof m.fill !== 'string') return m.fill.grad[1];
  if (typeof m.fill === 'string') return m.fill;
  return '#000000';
};
