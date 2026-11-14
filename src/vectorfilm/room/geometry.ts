/**
 * Room geometry in a 1000 x 1000 unit space, one-point perspective.
 *
 *   vanishing point VP = (500, 400)
 *   depth k = 1 at the front of the box, 0.6 at the back wall
 *
 * Every receding edge passes through VP, so the room reads as a real space
 * rather than a flat diagram.
 */
export const VP = { x: 500, y: 400 };
export const BACK = 0.6;

/** Floor plane point: lateral u (-500..500), depth k. */
export const floorPt = (u: number, k: number) => ({ x: VP.x + u * k, y: VP.y + 600 * k });
/** Ceiling plane point. */
export const ceilPt = (u: number, k: number) => ({ x: VP.x + u * k, y: VP.y - 400 * k });
/** Left wall point: vertical v (-400 ceiling .. 600 floor), depth k. */
export const leftPt = (v: number, k: number) => ({ x: VP.x - 500 * k, y: VP.y + v * k });
/** Right wall point. */
export const rightPt = (v: number, k: number) => ({ x: VP.x + 500 * k, y: VP.y + v * k });

type P = { x: number; y: number };
export const poly = (pts: P[]) => `M${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')} Z`;
export const line = (a: P, b: P) => `M${a.x.toFixed(1)} ${a.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}`;

/* Back wall rectangle */
export const BW = { x0: 200, y0: 160, x1: 800, y1: 760 };

/* Planes */
export const PLANES = {
  ceiling: poly([{ x: 0, y: 0 }, { x: 1000, y: 0 }, { x: BW.x1, y: BW.y0 }, { x: BW.x0, y: BW.y0 }]),
  floor: poly([{ x: 0, y: 1000 }, { x: 1000, y: 1000 }, { x: BW.x1, y: BW.y1 }, { x: BW.x0, y: BW.y1 }]),
  left: poly([{ x: 0, y: 0 }, { x: BW.x0, y: BW.y0 }, { x: BW.x0, y: BW.y1 }, { x: 0, y: 1000 }]),
  right: poly([{ x: 1000, y: 0 }, { x: BW.x1, y: BW.y0 }, { x: BW.x1, y: BW.y1 }, { x: 1000, y: 1000 }]),
  back: poly([
    { x: BW.x0, y: BW.y0 },
    { x: BW.x1, y: BW.y0 },
    { x: BW.x1, y: BW.y1 },
    { x: BW.x0, y: BW.y1 },
  ]),
};

/* Structural line drawing, in draw order. */
export const STRUCTURE_LINES: string[] = [
  `M${BW.x0} ${BW.y0} H${BW.x1} V${BW.y1} H${BW.x0} Z`,
  line({ x: 0, y: 0 }, { x: BW.x0, y: BW.y0 }),
  line({ x: 1000, y: 0 }, { x: BW.x1, y: BW.y0 }),
  line({ x: 0, y: 1000 }, { x: BW.x0, y: BW.y1 }),
  line({ x: 1000, y: 1000 }, { x: BW.x1, y: BW.y1 }),
];

/* Floor boards converge on VP. */
export const FLOOR_BOARDS: string[] = [100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) =>
  line({ x, y: 1000 }, { x: VP.x + (x - VP.x) * BACK, y: BW.y1 }),
);
export const FLOOR_SEAMS: string[] = [0.72, 0.84, 0.94].map((k) => line(floorPt(-500, k), floorPt(500, k)));

/* Recessed cove light on the ceiling. */
export const COVE = poly([ceilPt(-380, 0.68), ceilPt(380, 0.68), ceilPt(380, 0.92), ceilPt(-380, 0.92)]);

/* Window on the left wall + curtains either side. */
export const WINDOW = poly([leftPt(-250, 0.9), leftPt(-250, 0.68), leftPt(260, 0.68), leftPt(260, 0.9)]);
export const WINDOW_MULLIONS: string[] = [
  line(leftPt(-250, 0.79), leftPt(260, 0.79)),
  line(leftPt(-60, 0.9), leftPt(-60, 0.68)),
];
export const CURTAINS: string[] = [
  poly([leftPt(-330, 0.97), leftPt(-330, 0.9), leftPt(560, 0.9), leftPt(560, 0.97)]),
  poly([leftPt(-330, 0.68), leftPt(-330, 0.635), leftPt(560, 0.635), leftPt(560, 0.68)]),
];
export const CURTAIN_FOLDS: string[] = [0.915, 0.935, 0.955, 0.645, 0.66].map((k) =>
  line(leftPt(-330, k), leftPt(560, k)),
);

/* Walnut slat panel on the right wall. */
export const SLAT_PANEL = poly([rightPt(-400, 0.66), rightPt(-400, 0.88), rightPt(600, 0.88), rightPt(600, 0.66)]);
export const SLATS: { d: string; w: number }[] = Array.from({ length: 12 }, (_, i) => {
  const k = 0.665 + i * 0.019;
  return { d: line(rightPt(-400, k), rightPt(600, k)), w: 5 * k };
});

/* The painting's place on the back wall (2:1 — "180 x 90 cm"). */
export const CANVAS = { x: 300, y: 330, w: 400, h: 200 };
export const CANVAS_CENTER = { x: CANVAS.x + CANVAS.w / 2, y: CANVAS.y + CANVAS.h / 2 };
