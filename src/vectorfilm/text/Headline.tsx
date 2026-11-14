import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { COLORS, LAYOUT, TYPE, ease, fonts } from '../theme';
import { prog } from '../motion';

export type Word = { t: string; italic?: boolean; color?: string };
export type Line = Word[];

/**
 * Centred two-line headline. One fixed vertical anchor (LAYOUT.headlineCenterY)
 * for every section, so titles never jump around between beats.
 * Bold lines: Inter 800. Accent lines: Instrument Serif italic, slightly
 * larger so the x-heights optically match.
 */
const HeadlineInner: React.FC<{ lines: Line[]; from: number; to: number }> = ({ lines, from, to }) => {
  const f = useCurrentFrame();
  const out = prog(f, to - 26, 26, ease.exit);
  let wordIndex = 0;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: LAYOUT.hudSide,
          right: LAYOUT.hudSide,
          top: LAYOUT.headlineCenterY,
          transform: `translateY(-50%) translateY(${-out * 40}px)`,
          opacity: 1 - out,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {lines.map((line, li) => {
          const italic = line.every((w) => w.italic);
          return (
            <div
              key={li}
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'nowrap',
                gap: italic ? '0.22em' : '0.24em',
                fontFamily: italic ? fonts.italic : fonts.headline,
                fontStyle: italic ? 'italic' : 'normal',
                fontWeight: italic ? 400 : 800,
                fontSize: italic ? TYPE.headlineItalic : TYPE.headline,
                lineHeight: 1.02,
                letterSpacing: italic ? '-0.01em' : '-0.035em',
                whiteSpace: 'nowrap',
              }}
            >
              {line.map((w) => {
                const i = wordIndex++;
                const p = prog(f, from + 8 + i * 5, 22, ease.type);
                return (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      color: w.color ?? (w.italic ? COLORS.coral : COLORS.ink),
                      opacity: p,
                      transform: `translateY(${(1 - p) * 70}px)`,
                    }}
                  >
                    {w.t}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Headline: React.FC<{ lines: Line[]; from: number; to: number }> = (props) => {
  const f = useCurrentFrame();
  if (f < props.from || f > props.to) return null;
  const moving = f < props.from + 50 || f > props.to - 28;
  if (moving) {
    return (
      <CameraMotionBlur shutterAngle={220} samples={6}>
        <HeadlineInner {...props} />
      </CameraMotionBlur>
    );
  }
  return <HeadlineInner {...props} />;
};
