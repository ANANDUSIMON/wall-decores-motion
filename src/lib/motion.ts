/**
 * Motion utilities — velocity-driven motion blur and seeded randomness.
 *
 * Real motion blur, not a fake blur filter: we evaluate the animation's own
 * position function at sub-frame intervals and composite those samples.
 * This is what After Effects does when you enable motion blur on a layer.
 */

/** Deterministic PRNG so every render produces identical texture. */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Gaussian-ish value in [-1, 1] from a uniform generator. */
export const gaussian = (rnd: () => number) =>
  (rnd() + rnd() + rnd() - 1.5) / 1.5;

export type Sample = {
  /** sub-frame time */
  f: number;
  /** compositing opacity for this sample */
  opacity: number;
  /** 0 = current frame, 1 = oldest ghost */
  age: number;
};

/**
 * Shutter samples for motion blur.
 * `shutter` is the fraction of a frame the shutter stays open — 0.5 is the
 * film-standard 180° shutter, 1.0 is a full 360° shutter (heaviest smear).
 */
export const shutterSamples = (
  frame: number,
  count = 6,
  shutter = 0.75
): Sample[] => {
  if (count <= 1) return [{ f: frame, opacity: 1, age: 0 }];
  const out: Sample[] = [];
  // Weighted so the leading edge reads sharp and the trail falls away.
  let total = 0;
  const weights: number[] = [];
  for (let i = 0; i < count; i++) {
    const w = Math.pow(1 - i / count, 1.6);
    weights.push(w);
    total += w;
  }
  for (let i = 0; i < count; i++) {
    out.push({
      f: frame - (i / (count - 1)) * shutter,
      opacity: weights[i] / total,
      age: i / (count - 1),
    });
  }
  return out;
};

/**
 * Speed of a scalar animation at `frame`, in units per frame.
 * Used to gate motion blur: below ~8px/frame the eye sees no smear,
 * so we skip the extra samples and keep the render cheap.
 */
export const velocityOf = (
  fn: (f: number) => number,
  frame: number,
  h = 0.5
) => Math.abs(fn(frame + h) - fn(frame - h)) / (2 * h);

export const BLUR_THRESHOLD = 8;

/** Clamp helper. */
export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
