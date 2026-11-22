import React from 'react';
import { Composition } from 'remotion';
import { FPS, WIDTH, HEIGHT } from './theme';
import { GalleryFilm, SHOTS, TOTAL_FRAMES } from './GalleryFilm';
import { PostFX } from './components/PostFX';
import { VibrantFilm, SCENES as VIBRANT_SCENES, TOTAL as VIBRANT_TOTAL } from './brand/Film';
import { FPS as VFPS, W as VW, H as VH } from './brand/theme';
import { BrandReel } from './editorial/BrandReel';
import { FPS as EFPS, W as EW, H as EH, TOTAL as ETOTAL } from './editorial/theme';
import { VectorFilm } from './vectorfilm/VectorFilm';
import { FPS as VFFPS, W as VFW, H as VFH, TOTAL as VFTOTAL } from './vectorfilm/theme';
import { ShowcaseFilm } from './showcase/ShowcaseFilm';
import { FPS as SFPS, W as SW, H as SH, TOTAL as STOTAL } from './showcase/theme';
import { VectorShowcase } from './vectorshowcase/VectorShowcase';
import { FPS as VSFPS, W as VSW, H as VSH, TOTAL as VSTOTAL } from './vectorshowcase/theme';
import { RoomShowcase, ROOM_SHOWCASE_FPS, ROOM_SHOWCASE_DURATION } from './compositions/RoomShowcase';
import { TestRoom3D } from './TestRoom3D';
import { TestRoomCinematic30, ROOM_FPS, ROOM_DURATION } from './TestRoomCinematic30';
import { LastPiece } from './LastPiece/LastPiece';
import { DURATION as LP_DURATION, FPS as LP_FPS } from './LastPiece/config';
import './Reel/fonts';
import { Reel } from './Reel/Reel';
import { DURATION as WR_DURATION, FPS as WR_FPS, W as WR_W, H as WR_H } from './Reel/config';

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

    {/* 50s vertical editorial motion-graphics film — Wall Decores Brand Reel */}
    <Composition
      id="BrandReel"
      component={BrandReel}
      durationInFrames={ETOTAL}
      fps={EFPS}
      width={EW}
      height={EH}
    />

    {/* 60s vertical vector film — room built in vector, painting laid down by brush */}
    <Composition
      id="VectorFilm"
      component={VectorFilm}
      durationInFrames={VFTOTAL}
      fps={VFFPS}
      width={VFW}
      height={VFH}
    />

    {/* 60s 1080p showcase film — 5 rooms × 5 paintings with colour palettes */}
    <Composition
      id="ShowcaseFilm"
      component={ShowcaseFilm}
      durationInFrames={STOTAL}
      fps={SFPS}
      width={SW}
      height={SH}
    />

    {/* 60s 1080p landscape vector showcase — 5 rooms re-dressed, 5 paintings painted to match */}
    <Composition
      id="VectorShowcase"
      component={VectorShowcase}
      durationInFrames={VSTOTAL}
      fps={VSFPS}
      width={VSW}
      height={VSH}
    />

    {/* 3D room visualization pipeline — Three.js canvas via @remotion/three, Lambda-safe */}
    <Composition
      id="RoomShowcase"
      component={RoomShowcase}
      durationInFrames={ROOM_SHOWCASE_DURATION}
      fps={ROOM_SHOWCASE_FPS}
      width={WIDTH}
      height={HEIGHT}
    />

    {/* Test 3D room — Lambda render pipeline smoke test */}
    <Composition
      id="TestRoom3D"
      component={TestRoom3D}
      durationInFrames={240}
      fps={30}
      width={1920}
      height={1080}
    />

    {/* 30s cinematic 3D room — heavier Lambda smoke test with full lighting + post-FX */}
    <Composition id="TestRoomCinematic30" component={TestRoomCinematic30}
      durationInFrames={ROOM_DURATION} fps={ROOM_FPS} width={1920} height={1080}
      defaultProps={{ quality: "full" }} />

    {/* "The Last Piece" — 60s brand film, landscape + vertical */}
    <Composition
      id="LastPiece"
      component={LastPiece}
      durationInFrames={LP_DURATION}
      fps={LP_FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="LastPieceVertical"
      component={LastPiece}
      durationInFrames={LP_DURATION}
      fps={LP_FPS}
      width={1080}
      height={1920}
    />
    {/* 40s vertical brand reel — 2160x3840 60fps, beat-cut, dimension graphics, ElevenLabs audio */}
    <Composition
      id="WallDecoresReel"
      component={Reel}
      durationInFrames={WR_DURATION}
      fps={WR_FPS}
      width={WR_W}
      height={WR_H}
    />
  </>
);
