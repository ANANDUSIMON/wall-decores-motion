import React from 'react';
import { Composition } from 'remotion';
import { FPS, WIDTH, HEIGHT } from './theme';
import { BrandFilm, SHOTS, TOTAL_FRAMES } from './BrandFilm';
import { PostFX } from './components/PostFX';

/**
 * Compositions registered here:
 *
 *   BrandFilm        the whole 24s film, for preview and single-machine render
 *   Shot1 ... Shot6  one per shot, so the GitHub Actions matrix can render
 *                    all six in parallel and concat them losslessly
 *
 * Every shot composition carries the same PostFX grade, so the six files are
 * visually continuous and `-c copy` concat produces a seamless film.
 */

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BrandFilm"
        component={BrandFilm}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      {SHOTS.map(({ id, Comp, durationInFrames, localCuts, fx }) => {
        const Wrapped: React.FC = () => (
          <PostFX
            cutFrames={localCuts}
            bloom={fx.bloom}
            grain={fx.grain}
            vignette={fx.vignette}
          >
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
};
