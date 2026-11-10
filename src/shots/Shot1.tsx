import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {BrushStroke} from '../BrushStroke';
import {PostFX} from '../PostFX';
import {C, EASE, FONT} from '../theme';

export const Shot1: React.FC = () => {
  const frame = useCurrentFrame();
  const e = Easing.bezier(...EASE);
  const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

  return (
    <PostFX>
      <AbsoluteFill style={{backgroundColor: C.nearBlack}}>
        {/* Cream field revealed behind brush */}
        <AbsoluteFill
          style={{
            backgroundColor: C.cream,
            opacity: interpolate(frame, [10, 50], [0, 1], {...clamp, easing: e}),
          }}
        />

        {/* Gold hairline */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '10%',
            width: '80%',
            height: 1,
            backgroundColor: C.gold,
            opacity: interpolate(frame, [0, 20], [0, 1], {...clamp, easing: e}),
          }}
        />

        {/* Diagonal brush swipe */}
        <BrushStroke
          color={C.gold}
          progress={interpolate(frame, [5, 45], [0, 1], {...clamp, easing: e})}
          x1={200}
          y1={900}
          x2={1720}
          y2={180}
          width={120}
          bristleCount={70}
          seed={101}
        />

        {/* Kicker */}
        <div
          style={{
            position: 'absolute',
            bottom: 160,
            width: '100%',
            textAlign: 'center' as const,
            opacity: interpolate(frame, [35, 55], [0, 1], {...clamp, easing: e}),
            translate: `0px ${interpolate(frame, [35, 55], [20, 0], {...clamp, easing: e})}px`,
          }}
        >
          <span
            style={{
              fontFamily: FONT,
              fontSize: 24,
              letterSpacing: '0.25em',
              color: C.gold,
              fontWeight: 400,
            }}
          >
            ANGAMALY · KERALA
          </span>
        </div>
      </AbsoluteFill>
    </PostFX>
  );
};
