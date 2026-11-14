import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { SectionShell } from '../components/SectionShell';
import { EditorialHeadline } from '../components/EditorialHeadline';
import { PreviewCard } from '../components/PreviewCard';
import { EDITORIAL, SAFE, fonts, textColorFor } from '../theme';

const CYCLE = 160;
const FADE = 24;

const CARDS = [
  { src: '01_entrance', caption: 'LIVING FEATURE · 180×90 CM' },
  { src: '02_sofa', caption: 'SOFA WALL · VERTICAL PANEL' },
  { src: '04_pooja_wall', caption: 'POOJA WALL · 100×100 CM' },
];

/** Fades a window in over `FADE` frames, holds, fades out over the last
 * `FADE` frames of its own `CYCLE`-length slot. */
const windowOpacity = (frame: number, start: number): number => {
  const local = frame - start;
  const fadeIn = interpolate(local, [0, FADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(local, [CYCLE - FADE, CYCLE], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return Math.min(fadeIn, fadeOut);
};

/** 07 SPACE (480f, ink) — headline, three interior preview cards cycling
 * 160f each with cross-fade + slide, each carrying a mono caption bar. */
export const Space: React.FC = () => {
  const frame = useCurrentFrame();
  const ink = textColorFor(EDITORIAL.ink);

  return (
    <SectionShell background={EDITORIAL.ink} prevBackground={EDITORIAL.cream}>
      <div style={{ position: 'absolute', top: 140, left: SAFE, width: 700, height: 160 }}>
        <EditorialHeadline segments={[{ text: 'In the room.', style: 'bold' }]} delay={10} fontSize={92} color={ink} maxWidth={680} />
      </div>

      <div style={{ position: 'absolute', top: 440, left: SAFE }}>
        {CARDS.map((card, i) => {
          const start = i * CYCLE;
          const opacity = windowOpacity(frame, start);
          if (opacity <= 0) return null;
          return (
            <div key={card.src} style={{ position: 'absolute', top: 0, left: 0, opacity }}>
              <PreviewCard
                src={card.src}
                folder="interiors"
                width={920}
                height={1100}
                delay={start}
                duration={26}
                slideFromPx={-220}
                zoomDrift={[1, 1.04]}
                lifeFrames={CYCLE}
                borderColor="rgba(243,239,233,0.25)"
                labelColor={EDITORIAL.cream}
                background="#1F1A13"
                caption={card.caption}
              />
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 180,
          left: SAFE,
          fontFamily: fonts.mono,
          fontSize: 14,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: ink,
          opacity: 0.6,
        }}
      >
        REAL ROOMS · REAL COMMISSIONS
      </div>
    </SectionShell>
  );
};
