import React from 'react';
import {Composition, Folder} from 'remotion';
import {BrandFilm} from './BrandFilm';
import {Shot1} from './shots/Shot1';
import {Shot2} from './shots/Shot2';
import {Shot3} from './shots/Shot3';
import {Shot4} from './shots/Shot4';
import {Shot5} from './shots/Shot5';
import {Shot6} from './shots/Shot6';
import {SHOTS, TOTAL_FRAMES} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Shots">
      <Composition id="Shot1" component={Shot1} width={1920} height={1080} fps={30} durationInFrames={SHOTS.Shot1} />
      <Composition id="Shot2" component={Shot2} width={1920} height={1080} fps={30} durationInFrames={SHOTS.Shot2} />
      <Composition id="Shot3" component={Shot3} width={1920} height={1080} fps={30} durationInFrames={SHOTS.Shot3} />
      <Composition id="Shot4" component={Shot4} width={1920} height={1080} fps={30} durationInFrames={SHOTS.Shot4} />
      <Composition id="Shot5" component={Shot5} width={1920} height={1080} fps={30} durationInFrames={SHOTS.Shot5} />
      <Composition id="Shot6" component={Shot6} width={1920} height={1080} fps={30} durationInFrames={SHOTS.Shot6} />
    </Folder>
    <Composition
      id="BrandFilm"
      component={BrandFilm}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={TOTAL_FRAMES}
    />
  </>
);
