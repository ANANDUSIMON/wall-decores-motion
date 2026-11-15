import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { BRAND, FONT, TYPE, ease, W, H, sec } from '../theme';

/**
 * BrushIntro — frames 0-360 (6 seconds at 60fps).
 *
 * Gold brush strokes sweep across a cream background,
 * revealing "WALL DECORES" and the tagline.
 */

/** A single animated brush stroke (SVG path with dashoffset reveal). */
const BrushStroke: React.FC<{
  d: string;
  color: string;
  strokeWidth: number;
  startFrame: number;
  duration: number;
  pathLength: number;
}> = ({ d, color, strokeWidth, startFrame, duration, pathLength }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.brush,
  });

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={pathLength}
      strokeDashoffset={pathLength * (1 - progress)}
      opacity={interpolate(progress, [0, 0.05], [0, 1], { extrapolateRight: 'clamp' })}
    />
  );
};

/** Animated text that fades and slides in. */
const RevealText: React.FC<{
  children: string;
  style: React.CSSProperties;
  startFrame: number;
  duration?: number;
}> = ({ children, style, startFrame, duration = 40 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  const { from: sFrom, to: sTo } = sec('INTRO');
  const exitStart = sTo - 50;
  const exitProgress = interpolate(frame, [exitStart, sTo], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.exit,
  });

  return (
    <div
      style={{
        ...style,
        fontFamily: FONT,
        color: BRAND.ink,
        opacity: progress * exitProgress,
        transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
};

export const BrushIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { from, to } = sec('INTRO');

  // Background fade in
  const bgOpacity = interpolate(frame, [from, from + 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: BRAND.cream, opacity: bgOpacity }}>
      {/* Brush strokes — decorative gold strokes */}
      <AbsoluteFill>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Large sweeping stroke across top */}
          <BrushStroke
            d="M -50,280 C 300,250 600,320 960,270 C 1300,220 1600,300 1970,260"
            color={BRAND.gold}
            strokeWidth={80}
            startFrame={20}
            duration={90}
            pathLength={2100}
          />
          {/* Second stroke, thinner, lower */}
          <BrushStroke
            d="M -50,360 C 400,340 700,380 960,350 C 1200,320 1500,370 1970,340"
            color="#D4A84A"
            strokeWidth={40}
            startFrame={50}
            duration={80}
            pathLength={2100}
          />
          {/* Third stroke, accent */}
          <BrushStroke
            d="M -50,420 C 350,410 800,440 1200,400 C 1500,380 1700,420 1970,395"
            color="#E0C080"
            strokeWidth={20}
            startFrame={80}
            duration={70}
            pathLength={2100}
          />

          {/* Bottom decorative strokes */}
          <BrushStroke
            d="M -50,750 C 400,770 800,730 1200,760 C 1500,780 1700,740 1970,755"
            color={BRAND.gold}
            strokeWidth={60}
            startFrame={60}
            duration={90}
            pathLength={2100}
          />
          <BrushStroke
            d="M -50,810 C 300,800 600,830 960,800 C 1300,775 1600,820 1970,800"
            color="#D4A84A"
            strokeWidth={25}
            startFrame={90}
            duration={70}
            pathLength={2100}
          />
        </svg>
      </AbsoluteFill>

      {/* Brand name */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <RevealText
          startFrame={100}
          duration={50}
          style={{
            ...TYPE.brand,
            textAlign: 'center',
          }}
        >
          {BRAND.name}
        </RevealText>

        {/* Thin gold line */}
        <div
          style={{
            width: interpolate(frame, [160, 220], [0, 300], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: ease.cinematic,
            }),
            height: 2,
            background: BRAND.gold,
            margin: '20px 0',
            opacity: interpolate(frame, [160, 180], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        />

        <RevealText
          startFrame={180}
          duration={45}
          style={{
            ...TYPE.tagline,
            textAlign: 'center',
            color: '#8E857A',
            textTransform: 'uppercase',
          }}
        >
          {BRAND.sub}
        </RevealText>
      </AbsoluteFill>

      {/* Subtle film grain */}
      <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: 0.04 }}>
        <svg width="100%" height="100%">
          <filter id="sc-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="5" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#sc-grain)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
