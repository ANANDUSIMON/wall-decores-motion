import { Easing } from 'remotion';

/**
 * ShowcaseFilm — 60s, 60fps, 1920×1080, silent.
 *
 * Five rooms, five paintings, five palettes — vibrant colour compositions
 * showing how Wall Decores matches art to interior.
 */
export const FPS = 60;
export const W = 1920;
export const H = 1080;
export const TOTAL = 3600; // 60s × 60fps

/* ------------------------------------------------------------------ */
/*  Sections                                                           */
/* ------------------------------------------------------------------ */
export type SectionId =
  | 'INTRO'
  | 'ROOM1'
  | 'ROOM2'
  | 'ROOM3'
  | 'ROOM4'
  | 'ROOM5'
  | 'PALETTE'
  | 'SIGNOFF';

export interface Section {
  id: SectionId;
  index: number;
  from: number;
  to: number;
}

export const SECTIONS: Section[] = [
  { id: 'INTRO',   index: 0, from: 0,    to: 360  },
  { id: 'ROOM1',   index: 1, from: 360,  to: 840  },
  { id: 'ROOM2',   index: 2, from: 840,  to: 1320 },
  { id: 'ROOM3',   index: 3, from: 1320, to: 1800 },
  { id: 'ROOM4',   index: 4, from: 1800, to: 2280 },
  { id: 'ROOM5',   index: 5, from: 2280, to: 2760 },
  { id: 'PALETTE', index: 6, from: 2760, to: 3180 },
  { id: 'SIGNOFF', index: 7, from: 3180, to: 3600 },
];

export const sec = (id: SectionId) => SECTIONS.find((s) => s.id === id)!;

/* ------------------------------------------------------------------ */
/*  5 Vibrant Room–Painting Colour Palettes                            */
/* ------------------------------------------------------------------ */
export interface RoomPalette {
  id: string;
  name: string;
  /** Room interior colours */
  room: {
    wall: string;
    wallAccent: string;
    floor: string;
    floorLine: string;
    furniture: string;
    furnitureShade: string;
    trim: string;
    accent: string;
  };
  /** Painting colours (abstract vector art) */
  painting: {
    bg: string;
    primary: string;
    secondary: string;
    accent: string;
    highlight: string;
  };
  /** 5 vibrant swatches for the palette bar */
  swatches: [string, string, string, string, string];
  /** Display label */
  label: string;
  /** Painting subject description */
  subject: string;
  /** Room style */
  style: string;
}

