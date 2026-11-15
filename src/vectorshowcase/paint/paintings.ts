import { ROOMS, T, roomStart } from '../theme';
import { seeded } from '../motion';
import {
  arc,
  circle,
  ellipse,
  halfBand,
  petal,
  ring,
  schedule,
  spiral,
  zigzag,
  type Dot,
  type Mark,
  type Painting,
} from './kit';

const flecks = (seed: number, n: number, color: string, area = { x: 15, y: 10, w: 770, h: 380 }, r = [1.4, 3]): Dot[] => {
  const rnd = seeded(seed);
  return Array.from({ length: n }, () => ({
    x: area.x + rnd() * area.w,
    y: area.y + rnd() * area.h,
    r: r[0] + rnd() * (r[1] - r[0]),
    color,
    delay: 4 + Math.floor(rnd() * 46),
  }));
};

/* ================================================================== */
/* 1 · GOLDEN HOUR HILLS — for the Terracotta Lounge                    */
/* warm sky in the wall's own family, cooled by emerald hills          */
/* ================================================================== */
const hills = (a: Record<string, string>): [Mark[], Dot[]] => {
  const far = `M-10 262 C 120 200 240 212 360 246 C 470 278 560 200 680 206 C 740 208 790 230 810 240 L810 410 L-10 410 Z`;
  const mid = `M-10 302 C 90 252 200 256 300 292 C 400 326 470 282 560 266 C 660 250 740 290 810 300 L810 410 L-10 410 Z`;
  const near = `M-10 352 C 120 312 250 332 380 356 C 500 378 620 330 810 342 L810 410 L-10 410 Z`;
  const marks: Mark[] = [
    { id: 'g1', kind: 'wash', d: 'M-60 40 C 200 20 500 70 860 35', width: 150, color: a.sky1 },
    { id: 'g2', kind: 'wash', d: 'M860 150 C 560 125 280 178 -60 146', width: 150, color: a.sky2 },
    { id: 'g3', kind: 'wash', d: 'M-60 262 C 260 240 540 292 860 256', width: 150, color: a.sky2 },
    { id: 'g4', kind: 'wash', d: 'M860 372 C 560 352 260 398 -60 376', width: 120, color: a.sky1 },
    {
      id: 'sun',
      kind: 'reveal',
      d: spiral(560, 172, 74),
      width: 34,
      shape: circle(560, 172, 74),
      fill: { grad: [a.sun, '#FFE29A', a.sky1], x1: 500, y1: 110, x2: 620, y2: 240 },
      weight: 1.2,
    },
    {
      id: 'far',
      kind: 'reveal',
      texture: false,
      d: zigzag(0, 800, 222, 400, 4),
      width: 72,
      shape: far,
      fill: { grad: [a.hillFar, '#A8DEC5', a.hillFar], x1: 0, y1: 220, x2: 800, y2: 400 },
    },
    {
      id: 'mid',
      kind: 'reveal',
      texture: false,
      d: zigzag(800, 0, 262, 400, 3),
      width: 72,
      shape: mid,
      fill: { grad: [a.hillMid, '#36B88A', a.hillMid], x1: 0, y1: 260, x2: 800, y2: 400 },
    },
    ...[118, 146, 172].map(
      (x, i): Mark => ({
        id: `cy${i}`,
        kind: 'reveal',
        d: `M${x} ${282 - i * 4} L${x} ${206 - i * 6}`,
        width: 30,
        shape: ellipse(x, 246 - i * 5, 11, 42 - i * 3, 0),
        fill: a.hillNear,
        weight: 0.5,
      }),
    ),
    {
      id: 'near',
      kind: 'reveal',
      texture: false,
      d: zigzag(0, 800, 322, 404, 2),
      width: 62,
      shape: near,
      fill: { grad: [a.hillNear, '#137A5C', a.hillNear], x1: 0, y1: 320, x2: 800, y2: 400 },
    },
    { id: 'path', kind: 'line', d: 'M432 404 C 452 378 404 360 452 334 C 486 318 470 300 500 290', width: 6, color: a.sun, weight: 0.6 },
    { id: 'halo', kind: 'line', d: ring(560, 172, 90), width: 2.6, color: '#FFFFFF', weight: 0.5, opacity: 0.8 },
    { id: 'b1', kind: 'line', d: 'M200 104 q 14 -12 28 0 q 14 -12 28 0', width: 3.4, color: a.ink, weight: 0.4 },
    { id: 'b2', kind: 'line', d: 'M262 74 q 10 -9 20 0 q 10 -9 20 0', width: 3, color: a.ink, weight: 0.4 },
  ];
  return [marks, flecks(21, 40, '#FFFFFF', { x: 20, y: 10, w: 760, h: 200 }, [1.2, 2.6])];
};

