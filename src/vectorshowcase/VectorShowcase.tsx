import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { CREAM, FPS, HAIRLINE, INK, LAYOUT, SECTIONS, TOTAL, TYPE, BRAND, fonts } from './theme';
import { prog } from './motion';
import { ShowRoom } from './room/ShowRoom';
import { BuildPanel, RoomPanels } from './text/Panels';
import { Compose } from './text/Compose';
import { ContactCard, OpenTitle } from './text/Brand';

const pad = (n: number) => n.toString().padStart(2, '0');

/** Persistent HUD: corner ticks, brand, section, progress, timecode. */
const HUD: React.FC = () => {
  const f = useCurrentFrame();
  const idx = Math.max(0, SECTIONS.findIndex((s) => f >= s.from && f < s.to));
  const section = SECTIONS[idx] ?? SECTIONS[SECTIONS.length - 1];
  const intro = prog(f, 0, 30);
  const text: React.CSSProperties = { fontFamily: fonts.mono, fontSize: TYPE.hud, fontWeight: 500, letterSpacing: '0.14em', color: INK, whiteSpace: 'nowrap', lineHeight: 1 };
  const secs = Math.floor(f / FPS);
  const tc = `00:${pad(Math.floor(secs / 60))}:${pad(secs % 60)}:${pad(f % FPS)}`;
  const DASHES = 18;
  const filled = (f / TOTAL) * DASHES;
  const S = LAYOUT.hud;
  const line = `2px solid ${HAIRLINE}`;
  const corner = (pos: React.CSSProperties, b: React.CSSProperties) => <div style={{ position: 'absolute', width: 28, height: 28, ...pos, ...b }} />;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: intro }}>
      {corner({ top: 24, left: 24 }, { borderTop: line, borderLeft: line })}
      {corner({ top: 24, right: 24 }, { borderTop: line, borderRight: line })}
      {corner({ bottom: 24, left: 24 }, { borderBottom: line, borderLeft: line })}
      {corner({ bottom: 24, right: 24 }, { borderBottom: line, borderRight: line })}
      <div style={{ position: 'absolute', top: S, left: S + 66, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 14, height: 14, background: BRAND.orange }} />
        <span style={{ ...text, fontWeight: 700 }}>WALL DECORES</span>
      </div>
      <div style={{ position: 'absolute', top: S, right: S + 66, ...text }}>
        <b>{pad(idx + 1)}</b> / {pad(SECTIONS.length)} · {section.id}
      </div>
      <div style={{ position: 'absolute', bottom: S, left: S + 66, ...text, color: 'rgba(23,18,13,0.6)' }}>1920 × 1080 · 60 FPS</div>
      <div style={{ position: 'absolute', bottom: S + 7, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>
        {Array.from({ length: DASHES }, (_, i) => {
          const fill = Math.min(1, Math.max(0, filled - i));
          return (
            <div key={i} style={{ width: 26, height: 6, background: 'rgba(23,18,13,0.14)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: BRAND.orange, transformOrigin: 'left', transform: `scaleX(${fill})` }} />
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', bottom: S, right: S + 66, ...text }}>{tc}</div>
    </AbsoluteFill>
  );
};

/**
 * Static paper grain. Baked to a PNG and tiled rather than an feTurbulence
 * filter: the pattern never moves, but a filter still gets re-rasterized by
 * the renderer on every one of the film's 3,600 frames — a tiled <image>
 * costs that render once, at import, instead of once per frame.
 */
const Grain: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: 0.07 }}>
    <svg width="100%" height="100%">
      <defs>
        <pattern id="vs-grain" patternUnits="userSpaceOnUse" width={256} height={256}>
          <image href={staticFile('weave-noise.png')} x={0} y={0} width={256} height={256} preserveAspectRatio="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#vs-grain)" />
    </svg>
  </AbsoluteFill>
);

/**
 * VectorShowcase — 60s / 60fps / 1920x1080 / silent. Storyboard: STORYBOARD.md
 *
 *  00:00  OPEN      five brand-colour brush strokes, WALL DECORES lettered out of them
 *  00:05  BUILD     the room draws itself in line, floods with colour, furniture lands
 *  00:08  ROOM 01   Terracotta lounge   → Golden Hour Hills
 *  00:15  ROOM 02   Ocean study         → Tide & Coral Sun
 *  00:22  ROOM 03   Emerald library     → Monstera Arch
 *  00:29  ROOM 04   Rose salon          → Lotus Bloom
 *  00:36  ROOM 05   Saffron living      → Deco Sunrise
 *         each room: roller re-colours the wall, gesso covers the old canvas,
 *         the brush paints the new subject, palette + harmony build alongside
 *  00:44  COMPOSE   all five rooms and palettes side by side
 *  00:52  CONTACT   brush wordmark again, contacts
 */
export const VectorShowcase: React.FC = () => (
  <AbsoluteFill style={{ background: CREAM }}>
    <ShowRoom />
    <BuildPanel />
    <RoomPanels />
    <Compose />
    <OpenTitle />
    <ContactCard />
    <Grain />
    <HUD />
  </AbsoluteFill>
);
