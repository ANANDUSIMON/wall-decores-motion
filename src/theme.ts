import { Easing } from 'remotion';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/**
 * A gallery wall is never pure white. Pure #fff clips in camera, kills every
 * highlight the paintings have, and makes the whole thing feel like a slide
 * deck. These are the values a white wall actually photographs as: warm,
 * slightly grey, with a lift where the light lands and a fall into the
 * corners.
 */
export const palette = {
  wall: '#f3efe9',
  wallLift: '#fbf9f6',
  wallShade: '#e2dcd2',
  wallDeep: '#d3ccc0',

  /** Never pure black on white — it vibrates. Warm near-black instead. */
  ink: '#17120d',
  graphite: '#514a41',
  muted: '#8e857a',
  hairline: '#cdc5b8',

  /** A paler gold vanishes on white. This one holds. */
  gold: '#a37c37',
  goldSoft: '#c29a52',

  shadow: '#2a2118',
} as const;

export const ease = {
  /** Long tail — the move that makes things feel heavy and expensive. */
  cinematic: Easing.bezier(0.16, 1, 0.3, 1),
  /** Slightly firmer, for type. */
  entrance: Easing.bezier(0.22, 1, 0.36, 1),
  exit: Easing.bezier(0.7, 0, 0.84, 0),
  /** Near-linear with a soft start, for camera drift that should feel
   *  mechanical rather than animated. */
  drift: Easing.bezier(0.4, 0, 0.6, 1),
  linear: Easing.linear,
} as const;

export const FONT_STACK =
  '"Helvetica Neue", Helvetica, "Inter", "Segoe UI", Arial, sans-serif';

/**
 * On a light background type can carry less weight and more air than it can
 * on ink — 900 weight on white reads as shouting.
 */
export const type = {
  display: {
    fontSize: 172,
    fontWeight: 800,
    lineHeight: 0.86,
    letterSpacing: '-0.032em',
  },
  displaySm: {
    fontSize: 116,
    fontWeight: 800,
    lineHeight: 0.9,
    letterSpacing: '-0.028em',
  },
  heading: {
    fontSize: 58,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-0.012em',
  },
  body: { fontSize: 22, fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
  kicker: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.46em',
    textTransform: 'uppercase' as const,
  },
  annotation: {
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
  },
} as const;

export const grid = {
  width: WIDTH,
  height: HEIGHT,
  margin: 120,
  cols: 12,
  gutter: 24,
  get usable() {
    return WIDTH - this.margin * 2;
  },
  get colW() {
    return (this.usable - this.gutter * (this.cols - 1)) / this.cols;
  },
  col(n: number) {
    return this.margin + n * (this.colW + this.gutter);
  },
  span(n: number) {
    return n * this.colW + (n - 1) * this.gutter;
  },
} as const;
