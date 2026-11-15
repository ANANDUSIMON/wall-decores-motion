import { Easing } from 'remotion';
import { interFontFamily, instrumentSerifFontFamily, jetBrainsMonoFontFamily } from '../fonts';

/**
 * VectorShowcase — 60s · 60fps · 1920x1080 · silent.
 *
 * Built on the VectorFilm language (one-point-perspective room drawn line by
 * line, a visible brush laying the painting down stroke by stroke) and pushed
 * further: one room re-dressed five times. A paint roller re-colours the
 * walls, the soft furnishings re-tint, the old canvas is gessoed over and a
 * new subject is painted in colours composed against the new wall.
 */
export const FPS = 60;
export const W = 1920;
export const H = 1080;
export const TOTAL = 3600;

/* ------------------------------------------------------------------ */
/* Layout — room window on the left, editorial column on the right.    */
/* ------------------------------------------------------------------ */
export const LAYOUT = {
  hud: 46,
  viewport: { x: 112, y: 120, size: 840 },
  panel: { x: 1048, w: 760 },
} as const;

/* Type scale for 1080p landscape. Nothing on screen is smaller than 18px. */
export const TYPE = {
  hero: 96, // Inter 800 — headline bold line
  heroItalic: 104, // Instrument Serif italic — optically matched accent line
  subject: 54, // serif italic — painting title
  title: 80,
  kicker: 22, // mono, tracked
  label: 18, // mono — swatch labels
  body: 36,
  hud: 20,
  wordmark: 168,
} as const;

export const INK = '#17120D';
export const CREAM = '#F3EFE9';
export const PAPER = '#FBF8F2';
export const HAIRLINE = 'rgba(23,18,13,0.22)';

/** Brand palette from CLAUDE.md. */
export const BRAND = {
  gold: '#C8A870',
  emerald: '#1D9E75',
  orange: '#D85A30',
  cream: '#E8DFD0',
  rose: '#D4537E',
  sky: '#378ADD',
  name: 'WALL DECORES',
  tagline: 'Artisan · Collectives',
  web: 'WALLDECORES.COM',
  ig: '@WALL_DECORES_ARTISAN',
  phone: '+91 90377 90012',
} as const;

/* Fixed room materials (never re-tinted). */
export const MAT = {
  floor: '#A2643B',
  floorLine: '#83502D',
  walnut: '#6B4226',
  walnutLight: '#8B5A36',
  leaf: '#2F6B3A',
  leafLight: '#4C8A50',
  vase: '#FBF9F6',
  brass: '#B8873B',
  glow: '#FFEFC9',
  sky: '#DCE9EC',
} as const;

/* ------------------------------------------------------------------ */
/* Room palettes — the colour composition.                              */
/* Each room: what the walls/furnishings wear, and the five colours the */
/* painting is mixed from. Pillows + rug echo the painting so the room  */
/* and the art read as one composition.                                 */
/* ------------------------------------------------------------------ */
export type Dress = {
  wall: string;
  wallSide: string;
  ceiling: string;
  trim: string;
  curtain: string;
  sofa: string;
  sofaShade: string;
  pillow: string;
  rug: string;
};

export type Swatch = { label: string; hex: string };

export type RoomDef = Dress & {
  id: number;
  name: [string, string];
  fullName: string;
  subject: string;
  harmony: string;
  note: string;
  /** painting colours (used by paintings.ts) */
  art: Record<string, string>;
  swatches: [Swatch, Swatch, Swatch, Swatch, Swatch];
};

export const NEUTRAL: Dress = {
  wall: '#EDE6DC',
  wallSide: '#E2D9CC',
  ceiling: '#F7F3ED',
  trim: '#8B5A36',
  curtain: '#CDBDA6',
  sofa: '#D8CAB6',
  sofaShade: '#BFAF98',
  pillow: '#C9963F',
  rug: '#E6D8C3',
};

