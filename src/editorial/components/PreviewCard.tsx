import React from 'react';
import { Img, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { MotionTrail } from '@/lib/onda/primitives';
import { fonts } from '../theme';
import { progressIn } from '../motion';

export type PreviewCardProps = {
  /** file under public/paintings or public/interiors, without extension. */
  src: string;
  /** which public/ subfolder the file lives in. */
  folder?: 'paintings' | 'interiors';
  width: number;
  height: number;
  /** mono label at the top-left corner tag, e.g. "PREVIEW". */
  label?: string;
  /** optional mono caption bar under the card. */
  caption?: string;
  /** local frame this card starts entering. */
  delay?: number;
  /** frames the entrance takes. */
  duration?: number;
  /** horizontal px the card slides in from (negative = from the left). */
  slideFromPx?: number;
  /** degrees the card starts rotated at, settling to 0. */
  rotateFromDeg?: number;
  /** slow continuous zoom drift applied to the image for the card's whole life, `[from, to]`. */
  zoomDrift?: [number, number];
  /** total local frames the card is mounted for — needed to drive `zoomDrift` smoothly. */
  lifeFrames?: number;
  borderColor?: string;
  labelColor?: string;
  background?: string;
};

/**
 * A framed preview card — the artwork always lives inside this frame, never
 * full-bleed. Slide/rotate entrance is wrapped in `MotionTrail` so it leaves
 * a directional ghost; the trail is scoped to the card's own box because the
 * wrapping `div` below is the one CSS `transform` sits on, which gives the
 * nested `AbsoluteFill`-based primitive a sized, positioned containing
 * block instead of the full canvas.
 */
export const PreviewCard: React.FC<PreviewCardProps> = ({
  src,
  folder = 'paintings',
  width,
  height,
  label = 'PREVIEW',
  caption,
  delay = 0,
  duration = 24,
  slideFromPx = 0,
  rotateFromDeg = 0,
  zoomDrift,
  lifeFrames = 200,
  borderColor = 'rgba(23,18,13,0.35)',
  labelColor = '#17120D',
  background = '#FBF9F6',
}) => {
  const frame = useCurrentFrame();
  const t = progressIn(frame, delay, duration);
  const tx = interpolate(t, [0, 1], [slideFromPx, 0]);
  const rotate = interpolate(t, [0, 1], [rotateFromDeg, 0]);
  const opacity = t;

  const zoom = zoomDrift
    ? interpolate(frame - delay, [0, lifeFrames], [zoomDrift[0], zoomDrift[1]], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        opacity,
        transform: `translateX(${tx}px) rotate(${rotate}deg)`,
      }}
    >
      <MotionTrail layers={6} lagInFrames={1} trailOpacity={0.4}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 8,
            border: `1px solid ${borderColor}`,
            background,
            boxShadow: '0 24px 60px rgba(23,18,13,0.18)',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', inset: 10, overflow: 'hidden', borderRadius: 4 }}>
            <Img
              src={staticFile(`${folder}/${src}.png`)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `scale(${zoom})`,
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: labelColor,
            }}
          >
            <CornerTick color={labelColor} />
            <span>{label}</span>
          </div>
        </div>
      </MotionTrail>

      {caption && (
        <div
          style={{
            position: 'absolute',
            top: height + 14,
            left: 0,
            right: 0,
            fontFamily: fonts.mono,
            fontSize: 12,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: labelColor,
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};

const CornerTick: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ width: 5, height: 5, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
);
