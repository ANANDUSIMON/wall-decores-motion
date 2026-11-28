import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { BeatCue } from './types';
import { FPS, px } from './timeline';
import { interFontFamily, serifFontFamily } from './fonts';

const ease = Easing.bezier(0.22, 1, 0.36, 1); // brand default
const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

const LEFT = px(84);
const MAX_WIDTH = px(846);
const KICKER_Y = px(1226);
const KICKER_H = px(54);
const RULE_Y = px(1302);
const RULE_H = px(4);
const RULE_W = px(72);
const HEADLINE_Y = px(1326);
const HEADLINE_LINE_HEIGHT = px(80);

const FADE_IN = 0.3; // s
const FADE_OUT = 0.3; // s
const RULE_GROW = 0.5; // s

/** Black gradient, y 980->1920 in the 1080x1920 authoring frame, exponent 1.25. */
export const BottomScrim: React.FC<{ strength?: number }> = ({ strength = 1 }) => {
  const steps = 6;
  const stops = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const y = px(980 + t * (1920 - 980));
    const opacity = 0.8 * strength * t ** 1.25;
    return `rgba(0,0,0,${Math.min(opacity, 1).toFixed(3)}) ${y}px`;
  }).join(', ');
  return <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${stops})` }} />;
};

export const TextBands: React.FC<{ beat: BeatCue | null }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  if (!beat || t < beat.in - FADE_IN || t > beat.out + FADE_OUT) return null;

  const inOpacity = interpolate(t, [beat.in, beat.in + FADE_IN], [0, 1], { ...clamp, easing: ease });
  const outOpacity = interpolate(t, [beat.out, beat.out + FADE_OUT], [1, 0], { ...clamp, easing: ease });
  const groupOpacity = Math.min(inOpacity, outOpacity);
  const rise = (1 - inOpacity) * px(14);

  const ruleWidth = interpolate(t, [beat.in, beat.in + RULE_GROW], [0, RULE_W], { ...clamp, easing: ease });

  const line2In = beat.in + beat.line2Delay;
  const line2Opacity = interpolate(t, [line2In, line2In + FADE_IN], [0, 1], { ...clamp, easing: ease });
  const line2Rise = (1 - line2Opacity) * px(14);

  return (
    <AbsoluteFill style={{ opacity: groupOpacity }}>
      <div
        style={{
          position: 'absolute',
          left: LEFT,
          top: KICKER_Y,
          height: KICKER_H,
          maxWidth: MAX_WIDTH,
          display: 'inline-flex',
          alignItems: 'center',
          padding: `0 ${px(18)}px`,
          borderRadius: KICKER_H / 2,
          background: 'rgba(10,20,22,0.75)',
          border: `${px(2)}px solid rgba(88,222,212,0.55)`,
          transform: `translateY(${rise}px)`,
        }}
      >
        <span
          style={{
            fontFamily: interFontFamily,
            fontWeight: 600,
            fontSize: px(27),
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#58DED4',
            whiteSpace: 'nowrap',
          }}
        >
          {beat.kicker}
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: LEFT,
          top: RULE_Y,
          width: ruleWidth,
          height: RULE_H,
          background: '#F6A058',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: LEFT,
          top: HEADLINE_Y,
          maxWidth: MAX_WIDTH,
          fontFamily: serifFontFamily,
          fontStyle: 'italic',
          fontSize: px(70),
          lineHeight: `${HEADLINE_LINE_HEIGHT}px`,
          color: '#FFFFFF',
          textShadow: `0 0 ${px(14)}px #063432`,
        }}
      >
        <div style={{ opacity: inOpacity, transform: `translateY(${rise}px)` }}>{beat.lines[0]}</div>
        <div style={{ opacity: line2Opacity, transform: `translateY(${line2Rise}px)` }}>{beat.lines[1]}</div>
      </div>
    </AbsoluteFill>
  );
};

export const activeBeat = (beats: BeatCue[], t: number, fadeOut = FADE_OUT): BeatCue | null =>
  beats.find((b) => t >= b.in - FADE_IN && t <= b.out + fadeOut) ?? null;
