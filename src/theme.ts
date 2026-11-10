import { Easing } from 'remotion';

/**
 * Wall Decores Artisan Collectives — Film Design System
 * Vibrant premium: deep ink ground, saturated accents, generous negative space.
 * Vibrancy comes from saturation + bloom, never from colour count.
 * Rule: maximum TWO accent colours visible in any single shot.
 */

export const palette = {
  ink: '#0b0d0c',
  inkSoft: '#15191a',
  inkLift: '#1e2423',
  cream: '#f2ece0',
  creamDim: '#d9d1c2',
  gold: '#d4b26a',
  goldBright: '#eccf90',
  emerald: '#16b584',
  emeraldDeep: '#0d7a58',
  amber: '#e8622f',
  amberDeep: '#b4441c',
  rose: '#d4537e',
  teal: '#2a9d9b',
} as const;

export const ease = {
  /** explosive start, long luxurious settle — all entrances */
  entrance: Easing.bezier(0.16, 1, 0.3, 1),
  /** slow start, snap out — all exits */
  exit: Easing.bezier(0.7, 0, 0.84, 0),
  /** general cinematic move */
  cinematic: Easing.bezier(0.22, 1, 0.36, 1),
  /** weighted fall */
  drop: Easing.bezier(0.33, 1, 0.68, 1),
  /** linear, only for continuous sweeps */
  sweep: Easing.linear,
} as const;

export const type = {
  display: {
    fontSize: 184,
    fontWeight: 900,
    lineHeight: 0.84,
    letterSpacing: '-0.035em',
  },
  displaySm: {
    fontSize: 120,
    fontWeight: 900,
    lineHeight: 0.86,
    letterSpacing: '-0.03em',
  },
  heading: {
    fontSize: 64,
    fontWeight: 800,
    lineHeight: 1.0,
    letterSpacing: '-0.02em',
  },
  body: {
    fontSize: 24,
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0em',
  },
  kicker: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.42em',
    textTransform: 'uppercase' as const,
  },
  annotation: {
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
  },
} as const;

export const FONT_STACK =
  '"Helvetica Neue", Inter, "Archivo", system-ui, -apple-system, sans-serif';

/** 12-column grid, 120px side margins at 1920 */
export const grid = {
  width: 1920,
  height: 1080,
  margin: 120,
  columns: 12,
  get usable() {
    return this.width - this.margin * 2;
  },
  get gutter() {
    return 24;
  },
  /** left edge of column n (0-indexed) */
  col(n: number) {
    const colWidth = (this.usable - this.gutter * (this.columns - 1)) / this.columns;
    return this.margin + n * (colWidth + this.gutter);
  },
  /** width spanning n columns */
  span(n: number) {
    const colWidth = (this.usable - this.gutter * (this.columns - 1)) / this.columns;
    return colWidth * n + this.gutter * (n - 1);
  },
} as const;

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
