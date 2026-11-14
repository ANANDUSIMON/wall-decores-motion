import React from 'react';
import { useCurrentFrame } from 'remotion';
import { SectionShell } from '../components/SectionShell';
import { EditorialHeadline } from '../components/EditorialHeadline';
import { PreviewCard } from '../components/PreviewCard';
import { EDITORIAL, SAFE, fonts, textColorFor } from '../theme';
import { riseIn } from '../motion';

/** 03 CRAFT (420f, cream) — headline, a 2-up grid of preview cards
 * (12f stagger) with slow scale drift, a mono caption beneath. */
export const Craft: React.FC = () => {
  const frame = useCurrentFrame();
  const ink = textColorFor(EDITORIAL.cream);
  const caption = riseIn(frame, 200, 14, 10);

  return (
    <SectionShell background={EDITORIAL.cream} prevBackground={EDITORIAL.ink}>
      <div style={{ position: 'absolute', top: 160, left: SAFE, width: 880, height: 220 }}>
        <EditorialHeadline
          segments={[
            { text: 'Every piece is hand-painted.', style: 'bold' },
            { text: 'No prints.', style: 'italic', color: EDITORIAL.coral },
          ]}
          delay={10}
          fontSize={84}
          color={ink}
          maxWidth={860}
        />
      </div>

      <div style={{ position: 'absolute', top: 540, left: SAFE, display: 'flex', gap: 32 }}>
        <PreviewCard
          src="Emerald_rhythm_lotus"
          width={460}
          height={580}
          delay={60}
          duration={24}
          slideFromPx={0}
          zoomDrift={[1, 1.12]}
          lifeFrames={340}
          borderColor="rgba(23,18,13,0.2)"
          labelColor={ink}
          background="#FBF9F6"
        />
        <PreviewCard
          src="Geometric_Lotus_in_Turquoise_Abstraction1"
          width={460}
          height={580}
          delay={72}
          duration={24}
          slideFromPx={0}
          zoomDrift={[1, 1.12]}
          lifeFrames={340}
          borderColor="rgba(23,18,13,0.2)"
          labelColor={ink}
          background="#FBF9F6"
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 1200,
          left: SAFE,
          opacity: caption.opacity,
          transform: `translateY(${caption.translateY}px)`,
          fontFamily: fonts.mono,
          fontSize: 14,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: ink,
        }}
      >
        OIL &amp; ACRYLIC ON COTTON CANVAS
      </div>
    </SectionShell>
  );
};
