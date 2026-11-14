import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { FONT_STACK, INK } from '../theme';

/** Word-by-word rise from behind a clipping edge. Never a bare fade. */
export const Rise: React.FC<{
  text: string;
  size: number;
  delay?: number;
  color?: string;
  weight?: number;
  italic?: boolean;
  tracking?: string;
  align?: 'center' | 'left';
  maxWidth?: number;
  lineHeight?: number;
  shadow?: string;
}> = ({
  text,
  size,
  delay = 0,
  color = INK.warm,
  weight = 700,
  italic = false,
  tracking = '0em',
  align = 'center',
  maxWidth,
  lineHeight = 1.14,
  shadow,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        gap: `${size * 0.12}px ${size * 0.26}px`,
        maxWidth,
        textAlign: align,
      }}
    >
      {words.map((w, i) => {
        const d = delay + i * 2.6;
        const s = spring({ frame: frame - d, fps, config: { damping: 200, mass: 0.6 }, durationInFrames: 26 });
        const ty = interpolate(s, [0, 1], [size * 0.95, 0]);
        const op = interpolate(frame - d, [0, 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', lineHeight }}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${ty.toFixed(2)}px)`,
                opacity: op,
                fontFamily: FONT_STACK,
                fontSize: size,
                fontWeight: weight,
                fontStyle: italic ? 'italic' : 'normal',
                letterSpacing: tracking,
                color,
                whiteSpace: 'pre',
                textShadow: shadow,
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Letter-spaced label that tracks open as it arrives. */
export const Kicker: React.FC<{ text: string; size: number; delay?: number; color?: string }> = ({
  text,
  size,
  delay = 0,
  color = INK.soft,
}) => {
  const f = useCurrentFrame() - delay;
  const op = interpolate(f, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tr = interpolate(f, [0, 24], [0.18, 0.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        fontFamily: FONT_STACK,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: `${tr}em`,
        textTransform: 'uppercase',
        color,
        opacity: op,
        paddingLeft: `${tr}em`,
      }}
    >
      {text}
    </div>
  );
};

/** A colour chip from the palette spec, with its hex and area share. */
export const Swatch: React.FC<{
  hex: string;
  pct: number;
  delay?: number;
  size?: number;
  labelColor?: string;
  ringColor?: string;
}> = ({ hex, pct, delay = 0, size = 120, labelColor, ringColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 15, mass: 0.7, stiffness: 120 }, durationInFrames: 30 });
  const sc = interpolate(s, [0, 1], [0.3, 1]);
  const op = interpolate(frame - delay, [0, 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ transform: `scale(${sc.toFixed(3)})`, opacity: op, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.5,
          background: hex,
          border: `3px solid ${ringColor ?? 'rgba(255,255,255,0.78)'}`,
          boxSizing: 'border-box',
          boxShadow: '0 14px 26px rgba(10,30,30,0.26), inset 0 2px 0 rgba(255,255,255,0.26)',
        }}
      />
      <div style={{ fontFamily: FONT_STACK, fontSize: 15, fontWeight: 700, letterSpacing: '0.08em', color: labelColor ?? INK.warm, opacity: 0.85 }}>
        {hex.toUpperCase()}
      </div>
      <div style={{ fontFamily: FONT_STACK, fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', color: labelColor ?? INK.warm, opacity: 0.6 }}>
        {pct}%
      </div>
    </div>
  );
};
