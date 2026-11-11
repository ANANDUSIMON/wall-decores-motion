/**
 * The motion-blur engine.
 *
 * A CSS blur filter is not motion blur — it smears in every direction at once
 * and makes things look out of focus. Real motion blur comes from the shutter
 * being open while the subject moves, so the frame holds a weighted average of
 * every position the subject passed through.
 *
 * That is what this does. Give it the function that produces an element's
 * position and it samples that function backwards through the shutter
 * interval, returning the sub-frame positions to composite. The smear then
 * follows the actual path of travel, including the curve.
 */

export type Sample = {
  /** sub-frame time to evaluate the animation at */
  f: number;
  /** normalised weight — the leading edge is strongest */
  opacity: number;
  /** 0 for the live frame, rising for each trailing ghost */
  age: number;
};

/** Deterministic PRNG. Same seed, same texture, every render, every machine. */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Roughly normal, mean 0, range about -1..1. Three uniforms is plenty. */
export const gaussian = (rnd: () => number) => (rnd() + rnd() + rnd() - 1.5) / 1.5;

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/**
 * Sub-frame sample times across one shutter opening.
 *
 * `shutter` is the fraction of the frame the shutter stays open — 0.5 is the
 * classic 180-degree cine shutter, higher values smear more. Weights fall off
 * on a curve rather than linearly, which keeps the leading edge solid instead
 * of turning the whole element translucent.
 */
export const shutterSamples = (
  frame: number,
  count = 6,
  shutter = 0.75
): Sample[] => {
  if (count <= 1) return [{ f: frame, opacity: 1, age: 0 }];
  const raw = Array.from({ length: count }, (_, i) => Math.pow(1 - i / count, 1.6));
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map((w, i) => ({
    f: frame - (i / (count - 1)) * shutter,
    opacity: w / total,
    age: i,
  }));
};

/** Speed of a scalar animation at `frame`, by central difference. */
export const velocityOf = (
  fn: (f: number) => number,
  frame: number,
  h = 0.5
): number => Math.abs(fn(frame + h) - fn(frame - h)) / (2 * h);

/**
 * Speed of a 2D animation at `frame`. Using the real vector magnitude rather
 * than the vertical component alone is what lets a canvas that is sliding and
 * settling smear along its true path instead of straight down.
 */
export const velocity2D = (
  fn: (f: number) => { x: number; y: number },
  frame: number,
  h = 0.5
): number => {
  const a = fn(frame - h);
  const b = fn(frame + h);
  return Math.hypot(b.x - a.x, b.y - a.y) / (2 * h);
};

/**
 * Below this many pixels per frame the eye cannot see a smear, so we skip the
 * extra samples entirely. Most elements in a shot are static most of the time;
 * this keeps the render cheap without costing anything visible.
 */
export const BLUR_THRESHOLD = 7;

/** How many sub-frame copies a given speed deserves. */
export const samplesFor = (velocity: number) =>
  velocity > BLUR_THRESHOLD ? Math.round(clamp(velocity / 13, 3, 11)) : 1;
