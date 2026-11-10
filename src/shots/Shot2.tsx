import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {generateBristles} from '../BrushStroke';
import {PostFX} from '../PostFX';
import {C, EASE, FONT} from '../theme';

export const Shot2: React.FC = () => {
  const frame = useCurrentFrame();
  const e = Easing.bezier(...EASE);
  const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

  const everyBristles = useMemo(
    () => generateBristles({x1: 100, y1: 420, x2: 1820, y2: 420, width: 140, count: 55, seed: 201}),
    [],
  );
  const surfaceBristles = useMemo(
    () => generateBristles({x1: 100, y1: 680, x2: 1820, y2: 680, width: 140, count: 55, seed: 202}),
    [],
  );

  const p1 = interpolate(frame, [5, 40], [0, 1], {...clamp, easing: e});
  const p2 = interpolate(frame, [20, 55], [0, 1], {...clamp, easing: e});
  const wipeX = interpolate(frame, [75, 105], [120, -20], {...clamp, easing: e});

  const renderBrushMask = (
    bristles: ReturnType<typeof generateBristles>,
    progress: number,
    maskId: string,
    clipId: string,
  ) => (
    <>
      <clipPath id={clipId}>
        <rect x={0} y={0} width={1920 * progress} height={1080} />
      </clipPath>
      <mask id={maskId}>
        <rect width="1920" height="1080" fill="black" />
        <g clipPath={`url(#${clipId})`}>
          {bristles.map((b, i) => (
            <path
              key={i}
              d={b.d}
              stroke="white"
              strokeWidth={b.strokeWidth * 14}
              fill="none"
              opacity={b.opacity}
              strokeLinecap="round"
              strokeDasharray={b.dashArray}
            />
          ))}
        </g>
      </mask>
    </>
  );

  return (
    <PostFX>
      <AbsoluteFill style={{backgroundColor: C.nearBlack}}>
        {/* Brush-matte text reveals */}
        <svg
          viewBox="0 0 1920 1080"
          style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
        >
          <defs>
            {renderBrushMask(everyBristles, p1, 'every-mask', 'every-clip')}
            {renderBrushMask(surfaceBristles, p2, 'surface-mask', 'surface-clip')}
          </defs>

          <text
            mask="url(#every-mask)"
            x="960"
            y="460"
            textAnchor="middle"
            fill={C.cream}
            fontFamily="Georgia, serif"
            fontSize="140"
            fontWeight={800}
            letterSpacing="0.06em"
          >
            EVERY
          </text>
          <text
            mask="url(#surface-mask)"
            x="960"
            y="720"
            textAnchor="middle"
            fill={C.cream}
            fontFamily="Georgia, serif"
            fontSize="140"
            fontWeight={800}
            letterSpacing="0.06em"
          >
            SURFACE
          </text>
        </svg>

        {/* Emerald diagonal transition */}
        <AbsoluteFill
          style={{
            backgroundColor: C.emerald,
            clipPath: `polygon(${wipeX + 15}% 0%, 120% 0%, 120% 100%, ${wipeX}% 100%)`,
          }}
        />
      </AbsoluteFill>
    </PostFX>
  );
};
