import { BeatCue } from './types';

// All layout numbers in this project (and in placement.json) are authored
// for a 1080x1920 frame, then scaled up for the real 2160x3840 render.
export const U = 2;
export const px = (n: number) => n * U;

export const FPS = 30;
export const WIDTH = 2160;
export const HEIGHT = 3840;
export const DURATION_FRAMES = 540; // 18.0s @ 30fps

export const SCENE = {
  S1: { start: 0, end: 150 },
  T1: { start: 150, end: 157 },
  S2: { start: 157, end: 315 },
  T2: { start: 315, end: 322 },
  S3: { start: 322, end: 471 },
  T3: { start: 471, end: 480 },
  S4: { start: 480, end: 540 },
} as const;

export const BEAT: BeatCue[] = [
  { in: 0.5, out: 4.8, kicker: 'WALL DECORES', lines: ['Same wall.', 'Different angle.'], line2Delay: 0.9 },
  {
    in: 5.4,
    out: 10.3,
    kicker: 'HANDCRAFTED IN KERALA',
    lines: ['Every brushstroke', 'catches the light.'],
    line2Delay: 1.0,
  },
  {
    in: 11.0,
    out: 15.5,
    kicker: 'THE FINISHING TOUCH',
    lines: ['One piece.', 'The room, complete.'],
    line2Delay: 1.2,
  },
];

export const CONTACT = {
  wordmark: 'WALL DECORES',
  sub: 'Handcrafted for the spaces you love.',
  handle: '@wall_decores_artisan',
  web: 'walldecores.com',
};
