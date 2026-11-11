import React from 'react';
import { Composition } from 'remotion';
import { FPS, WIDTH, HEIGHT } from './theme';
import { GalleryFilm, SHOTS, TOTAL_FRAMES } from './GalleryFilm';
import { PostFX } from './components/PostFX';

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
  </>
);
