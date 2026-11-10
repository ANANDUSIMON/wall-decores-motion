import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {PostFX} from '../PostFX';
import {C, EASE, FONT} from '../theme';

export const Shot5: React.FC = () => {
  const frame = useCurrentFrame();
  const e = Easing.bezier(...EASE);
  const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

  const frameW = 1200;
  const frameH = 600;
  const frameX = (1920 - frameW) / 2;
  const frameY = (1080 - frameH) / 2;
  const perimeter = 2 * (frameW + frameH);

  return (
    <PostFX>
      <AbsoluteFill style={{backgroundColor: C.nearBlack}}>
        {/* Gold canvas-stretcher frame */}
        <svg
          viewBox="0 0 1920 1080"
          style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
        >
          <rect
            x={frameX}
            y={frameY}
            width={frameW}
            height={frameH}
            fill="none"
            stroke={C.gold}
            strokeWidth={2}
            strokeDasharray={perimeter}
            strokeDashoffset={interpolate(frame, [0, 30], [perimeter, 0], {
              ...clamp,
              easing: e,
            })}
          />
          {/* Inner hairline */}
          <rect
            x={frameX + 16}
            y={frameY + 16}
            width={frameW - 32}
            height={frameH - 32}
            fill="none"
            stroke={C.gold}
            strokeWidth={0.5}
            opacity={interpolate(frame, [20, 35], [0, 0.5], {...clamp, easing: e})}
          />
        </svg>

        {/* IMPASTO */}
        <div
          style={{
            position: 'absolute',
            top: frameY + 120,
            width: '100%',
            textAlign: 'center' as const,
            opacity: interpolate(frame, [18, 33], [0, 1], {...clamp, easing: e}),
            translate: `0px ${interpolate(frame, [18, 33], [20, 0], {...clamp, easing: e})}px`,
            fontFamily: FONT,
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: C.gold,
          }}
        >
          IMPASTO
        </div>

        {/* OIL ON CANVAS */}
        <div
          style={{
            position: 'absolute',
            top: frameY + 260,
            width: '100%',
            textAlign: 'center' as const,
            opacity: interpolate(frame, [33, 48], [0, 1], {...clamp, easing: e}),
            translate: `0px ${interpolate(frame, [33, 48], [20, 0], {...clamp, easing: e})}px`,
            fontFamily: FONT,
            fontSize: 28,
            letterSpacing: '0.22em',
            color: C.cream,
            fontWeight: 400,
          }}
        >
          OIL ON CANVAS
        </div>

        {/* BESPOKE SCALE */}
        <div
          style={{
            position: 'absolute',
            top: frameY + 360,
            width: '100%',
            textAlign: 'center' as const,
            opacity: interpolate(frame, [48, 63], [0, 1], {...clamp, easing: e}),
            translate: `0px ${interpolate(frame, [48, 63], [20, 0], {...clamp, easing: e})}px`,
            fontFamily: FONT,
            fontSize: 28,
            letterSpacing: '0.22em',
            color: C.cream,
            fontWeight: 400,
          }}
        >
          BESPOKE SCALE
        </div>
      </AbsoluteFill>
    </PostFX>
  );
};
