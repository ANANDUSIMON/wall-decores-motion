import React from 'react';
import {Series} from 'remotion';
import {Shot1} from './shots/Shot1';
import {Shot2} from './shots/Shot2';
import {Shot3} from './shots/Shot3';
import {Shot4} from './shots/Shot4';
import {Shot5} from './shots/Shot5';
import {Shot6} from './shots/Shot6';
import {SHOTS} from './theme';

export const BrandFilm: React.FC = () => <Series>
  <Series.Sequence name="Cold Open" durationInFrames={SHOTS.Shot1}><Shot1/></Series.Sequence>
  <Series.Sequence name="Every Surface" durationInFrames={SHOTS.Shot2}><Shot2/></Series.Sequence>
  <Series.Sequence name="Craft" durationInFrames={SHOTS.Shot3}><Shot3/></Series.Sequence>
  <Series.Sequence name="The Turn" durationInFrames={SHOTS.Shot4}><Shot4/></Series.Sequence>
  <Series.Sequence name="Scale" durationInFrames={SHOTS.Shot5}><Shot5/></Series.Sequence>
  <Series.Sequence name="Brand Lock-up" durationInFrames={SHOTS.Shot6}><Shot6/></Series.Sequence>
</Series>;
