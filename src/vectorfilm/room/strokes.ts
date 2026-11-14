import { getLength, getPointAtLength, getTangentAtLength } from '@remotion/paths';
import type { Role } from '../theme';
import { T } from '../theme';
import { seeded } from '../motion';

/** Non-null wrappers — @remotion/paths returns null for degenerate input. */
export const pointAt = (d: string, len: number) => getPointAtLength(d, len) ?? { x: 0, y: 0 };
export const tangentAt = (d: string, len: number) => getTangentAtLength(d, len) ?? { x: 1, y: 0 };

/**
 * The painting lives in an 800 x 400 canvas space (2:1, "180 x 90 cm").
 *
 * Three kinds of mark, all laid down by the same visible brush:
 *   'wash'   — the brush stroke itself is the paint (ground layers)
 *   'reveal' — the brush stroke is a MASK that uncovers a designed shape
 *              (petals, lotus pads, moon). This is how a crisp, beautiful
 *              petal can still appear "painted on" stroke by stroke.
 *   'line'   — thin gold Art-Deco linework drawn on at the end
 */
export type Paint = { role?: Role; color?: string };
export type Fill = Paint | { grad: [Paint, Paint, Paint]; x1: number; y1: number; x2: number; y2: number };

export type Mark = {
  id: string;
  kind: 'wash' | 'reveal' | 'line';
  /** the path the brush travels */
  d: string;
  /** brush width (for 'reveal' this is the mask width — must cover the shape) */
  width: number;
  paint?: Paint; // wash / line colour
  shape?: string; // reveal: the shape uncovered
  fill?: Fill; // reveal: shape fill
  weight?: number;
  opacity?: number;
  /** draw bristle hairlines inside revealed shapes (off for broad zig-zag fills) */
  texture?: boolean;
};

export type Dot = { x: number; y: number; r: number; paint: Paint; at: number };

const f1 = (n: number) => n.toFixed(1);
const P = (x: number, y: number) => `${f1(x)} ${f1(y)}`;

/* ------------------------------------------------------------------ */
/* 1. Ground — patchwork washes, every stroke runs past the canvas     */
/*    edges so no round brush-ends ever show inside the painting.      */
/* ------------------------------------------------------------------ */
const ground: Mark[] = [
  { id: 'g1', kind: 'wash', d: `M-60 50 C 200 25 440 80 860 40`, width: 150, paint: { role: 'fieldDeep' } },
  { id: 'g2', kind: 'wash', d: `M860 160 C 580 130 300 195 -60 155`, width: 150, paint: { role: 'field' } },
  { id: 'g3', kind: 'wash', d: `M-60 275 C 260 250 530 310 860 270`, width: 150, paint: { role: 'fieldDeep' } },
  { id: 'g4', kind: 'wash', d: `M860 385 C 560 360 260 405 -60 380`, width: 140, paint: { role: 'field' } },
  { id: 'g5', kind: 'wash', d: `M58 -60 C 72 120 44 280 64 460`, width: 70, paint: { color: '#B5562F' }, opacity: 0.9 },
  { id: 'g6', kind: 'wash', d: `M748 460 C 730 280 760 120 742 -60`, width: 56, paint: { role: 'gold' }, opacity: 0.85 },
  { id: 'g7', kind: 'wash', d: `M520 -60 C 532 100 508 300 526 460`, width: 44, paint: { role: 'light' }, opacity: 0.6 },
];

/* ------------------------------------------------------------------ */
/* 2. Gold moon — filled disc uncovered by a spiral stroke             */
/* ------------------------------------------------------------------ */
const MOON = { x: 640, y: 92, r: 58 };
const spiral = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = (i / 80) * 2.4 * Math.PI * 2;
    const r = 4 + (MOON.r * 0.92 * i) / 80;
    pts.push(P(MOON.x + Math.cos(t) * r, MOON.y + Math.sin(t) * r));
  }
  return `M${pts.join(' L')}`;
})();
const moon: Mark = {
  id: 'moon',
  kind: 'reveal',
  d: spiral,
  width: 34,
  shape: `M${MOON.x - MOON.r} ${MOON.y} a${MOON.r} ${MOON.r} 0 1 0 ${MOON.r * 2} 0 a${MOON.r} ${MOON.r} 0 1 0 ${-MOON.r * 2} 0 Z`,
  fill: {
    grad: [{ role: 'gold' }, { color: '#F3D58A' }, { role: 'gold' }],
    x1: MOON.x - MOON.r,
    y1: MOON.y - MOON.r,
    x2: MOON.x + MOON.r,
    y2: MOON.y + MOON.r,
  },
  weight: 1.3,
};

