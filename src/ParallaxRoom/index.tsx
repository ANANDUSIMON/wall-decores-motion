import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { ParallaxScene } from './ParallaxScene';
import { CloseupScene } from './CloseupScene';
import { EndCard } from './EndCard';
import { WhipTransition } from './WhipTransition';
import { TextBands, BottomScrim, activeBeat } from './TextBands';
import { usePlacement } from './usePlacement';
import { BEAT, FPS, SCENE } from './timeline';

const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const easeIn = Easing.in(Easing.cubic);

const ASSET = 'parallax-room/';
const layer = (name: string) => staticFile(`${ASSET}layers/${name}`);
const PAINTING_SRC = staticFile(`${ASSET}painting.png`);
const AUDIO_SRC = staticFile(`${ASSET}audio/mix.wav`);

export const ParallaxRoom: React.FC = () => {
  const frame = useCurrentFrame();
  const placement = usePlacement();

  if (!placement) return null;

  const showS1 = frame >= SCENE.S1.start && frame <= SCENE.T1.end - 1;
  const showS2 = frame >= SCENE.T1.start && frame <= SCENE.T2.end - 1;
  const showS3 = frame >= SCENE.T2.start && frame <= SCENE.T3.end - 1;
  const showS4 = frame >= SCENE.S4.start;

  // T3 is a plain fade to black, not a whip — S3 just dims out over its window.
  const s3FadeOpacity = interpolate(frame, [SCENE.T3.start, SCENE.T3.end - 1], [1, 0], {
    ...clamp,
    easing: easeIn,
  });

  const beat = activeBeat(BEAT, frame / FPS);
  const closeupActive = frame >= SCENE.S2.start && frame < SCENE.T2.start;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {showS1 && (
        <WhipTransition start={SCENE.T1.start} end={SCENE.T1.end - 1} role="outgoing">
          <ParallaxScene
            backgroundSrc={layer('left_corner_background.png')}
            foregroundSrc={layer('left_corner_foreground.png')}
            paintingSrc={PAINTING_SRC}
            placement={placement.left_corner}
            startFrame={SCENE.S1.start}
            durationFrames={SCENE.S1.end - SCENE.S1.start}
            baseDistance={-60}
            zoomTo={1.03}
          />
        </WhipTransition>
      )}

      {showS2 && (
        <WhipTransition start={SCENE.T1.start} end={SCENE.T1.end - 1} role="incoming">
          <WhipTransition start={SCENE.T2.start} end={SCENE.T2.end - 1} role="outgoing" reverse>
            <CloseupScene
              backgroundSrc={layer('closeup_wall_1.png')}
              paintingSrc={PAINTING_SRC}
              placement={placement.closeup}
              startFrame={SCENE.S2.start}
              durationFrames={SCENE.S2.end - SCENE.S2.start}
            />
          </WhipTransition>
        </WhipTransition>
      )}

      {showS3 && (
        <WhipTransition start={SCENE.T2.start} end={SCENE.T2.end - 1} role="incoming" reverse>
          <div style={{ position: 'absolute', inset: 0, opacity: s3FadeOpacity }}>
            <ParallaxScene
              backgroundSrc={layer('right_angle_background.png')}
              foregroundSrc={layer('right_angle_foreground.png')}
              paintingSrc={PAINTING_SRC}
              placement={placement.right_angle}
              startFrame={SCENE.S3.start}
              durationFrames={SCENE.S3.end - SCENE.S3.start}
              baseDistance={50}
              zoomTo={1.02}
            />
          </div>
        </WhipTransition>
      )}

      {showS4 && <EndCard backgroundSrc={layer('closeup_wall_2_led.png')} paintingSrc={PAINTING_SRC} startFrame={SCENE.S4.start} />}

      {!showS4 && (
        <>
          <BottomScrim strength={closeupActive ? 1.15 : 1} />
          <TextBands beat={beat} />
        </>
      )}

      <Audio src={AUDIO_SRC} />
    </AbsoluteFill>
  );
};
