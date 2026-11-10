import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {BrushStroke} from '../BrushStroke';
import {PostFX} from '../PostFX';
import {C, EASE, FONT} from '../theme';

export const Shot3: React.FC = () => {
  const frame = useCurrentFrame();
  const e = Easing.bezier(...EASE);
  const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

  const cols = [
    {x: 440, color: C.gold, label: 'HAND-MIXED', strokeStart: 0, textStart: 18, seed: 301},
    {x: 960, color: C.emerald, label: 'HAND-LAID', strokeStart: 25, textStart: 43, seed: 302},
    {x: 1480, color: C.burntOrange, label: 'HAND-FINISHED', strokeStart: 50, textStart: 68, seed: 303},
  ];

  return (
    <PostFX>
      <AbsoluteFill style={{backgroundColor: C.nearBlack}}>
        {cols.map((col) => (
          <React.Fragment key={col.seed}>
            {/* Vertical brush stroke */}
            <BrushStroke
              color={col.color}
              progress={interpolate(frame, [col.strokeStart, col.strokeStart + 40], [0, 1], {...clamp, easing: e})}
              x1={col.x}
              y1={140}
              x2={col.x}
              y2={780}
              width={50}
              bristleCount={55}
              seed={col.seed}
            />

            {/* Rolling text label */}
            <div
              style={{
                position: 'absolute',
                top: 830,
                left: col.x - 160,
                width: 320,
                textAlign: 'center' as const,
                opacity: interpolate(frame, [col.textStart, col.textStart + 15], [0, 1], {...clamp, easing: e}),
                translate: `0px ${interpolate(frame, [col.textStart, col.textStart + 15], [30, 0], {...clamp, easing: e})}px`,
                fontFamily: FONT,
                fontSize: 22,
                letterSpacing: '0.2em',
                color: C.cream,
                fontWeight: 400,
              }}
            >
              {col.label}
            </div>
          </React.Fragment>
        ))}
      </AbsoluteFill>
    </PostFX>
  );
};
