import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { MotionBlur } from '@/lib/onda/primitives';
import { DrawOn } from '@/components/onda/draw-on/DrawOn';
import { SectionShell } from '../components/SectionShell';
import { EDITORIAL, fonts, textColorFor } from '../theme';
import { progressIn, riseIn } from '../motion';

const CONTACT_LINES = ['WALLDECORES.COM', '@WALL_DECORES_ARTISAN', '+91 90377 90012'];

/** 08 SIGN-OFF (300f, coral) — the wordmark locks centre with a final
 * motion-blurred snap at local f40, contact lines + a full-width rule
 * follow, then holds perfectly still for the last 40 frames. */
export const SignOff: React.FC = () => {
  const frame = useCurrentFrame();
  const ink = textColorFor(EDITORIAL.coral);
  const snap = progressIn(frame, 34, 6);
  const scale = 1.08 - 0.08 * snap;

  return (
    <SectionShell background={EDITORIAL.coral} prevBackground={EDITORIAL.ink}>
      <MotionBlur>
        <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
          <div
            style={{
              opacity: snap,
              transform: `scale(${scale})`,
              fontFamily: fonts.headline,
              fontWeight: 900,
              fontSize: 120,
              letterSpacing: '-0.02em',
              color: ink,
            }}
          >
            WALL DECORES
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {CONTACT_LINES.map((line, i) => {
              const { opacity, translateY } = riseIn(frame, 56 + i * 10, 14, 10);
              return (
                <div
                  key={line}
                  style={{
                    opacity,
                    transform: `translateY(${translateY}px)`,
                    fontFamily: fonts.mono,
                    fontSize: 15,
                    letterSpacing: '0.12em',
                    color: ink,
                  }}
                >
                  {line}
                </div>
              );
            })}
          </div>

          <DrawOn
            kind="draw-on"
            d="M 2 2 L 918 2"
            delay={100}
            duration={30}
            stroke={ink}
            strokeWidth={2}
            viewBox="0 0 920 4"
            width={920}
            height={4}
          />
        </AbsoluteFill>
      </MotionBlur>
    </SectionShell>
  );
};
