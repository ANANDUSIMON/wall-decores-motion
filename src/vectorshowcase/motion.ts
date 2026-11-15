import { NEUTRAL, ROOMS, T, ease, roomStart, type Dress } from './theme';
import { prog, lerpHex } from '../vectorfilm/motion';

export { prog, hold, pop, lerp, lerpHex, seeded } from '../vectorfilm/motion';

/** Which room is on stage at frame f (-1 before the first room). */
export const roomIndexAt = (f: number) => {
  if (f < T.roomsStart) return -1;
  return Math.min(ROOMS.length - 1, Math.floor((f - T.roomsStart) / T.roomLen));
};

/** Frames since the current room began. */
export const localAt = (f: number) => {
  const i = roomIndexAt(f);
  return i < 0 ? f - T.roomsStart : f - roomStart(i);
};

const dressOf = (i: number): Dress => (i < 0 ? NEUTRAL : ROOMS[i]);

/**
 * The room's colours at frame f. `roll` drives the back wall (revealed by
 * the roller), `tint` everything soft. Before rooms start: neutral.
 */
export const dressAt = (f: number) => {
  const i = roomIndexAt(f);
  const l = localAt(f);
  const prev = dressOf(i - 1);
  const cur = dressOf(i);
  const roll = i < 0 ? 1 : prog(l, T.roll[0], T.roll[1] - T.roll[0], ease.inOut);
  const tint = i < 0 ? 1 : prog(l, T.tint[0], T.tint[1] - T.tint[0], ease.inOut);
  const mix = (k: keyof Dress, t: number) => lerpHex(prev[k], cur[k], t);
  return {
    i,
    l,
    roll,
    prevWall: prev.wall,
    wall: cur.wall,
    wallSide: mix('wallSide', roll),
    ceiling: mix('ceiling', roll),
    trim: mix('trim', tint),
    curtain: mix('curtain', tint),
    sofa: mix('sofa', tint),
    sofaShade: mix('sofaShade', tint),
    pillow: mix('pillow', tint),
    rug: mix('rug', tint),
  };
};

export const hexToHsl = (hex: string) => {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d > 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
};
