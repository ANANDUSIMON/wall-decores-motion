import React from 'react';
import { Composition } from 'remotion';
import { FPS, WIDTH, HEIGHT } from './theme';
import { GalleryFilm, SHOTS, TOTAL_FRAMES } from './GalleryFilm';
import { PostFX } from './components/PostFX';
import { VibrantFilm, SCENES as VIBRANT_SCENES, TOTAL as VIBRANT_TOTAL } from './brand/Film';
import { FPS as VFPS, W as VW, H as VH } from './brand/theme';

/**
 * Each shot is registered as its own composition as well as part of the
 * whole film. That is what lets the GitHub Actions matrix put one shot on
 * each machine and render all six at once — six shots in the wall-clock time
 * of the longest one, rather than the sum of all six.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="GalleryFilm"
      component={GalleryFilm}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />

    {SHOTS.map(({ id, Comp, durationInFrames, localCuts, fx }) => {
      const Wrapped: React.FC = () => (
        <PostFX {...fx} cutFrames={localCuts}>
          <Comp />
        </PostFX>
      );
      return (
        <Composition
          key={id}
          id={id}
          component={Wrapped}
          durationInFrames={durationInFrames}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      );
    })}

    {/* 50s vertical brand film — Wall Decores Vibrant, S1-S5 matrix render */}
    <Composition
      id="VibrantFilm"
      component={VibrantFilm}
      durationInFrames={VIBRANT_TOTAL}
      fps={VFPS}
      width={VW}
      height={VH}
    />
    {VIBRANT_SCENES.map(({ id, C, dur }) => (
      <Composition key={id} id={id} component={C} durationInFrames={dur} fps={VFPS} width={VW} height={VH} />
    ))}
  </>
);
