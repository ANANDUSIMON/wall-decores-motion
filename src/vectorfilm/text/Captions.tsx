import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, LAYOUT, PALETTES, TYPE, T, ease, fonts } from '../theme';
import { hold, pop, prog, currentPaletteIndex, lerpHex, paletteState } from '../motion';
import { SCHEDULE } from '../room/strokes';

const mono = (size: number, color: string = COLORS.ink): React.CSSProperties => ({
  fontFamily: fonts.mono,
  fontSize: size,
  color,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1.1,
});

/**
 * Two data columns pinned to the same side margins as the HUD — left column
 * left-aligned, right column right-aligned — so every edge in the frame
 * lines up on one of two verticals.
 */
const DataRow: React.FC<{
  from: number;
  to: number;
  left: { label: string; value: string };
  right: { label: string; value: string };
}> = ({ from, to, left, right }) => {
  const f = useCurrentFrame();
  const o = hold(f, from, to, 20);
  if (o <= 0) return null;
  const rise = (d: number) => (1 - prog(f, from + d, 24)) * 30;
  const col = (side: 'left' | 'right', d: number, c: { label: string; value: string }) => (
    <div
      style={{
        position: 'absolute',
        [side]: LAYOUT.hudSide,
        top: LAYOUT.captionCenterY,
        transform: `translateY(-50%) translateY(${rise(d)}px)`,
        textAlign: side,
        display: 'flex',
        flexDirection: 'column',
        alignItems: side === 'left' ? 'flex-start' : 'flex-end',
        gap: 14,
      }}
    >
      <div style={{ ...mono(26, 'rgba(23,18,13,0.55)'), letterSpacing: '0.16em' }}>{c.label}</div>
      <div style={{ ...mono(TYPE.captionBig), fontWeight: 700, letterSpacing: '-0.01em' }}>{c.value}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {col('left', 0, left)}
      {col('right', 8, right)}
      {/* hairline between the columns and the room window */}
      <div
        style={{
          position: 'absolute',
          left: LAYOUT.hudSide,
          right: LAYOUT.hudSide,
          top: LAYOUT.captionCenterY - 98,
          height: 2,
          background: COLORS.hairline,
          transformOrigin: 'left',
          transform: `scaleX(${prog(f, from, 40, ease.heavy)})`,
        }}
      />
    </AbsoluteFill>
  );
};

/** CANVAS: dimensions count up from zero. */
export const CanvasData: React.FC = () => {
  const f = useCurrentFrame();
  const t = prog(f, T.dimensions, 60, ease.heavy);
  const n = (v: number) => Math.round(v * t);
  return (
    <DataRow
      from={T.dimensions - 20}
      to={T.zoomIn[0] + 10}
      left={{ label: 'Canvas · metric', value: `${n(180)} × ${n(90)} CM` }}
      right={{ label: 'Imperial', value: `${n(72)} × ${n(36)} IN` }}
    />
  );
};

/** PAINT: live brush-stroke counter. */
export const PaintData: React.FC = () => {
  const f = useCurrentFrame();
  const done = SCHEDULE.filter((s) => f >= s.end).length;
  return (
    <DataRow
      from={T.zoomIn[0] + 40}
      to={T.zoomOut[1]}
      left={{ label: 'Brush strokes', value: `${String(done).padStart(2, '0')} / ${SCHEDULE.length}` }}
      right={{ label: 'Medium', value: 'OIL + ACRYLIC' }}
    />
  );
};

/** COLOUR: the active palette as big swatches, centred. */
export const Swatches: React.FC = () => {
  const f = useCurrentFrame();
  const from = T.zoomOut[1] + 10;
  const to = T.shrink[0] + 10;
  const o = hold(f, from, to, 20);
  if (o <= 0) return null;
  const { from: a, to: b, t } = paletteState(f);
  const name = PALETTES[currentPaletteIndex(f)];
  const D = 92;
  const GAP = 30;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: LAYOUT.captionCenterY - 30,
          transform: 'translateY(-50%)',
          display: 'flex',
          justifyContent: 'center',
          gap: GAP,
        }}
      >
        {PALETTES[a].swatches.map((c, i) => {
          const k = pop(f, from + i * 5);
          const squash = 1 - Math.sin(Math.min(1, Math.max(0, t * 1.4 - i * 0.08)) * Math.PI) * 0.5;
          return (
            <div
              key={i}
              style={{
                width: D,
                height: D,
                borderRadius: D,
                background: lerpHex(c, PALETTES[b].swatches[i], t),
                boxShadow: '0 0 0 4px #FBF8F2, 0 10px 24px rgba(23,18,13,0.16)',
                transform: `scale(${k}) scaleX(${squash})`,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: LAYOUT.captionCenterY + 70,
          textAlign: 'center',
          ...mono(TYPE.caption),
          fontWeight: 700,
          letterSpacing: '0.14em',
        }}
      >
        {name.id} · {name.name}
      </div>
    </AbsoluteFill>
  );
};
