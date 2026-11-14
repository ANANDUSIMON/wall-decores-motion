import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { EDITORIAL, FPS, SECTIONS, TOTAL, fonts, lineColorFor, textColorFor } from './theme';

const CORNER_INSET = 56;
const TEXT_INSET = 96;
const DASH_COUNT = 14;

const findSection = (frame: number) =>
  SECTIONS.find((s) => frame >= s.from && frame < s.from + s.durationInFrames) ?? SECTIONS[SECTIONS.length - 1];

const timecode = (frame: number, fps: number): string => {
  const totalSeconds = Math.floor(frame / fps);
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
};

type Corner = 'tl' | 'tr' | 'bl' | 'br';

const CORNER_STYLE = (corner: Corner, color: string): React.CSSProperties => {
  const base: React.CSSProperties = { position: 'absolute', width: 22, height: 22 };
  switch (corner) {
    case 'tl':
      return { ...base, top: CORNER_INSET, left: CORNER_INSET, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` };
    case 'tr':
      return { ...base, top: CORNER_INSET, right: CORNER_INSET, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` };
    case 'bl':
      return { ...base, bottom: CORNER_INSET, left: CORNER_INSET, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` };
    case 'br':
      return { ...base, bottom: CORNER_INSET, right: CORNER_INSET, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` };
  }
};

/**
 * The persistent HUD scaffold — mounted once at the top of `BrandReel`, never
 * unmounted, so the timecode and progress bar stay continuous across all
 * 3000 frames regardless of which section is underneath. Colour auto-inverts
 * off the current section's background (`theme.textColorFor`).
 */
export const HUD: React.FC = () => {
  const frame = useCurrentFrame();
  const section = findSection(frame);
  const ink = textColorFor(section.background);
  const line = lineColorFor(section.background);

  const mono: React.CSSProperties = {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: ink,
    whiteSpace: 'nowrap',
  };

  const progress = Math.min(1, Math.max(0, frame / TOTAL));
  const filled = Math.round(progress * DASH_COUNT);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={CORNER_STYLE('tl', line)} />
      <div style={CORNER_STYLE('tr', line)} />
      <div style={CORNER_STYLE('bl', line)} />
      <div style={CORNER_STYLE('br', line)} />

      <div style={{ position: 'absolute', top: TEXT_INSET, left: TEXT_INSET, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 7, height: 7, background: EDITORIAL.coral }} />
        <span style={mono}>WALL DECORES · ARTISAN · COLLECTIVES</span>
      </div>

      <div style={{ position: 'absolute', top: TEXT_INSET, right: TEXT_INSET }}>
        <span style={mono}>{String(section.index).padStart(2, '0')} / 08 · {section.label}</span>
      </div>

      <div style={{ position: 'absolute', bottom: TEXT_INSET, left: TEXT_INSET }}>
        <span style={mono}>1080×1920 · 60 FPS</span>
      </div>

      <div style={{ position: 'absolute', bottom: TEXT_INSET, right: TEXT_INSET }}>
        <span style={mono}>{timecode(frame, FPS)}</span>
      </div>

      <div style={{ position: 'absolute', bottom: TEXT_INSET, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
        {Array.from({ length: DASH_COUNT }).map((_, i) => (
          <div key={i} style={{ width: 14, height: 2, background: i < filled ? EDITORIAL.coral : line }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
