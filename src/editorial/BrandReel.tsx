import React from 'react';
import { Series } from 'remotion';
import { PostFX } from '../components/PostFX';
import { HUD } from './HUD';
import { SECTIONS } from './theme';
import { Hook } from './sections/Hook';
import { Studio } from './sections/Studio';
import { Craft } from './sections/Craft';
import { Texture } from './sections/Texture';
import { PaletteSection } from './sections/Palette';
import { Scale } from './sections/Scale';
import { Space } from './sections/Space';
import { SignOff } from './sections/SignOff';

const SECTION_COMPONENTS = {
  HOOK: Hook,
  STUDIO: Studio,
  CRAFT: Craft,
  TEXTURE: Texture,
  PALETTE: PaletteSection,
  SCALE: Scale,
  SPACE: Space,
  SIGNOFF: SignOff,
} as const;

/**
 * "WALL DECORES — Brand Reel" — 50s / 3000f vertical editorial motion-graphics
 * film. The 8 beats run back to back via `<Series>`; the HUD is mounted once
 * outside the series so its timecode/progress bar stay continuous across the
 * whole film. `PostFX` (grain + a slight vignette, no chromatic fringe — this
 * style stays clean) wraps everything.
 */
export const BrandReel: React.FC = () => (
  <PostFX grain={0.03} vignette={0.18} warmth={0} cutFrames={[]}>
    <Series>
      {SECTIONS.map((section) => {
        const Component = SECTION_COMPONENTS[section.id];
        return (
          <Series.Sequence key={section.id} durationInFrames={section.durationInFrames}>
            <Component />
          </Series.Sequence>
        );
      })}
    </Series>
    <HUD />
  </PostFX>
);