export const ROOMS: RoomDef[] = [
  {
    id: 1,
    name: ['Terracotta', 'lounge.'],
    fullName: 'Terracotta Lounge',
    subject: 'Golden Hour Hills',
    harmony: 'COMPLEMENTARY',
    note: 'Burnt-orange walls, emerald hills.',
    wall: '#D85A30',
    wallSide: '#B9481F',
    ceiling: '#F6E3D6',
    trim: '#7A3A1C',
    curtain: '#F2C9A8',
    sofa: '#F3E6D3',
    sofaShade: '#DCC9AE',
    pillow: '#1D9E75',
    rug: '#F2B544',
    art: {
      sky1: '#F2B544',
      sky2: '#F7D27A',
      sun: '#FFF1C7',
      hillFar: '#7CCBA9',
      hillMid: '#1D9E75',
      hillNear: '#0B5A45',
      ink: '#5A2E14',
    },
    swatches: [
      { label: 'WALL', hex: '#D85A30' },
      { label: 'RUG', hex: '#F2B544' },
      { label: 'HILLS', hex: '#1D9E75' },
      { label: 'SHADOW', hex: '#0B5A45' },
      { label: 'SUN', hex: '#FFF1C7' },
    ],
  },
  {
    id: 2,
    name: ['Ocean', 'study.'],
    fullName: 'Ocean Study',
    subject: 'Tide & Coral Sun',
    harmony: 'SPLIT-COMPLEMENTARY',
    note: 'Sky-blue walls, a coral sun.',
    wall: '#378ADD',
    wallSide: '#2A6FB8',
    ceiling: '#E3EEF9',
    trim: '#1E3F66',
    curtain: '#CFE3F5',
    sofa: '#F4EEE4',
    sofaShade: '#DDD3C3',
    pillow: '#F07A5A',
    rug: '#5FC4E0',
    art: {
      deep: '#10294F',
      mid: '#1F4F8A',
      wave: '#5FC4E0',
      foam: '#F6F1E6',
      sun: '#F07A5A',
      gold: '#E8B44C',
    },
    swatches: [
      { label: 'WALL', hex: '#378ADD' },
      { label: 'RUG', hex: '#5FC4E0' },
      { label: 'NIGHT', hex: '#10294F' },
      { label: 'SUN', hex: '#F07A5A' },
      { label: 'FOAM', hex: '#F6F1E6' },
    ],
  },
  {
    id: 3,
    name: ['Emerald', 'library.'],
    fullName: 'Emerald Library',
    subject: 'Monstera Arch',
    harmony: 'COMPLEMENTARY',
    note: 'Emerald walls, a rose-pink arch.',
    wall: '#1D9E75',
    wallSide: '#157A5A',
    ceiling: '#E2F2EA',
    trim: '#0D4A37',
    curtain: '#CDEBDD',
    sofa: '#F5E9DC',
    sofaShade: '#DDCDB9',
    pillow: '#D4537E',
    rug: '#F6C9B8',
    art: {
      bg: '#F6C9B8',
      bg2: '#FBE0D4',
      arch: '#D4537E',
      leaf1: '#0F6B4E',
      leaf2: '#2FA77A',
      leaf3: '#7FD1A8',
      gold: '#C8A870',
    },
    swatches: [
      { label: 'WALL', hex: '#1D9E75' },
      { label: 'RUG', hex: '#F6C9B8' },
      { label: 'ARCH', hex: '#D4537E' },
      { label: 'LEAF', hex: '#2FA77A' },
      { label: 'GOLD', hex: '#C8A870' },
    ],
  },
  {
    id: 4,
    name: ['Rose', 'salon.'],
    fullName: 'Rose Salon',
    subject: 'Lotus Bloom',
    harmony: 'ANALOGOUS + ACCENT',
    note: 'Rose walls, plum ground, emerald pads.',
    wall: '#D4537E',
    wallSide: '#B23F67',
    ceiling: '#F8E2EA',
    trim: '#6A2341',
    curtain: '#F6CBD9',
    sofa: '#FBF1EA',
    sofaShade: '#E6D3C8',
    pillow: '#1D9E75',
    rug: '#E9B949',
    art: {
      bg: '#4A1838',
      bg2: '#6E2550',
      petalLo: '#FFF3EA',
      petalMid: '#F7B6C8',
      petalTip: '#E35D8A',
      pad: '#1D9E75',
      padLight: '#6FCFA5',
      gold: '#E9B949',
    },
    swatches: [
      { label: 'WALL', hex: '#D4537E' },
      { label: 'RUG', hex: '#E9B949' },
      { label: 'PLUM', hex: '#4A1838' },
      { label: 'PETAL', hex: '#F7B6C8' },
      { label: 'PAD', hex: '#1D9E75' },
    ],
  },
  {
    id: 5,
    name: ['Saffron', 'living.'],
    fullName: 'Saffron Living',
    subject: 'Deco Sunrise',
    harmony: 'TRIADIC',
    note: 'Saffron, indigo and coral.',
    wall: '#E9A630',
    wallSide: '#C98918',
    ceiling: '#FBEBC8',
    trim: '#5A3A12',
    curtain: '#F7DDA0',
    sofa: '#F6EEE2',
    sofaShade: '#DED2BF',
    pillow: '#23306B',
    rug: '#378ADD',
    art: {
      bg: '#F5EBDD',
      bg2: '#EFE1CC',
      indigo: '#23306B',
      sky: '#378ADD',
      coral: '#E8603C',
      gold: '#C8A870',
      cream: '#FFF7EA',
    },
    swatches: [
      { label: 'WALL', hex: '#E9A630' },
      { label: 'RUG', hex: '#378ADD' },
      { label: 'INDIGO', hex: '#23306B' },
      { label: 'CORAL', hex: '#E8603C' },
      { label: 'GROUND', hex: '#F5EBDD' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Timeline (global frames).                                            */
/* ------------------------------------------------------------------ */
export const T = {
  open: [0, 300] as const,
  build: [300, 480] as const,
  roomsStart: 480,
  roomLen: 432,
  compose: [2640, 3120] as const,
  contact: [3120, 3600] as const,

  // BUILD beats
  viewportIn: 300,
  lines: 312,
  fill: 372,
  furniture: 392,
  lamps: 430,
  canvasDash: 400,
  canvasPrime: 448,

  // Per-room local beats (frames from the room's start)
  prime: [0, 56] as const, // gesso covers the old painting
  roll: [8, 72] as const, // paint roller re-colours the back wall
  tint: [24, 64] as const, // soft furnishings re-tint
  paint: [84, 330] as const, // brush window
  zoomIn: [70, 54] as const, // [start, dur]
  zoomOut: [352, 60] as const,
  lightOn: 334,
} as const;

export const roomStart = (i: number) => T.roomsStart + i * T.roomLen;

export type SectionId = 'OPEN' | 'BUILD' | 'ROOM 01' | 'ROOM 02' | 'ROOM 03' | 'ROOM 04' | 'ROOM 05' | 'COMPOSE' | 'CONTACT';
export const SECTIONS: { id: SectionId; from: number; to: number }[] = [
  { id: 'OPEN', from: T.open[0], to: T.open[1] },
  { id: 'BUILD', from: T.build[0], to: T.build[1] },
  ...ROOMS.map((_, i) => ({ id: `ROOM 0${i + 1}` as SectionId, from: roomStart(i), to: roomStart(i) + T.roomLen })),
  { id: 'COMPOSE', from: T.compose[0], to: T.compose[1] },
  { id: 'CONTACT', from: T.contact[0], to: T.contact[1] },
];

export const ease = {
  type: Easing.bezier(0.22, 1, 0.36, 1), // brand default
  heavy: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  exit: Easing.bezier(0.7, 0, 0.84, 0),
  paint: Easing.bezier(0.33, 0, 0.25, 1),
};

export const fonts = {
  sans: interFontFamily,
  serif: instrumentSerifFontFamily,
  mono: jetBrainsMonoFontFamily,
};
