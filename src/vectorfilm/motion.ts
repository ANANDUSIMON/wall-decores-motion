import { interpolate, spring, type EasingFunction } from 'remotion';
import { ease, FPS, PALETTES, T, type Role } from './theme';

/** Eased 0→1 over [start, start+dur], clamped. */
export const prog = (frame: number, start: number, dur: number, easing: EasingFunction = ease.type): number =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** 1 while inside [inAt, outAt], with eased fades at both ends. */
export const hold = (frame: number, inAt: number, outAt: number, fade = 18): number =>
  Math.min(prog(frame, inAt, fade), 1 - prog(frame, outAt - fade, fade, ease.exit));

/** Springy pop 0→1 (slight overshoot) starting at `start`. */
export const pop = (frame: number, start: number, damping = 13): number =>
  spring({ frame: frame - start, fps: FPS, config: { damping, stiffness: 140, mass: 0.9 } });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const hexToRgb = (hex: string) => {
  const c = hex.replace('#', '');
  return { r: parseInt(c.slice(0, 2), 16), g: parseInt(c.slice(2, 4), 16), b: parseInt(c.slice(4, 6), 16) };
};

export const lerpHex = (from: string, to: string, t: number): string => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const k = Math.min(1, Math.max(0, t));
  const ch = (x: number, y: number) => Math.round(x + (y - x) * k).toString(16).padStart(2, '0');
  return `#${ch(a.r, b.r)}${ch(a.g, b.g)}${ch(a.b, b.b)}`;
};

/** Small deterministic PRNG so every render is identical. */
export const seeded = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

/**
 * Active palette state at a frame: which palette we're coming from, going
 * to, and how far through the cross-blend we are.
 */
export const paletteState = (frame: number) => {
  let from = 0;
  let to = 0;
  let t = 0;
  for (const swap of T.paletteSwaps) {
    if (frame >= swap.at + T.paletteSwapDur) {
      from = swap.to;
      to = swap.to;
      t = 0;
    } else if (frame >= swap.at) {
      to = swap.to;
      t = prog(frame, swap.at, T.paletteSwapDur, ease.inOut);
      break;
    } else {
      break;
    }
  }
  return { from, to, t };
};

/** Colour for a paint role at this frame (blends during palette swaps). */
export const roleColor = (frame: number, role: Role): string => {
  const { from, to, t } = paletteState(frame);
  return lerpHex(PALETTES[from].roles[role], PALETTES[to].roles[role], t);
};

/** Index of the palette that is "current" for labels (switches mid-blend). */
export const currentPaletteIndex = (frame: number): number => {
  const { from, to, t } = paletteState(frame);
  return t < 0.5 ? from : to;
};
