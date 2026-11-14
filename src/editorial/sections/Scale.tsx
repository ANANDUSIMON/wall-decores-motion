import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DrawOn } from '@/components/onda/draw-on/DrawOn';
import { SectionShell } from '../components/SectionShell';
import { EditorialHeadline } from '../components/EditorialHeadline';
import { SpecRow } from '../components/SpecRow';
import { EDITORIAL, SAFE, fonts, textColorFor } from '../theme';
import { riseIn } from '../motion';

const ROWS = [
  { label: 'STATEMENT LOTUS', to: 180, suffix: '× 90 CM (72 × 36 IN)' },
  { label: 'SQUARE HERO', to: 100, suffix: '× 100 CM (40 × 40 IN)' },
  { label: 'ENTRY DIPTYCH', to: 180, suffix: '× 75 CM EA (72 × 30 IN)' },
];

/** A 1px human-silhouette capsule beside a proportional canvas rectangle,
 * both drawn on with `draw-on` — a quick scale reference, not a diagram
 * library. */
const ScaleDiagram: React.FC<{ color: string; delay: number }> = ({ color, delay }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 36 }}>
    <DrawOn
      kind="draw-on"
      d="M20 2 A18 18 0 0 1 38 20 L38 140 A18 18 0 0 1 20 158 A18 18 0 0 1 2 140 L2 20 A18 18 0 0 1 20 2 Z"
      delay={delay}
      duration={26}
      stroke={color}
      strokeWidth={2}
      viewBox="0 0 40 160"
      width={40}
      height={160}
    />
    <DrawOn
      kind="draw-on"
      d="M2 2 L158 2 L158 82 L2 82 Z"
      delay={delay + 10}
      duration={26}
      stroke={color}
      strokeWidth={2}
      viewBox="0 0 160 84"
      width={160}
      height={84}
    />
  </div>
);

/** 06 SCALE (360f, cream) — headline, three count-up spec rows, a tiny
 * scale-reference diagram beside the first row. */
export const Scale: React.FC = () => {
  const frame = useCurrentFrame();
  const ink = textColorFor(EDITORIAL.cream);
  const footer = riseIn(frame, 300, 14, 10);

  return (
    <SectionShell background={EDITORIAL.cream} prevBackground={EDITORIAL.paper}>
      <div style={{ position: 'absolute', top: 180, left: SAFE, width: 700, height: 160 }}>
        <EditorialHeadline segments={[{ text: 'Made to your wall.', style: 'bold' }]} delay={10} fontSize={92} color={ink} maxWidth={680} />
      </div>

      <div style={{ position: 'absolute', top: 460, left: SAFE, display: 'flex', flexDirection: 'column', gap: 54 }}>
        {ROWS.map((row, i) => (
          <SpecRow key={row.label} label={row.label} to={row.to} suffix={row.suffix} delay={80 + i * 24} color={ink} width={840} />
        ))}
      </div>

      <div style={{ position: 'absolute', top: 760, left: SAFE + 60 }}>
        <ScaleDiagram color={EDITORIAL.gold} delay={130} />
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
        CUSTOM DIMENSIONS ON REQUEST
      </div>
    </SectionShell>
  );
};
