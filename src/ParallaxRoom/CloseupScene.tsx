import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { PaintingSlot } from './types';
import { FPS, HEIGHT, WIDTH, px } from './timeline';
import { Grade } from './Grade';

const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const easeInOutCubic = Easing.inOut(Easing.cubic);

const LightSweep: React.FC<{ localSec: number }> = ({ localSec }) => {
  const progress = interpolate(localSec, [0.5, 4.5], [0, 1], clamp);
  const x = interpolate(progress, [0, 1], [-WIDTH * 1.2, WIDTH * 1.2]);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: px(200),
          height: HEIGHT * 1.6,
          background: 'rgba(255, 220, 180, 0.12)',
          transform: `translate(-50%, -50%) rotate(45deg) translateX(${x}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

type Props = {
  backgroundSrc: string;
  paintingSrc: string;
  placement: PaintingSlot;
  startFrame: number;
  durationFrames: number;
};

export const CloseupScene: React.FC<Props> = ({ backgroundSrc, paintingSrc, placement, startFrame, durationFrames }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const localSec = local / FPS;

  const zoom = interpolate(local, [0, durationFrames], [1, 1.08], { ...clamp, easing: easeInOutCubic });
  const panX = interpolate(local, [0, durationFrames], [0, px(-80)], { ...clamp, easing: easeInOutCubic });

  return (
    <Grade>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
        <Img
          src={backgroundSrc}
          style={{
            position: 'absolute',
            top: '-6%',
            left: '-6%',
            width: '112%',
            height: '112%',
            objectFit: 'cover',
            transform: `translateX(${panX}px)`,
          }}
        />
        <Img
          src={paintingSrc}
          style={{
            position: 'absolute',
            left: px(placement.x),
            top: px(placement.y),
            width: px(placement.width),
            height: px(placement.height),
          }}
        />
      </AbsoluteFill>
      <LightSweep localSec={localSec} />
    </Grade>
  );
};
