import { Easing } from 'remotion';
import { interFontFamily, instrumentSerifFontFamily, jetBrainsMonoFontFamily } from '../fonts';

/**
 * VectorFilm — 60s, 60fps, 1080x1920, silent.
 * Everything on screen is drawn as vector: the room is built line by line,
 * an empty canvas is measured onto the wall, and the painting is laid down
 * stroke by stroke with a visible brush. No photographs.
 */
export const FPS = 60;
export const W = 1080;
export const H = 1920;
export const TOTAL = 3600;

/* ------------------------------------------------------------------ */
/* Layout grid — every element snaps to these numbers.                 */
/* Text is always horizontally centred on the frame axis (x = 540).    */
/* ------------------------------------------------------------------ */
export const LAYOUT = {
  /** HUD rows: top text baseline zone and bottom text zone. */
  hudTop: 64,
  hudBottom: 64,
  hudSide: 64,
  /** Headline block is vertically centred on this y. */
  headlineCenterY: 395,
  /** The room "viewport" window. */
  viewport: { x: 60, y: 610, size: 960 },
  /** Caption / data block is vertically centred on this y. */
  captionCenterY: 1700,
} as const;

export const TYPE = {
  headline: 116, // Inter 800 — bold line
  headlineItalic: 128, // Instrument Serif italic — accent line (optically matched)
  wordmark: 118,
  captionBig: 60,
  caption: 34,
  hud: 24,
} as const;

export const COLORS = {
  cream: '#F3EFE9',
  paper: '#FBF8F2',
  ink: '#17120D',
  coral: '#F07973',
  jade: '#2C9B8E',
  gold: '#C9963F',
  hairline: 'rgba(23,18,13,0.22)',

  // Room
  wall: '#EDE6DC',
  wallSide: '#E2D9CC',
  ceiling: '#F7F3ED',
  floor: '#A2643B',
  floorLine: '#83502D',
  walnut: '#6B4226',
  walnutLight: '#8B5A36',
  sofa: '#D8CAB6',
  sofaShade: '#BFAF98',
  leaf: '#2F6B3A',
  leafLight: '#4C8A50',
  vase: '#FBF9F6',
  brass: '#B8873B',
  glow: '#FFEFC9',
  sky: '#DCE9EC',
  curtain: '#CDBDA6',
} as const;

/* ------------------------------------------------------------------ */
/* Palettes (from public/data/palettes.json) mapped onto paint roles.  */
/* ------------------------------------------------------------------ */
export type Role = 'fieldDeep' | 'field' | 'light' | 'body' | 'tip' | 'cream' | 'gold';
export type RolePalette = { id: string; name: string; swatches: string[]; roles: Record<Role, string> };

export const PALETTES: RolePalette[] = [
  {
    id: 'P12',
    name: 'CORAL & JADE',
    swatches: ['#F07973', '#F6B9A5', '#2C9B8E', '#A1D0B9', '#F4E1C5'],
    roles: {
      fieldDeep: '#1F6F67',
      field: '#2C9B8E',
      light: '#A1D0B9',
      body: '#F6B9A5',
      tip: '#F07973',
      cream: '#F4E1C5',
      gold: '#D9A441',
    },
  },
  {
    id: 'P04',
    name: 'PEACOCK DAWN',
    swatches: ['#0E8C9C', '#65C3BA', '#E6AD61', '#F1B8A6', '#F8E5CF'],
    roles: {
      fieldDeep: '#0A6470',
      field: '#0E8C9C',
      light: '#65C3BA',
      body: '#F1B8A6',
      tip: '#E6AD61',
      cream: '#F8E5CF',
      gold: '#E6AD61',
    },
  },
  {
    id: 'P07',
    name: 'ROSEWATER EMERALD',
    swatches: ['#EFA9B3', '#F5D5C6', '#278E7C', '#83C0A6', '#EACB86'],
    roles: {
      fieldDeep: '#1D6B5E',
      field: '#278E7C',
      light: '#83C0A6',
      body: '#F5D5C6',
      tip: '#EFA9B3',
      cream: '#FBF1E6',
      gold: '#EACB86',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Sections (global frames).                                           */
/* ------------------------------------------------------------------ */
export type SectionId = 'OPEN' | 'ROOM' | 'CANVAS' | 'PAINT' | 'COLOUR' | 'CONTACT';
export type Section = { id: SectionId; index: number; from: number; to: number };

export const SECTIONS: Section[] = [
  { id: 'OPEN', index: 1, from: 0, to: 360 },
  { id: 'ROOM', index: 2, from: 360, to: 960 },
  { id: 'CANVAS', index: 3, from: 960, to: 1320 },
  { id: 'PAINT', index: 4, from: 1320, to: 2340 },
  { id: 'COLOUR', index: 5, from: 2340, to: 3060 },
  { id: 'CONTACT', index: 6, from: 3060, to: 3600 },
];

/* Key beats used across layers — single source of truth for timing. */
export const T = {
  // ROOM
  viewportIn: 372,
  structureStart: 400,
  fillStart: 600,
  furnitureStart: 650,
  lampsStart: 840,
  // CANVAS
  canvasDash: 1000,
  canvasPrime: 1080,
  canvasFrame: 1110,
  dimensions: 1150,
  // PAINT
  zoomIn: [1330, 1430] as const,
  paintWindow: [1440, 2250] as const,
  zoomOut: [2262, 2340] as const,
  // COLOUR — palette index changes
  paletteSwaps: [
    { at: 2470, to: 1 },
    { at: 2710, to: 2 },
    { at: 2950, to: 0 },
  ],
  paletteSwapDur: 50,
  // CONTACT
  shrink: [3060, 3170] as const,
  wordmark: 3150,
  contacts: 3230,
} as const;

export const ease = {
  type: Easing.bezier(0.22, 1, 0.36, 1),
  heavy: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  exit: Easing.bezier(0.7, 0, 0.84, 0),
  paint: Easing.bezier(0.33, 0, 0.25, 1),
};

export const fonts = {
  headline: interFontFamily,
  italic: instrumentSerifFontFamily,
  mono: jetBrainsMonoFontFamily,
};