export const PALETTES: RoomPalette[] = [
  {
    id: 'warm-terracotta',
    name: 'WARM TERRACOTTA',
    room: {
      wall: '#F5E6D3',
      wallAccent: '#E8D5BE',
      floor: '#B8764F',
      floorLine: '#9A6240',
      furniture: '#DEC9A8',
      furnitureShade: '#C4AD8A',
      trim: '#C8A870',
      accent: '#D85A30',
    },
    painting: {
      bg: '#F5DEB3',
      primary: '#D85A30',
      secondary: '#E8A35E',
      accent: '#C8A870',
      highlight: '#FFF3E0',
    },
    swatches: ['#D85A30', '#E8A35E', '#F5DEB3', '#C8A870', '#8B4513'],
    label: 'Warm Terracotta',
    subject: 'Abstract Sunset',
    style: 'Modern Minimalist',
  },
  {
    id: 'ocean-blue',
    name: 'OCEAN BLUE',
    room: {
      wall: '#EDF3F5',
      wallAccent: '#DCE8ED',
      floor: '#C2A882',
      floorLine: '#A89070',
      furniture: '#E8E0D4',
      furnitureShade: '#D0C4B4',
      trim: '#B0C4D8',
      accent: '#378ADD',
    },
    painting: {
      bg: '#87CEEB',
      primary: '#2C6FAC',
      secondary: '#378ADD',
      accent: '#1D9E75',
      highlight: '#E0F4FF',
    },
    swatches: ['#378ADD', '#1D9E75', '#87CEEB', '#2C6FAC', '#E8DFD0'],
    label: 'Ocean Blue',
    subject: 'Seascape Waves',
    style: 'Coastal Living',
  },
  {
    id: 'emerald-garden',
    name: 'EMERALD GARDEN',
    room: {
      wall: '#F0EBE0',
      wallAccent: '#E2D9C8',
      floor: '#6B4226',
      floorLine: '#573618',
      furniture: '#4A3520',
      furnitureShade: '#3A2810',
      trim: '#C8A870',
      accent: '#1D9E75',
    },
    painting: {
      bg: '#E8F5E9',
      primary: '#1D9E75',
      secondary: '#2E8B57',
      accent: '#C8A870',
      highlight: '#F0E68C',
    },
    swatches: ['#1D9E75', '#2E8B57', '#C8A870', '#556B2F', '#F0E68C'],
    label: 'Emerald Garden',
    subject: 'Botanical Leaves',
    style: 'Bohemian Loft',
  },
  {
    id: 'rose-blush',
    name: 'ROSE BLUSH',
    room: {
      wall: '#FDF0F0',
      wallAccent: '#F5E2E2',
      floor: '#D4BC9A',
      floorLine: '#BCA480',
      furniture: '#F0E8DC',
      furnitureShade: '#E0D4C4',
      trim: '#E8C8C8',
      accent: '#D4537E',
    },
    painting: {
      bg: '#FFF0F5',
      primary: '#D4537E',
      secondary: '#FFB6C1',
      accent: '#FF69B4',
      highlight: '#FFF5F7',
    },
    swatches: ['#D4537E', '#FFB6C1', '#FFC0CB', '#FF69B4', '#F5E6E0'],
    label: 'Rose Blush',
    subject: 'Abstract Florals',
    style: 'Scandinavian Cozy',
  },
  {
    id: 'teal-coral',
    name: 'TEAL & CORAL',
    room: {
      wall: '#1A3C40',
      wallAccent: '#0F2B2E',
      floor: '#3D2B1F',
      floorLine: '#2E1F14',
      furniture: '#2A5A5E',
      furnitureShade: '#1E4448',
      trim: '#C8A870',
      accent: '#FF6F61',
    },
    painting: {
      bg: '#004D4D',
      primary: '#FF6F61',
      secondary: '#20B2AA',
      accent: '#C8A870',
      highlight: '#FFE8E5',
    },
    swatches: ['#008080', '#FF6F61', '#C8A870', '#20B2AA', '#D85A30'],
    label: 'Teal & Coral',
    subject: 'Geometric Art Deco',
    style: 'Art Deco Lounge',
  },
];

/* ------------------------------------------------------------------ */
/*  Easing                                                             */
/* ------------------------------------------------------------------ */
export const ease = {
  /** Long tail — heavy, expensive feel. */
  cinematic: Easing.bezier(0.16, 1, 0.3, 1),
  /** Default brand easing per CLAUDE.md */
  brand: Easing.bezier(0.22, 1, 0.36, 1),
  /** Firm in-out for swaps */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** Exit */
  exit: Easing.bezier(0.7, 0, 0.84, 0),
  /** Brush stroke feel */
  brush: Easing.bezier(0.33, 0, 0.25, 1),
};

/* ------------------------------------------------------------------ */
/*  Typography                                                         */
/* ------------------------------------------------------------------ */
export const FONT =
  '"Helvetica Neue", Helvetica, "Inter", "Segoe UI", Arial, sans-serif';

export const TYPE = {
  brand: { fontSize: 92, fontWeight: 800, letterSpacing: '0.12em' },
  tagline: { fontSize: 28, fontWeight: 500, letterSpacing: '0.32em' },
  headline: { fontSize: 68, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 },
  subhead: { fontSize: 36, fontWeight: 600, letterSpacing: '0.04em' },
  caption: { fontSize: 24, fontWeight: 500, letterSpacing: '0.08em' },
  label: { fontSize: 18, fontWeight: 600, letterSpacing: '0.2em' },
  contact: { fontSize: 22, fontWeight: 400, letterSpacing: '0.04em' },
  swatchLabel: { fontSize: 14, fontWeight: 600, letterSpacing: '0.1em' },
};

/* ------------------------------------------------------------------ */
/*  Brand constants                                                    */
/* ------------------------------------------------------------------ */
export const BRAND = {
  name: 'WALL DECORES',
  sub: 'Artisan · Collectives',
  website: 'walldecores.com',
  insta: '@wall_decores_artisan',
  phone: '9037790012',
  gold: '#C8A870',
  cream: '#E8DFD0',
  ink: '#17120D',
};
