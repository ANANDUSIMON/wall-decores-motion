import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { ease, FONT_STACK } from '../theme';
import { shutterSamples, velocityOf, BLUR_THRESHOLD, clamp } from '../lib/motion';

type Common = {
  children: string;
  color?: string;
  start?: number;
  duration?: number;
  style?: React.CSSProperties;
};

/**
 * Type that rises into place behind a wiping mask, with motion blur on the
 * travel. Never animates opacity alone — the house rule — so it always reads
 * as a physical move rather than a fade.
 */
export const MaskRise: React.FC<Common & { stagger?: number }> = ({
  children,
  color = '#fff',
  start = 0,
  duration = 18,
  style,
}) => {
  const frame = useCurrentFrame();

  const yAt = (f: number) =>
    interpolate(f, [start, start + duration], [118, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: ease.entrance,
    });

  const v = velocityOf(yAt, frame);
  const n = v > BLUR_THRESHOLD ? Math.round(clamp(v / 10, 2, 7)) : 1;
  const samples = shutterSamples(frame, n, 0.7);

  if (frame < start) return null;

  return (
    <span
      style={{
        display: 'block',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      {samples.map((s, i) => (
        <span
          key={i}
          style={{
            display: 'block',
            position: i === 0 ? 'relative' : 'absolute',
            inset: i === 0 ? undefined : 0,
            fontFamily: FONT_STACK,
            color,
            transform: `translateY(${yAt(s.f).toFixed(2)}px)`,
            opacity: s.opacity,
            mixBlendMode: s.age === 0 ? 'normal' : 'screen',
            filter: s.age === 0 ? 'none' : `blur(${(s.age * 1.6).toFixed(2)}px)`,
            willChange: 'transform',
          }}
        >
          {children}
        </span>
      ))}
    </span>
  );
};

/** A line that swaps for the next with a vertical roll. */
export const RollSwap: React.FC<{
  lines: string[];
  /** frames each line holds before rolling out */
  hold: number;
  start?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ lines, hold, start = 0, color = '#fff', style }) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  const idx = Math.floor(local / hold);
  const within = local - idx * hold;
  const roll = 14;

  if (local < 0 || idx >= lines.length) return null;

  const enter = interpolate(within, [0, roll], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.entrance,
  });
  const exit =
    within > hold - roll
      ? interpolate(within, [hold - roll, hold], [0, -100], {
          extrapolateRight: 'clamp',
          easing: ease.exit,
        })
      : 0;

  return (
    <span
      style={{
        display: 'block',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      <span
        style={{
          display: 'block',
          fontFamily: FONT_STACK,
          color,
          transform: `translateY(${enter + exit}%)`,
          willChange: 'transform',
        }}
      >
        {lines[idx]}
      </span>
    </span>
  );
};

/** Hairline that grows outward from its centre. */
export const GrowLine: React.FC<{
  x: number;
  y: number;
  width: number;
  color?: string;
  start?: number;
  duration?: number;
  thickness?: number;
  vertical?: boolean;
}> = ({
  x,
  y,
  width,
  color = '#fff',
  start = 0,
  duration = 14,
  thickness = 1,
  vertical = false,
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.entrance,
  });
  if (s <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: vertical ? x : x - width / 2,
        top: vertical ? y - width / 2 : y,
        width: vertical ? thickness : width,
        height: vertical ? width : thickness,
        background: color,
        transform: vertical ? `scaleY(${s})` : `scaleX(${s})`,
        transformOrigin: 'center',
        boxShadow: `0 0 12px ${color}`,
      }}
    />
  );
};
