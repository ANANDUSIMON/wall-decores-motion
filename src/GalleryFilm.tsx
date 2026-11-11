import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { palette } from './theme';
import { PostFX } from './components/PostFX';
import { Shot1 } from './shots/Shot1';
import { Shot2 } from './shots/Shot2';
import { Shot3 } from './shots/Shot3';
import { Shot4 } from './shots/Shot4';
import { Shot5 } from './shots/Shot5';
import { Shot6 } from './shots/Shot6';

export type ShotSpec = {
  id: string;
  Comp: React.FC;
  from: number;
  durationInFrames: number;
  /** frames, local to the shot, where a cut lands */
  localCuts: number[];
  fx: { grain: number; vignette: number; warmth: number };
};

/**
 * Grading is per shot, not global.
 *
 * One setting cannot serve a wide wall shot and a close texture push. The
 * texture shot wants almost no vignette so the surface stays even; the wide
 * shots want more, so the frame has edges. The difference is small on any
 * single frame and obvious across the film.
 */
export const SHOTS: ShotSpec[] = [
  {
    id: 'Shot1',
    Comp: Shot1,
    from: 0,
    durationInFrames: 105,
    localCuts: [0],
    fx: { grain: 0.045, vignette: 0.34, warmth: 0.55 },
  },
  {
    id: 'Shot2',
    Comp: Shot2,
    from: 105,
    durationInFrames: 150,
    localCuts: [0],
    fx: { grain: 0.045, vignette: 0.3, warmth: 0.5 },
  },
  {
    id: 'Shot3',
    Comp: Shot3,
    from: 255,
    durationInFrames: 135,
    localCuts: [0],
    // Close on the surface: the vignette has to get out of the way, or it
    // reads as shading on the painting rather than on the lens.
    fx: { grain: 0.04, vignette: 0.16, warmth: 0.45 },
  },
  {
    id: 'Shot4',
    Comp: Shot4,
    from: 390,
    durationInFrames: 135,
    localCuts: [0],
    fx: { grain: 0.045, vignette: 0.36, warmth: 0.5 },
  },
  {
    id: 'Shot5',
    Comp: Shot5,
    from: 525,
    durationInFrames: 120,
    localCuts: [0],
    fx: { grain: 0.04, vignette: 0.26, warmth: 0.45 },
  },
  {
    id: 'Shot6',
    Comp: Shot6,
    from: 645,
    durationInFrames: 135,
    localCuts: [0],
    fx: { grain: 0.045, vignette: 0.38, warmth: 0.6 },
  },
];

export const TOTAL_FRAMES = SHOTS.reduce((a, s) => a + s.durationInFrames, 0);

export const GalleryFilm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: palette.wall }}>
    {SHOTS.map(({ id, Comp, from, durationInFrames, localCuts, fx }) => (
      <Sequence key={id} from={from} durationInFrames={durationInFrames} name={id}>
        <PostFX {...fx} cutFrames={localCuts}>
          <Comp />
        </PostFX>
      </Sequence>
    ))}
  </AbsoluteFill>
);