/* ================================================================== */
/* 2 · TIDE & CORAL SUN — for the Ocean Study                           */
/* navy deepens the blue wall; the coral sun answers it                 */
/* ================================================================== */
const tide = (a: Record<string, string>): [Mark[], Dot[]] => {
  const back = `M-10 250 C 100 210 180 240 260 226 C 340 212 400 182 470 200 C 540 220 600 250 700 230 C 760 218 790 225 810 230 L810 410 L-10 410 Z`;
  const curl = `M-10 330 C 60 300 110 232 190 176 C 250 136 330 130 360 170 C 380 198 350 230 315 218 C 290 210 300 186 322 186 C 300 170 255 180 235 215 C 210 260 240 300 300 310 C 400 325 520 300 620 315 C 700 327 760 330 810 325 L810 410 L-10 410 Z`;
  const front = `M-10 372 C 120 342 220 362 330 352 C 460 342 560 372 680 356 C 740 349 780 352 810 355 L810 410 L-10 410 Z`;
  const marks: Mark[] = [
    { id: 'g1', kind: 'wash', d: 'M-60 45 C 220 25 520 70 860 40', width: 150, color: a.deep },
    { id: 'g2', kind: 'wash', d: 'M860 155 C 560 130 280 180 -60 150', width: 150, color: a.mid },
    { id: 'g3', kind: 'wash', d: 'M-60 270 C 260 250 540 300 860 262', width: 150, color: a.deep },
    { id: 'g4', kind: 'wash', d: 'M860 380 C 560 360 260 400 -60 378', width: 120, color: a.mid },
    {
      id: 'sun',
      kind: 'reveal',
      d: spiral(616, 112, 62),
      width: 30,
      shape: circle(616, 112, 62),
      fill: { grad: [a.sun, '#F7A184', '#E25A3A'], x1: 560, y1: 60, x2: 670, y2: 170 },
      weight: 1.2,
    },
    {
      id: 'back',
      kind: 'reveal',
      texture: false,
      d: zigzag(0, 800, 196, 400, 4),
      width: 74,
      shape: back,
      fill: { grad: [a.mid, '#2E6FB0', a.mid], x1: 0, y1: 190, x2: 800, y2: 400 },
    },
    {
      id: 'curl',
      kind: 'reveal',
      texture: false,
      d: zigzag(800, 0, 140, 404, 6),
      width: 70,
      shape: curl,
      fill: { grad: [a.wave, '#9FE1EF', a.wave], x1: 160, y1: 140, x2: 600, y2: 400 },
      weight: 1.3,
    },
    {
      id: 'front',
      kind: 'reveal',
      texture: false,
      d: zigzag(0, 800, 344, 404, 2),
      width: 60,
      shape: front,
      fill: { grad: [a.deep, '#1B467E', a.deep], x1: 0, y1: 340, x2: 800, y2: 400 },
    },
    { id: 'foam1', kind: 'line', d: 'M120 236 C 150 210 170 194 190 176 C 250 136 330 130 360 170 C 380 198 350 230 315 218', width: 5, color: a.foam, weight: 0.7 },
    { id: 'foam2', kind: 'line', d: 'M420 196 C 470 196 520 216 560 230', width: 4, color: a.foam, weight: 0.4, opacity: 0.85 },
    { id: 'foam3', kind: 'line', d: 'M330 352 C 460 342 560 372 680 356', width: 4, color: a.wave, weight: 0.5 },
    { id: 'ring', kind: 'line', d: ring(616, 112, 76), width: 2.6, color: a.gold, weight: 0.5 },
    { id: 'glint', kind: 'line', d: 'M560 222 L700 222 M590 236 L670 236 M610 250 L650 250', width: 3, color: a.sun, weight: 0.5 },
  ];
  const spray = flecks(33, 26, a.foam, { x: 190, y: 120, w: 200, h: 70 }, [1.6, 4]);
  return [marks, [...spray, ...flecks(7, 30, a.gold, { x: 20, y: 10, w: 760, h: 170 }, [1, 2.4])]];
};

