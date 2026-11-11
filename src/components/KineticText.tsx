import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { ease, FONT_STACK, palette } from '../theme';
import { shutterSamples, velocityOf, samplesFor } from '../lib/motion';

/**
 * Type rising from behind a mask edge.
 *
 * Never a fade. A fade is the tell that something was made in a browser —
 * real title design moves the type and clips it, so it emerges rather than
 * materialising. The rise is motion-blurred from its own curve, which is the
 * part that makes it feel like it has weight.
 */
export const MaskRise: React.FC<{
  children: React.ReactNode;
  start?: number;
  duration?: number;
  color?: string;
  distance?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  start = 0,
  duration = 20,
  color = palette.ink,
  distance = 124,
  style,
}) => {
  const frame = useCurrentFrame();

  const yAt = (f: number) =>
    interpolate(f, [start, start + duration], [distance, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: ease.cinematic,
    });

  const speed = velocityOf(yAt, frame);
  const samples = shutterSamples(frame, Math.min(samplesFor(speed), 6), 0.7);

  return (
    <div style={{ overflow: 'hidden', paddingBottom: '0.08em' }}>
      <div style={{ position: 'relative' }}>
        {/* a spacer holds the line box open so the clip never collapses */}
        <div style={{ visibility: 'hidden', ...style, fontFamily: FONT_STACK }}>
          {children}
        </div>
        {samples.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translateY(${yAt(s.f).toFixed(2)}px)`,
              opacity: s.opacity,
              filter: s.age === 0 ? 'none' : `blur(${(s.age * 0.7).toFixed(2)}px)`,
              color,
              fontFamily: FONT_STACK,
              willChange: 'transform',
              ...style,
            }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * One line rolling up and out while the next rolls up and in, sharing a
 * single clipped track. Two words never coexist, which is what makes it read
 * as a mechanism rather than a crossfade.
 */
export const RollSwap: React.FC<{
  words: string[];
  start?: number;
  hold?: number;
  swap?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ words, start = 0, hold = 40, swap = 12, color = palette.ink, style }) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  const cycle = hold + swap;
  const index = Math.max(0, Math.min(words.length - 1, Math.floor(t / cycle)));
  const local = t - index * cycle;

  const out = interpolate(local, [hold, hold + swap], [0, -108], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.entrance,
  });
  const inc = interpolate(local, [hold, hold + swap], [108, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.entrance,
  });

  const next = words[Math.min(words.length - 1, index + 1)];
  const swapping = local >= hold && index < words.length - 1;

  return (
    <div style={{ overflow: 'hidden', paddingBottom: '0.08em' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ visibility: 'hidden', ...style, fontFamily: FONT_STACK }}>
          {words[0]}
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${out.toFixed(2)}%)`,
            color,
            fontFamily: FONT_STACK,
            ...style,
          }}
        >
          {words[index]}
        </div>
        {swapping && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translateY(${inc.toFixed(2)}%)`,
              color,
              fontFamily: FONT_STACK,
              ...style,
            }}
          >
            {next}
          </div>
        )}
      </div>
    </div>
  );
};

/** A hairline growing outward from its centre. */
export const GrowLine: React.FC<{
  x: number;
  y: number;
  width: number;
  start?: number;
  duration?: number;
  color?: string;
  thickness?: number;
  vertical?: boolean;
}> = ({
  x,
  y,
  width,
  start = 0,
  duration = 16,
  color = palette.gold,
  thickness = 1,
  vertical = false,
}) => {
  const frame = useCurrentFrame();
  const g = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: vertical ? x : x - width / 2,
        top: vertical ? y - width / 2 : y,
        width: vertical ? thickness : width,
        height: vertical ? width : thickness,
        backgroundColor: color,
        transform: vertical ? `scaleY(${g})` : `scaleX(${g})`,
        transformOrigin: '50% 50%',
      }}
    />
  );
};

/**
 * Type revealed left-to-right by a hard clip, the way a title card is
 * painted on. Pairs with a stroke sweeping through the same space.
 */
export const WipeText: React.FC<{
  children: React.ReactNode;
  start?: number;
  duration?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, start = 0, duration = 20, color = palette.ink, style }) => {
  const frame = useCurrentFrame();
  const r = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });
  return (
    <div
      style={{
        clipPath: `inset(-20% ${((1 - r) * 100).toFixed(2)}% -20% 0)`,
        color,
        fontFamily: FONT_STACK,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** A measurement bracket — the drawing-office move that says "made to size". */
export const Dimension: React.FC<{
  x: number;
  y: number;
  length: number;
  label: string;
  vertical?: boolean;
  start?: number;
  duration?: number;
  color?: string;
}> = ({
  x,
  y,
  length,
  label,
  vertical = false,
  start = 0,
  duration = 20,
  color = palette.graphite,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g = spring({
    frame: frame - start,
    fps,
    config: { damping: 18, mass: 0.6, stiffness: 90 },
    durationInFrames: duration,
  });
  const labelOp = interpolate(frame, [start + duration * 0.6, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const tick = 9;
  return (
    <div
      style={{
        position: 'absolute',
        left: vertical ? x : x - length / 2,
        top: vertical ? y - length / 2 : y,
        width: vertical ? 1 : length,
        height: vertical ? length : 1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: color,
          opacity: 0.55,
          transform: vertical ? `scaleY(${g})` : `scaleX(${g})`,
          transformOrigin: '50% 50%',
        }}
      />
      {[0, 1].map((end) => (
        <div
          key={end}
          style={{
            position: 'absolute',
            backgroundColor: color,
            opacity: 0.55 * g,
            ...(vertical
              ? {
                  left: -tick / 2,
                  top: end === 0 ? 0 : length - 1,
                  width: tick,
                  height: 1,
                }
              : {
                  top: -tick / 2,
                  left: end === 0 ? 0 : length - 1,
                  height: tick,
                  width: 1,
                }),
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          ...(vertical
            ? { left: 16, top: length / 2 - 8 }
            : { top: -26, left: length / 2 - 60, width: 120, textAlign: 'center' }),
          fontFamily: FONT_STACK,
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.18em',
          color,
          opacity: labelOp,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
    </div>
  );
};
