import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { MotionBlur } from '@/lib/onda/primitives';
import { DrawOn } from '@/components/onda/draw-on/DrawOn';
import { SectionShell } from '../components/SectionShell';
import { EDITORIAL, fonts, textColorFor } from '../theme';
import { riseIn } from '../motion';

const WORD = 'WALL DECORES';

/** 01 HOOK (300f, cream) — wordmark arrives letter by letter at f60,
 * settles f140; subtitle at f180; coral rule draws under it at f240. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const ink = textColorFor(EDITORIAL.cream);
  const subtitle = riseIn(frame, 180, 16, 10);

  return (
    <SectionShell background={EDITORIAL.cream}>
      <MotionBlur>
        <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
          <div style={{ display: 'flex' }}>
            {WORD.split('').map((ch, i) => {
              const { opacity, translateY } = riseIn(frame, 60 + i * 2, 20, 18);
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    opacity,
                    transform: `translateY(${translateY}px)`,
                    fontFamily: fonts.headline,
                    fontWeight: 900,
                    fontSize: 140,
                    letterSpacing: '-0.02em',
                    color: ink,
                    minWidth: ch === ' ' ? 36 : undefined,
                  }}
                >
                  {ch === ' ' ? ' ' : ch}
                </span>
              );
            })}
          </div>

          <div
            style={{
              opacity: subtitle.opacity,
              transform: `translateY(${subtitle.translateY}px)`,
              fontFamily: fonts.mono,
              fontSize: 16,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: ink,
            }}
          >
            ARTISAN WALL ART · ANGAMALY, KERALA
          </div>

          <DrawOn
            kind="draw-on"
            d="M 2 2 L 398 2"
            delay={240}
            duration={30}
            stroke={EDITORIAL.coral}
            strokeWidth={2}
            viewBox="0 0 400 4"
            width={400}
            height={4}
          />
        </AbsoluteFill>
      </MotionBlur>
    </SectionShell>
  );
};
