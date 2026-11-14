import { Easing } from 'remotion';
import { interFontFamily, instrumentSerifFontFamily, jetBrainsMonoFontFamily } from '../fonts';

export const FPS = 60;
export const W = 1080;
export const H = 1920;
export const TOTAL = 3000;

/** Safe margin from the canvas edge for all section content. */
export const SAFE = 80;

export const EDITORIAL = {
  cream: '#F3EFE9',
  ink: '#17120D',
  jade: '#2C9B8E',
  coral: '#F07973',
  gold: '#A37C37',
  paper: '#FBF9F6',
} as const;

export type SectionId =
  | 'HOOK' | 'STUDIO' | 'CRAFT' | 'TEXTURE' | 'PALETTE' | 'SCALE' | 'SPACE' | 'SIGNOFF';

export type Section = {
  id: SectionId;
  index: number;
  label: string;
  from: number;
  durationInFrames: number;
  background: string;
};

/** The 8 beats, in exact frame ranges at 60fps / 3000f total (50s). */
export const SECTIONS: Section[] = [
  { id: 'HOOK', index: 1, label: 'HOOK', from: 0, durationInFrames: 300, background: EDITORIAL.cream },
  { id: 'STUDIO', index: 2, label: 'STUDIO', from: 300, durationInFrames: 360, background: EDITORIAL.ink },
  { id: 'CRAFT', index: 3, label: 'CRAFT', from: 660, durationInFrames: 420, background: EDITORIAL.cream },
  { id: 'TEXTURE', index: 4, label: 'TEXTURE', from: 1080, durationInFrames: 360, background: EDITORIAL.ink },
  { id: 'PALETTE', index: 5, label: 'PALETTE', from: 1440, durationInFrames: 420, background: EDITORIAL.paper },
  { id: 'SCALE', index: 6, label: 'SCALE', from: 1860, durationInFrames: 360, background: EDITORIAL.cream },
  { id: 'SPACE', index: 7, label: 'SPACE', from: 2220, durationInFrames: 480, background: EDITORIAL.ink },
  { id: 'SIGNOFF', index: 8, label: 'SIGN-OFF', from: 2700, durationInFrames: 300, background: EDITORIAL.coral },
];

export const ease = {
  /** Headlines, HUD text, anything that types or settles in place. */
  type: Easing.bezier(0.22, 1, 0.36, 1),
  /** Cards, camera-weight moves — heavier, longer tail. */
  heavy: Easing.bezier(0.16, 1, 0.3, 1),
};

export const fonts = {
  headline: interFontFamily,
  italic: instrumentSerifFontFamily,
  mono: jetBrainsMonoFontFamily,
};

/** Ink is the only background dark enough to need cream text — every other
 * section background (cream, paper, coral) reads correctly with ink text. */
export const textColorFor = (background: string): string =>
  background === EDITORIAL.ink ? EDITORIAL.cream : EDITORIAL.ink;

export const lineColorFor = (background: string): string =>
  background === EDITORIAL.ink ? 'rgba(243,239,233,0.25)' : 'rgba(23,18,13,0.25)';
