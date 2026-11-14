import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DrawOn } from '@/components/onda/draw-on/DrawOn';
import { SectionShell } from '../components/SectionShell';
import { EditorialHeadline } from '../components/EditorialHeadline';
import { PreviewCard } from '../components/PreviewCard';
import { EDITORIAL, SAFE, fonts, textColorFor } from '../theme';
import { riseIn } from '../motion';

/** 04 TEXTURE (360f, ink) — near-full-width preview card zooms into the
 * impasto; a coral bracket draws around a detail region at f240. */
export const Texture: React.FC = () => {
  const frame = useCurrentFrame();
  const ink = textColorFor(EDITORIAL.ink);
  const tag = riseIn(frame, 252, 14, 8);

  return (
    <SectionShell background={EDITORIAL.ink} prevBackground={EDITORIAL.cream}>
      <div style={{ position: 'absolute', top: 140, left: SAFE, width: 880, height: 200 }}>
        <EditorialHeadline
          segments={[
            { text: 'Sculptural impasto —', style: 'bold' },
            { text: 'texture you can feel.', style: 'italic', color: EDITORIAL.coral },
          ]}
          delay={10}
          fontSize={80}
          color={ink}
          maxWidth={860}
        />
      </div>

      <div style={{ position: 'absolute', top: 440, left: SAFE }}>
        <PreviewCard
          src="Art_Deco_overhead_lotus_bloom"
          width={920}
          height={1060}
          delay={40}
          duration={26}
          slideFromPx={0}
          zoomDrift={[1, 1.35]}
          lifeFrames={310}
          borderColor="rgba(243,239,233,0.25)"
          labelColor={EDITORIAL.cream}
          background="#1F1A13"
        />
      </div>

      <div style={{ position: 'absolute', top: 740, left: SAFE + 560, width: 260, height: 220 }}>
        <DrawOn
          kind="draw-on"
          d="M 2 2 L 2 60 M 2 2 L 60 2 M 198 2 L 198 60 M 198 2 L 140 2 M 2 158 L 2 100 M 2 158 L 60 158 M 198 158 L 198 100 M 198 158 L 140 158"
          delay={240}
          duration={20}
          stroke={EDITORIAL.coral}
          strokeWidth={2}
          viewBox="0 0 200 160"
          width={200}
          height={160}
        />
        <div
          style={{
            opacity: tag.opacity,
            transform: `translateY(${tag.translateY}px)`,
            marginTop: 10,
            fontFamily: fonts.mono,
            fontSize: 12,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: EDITORIAL.coral,
          }}
        >
          SURFACE RELIEF · 3–6 MM
        </div>
      </div>
    </SectionShell>
  );
};
