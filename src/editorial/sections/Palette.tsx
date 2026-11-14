import React from 'react';
import { useCurrentFrame } from 'remotion';
import { PAL, type Palette } from '../../brand/theme';
import { SectionShell } from '../components/SectionShell';
import { EditorialHeadline } from '../components/EditorialHeadline';
import { SwatchRow, type Swatch } from '../components/SwatchRow';
import { EDITORIAL, SAFE, fonts, textColorFor } from '../theme';
import { riseIn } from '../motion';

const toSwatches = (palette: Palette): Swatch[] => palette.colors.map((hex, i) => ({ hex, percent: palette.area[i] }));

const ROWS: { name: string; swatches: Swatch[] }[] = [
  { name: `P12 · ${PAL.coralJade.name}`, swatches: toSwatches(PAL.coralJade) },
  { name: `P01 · ${PAL.celestialCoral.name}`, swatches: toSwatches(PAL.celestialCoral) },
  { name: `P02 · ${PAL.lotusLagoon.name}`, swatches: toSwatches(PAL.lotusLagoon) },
];

/** 05 PALETTE (420f, paper) — headline + three staggered swatch rows
 * pulled from the brand palette library, labels always ink. */
export const PaletteSection: React.FC = () => {
  const frame = useCurrentFrame();
  const ink = textColorFor(EDITORIAL.paper);
  const footer = riseIn(frame, 340, 14, 10);

  return (
    <SectionShell background={EDITORIAL.paper} prevBackground={EDITORIAL.ink}>
      <div style={{ position: 'absolute', top: 160, left: SAFE, width: 860, height: 200 }}>
        <EditorialHeadline
          segments={[
            { text: 'Colour, composed', style: 'bold' },
            { text: 'for your light.', style: 'italic', color: EDITORIAL.coral },
          ]}
          delay={10}
          fontSize={86}
          color={ink}
          maxWidth={840}
        />
      </div>

      <div style={{ position: 'absolute', top: 460, left: SAFE, display: 'flex', flexDirection: 'column', gap: 70 }}>
        {ROWS.map((row, i) => (
          <SwatchRow key={row.name} name={row.name} swatches={row.swatches} delay={100 + i * 40} color={ink} width={900} />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 180,
          left: SAFE,
          opacity: footer.opacity,
          transform: `translateY(${footer.translateY}px)`,
          fontFamily: fonts.mono,
          fontSize: 14,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: ink,
        }}
      >
        12 PALETTES · COMPOSED PER COMMISSION
      </div>
    </SectionShell>
  );
};
