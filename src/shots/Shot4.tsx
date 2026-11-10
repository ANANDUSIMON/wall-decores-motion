import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {BrushStroke} from '../BrushStroke';
import {PostFX} from '../PostFX';
import {C, EASE, FONT} from '../theme';

export const Shot4: React.FC = () => {
  const frame = useCurrentFrame();
  const e = Easing.bezier(...EASE);
  const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

  return (
    <PostFX>
      <AbsoluteFill style={{backgroundColor: C.nearBlack}}>
        {/* Cream inversion */}
        <AbsoluteFill
          style={{
            backgroundColor: C.cream,
            opacity: interpolate(frame, [0, 18], [0, 1], {...clamp, easing: e}),
          }}
        />

        {/* "NOT PRINTED." — appears then exits */}
        <div
          style={{
            position: 'absolute',
            top: '38%',
            width: '100%',
            textAlign: 'center' as const,
            opacity: interpolate(frame, [8, 22, 38, 52], [0, 1, 1, 0], {
              ...clamp,
            }),
            fontFamily: FONT,
            fontSize: 90,
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: C.nearBlack,
          }}
        >
          NOT PRINTED.
        </div>

        {/* "PAINTED." — takes over */}
        <div
          style={{
            position: 'absolute',
            top: '36%',
            width: '100%',
            textAlign: 'center' as const,
            opacity: interpolate(frame, [44, 58], [0, 1], {...clamp, easing: e}),
            scale: String(
              interpolate(frame, [44, 58], [0.92, 1], {...clamp, easing: e}),
            ),
            fontFamily: FONT,
            fontSize: 110,
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: C.burntOrange,
          }}
        >
          PAINTED.
        </div>

        {/* Hero burnt-orange stroke */}
        <BrushStroke
          color={C.burntOrange}
          progress={interpolate(frame, [42, 82], [0, 1], {...clamp, easing: e})}
          x1={100}
          y1={720}
          x2={1820}
          y2={680}
          width={100}
          bristleCount={75}
          seed={401}
        />
      </AbsoluteFill>
    </PostFX>
  );
};
