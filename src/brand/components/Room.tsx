import React from 'react';
import { Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { type Palette, ROOM_W, ROOM_H, W, H, INTERIOR, CREAM, FONT_STACK, SAFE } from '../theme';

/**
 * Interiors are 1536x1024, scaled to fill 1920 tall they run 2880 wide —
 * 1800px of pan latitude, so the camera lives inside the room instead of
 * letterboxing it. `focus` is 0 (far left wall) to 1 (far right).
 */
const offsetFor = (focusX: number, zoom: number) => {
  const imgW = ROOM_W * zoom;
  const raw = -(focusX * imgW - W / 2);
  const min = -(imgW - W);
  return Math.max(min, Math.min(0, raw));
};
const offsetYFor = (focusY: number, zoom: number) => {
  const imgH = ROOM_H * zoom;
  const raw = -(focusY * imgH - H / 2);
  const min = -(imgH - H);
  return Math.max(min, Math.min(0, raw));
};

export const Interior: React.FC<{
  /** file under public/interiors, without extension */
  src: string;
  focusFrom: number;
  focusTo: number;
  focusY?: number;
  zoomFrom?: number;
  zoomTo?: number;
  dur: number;
  /** the painting's centre, as a fraction of the room photo itself */
  glowAt?: { x: number; y: number };
  glowColor?: string;
  /** fraction of `dur` at which the one-time glow pulse fires */
  glowStart?: number;
}> = ({
  src,
  focusFrom,
  focusTo,
  focusY = 0.5,
  zoomFrom = 1.0,
  zoomTo = 1.08,
  dur,
  glowAt,
  glowColor = '#FFFFFF',
  glowStart = 0.3,
}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const zoom = zoomFrom + (zoomTo - zoomFrom) * t;
  const focus = focusFrom + (focusTo - focusFrom) * t;
  const x = offsetFor(focus, zoom);
  const y = offsetYFor(focusY, zoom);
  const stageW = ROOM_W * zoom;
  const stageH = ROOM_H * zoom;

  const glowFrame = glowStart * dur;
  const glowOp = glowAt
    ? interpolate(f, [glowFrame, glowFrame + 18, glowFrame + 48], [0, 0.5, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: x, top: y, width: stageW, height: stageH }}>
        <Img
          src={staticFile(`interiors/${src}.png`)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {glowAt && (
          <div
            style={{
              position: 'absolute',
              left: `${glowAt.x * 100}%`,
              top: `${glowAt.y * 100}%`,
              width: stageW * 0.46,
              height: stageW * 0.46,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${glowColor} 0%, ${glowColor}00 70%)`,
              opacity: glowOp,
              pointerEvents: 'none',
              mixBlendMode: 'soft-light',
            }}
          />
        )}
      </div>
    </div>
  );
};

/** Walnut panel sliding up with the piece's size and its painting palette. */
export const SizePanel: React.FC<{
  title: string;
  sizeLabel: string;
  pal: Palette;
  delay?: number;
}> = ({ title, sizeLabel, pal, delay = 0 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 18, mass: 0.9, stiffness: 100 }, durationInFrames: 30 });
  const ty = interpolate(s, [0, 1], [160, 0]);
  const op = interpolate(f - delay, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        transform: `translateY(${ty.toFixed(2)}px)`,
        opacity: op,
      }}
    >
      <div style={{ background: `${INTERIOR.walnut}D9`, padding: `36px ${SAFE}px 48px` }}>
        <div style={{ fontFamily: FONT_STACK, fontWeight: 700, fontSize: 34, color: CREAM, marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontFamily: FONT_STACK, fontWeight: 500, fontSize: 22, color: '#E7D9C2', marginBottom: 18 }}>
          {sizeLabel}
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {pal.colors.map((c) => (
            <div key={c} style={{ width: 34, height: 34, borderRadius: 17, background: c, border: '2px solid rgba(255,255,255,0.5)' }} />
          ))}
        </div>
      </div>
    </div>
  );
};