/* ------------------------------------------------------------------ */
/* 3. Lotus pads + a standing leaf — filled by zig-zag brush strokes   */
/* ------------------------------------------------------------------ */
const ellipseShape = (cx: number, cy: number, rx: number, ry: number, rot: number) => {
  const pts: string[] = [];
  const r = (rot * Math.PI) / 180;
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    // small notch toward the centre, like a lotus pad
    const notch = Math.abs(Math.sin((t - Math.PI / 2) / 2)) < 0.09 ? 0.55 : 1;
    const x = Math.cos(t) * rx * notch;
    const y = Math.sin(t) * ry * notch;
    pts.push(P(cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)));
  }
  return `M${pts.join(' L')} Z`;
};
const zigzag = (x0: number, x1: number, y0: number, y1: number, rows: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= rows; i++) {
    const y = y0 + ((y1 - y0) * i) / rows;
    pts.push(i % 2 === 0 ? P(x0, y) : P(x1, y));
    pts.push(i % 2 === 0 ? P(x1, y) : P(x0, y));
  }
  return `M${pts.join(' L')}`;
};
const pads: Mark[] = [
  {
    id: 'pad1',
    kind: 'reveal',
    texture: false,
    d: zigzag(10, 360, 300, 420, 3),
    width: 62,
    shape: ellipseShape(185, 362, 180, 62, -6),
    fill: { grad: [{ color: '#4F7F62' }, { color: '#7FA98A' }, { color: '#5F8F6E' }], x1: 10, y1: 300, x2: 360, y2: 420 },
  },
  {
    id: 'pad2',
    kind: 'reveal',
    texture: false,
    d: zigzag(790, 450, 310, 420, 3),
    width: 62,
    shape: ellipseShape(625, 368, 170, 58, 7),
    fill: { grad: [{ color: '#5F8F6E' }, { color: '#8DB596' }, { color: '#4F7F62' }], x1: 790, y1: 310, x2: 450, y2: 420 },
  },
  {
    id: 'leaf',
    kind: 'reveal',
    d: `M150 330 C 120 260 100 180 135 110`,
    width: 96,
    shape: `M150 335 C 70 280 70 170 135 100 C 150 170 190 250 150 335 Z`,
    fill: { grad: [{ color: '#3F6F52' }, { color: '#6E9C7E' }, { color: '#9CC3A4' }], x1: 150, y1: 335, x2: 135, y2: 100 },
  },
];

/* ------------------------------------------------------------------ */
/* 4. Lotus — designed petal shapes, each uncovered by one stroke      */
/* ------------------------------------------------------------------ */
const BASE = { x: 400, y: 304 };
type Petal = { a: number; len: number; w: number };
// back → front
const PETALS: Petal[] = [
  { a: -102, len: 122, w: 30 },
  { a: 102, len: 122, w: 30 },
  { a: -78, len: 172, w: 40 },
  { a: 78, len: 172, w: 40 },
  { a: -52, len: 190, w: 44 },
  { a: 52, len: 190, w: 44 },
  { a: -28, len: 205, w: 46 },
  { a: 28, len: 205, w: 46 },
  { a: -12, len: 200, w: 44 },
  { a: 12, len: 200, w: 44 },
  { a: 0, len: 222, w: 46 },
];

const petalGeom = (p: Petal, base = BASE) => {
  const r = (p.a * Math.PI) / 180;
  const dx = Math.sin(r);
  const dy = -Math.cos(r);
  const nx = -dy;
  const ny = dx;
  const T = { x: base.x + dx * p.len, y: base.y + dy * p.len };
  const at = (t: number, s: number) => P(base.x + dx * p.len * t + nx * s, base.y + dy * p.len * t + ny * s);
  const shape =
    `M${P(base.x, base.y)} C ${at(0.18, p.w * 1.05)} ${at(0.72, p.w * 0.95)} ${P(T.x, T.y)} ` +
    `C ${at(0.72, -p.w * 0.95)} ${at(0.18, -p.w * 1.05)} ${P(base.x, base.y)} Z`;
  const spine = `M${P(base.x, base.y)} L${P(T.x, T.y)}`;
  return { shape, spine, T };
};

const petals: Mark[] = PETALS.map((p, i) => {
  const g = petalGeom(p);
  return {
    id: `petal${i}`,
    kind: 'reveal',
    d: g.spine,
    width: p.w * 2.3,
    shape: g.shape,
    fill: {
      grad: [{ role: 'cream' }, { role: 'body' }, { role: 'tip' }],
      x1: BASE.x,
      y1: BASE.y,
      x2: g.T.x,
      y2: g.T.y,
    },
    weight: 1.1,
  };
});

