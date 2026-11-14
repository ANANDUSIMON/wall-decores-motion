import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CountUp } from '@/components/onda/count-up/CountUp';
import { fonts } from '../theme';
import { riseIn, progressIn } from '../motion';

export type SpecRowProps = {
  label: string;
  /** rendered after the count-up value, e.g. "CM" or "CM EA (72 × 30 IN)". */
  suffix?: string;
  from?: number;
  to: number;
  delay?: number;
  duration?: number;
  color: string;
  ruleColor?: string;
  width?: number;
};

/**
 * Mono label left, count-up value right, a thin rule drawing in between.
 * Thin wrapper around the Onda `CountUp` primitive — `placement` is left
 * unset so it stays a pass-through inline element inside this row's own
 * flex layout rather than escaping to an absolute canvas position.
 */
export const SpecRow: React.FC<SpecRowProps> = ({
  label,
  suffix = '',
  from = 0,
  to,
  delay = 0,
  duration = 36,
  color,
  ruleColor,
  width = 820,
}) => {
  const frame = useCurrentFrame();
  const { opacity, translateY } = riseIn(frame, delay, 14, 12);
  const ruleProgress = progressIn(frame, delay, 18);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        width,
        fontFamily: fonts.mono,
        color,
      }}
    >
      <span style={{ fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      <div
        style={{
          flex: 1,
          margin: '0 16px',
          borderBottom: `1px solid ${ruleColor ?? color}`,
          opacity: 0.3,
          transform: `scaleX(${ruleProgress})`,
          transformOrigin: 'left',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 20, fontWeight: 700 }}>
        <CountUp
          kind="count-up"
          from={from}
          to={to}
          delay={delay}
          duration={duration}
          decimals={0}
          prefix=""
          suffix=""
          color={color}
          fontSize={20}
          fontFamily={fonts.mono}
          fontWeight={700}
          align="right"
        />
        {suffix && <span style={{ fontSize: 13, letterSpacing: '0.06em' }}>{suffix}</span>}
      </div>
    </div>
  );
};