/* ================================================================== */
/* 3 · MONSTERA ARCH — for the Emerald Library                          */
/* the wall's green comes back as leaves, framed by its complement      */
/* ================================================================== */
const monstera = (a: Record<string, string>): [Mark[], Dot[]] => {
  const archShape = 'M250 410 L250 172 A150 150 0 0 1 550 172 L550 410 Z';
  const leaves = [
    { bx: 404, by: 410, a: -18, len: 262, w: 92, g: [a.leaf1, a.leaf2, a.leaf1] },
    { bx: 384, by: 410, a: 38, len: 232, w: 80, g: [a.leaf2, a.leaf3, a.leaf2] },
    { bx: 420, by: 410, a: -58, len: 206, w: 70, g: [a.leaf1, '#1E8A63', a.leaf2] },
    { bx: 396, by: 410, a: 70, len: 168, w: 56, g: [a.leaf1, a.leaf2, a.leaf1] },
    { bx: 410, by: 410, a: -84, len: 150, w: 48, g: [a.leaf2, a.leaf3, a.leaf2] },
  ];
  const leafMarks: Mark[] = leaves.map((l, i) => {
    const g = petal(l.bx, l.by, l.a, l.len, l.w, 0.3);
    return {
      id: `leaf${i}`,
      kind: 'reveal',
      d: g.spine,
      width: l.w * 2.3,
      shape: g.shape,
      fill: { grad: l.g as [string, string, string], x1: l.bx, y1: l.by, x2: g.tip.x, y2: g.tip.y },
      weight: 1.1,
    };
  });
  const veins: Mark[] = leaves.flatMap((l, i) => {
    const g = petal(l.bx, l.by, l.a, l.len, l.w, 0.3);
    const rib: Mark = { id: `rib${i}`, kind: 'line', d: `M${l.bx} ${l.by} L${g.tip.x.toFixed(1)} ${g.tip.y.toFixed(1)}`, width: 3, color: a.leaf3, weight: 0.35 };
    const side: Mark[] = [0.35, 0.55, 0.75].flatMap((t, j) =>
      [-1, 1].map((s): Mark => {
        const p0 = g.off(t, 0);
        const p1 = g.off(t + 0.12, s * l.w * 0.8);
        return { id: `v${i}${j}${s}`, kind: 'line', d: `M${p0.x.toFixed(1)} ${p0.y.toFixed(1)} L${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`, width: 2.4, color: a.leaf3, weight: 0.2, opacity: 0.8 };
      }),
    );
    return [rib, ...side];
  });
  const marks: Mark[] = [
    { id: 'g1', kind: 'wash', d: 'M-60 45 C 220 25 520 70 860 40', width: 150, color: a.bg },
    { id: 'g2', kind: 'wash', d: 'M860 155 C 560 130 280 180 -60 150', width: 150, color: a.bg2 },
    { id: 'g3', kind: 'wash', d: 'M-60 270 C 260 250 540 300 860 262', width: 150, color: a.bg },
    { id: 'g4', kind: 'wash', d: 'M860 380 C 560 360 260 400 -60 378', width: 120, color: a.bg2 },
    {
      id: 'arch',
      kind: 'reveal',
      texture: false,
      d: zigzag(250, 550, 30, 404, 6),
      width: 76,
      shape: archShape,
      fill: { grad: [a.arch, '#E57A9C', a.arch], x1: 250, y1: 20, x2: 550, y2: 410 },
      weight: 1.3,
    },
    {
      id: 'sun',
      kind: 'reveal',
      d: spiral(128, 92, 42, 2),
      width: 26,
      shape: circle(128, 92, 42),
      fill: { grad: [a.gold, '#E9D3A2', a.gold], x1: 86, y1: 50, x2: 170, y2: 134 },
      weight: 0.8,
    },
    ...leafMarks,
    { id: 'archline', kind: 'line', d: 'M236 410 L236 172 A164 164 0 0 1 564 172 L564 410', width: 3, color: a.gold, weight: 0.7 },
    ...veins,
  ];
  const buds = flecks(44, 14, a.arch, { x: 600, y: 230, w: 180, h: 160 }, [3, 6]);
  return [marks, [...buds, ...flecks(45, 36, a.gold)]];
};

