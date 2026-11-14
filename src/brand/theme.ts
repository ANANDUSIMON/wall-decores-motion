import { Easing } from 'remotion';

/**
 * Colour system for the 50s vertical brand film, straight from
 * public/data/palettes.json ("Peaceful Vibrant Canvas Painting Colour
 * Composition Specification"). Each palette's 5 colours are kept in the
 * spec's own dominant -> highlight order, which doubles as swatch order.
 */
export type Palette = {
  id: string;
  name: string;
  colors: [string, string, string, string, string];
  /** canvas-area percent per colour, same order as `colors` */
  area: [number, number, number, number, number];
};

export const PAL = {
  // P01 Celestial Coral — "Luminous, peaceful, expressive".
  celestialCoral: {
    id: 'P01',
    name: 'Celestial Coral',
    colors: ['#F4B89B', '#F17F70', '#178D9B', '#83AFC0', '#F7E0C9'],
    area: [30, 25, 20, 15, 10],
  } as Palette,
  // P02 Lotus Lagoon — "Fresh, restful, botanical".
  lotusLagoon: {
    id: 'P02',
    name: 'Lotus Lagoon',
    colors: ['#F49AA8', '#F8C8B6', '#35A99C', '#87C7B7', '#F5E5C9'],
    area: [25, 25, 25, 15, 10],
  } as Palette,
  // P12 Coral & Jade — "Vibrant, refined, restful".
  coralJade: {
    id: 'P12',
    name: 'Coral & Jade',
    colors: ['#F07973', '#F6B9A5', '#2C9B8E', '#A1D0B9', '#F4E1C5'],
    area: [25, 25, 20, 20, 10],
  } as Palette,
} as const;

/**
 * Interior tones the paintings actually hang against — plaster, walnut,
 * cream upholstery, olive cushion, brass, wood floor. These never compete
 * with a painting palette; they frame it.
 */
export const INTERIOR = {
  plaster: '#E9E0D2',
  walnut: '#6B4A2F',
  cream: '#EDE7DB',
  olive: '#6E7B3F',
  brass: '#C9A24B',
  woodFloor: '#8B5A2B',
} as const;

/**
 * The deep value share (5-10% of the spec's area ratio) is a warm ink, never
 * neutral black — a true black on a coral/plaster ground reads as a hole
 * punched in the picture rather than a shadow.
 */
export const INK = {
  warm: '#3A2A1C',
  soft: '#6B4A2F',
};

export const CREAM = '#FBF3E4';

export const VEASE = {
  cinematic: Easing.bezier(0.16, 1, 0.3, 1),
  entrance: Easing.bezier(0.22, 1, 0.36, 1),
  inOut: Easing.bezier(0.42, 0, 0.58, 1),
};

export const FONT_STACK = '"Helvetica Neue", Helvetica, "Inter", "Segoe UI", Arial, sans-serif';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** text/caption safe margin, survives the Instagram crop */
export const SAFE = 120;

/** Interiors are 1536x1024; scaled to fill 1920 tall they run 2880 wide. */
export const ROOM_W = 2880;
export const ROOM_H = 1920;

/** Standalone painting stills are 1254x1254. */
export const PAINT_SRC = 1254;