/* Buds on stems */
const stems: Mark[] = [
  { id: 'stem1', kind: 'wash', d: `M262 430 C 258 360 250 300 246 236`, width: 8, paint: { color: '#4F7A5C' }, weight: 0.6 },
  { id: 'stem2', kind: 'wash', d: `M548 430 C 552 370 560 300 566 226`, width: 8, paint: { color: '#4F7A5C' }, weight: 0.6 },
];
const buds: Mark[] = [
  { a: -6, x: 246, y: 240 },
  { a: 8, x: 566, y: 230 },
].map((b, i) => {
  const g = petalGeom({ a: b.a, len: 86, w: 24 }, { x: b.x, y: b.y });
  return {
    id: `bud${i}`,
    kind: 'reveal' as const,
    d: g.spine,
    width: 60,
    shape: g.shape,
    fill: { grad: [{ role: 'cream' }, { role: 'body' }, { role: 'tip' }], x1: b.x, y1: b.y, x2: g.T.x, y2: g.T.y },
    weight: 0.7,
  };
});

/* Gold seed pod */
const pod: Mark = {
  id: 'pod',
  kind: 'reveal',
  d: `M362 296 L438 296`,
  width: 46,
  shape: `M360 298 C 362 278 438 278 440 298 C 430 312 370 312 360 298 Z`,
  fill: { grad: [{ role: 'gold' }, { color: '#F1CF7E' }, { role: 'gold' }], x1: 360, y1: 280, x2: 440, y2: 312 },
  weight: 0.6,
};

/* ------------------------------------------------------------------ */
/* 5. Art-Deco gold linework over the front petals + moon ring          */
/* ------------------------------------------------------------------ */
const lines: Mark[] = [
  ...PETALS.slice(4).map((p, i) => ({
    id: `deco${i}`,
    kind: 'line' as const,
    d: petalGeom(p).shape,
    width: 2.6,
    paint: { role: 'gold' as Role },
    weight: 0.5,
  })),
  {
    id: 'ring',
    kind: 'line',
    d: `M${MOON.x - MOON.r - 10} ${MOON.y} a${MOON.r + 10} ${MOON.r + 10} 0 1 0 ${(MOON.r + 10) * 2} 0 a${MOON.r + 10} ${MOON.r + 10} 0 1 0 ${-(MOON.r + 10) * 2} 0`,
    width: 2.4,
    paint: { role: 'gold' },
    weight: 0.5,
  },
];

export const MARKS: Mark[] = [...ground, moon, ...pads, ...stems, ...buds, ...petals, pod, ...lines];

/* ------------------------------------------------------------------ */
/* Scheduling — one brush, marks laid down one after another.          */
/* ------------------------------------------------------------------ */
export type ScheduledMark = Mark & { start: number; end: number; length: number };

const GAP = 3;
export const BRUSH_END = T.paintWindow[1] - 90;

export const SCHEDULE: ScheduledMark[] = (() => {
  const lens = MARKS.map((m) => getLength(m.d));
  const raw = MARKS.map((m, i) => Math.max(8, Math.sqrt(lens[i]) * 1.15 * (m.weight ?? 1)));
  const budget = BRUSH_END - T.paintWindow[0] - GAP * MARKS.length;
  const scale = budget / raw.reduce((a, b) => a + b, 0);
  let t = T.paintWindow[0];
  return MARKS.map((m, i) => {
    const dur = Math.max(6, Math.round(raw[i] * scale));
    const out = { ...m, start: t, end: t + dur, length: lens[i] };
    t += dur + GAP;
    return out;
  });
})();

/* ------------------------------------------------------------------ */
/* Dots — seeds on the pod + gold-leaf flecks, tapped in at the end     */
/* ------------------------------------------------------------------ */
export const DOTS: Dot[] = (() => {
  const out: Dot[] = [];
  const start = BRUSH_END + 4;
  for (let i = 0; i < 7; i++) {
    out.push({ x: 372 + i * 9.5, y: 292 + (i % 2) * 6, r: 3.6, paint: { color: '#7A4E1E' }, at: start + i * 2 });
  }
  const rnd = seeded(11);
  for (let i = 0; i < 52; i++) {
    out.push({
      x: 15 + rnd() * 770,
      y: 10 + rnd() * 380,
      r: 1.4 + rnd() * 3,
      paint: { role: 'gold' },
      at: start + 12 + Math.floor(rnd() * 60),
    });
  }
  return out;
})();
