import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {BrushStroke} from '../BrushStroke';
import {PostFX} from '../PostFX';
import {C, EASE, FONT} from '../theme';

export const Shot6: React.FC = () => {
  const frame = useCurrentFrame();
  const e = Easing.bezier(...EASE);
  const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

  return (
    <PostFX>
      <AbsoluteFill style={{backgroundColor: C.nearBlack}}>
        {/* Gold brush stroke behind brand name */}
        <BrushStroke
          color={C.gold}
          progress={interpolate(frame, [0, 30], [0, 1], {...clamp, easing: e})}
          x1={300}
          y1={460}
          x2={1620}
          y2={460}
          width={70}
          bristleCount={65}
          seed={601}
        />

        {/* WALL DECORES */}
        <div
          style={{
            position: 'absolute',
            top: 370,
            width: '100%',
            textAlign: 'center' as const,
            opacity: interpolate(frame, [10, 25], [0, 1], {...clamp, easing: e}),
            fontFamily: FONT,
            fontSize: 110,
            fontWeight: 800,
            letterSpacing: '0.1em',
            color: C.cream,
          }}
        >
          WALL DECORES
        </div>

        {/* Hairline divider */}
        <div
          style={{
            position: 'absolute',
            top: 530,
            left: '30%',
            width: '40%',
            height: 1,
            backgroundColor: C.gold,
            opacity: interpolate(frame, [22, 35], [0, 1], {...clamp, easing: e}),
            scale: `${interpolate(frame, [22, 35], [0.6, 1], {...clamp, easing: e})} 1`,
          }}
        />

        {/* ARTISAN · COLLECTIVES */}
        <div
          style={{
            position: 'absolute',
            top: 560,
            width: '100%',
            textAlign: 'center' as const,
            opacity: interpolate(frame, [30, 43], [0, 1], {...clamp, easing: e}),
            translate: `0px ${interpolate(frame, [30, 43], [12, 0], {...clamp, easing: e})}px`,
            fontFamily: FONT,
            fontSize: 30,
            letterSpacing: '0.35em',
            color: C.gold,
            fontWeight: 400,
          }}
        >
          ARTISAN · COLLECTIVES
        </div>

        {/* Contact line */}
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            width: '100%',
            textAlign: 'center' as const,
            opacity: interpolate(frame, [40, 55], [0, 1], {...clamp, easing: e}),
            fontFamily: FONT,
            fontSize: 18,
            letterSpacing: '0.15em',
            color: C.cream,
            fontWeight: 400,
          }}
        >
          walldecores.com · @wall_decores_artisan · 9037790012
        </div>
      </AbsoluteFill>
    </PostFX>
  );
};