/* ================================================================== */
/* 4 · LOTUS BLOOM — for the Rose Salon                                 */
/* plum ground deepens the rose; emerald pads give it an accent         */
/* ================================================================== */
const lotus = (a: Record<string, string>): [Mark[], Dot[]] => {
  const base = { x: 400, y: 304 };
  const PETALS = [
    { a: -102, len: 122, w: 30 },
    { a: 102, len: 122, w: 30 },
    { a: -78, len: 172, w: 40 },
    { a: 78, len: 172, w: 40 },
    { a: -52, len: 190, w: 44 },
    { a: 52, len: 190, w: 44 },
    { a: -28, len: 205, w: 46 },
    { a: 28, len: 205, w: 46 },
    { a: 0, len: 222, w: 46 },
  ];
  const petals: Mark[] = PETALS.map((p, i) => {
    const g = petal(base.x, base.y, p.a, p.len, p.w);
    return {
      id: `petal${i}`,
      kind: 'reveal',
      d: g.spine,
      width: p.w * 2.3,
      shape: g.shape,
      fill: { grad: [a.petalLo, a.petalMid, a.petalTip], x1: base.x, y1: base.y, x2: g.tip.x, y2: g.tip.y },
      weight: 1.05,
    };
  });
  const deco: Mark[] = PETALS.slice(4).map((p, i) => ({
    id: `deco${i}`,
    kind: 'line',
    d: petal(base.x, base.y, p.a, p.len, p.w).shape,
    width: 2.6,
    color: a.gold,
    weight: 0.45,
  }));
  const marks: Mark[] = [
    { id: 'g1', kind: 'wash', d: 'M-60 50 C 200 25 440 80 860 40', width: 150, color: a.bg },
    { id: 'g2', kind: 'wash', d: 'M860 160 C 580 130 300 195 -60 155', width: 150, color: a.bg2 },
    { id: 'g3', kind: 'wash', d: 'M-60 275 C 260 250 530 310 860 270', width: 150, color: a.bg },
    { id: 'g4', kind: 'wash', d: 'M860 385 C 560 360 260 405 -60 380', width: 140, color: a.bg2 },
    {
      id: 'moon',
      kind: 'reveal',
      d: spiral(650, 90, 54),
      width: 30,
      shape: circle(650, 90, 54),
      fill: { grad: [a.gold, '#F3D58A', a.gold], x1: 596, y1: 36, x2: 704, y2: 144 },
      weight: 1.1,
    },
    {
      id: 'pad1',
      kind: 'reveal',
      texture: false,
      d: zigzag(10, 360, 300, 420, 3),
      width: 62,
      shape: ellipse(185, 362, 180, 62, -6, true),
      fill: { grad: [a.pad, a.padLight, a.pad], x1: 10, y1: 300, x2: 360, y2: 420 },
    },
    {
      id: 'pad2',
      kind: 'reveal',
      texture: false,
      d: zigzag(790, 450, 310, 420, 3),
      width: 62,
      shape: ellipse(625, 368, 170, 58, 7, true),
      fill: { grad: [a.padLight, a.pad, a.pad], x1: 790, y1: 310, x2: 450, y2: 420 },
    },
    ...petals,
    {
      id: 'pod',
      kind: 'reveal',
      d: 'M362 296 L438 296',
      width: 46,
      shape: 'M360 298 C 362 278 438 278 440 298 C 430 312 370 312 360 298 Z',
      fill: { grad: [a.gold, '#F1CF7E', a.gold], x1: 360, y1: 280, x2: 440, y2: 312 },
      weight: 0.6,
    },
    ...deco,
    { id: 'ring', kind: 'line', d: ring(650, 90, 66), width: 2.4, color: a.gold, weight: 0.5 },
  ];
  const seeds: Dot[] = Array.from({ length: 7 }, (_, i) => ({ x: 372 + i * 9.5, y: 292 + (i % 2) * 6, r: 3.6, color: '#7A4E1E', delay: i * 2 }));
  return [marks, [...seeds, ...flecks(11, 48, a.gold)]];
};

