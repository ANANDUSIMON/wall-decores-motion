import { interpolate, type EasingFunction } from 'remotion';
import { ease } from './theme';

/** Progress 0→1 over [delay, delay+duration], eased, clamped both ends. */
export const progressIn = (
  frame: number,
  delay: number,
  duration: number,
  easing: EasingFunction = ease.type,
): number =>
  interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Fade + upward drift — the house word/line entrance. */
export const riseIn = (
  frame: number,
  delay: number,
  duration = 14,
  travelPx = 14,
): { opacity: number; translateY: number } => {
  const t = progressIn(frame, delay, duration);
  return { opacity: t, translateY: (1 - t) * travelPx };
};

/** Linear hex interpolation — the 10-frame background crossfade at section
 * boundaries. Flat colours only, so a plain channel lerp is enough. */
export const lerpHex = (from: string, to: string, t: number): string => {
  const clamp = Math.min(1, Math.max(0, t));
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const r = Math.round(a.r + (b.r - a.r) * clamp);
  const g = Math.round(a.g + (b.g - a.g) * clamp);
  const bch = Math.round(a.b + (b.b - a.b) * clamp);
  return `rgb(${r}, ${g}, ${bch})`;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return { r, g, b };
};
