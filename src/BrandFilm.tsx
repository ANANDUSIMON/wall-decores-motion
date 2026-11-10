import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { PostFX } from './components/PostFX';
import { Shot1 } from './shots/Shot1';
import { Shot2 } from './shots/Shot2';
import { Shot3 } from './shots/Shot3';
import { Shot4 } from './shots/Shot4';
import { Shot5 } from './shots/Shot5';
import { Shot6 } from './shots/Shot6';

/**
 * Master timeline — 720 frames / 24.0s at 30fps.
 *
 * Shot boundaries are hard cuts throughout. No crossfades: the film's rhythm
 * depends on the cut landing clean, and a dissolve would soften exactly the
 * moments that are meant to hit.
 */
export type ShotFX = { bloom: number; grain: number; vignette: number };

/**
 * `fx` is graded per shot. A single global bloom value cannot serve both an
 * ink shot, where glow is most of the richness, and the cream inversion,
 * where the same value turns the frame milky and kills the contrast the cut
 * exists for.
 */
export const SHOTS: {
  id: string;
  Comp: React.FC;
  from: number;
  durationInFrames: number;
  /** cut frames in this shot's own local timeline */
  localCuts: number[];
  fx: ShotFX;
}[] = [
  // id       component  from  frames  localCuts   bloom grain vignette
  { id: 'Shot1', Comp: Shot1, from: 0,   durationInFrames: 90,  localCuts: [0],     fx: { bloom: 0.46, grain: 0.05, vignette: 0.48 } }, //  0.0 -  3.0
  { id: 'Shot2', Comp: Shot2, from: 90,  durationInFrames: 150, localCuts: [0],     fx: { bloom: 0.42, grain: 0.05, vignette: 0.45 } }, //  3.0 -  8.0
  { id: 'Shot3', Comp: Shot3, from: 240, durationInFrames: 150, localCuts: [0],     fx: { bloom: 0.34, grain: 0.05, vignette: 0.44 } }, //  8.0 - 13.0
  { id: 'Shot4', Comp: Shot4, from: 390, durationInFrames: 135, localCuts: [0],     fx: { bloom: 0.30, grain: 0.05, vignette: 0.46 } }, // 13.0 - 17.5
  { id: 'Shot5', Comp: Shot5, from: 525, durationInFrames: 105, localCuts: [0, 36], fx: { bloom: 0.12, grain: 0.06, vignette: 0.30 } }, // 17.5 - 21.0
  { id: 'Shot6', Comp: Shot6, from: 630, durationInFrames: 90,  localCuts: [0],     fx: { bloom: 0.50, grain: 0.05, vignette: 0.52 } }, // 21.0 - 24.0
];

export const TOTAL_FRAMES = 720;

export const BrandFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {SHOTS.map(({ id, Comp, from, durationInFrames, localCuts, fx }) => (
        <Sequence key={id} from={from} durationInFrames={durationInFrames}>
          <PostFX
            cutFrames={localCuts}
            bloom={fx.bloom}
            grain={fx.grain}
            vignette={fx.vignette}
          >
            <Comp />
          </PostFX>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
