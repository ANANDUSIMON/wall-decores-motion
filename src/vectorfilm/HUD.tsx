import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, FPS, LAYOUT, SECTIONS, TOTAL, TYPE, fonts } from './theme';
import { prog } from './motion';

const pad = (n: number) => n.toString().padStart(2, '0');

/**
 * Persistent HUD. Sized for a phone screen (24px mono, not 12px) and pinned
 * to the same 64px side margins the data columns use, so the whole frame
 * shares two vertical alignment lines.
 */
export const HUD: React.FC = () => {
  const f = useCurrentFrame();
  const section = SECTIONS.find((s) => f >= s.from && f < s.to) ?? SECTIONS[SECTIONS.length - 1];
  const intro = prog(f, 0, 30);

  const text: React.CSSProperties = {
    fontFamily: fonts.mono,
    fontSize: TYPE.hud,
    fontWeight: 500,
    letterSpacing: '0.14em',
    color: COLORS.ink,
    whiteSpace: 'nowrap',
    lineHeight: 1,
  };

  const secs = Math.floor(f / FPS);
  const tc = `00:${pad(Math.floor(secs / 60))}:${pad(secs % 60)}`;

  const DASHES = 12;
  const filled = (f / TOTAL) * DASHES;

  const S = LAYOUT.hudSide;
  const corner = (pos: React.CSSProperties, b: React.CSSProperties) => (
    <div style={{ position: 'absolute', width: 30, height: 30, ...pos, ...b }} />
  );
  const line = `2px solid ${COLORS.hairline}`;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: intro }}>
      {corner({ top: 30, left: 30 }, { borderTop: line, borderLeft: line })}
      {corner({ top: 30, right: 30 }, { borderTop: line, borderRight: line })}
      {corner({ bottom: 30, left: 30 }, { borderBottom: line, borderLeft: line })}
      {corner({ bottom: 30, right: 30 }, { borderBottom: line, borderRight: line })}

      <div style={{ position: 'absolute', top: LAYOUT.hudTop, left: S, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 16, height: 16, background: COLORS.coral }} />
        <span style={{ ...text, fontWeight: 700 }}>WALL DECORES</span>
      </div>
      <div style={{ position: 'absolute', top: LAYOUT.hudTop, right: S, ...text }}>
        <b>{pad(section.index)}</b> / {pad(SECTIONS.length)} · {section.id}
      </div>

      <div style={{ position: 'absolute', bottom: LAYOUT.hudBottom, left: S, ...text, color: 'rgba(23,18,13,0.6)' }}>60 FPS</div>
      <div style={{ position: 'absolute', bottom: LAYOUT.hudBottom + 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>
        {Array.from({ length: DASHES }, (_, i) => {
          const fill = Math.min(1, Math.max(0, filled - i));
          return (
            <div key={i} style={{ width: 26, height: 6, background: 'rgba(23,18,13,0.14)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: COLORS.coral, transformOrigin: 'left', transform: `scaleX(${fill})` }} />
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', bottom: LAYOUT.hudBottom, right: S, ...text }}>{tc}</div>
    </AbsoluteFill>
  );
};
