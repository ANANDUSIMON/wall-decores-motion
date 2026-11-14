import React from 'react';
import { useCurrentFrame } from 'remotion';
import { SectionShell } from '../components/SectionShell';
import { EditorialHeadline } from '../components/EditorialHeadline';
import { PreviewCard } from '../components/PreviewCard';
import { EDITORIAL, SAFE, fonts, textColorFor } from '../theme';
import { riseIn } from '../motion';

const SPEC_LINES = ['FOUNDED · 2021', 'BASED · ANGAMALY, KERALA', 'FOR · DESIGNERS & ARCHITECTS'];

/** 02 STUDIO (360f, ink) — headline + three mono facts, a preview card
 * slides in from the right at f200 and settles upright. */
export const Studio: React.FC = () => {
  const frame = useCurrentFrame();
  const ink = textColorFor(EDITORIAL.ink);

  return (
    <SectionShell background={EDITORIAL.ink} prevBackground={EDITORIAL.cream}>
      <div style={{ position: 'absolute', top: 220, left: SAFE, width: 820, height: 280 }}>
        <EditorialHeadline
          segments={[
            { text: 'We make original canvas art', style: 'bold' },
            { text: 'for rooms people live in.', style: 'italic', color: EDITORIAL.coral },
          ]}
          delay={10}
          fontSize={88}
          color={ink}
          maxWidth={800}
        />
      </div>

      <div style={{ position: 'absolute', top: 560, left: SAFE, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SPEC_LINES.map((line, i) => {
          const { opacity, translateY } = riseIn(frame, 70 + i * 10, 14, 10);
          return (
            <div
              key={line}
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                fontFamily: fonts.mono,
                fontSize: 15,
                letterSpacing: '0.1em',
                color: ink,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', top: 880, right: SAFE }}>
        <PreviewCard
          src="Art_Deco_Lotus_Jade_and_Gold"
          width={540}
          height={660}
          delay={200}
          duration={28}
          slideFromPx={260}
          rotateFromDeg={3}
          zoomDrift={[1, 1.06]}
          lifeFrames={160}
          borderColor="rgba(243,239,233,0.25)"
          labelColor={EDITORIAL.cream}
          background="#1F1A13"
        />
      </div>
    </SectionShell>
  );
};