/* ================================================================== */
/* 5 · DECO SUNRISE — for the Saffron Living                            */
/* a triad: saffron wall, indigo + coral bands, sky between             */
/* ================================================================== */
const deco = (a: Record<string, string>): [Mark[], Dot[]] => {
  const cx = 400;
  const cy = 412;
  const bands: { ro: number; ri: number; c: [string, string, string] }[] = [
    { ro: 368, ri: 300, c: [a.indigo, '#34428A', a.indigo] },
    { ro: 300, ri: 236, c: [a.sky, '#63A6E8', a.sky] },
    { ro: 236, ri: 176, c: [a.coral, '#F08463', a.coral] },
    { ro: 176, ri: 120, c: [a.gold, '#DCC294', a.gold] },
    { ro: 120, ri: 0, c: [a.cream, '#FFFFFF', a.cream] },
  ];
  const bandMarks: Mark[] = bands.map((b, i) => {
    const rm = b.ri <= 0 ? b.ro * 0.55 : (b.ro + b.ri) / 2;
    const w = b.ri <= 0 ? b.ro * 1.15 : b.ro - b.ri + 18;
    return {
      id: `band${i}`,
      kind: 'reveal',
      texture: i === 4 ? false : true,
      d: i % 2 === 0 ? arc(cx, cy + 2, rm) : `M${cx + rm} ${cy + 2} A${rm} ${rm} 0 0 0 ${cx - rm} ${cy + 2}`,
      width: w,
      shape: halfBand(cx, cy, b.ro, b.ri),
      fill: { grad: b.c, x1: cx - b.ro, y1: cy - b.ro, x2: cx + b.ro, y2: cy },
      weight: 1.2,
    };
  });
  const rays: Mark[] = Array.from({ length: 9 }, (_, i) => {
    const t = ((200 + i * 17.5) * Math.PI) / 180;
    const x0 = cx + Math.cos(t) * 24;
    const y0 = cy + Math.sin(t) * 24;
    const x1 = cx + Math.cos(t) * 112;
    const y1 = cy + Math.sin(t) * 112;
    return { id: `ray${i}`, kind: 'line', d: `M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}`, width: 3, color: a.gold, weight: 0.25 };
  });
  const seams: Mark[] = [300, 236, 176, 120].map((r, i) => ({ id: `seam${i}`, kind: 'line', d: arc(cx, cy, r), width: 2.6, color: a.gold, weight: 0.4 }));
  const corner = (id: string, x: number, flip: number): Mark => ({
    id,
    kind: 'reveal',
    d: `M${x} 10 L${x + flip * 90} 10 M${x} 60 L${x + flip * 60} 60`,
    width: 50,
    shape: `M${x} 0 L${x + flip * 110} 0 A110 110 0 0 ${flip > 0 ? 1 : 0} ${x} 110 Z`,
    fill: { grad: [a.coral, '#F08463', a.coral], x1: x, y1: 0, x2: x + flip * 110, y2: 110 },
    texture: false,
    weight: 0.6,
  });
  const marks: Mark[] = [
    { id: 'g1', kind: 'wash', d: 'M-60 45 C 220 25 520 70 860 40', width: 150, color: a.bg },
    { id: 'g2', kind: 'wash', d: 'M860 155 C 560 130 280 180 -60 150', width: 150, color: a.bg2 },
    { id: 'g3', kind: 'wash', d: 'M-60 270 C 260 250 540 300 860 262', width: 150, color: a.bg },
    { id: 'g4', kind: 'wash', d: 'M860 380 C 560 360 260 400 -60 378', width: 120, color: a.bg2 },
    ...bandMarks,
    corner('cl', 0, 1),
    corner('cr', 800, -1),
    ...seams,
    ...rays,
    { id: 'horizon', kind: 'line', d: 'M20 400 L780 400', width: 3, color: a.indigo, weight: 0.5 },
  ];
  const stars: Dot[] = [
    { x: 120, y: 190, r: 5, color: a.gold, delay: 0 },
    { x: 680, y: 190, r: 5, color: a.gold, delay: 4 },
    { x: 96, y: 300, r: 3.5, color: a.indigo, delay: 8 },
    { x: 704, y: 300, r: 3.5, color: a.indigo, delay: 12 },
  ];
  return [marks, [...stars, ...flecks(5, 30, a.gold, { x: 20, y: 120, w: 760, h: 260 })]];
};

const BUILDERS = [hills, tide, monstera, lotus, deco];

/** All five paintings, scheduled on the global timeline. */
export const PAINTINGS: Painting[] = ROOMS.map((r, i) => {
  const [marks, dots] = BUILDERS[i](r.art);
  const s = roomStart(i);
  return schedule(marks, dots, s + T.paint[0], s + T.paint[1] - 40);
});
