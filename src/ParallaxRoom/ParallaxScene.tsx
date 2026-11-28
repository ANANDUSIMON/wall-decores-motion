import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, spring, useCurrentFrame } from 'remotion';
import { PaintingSlot } from './types';
import { px } from './timeline';
import { cornerPinMatrix3d } from './cornerPin';
import { Grade } from './Grade';

const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const easeInOutCubic = Easing.inOut(Easing.cubic);

/** Background slowest, painting mid, foreground fastest — simulates a 3D camera pan. */
export const parallaxTranslate = (
  frame: number,
  startFrame: number,
  durationFrames: number,
  baseDistance: number, // px, background layer
  speedMultiplier: number, // 1.0 bg, 1.5 painting, 2.5 fg
) => {
  const progress = spring({
    frame: frame - startFrame,
    fps: 30,
    config: { damping: 200, stiffness: 10, mass: 0.5 },
    durationInFrames: durationFrames,
  });
  return baseDistance * speedMultiplier * progress;
};

const Layer: React.FC<{ src: string; x: number }> = ({ src, x }) => (
  <Img
    src={src}
    style={{
      position: 'absolute',
      top: '-6%',
      left: '-6%',
      width: '112%',
      height: '112%',
      objectFit: 'cover',
      transform: `translateX(${x}px)`,
    }}
  />
);

type Props = {
  backgroundSrc: string;
  foregroundSrc: string;
  paintingSrc: string;
  placement: PaintingSlot;
  startFrame: number;
  durationFrames: number;
  /** px in the 1080-authoring space, signed; S1 uses -60, S3 uses +50. */
  baseDistance: number;
  zoomTo: number;
};

export const ParallaxScene: React.FC<Props> = ({
  backgroundSrc,
  foregroundSrc,
  paintingSrc,
  placement,
  startFrame,
  durationFrames,
  baseDistance,
  zoomTo,
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const base = px(baseDistance);

  const bgX = parallaxTranslate(frame, startFrame, durationFrames, base, 1);
  const paintingX = parallaxTranslate(frame, startFrame, durationFrames, base, 1.5);
  const fgX = parallaxTranslate(frame, startFrame, durationFrames, base, 2.5);

  const zoom = interpolate(local, [0, durationFrames], [1, zoomTo], { ...clamp, easing: easeInOutCubic });

  const warp = placement.perspective
    ? cornerPinMatrix3d(px(placement.width), px(placement.height), {
        topLeft: [px(placement.perspective.topLeft[0]), px(placement.perspective.topLeft[1])],
        topRight: [px(placement.perspective.topRight[0]), px(placement.perspective.topRight[1])],
        bottomLeft: [px(placement.perspective.bottomLeft[0]), px(placement.perspective.bottomLeft[1])],
        bottomRight: [px(placement.perspective.bottomRight[0]), px(placement.perspective.bottomRight[1])],
      })
    : 'none';

  return (
    <Grade>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
        <Layer src={backgroundSrc} x={bgX} />
        <Img
          src={paintingSrc}
          style={{
            position: 'absolute',
            left: px(placement.x),
            top: px(placement.y),
            width: px(placement.width),
            height: px(placement.height),
            transform: `translateX(${paintingX}px) ${warp}`,
            transformOrigin: 'top left',
          }}
        />
        <Layer src={foregroundSrc} x={fgX} />
      </AbsoluteFill>
    </Grade>
  );
};
