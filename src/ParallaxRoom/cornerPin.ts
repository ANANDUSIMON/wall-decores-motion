import { PerspectiveCorners } from './types';

// Standard 4-point corner-pin: solve the 3x3 projective transform that maps
// a rectangle's four corners onto arbitrary target points, then embed it in
// a CSS matrix3d. The pixel offsets in placement.json are nudges applied to
// each corner of the (width x height) rectangle, in that rectangle's own
// local coordinate space (top-left origin).

type Mat3 = number[]; // row-major, 9 values

const adj = (m: Mat3): Mat3 => [
  m[4] * m[8] - m[5] * m[7],
  m[2] * m[7] - m[1] * m[8],
  m[1] * m[5] - m[2] * m[4],
  m[5] * m[6] - m[3] * m[8],
  m[0] * m[8] - m[2] * m[6],
  m[2] * m[3] - m[0] * m[5],
  m[3] * m[7] - m[4] * m[6],
  m[1] * m[6] - m[0] * m[7],
  m[0] * m[4] - m[1] * m[3],
];

const multmm = (a: Mat3, b: Mat3): Mat3 => {
  const c = new Array(9).fill(0);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) sum += a[i * 3 + k] * b[k * 3 + j];
      c[i * 3 + j] = sum;
    }
  }
  return c;
};

const multmv = (m: Mat3, v: number[]): number[] => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
];

const basisToPoints = (
  x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number,
): Mat3 => {
  const m: Mat3 = [x1, x2, x3, y1, y2, y3, 1, 1, 1];
  const v = multmv(adj(m), [x4, y4, 1]);
  return multmm(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
};

const general2DProjection = (
  x1s: number, y1s: number, x2s: number, y2s: number, x3s: number, y3s: number, x4s: number, y4s: number,
  x1d: number, y1d: number, x2d: number, y2d: number, x3d: number, y3d: number, x4d: number, y4d: number,
): Mat3 => {
  const s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
  const d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
  return multmm(d, adj(s));
};

/**
 * Returns a CSS `matrix3d(...)` string that warps a `width x height`
 * rectangle (top-left origin) so its four corners land on
 * `corners.{topLeft,topRight,bottomLeft,bottomRight}` offsets from their
 * un-warped positions. Falls back to `none` if the solve degenerates.
 */
export const cornerPinMatrix3d = (width: number, height: number, corners: PerspectiveCorners): string => {
  const [tlx, tly] = corners.topLeft;
  const [trx, trY] = corners.topRight;
  const [blx, bly] = corners.bottomLeft;
  const [brx, bry] = corners.bottomRight;

  const h = general2DProjection(
    0, 0, width, 0, 0, height, width, height,
    tlx, tly, width + trx, trY, blx, height + bly, width + brx, height + bry,
  );

  const w = h[8];
  if (!Number.isFinite(w) || Math.abs(w) < 1e-9) return 'none';
  for (let i = 0; i < 9; i++) h[i] /= w;

  // Embed the 3x3 planar homography into a 4x4 matrix3d, column-major,
  // leaving z untouched.
  return [
    'matrix3d(',
    [h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, h[8]].join(', '),
    ')',
  ].join('');
};
