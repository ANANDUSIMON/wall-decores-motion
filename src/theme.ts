import {Easing, interpolate} from 'remotion';

export const C = {nearBlack: '#0a0a0a', cream: '#e8dfd0', gold: '#c8a870', emerald: '#1d9e75', burntOrange: '#d85a30', rose: '#d4537e'} as const;
export const FONT = 'Arial, Helvetica, sans-serif';
export const GRID = {margin: 120, columns: 12, gutter: 24};
export const SHOTS = {Shot1: 75, Shot2: 105, Shot3: 120, Shot4: 105, Shot5: 105, Shot6: 90} as const;
export const TOTAL_FRAMES = Object.values(SHOTS).reduce((a, b) => a + b, 0);
export const entrance = Easing.bezier(0.16, 1, 0.3, 1);
export const exit = Easing.bezier(0.7, 0, 0.84, 0);
export const tween = (frame: number, start: number, end: number, from = 0, to = 1, ease = entrance) =>
  interpolate(frame, [start, end], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
export const type = {
  display: {fontFamily: FONT, fontWeight: 900, fontSize: 180, lineHeight: 0.85, letterSpacing: '-0.03em'},
  heading: {fontFamily: FONT, fontWeight: 800, fontSize: 64},
  body: {fontFamily: FONT, fontWeight: 500, fontSize: 24},
  kicker: {fontFamily: FONT, fontWeight: 600, fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase' as const},
};
