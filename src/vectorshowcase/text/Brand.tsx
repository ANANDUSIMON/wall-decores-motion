import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { getLength } from '@remotion/paths';
import { BRAND, INK, PAPER, T, TYPE, ease, fonts } from '../theme';
import { lerpHex, pop, prog, seeded } from '../motion';
import { BrushGraphic } from '../paint/Brush';
import { pointAt, tangentAt } from '../paint/kit';

/**
 * Sign-painter wordmark: five loaded brushes lay a band of the brand colours
 * (alternating direction, like a real painter working back and forth), then
 * WALL DECORES is lettered out of it in paper-white, a gold flick underlines
 * it and paint flecks settle. Used for the open and the sign-off.
 */
const BAND = [
  { c: BRAND.gold, y: -104 },
  { c: BRAND.emerald, y: -52 },
  { c: BRAND.orange, y: 0 },
  { c: BRAND.rose, y: 52 },
  { c: BRAND.sky, y: 104 },
];

const strokeD = (y: number, i: number, half: number) => {
  const dir = i % 2 === 0 ? 1 : -1;
  const x0 = -half * dir;
  const x1 = half * dir;
  const wob = i % 2 === 0 ? 14 : -12;
  return `M${x0} ${y + wob * 0.4} C ${x0 * 0.35} ${y - wob} ${x1 * 0.35} ${y + wob} ${x1} ${y - wob * 0.3}`;
};

export const BrushWordmark: React.FC<{ start: number; cx: number; cy: number; scale?: number; out?: number }> = ({ start, cx, cy, scale = 1, out = 0 }) => {
  const f = useCurrentFrame();
  const half = 760;
  const per = 18;
  const strokes = useMemo(
    () =>
      BAND.map((b, i) => {
        const d = strokeD(b.y, i, half);
        return { ...b, d, len: getLength(d), s: start + 6 + i * (per + 3) };
      }),
    [start],
  );
  const flecks = useMemo(() => {
    const rnd = seeded(77);
    return Array.from({ length: 40 }, (_, i) => ({
      x: (rnd() - 0.5) * 1700,
      y: (rnd() - 0.5) * 420,
      r: 2 + rnd() * 6,
      c: BAND[i % 5].c,
      at: start + 120 + Math.floor(rnd() * 40),
    })).filter((d) => Math.abs(d.y) > 150 || Math.abs(d.x) > 800);
  }, [start]);

  const bandDone = strokes[strokes.length - 1].s + per;
  const flick = 'M-560 196 C -300 214 120 176 600 192';
  const flickP = prog(f, bandDone + 46, 26, ease.paint);
  const flickLen = useMemo(() => getLength(flick), []);

  // brush cursor
  let brush: React.ReactNode = null;
  const active = strokes.find((s) => f >= s.s - 3 && f <= s.s + per);
  if (active) {
    const p = prog(f, active.s, per, ease.paint);
    const L = Math.max(1, p * active.len);
    const pt = pointAt(active.d, L);
    const tg = tangentAt(active.d, L);
    brush = <BrushGraphic x={pt.x} y={pt.y} color={active.c} tilt={Math.atan2(tg.y, tg.x) * 57.3} scale={1.5} lift={f < active.s ? 1 : 0} />;
  } else if (flickP > 0 && flickP < 1) {
    const L = Math.max(1, flickP * flickLen);
    const pt = pointAt(flick, L);
    brush = <BrushGraphic x={pt.x} y={pt.y} color={BRAND.gold} tilt={0} scale={1.1} />;
  }

  const letters = BRAND.name.split('');
  const letterStart = bandDone + 4;

  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 50}px)` }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <filter id="bw-rough" x="-5%" y="-30%" width="110%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
          <g filter="url(#bw-rough)">
            {strokes.map((s, i) => {
              const p = prog(f, s.s, per, ease.paint);
              if (p <= 0) return null;
              const common = { pathLength: 1, fill: 'none', strokeLinecap: 'round' as const, strokeDasharray: '1 1', strokeDashoffset: 1 - p };
              return (
                <g key={i}>
                  <path d={s.d} {...common} stroke={s.c} strokeWidth={66} />
                  {[-22, -9, 6, 19].map((o, k) => (
                    <path key={k} d={s.d} {...common} stroke={lerpHex(s.c, k % 2 ? '#000000' : '#ffffff', 0.22)} strokeWidth={3 + (k % 2)} opacity={0.5} transform={`translate(0 ${o})`} />
                  ))}
                </g>
              );
            })}
            {flickP > 0 && (
              <path d={flick} pathLength={1} fill="none" stroke={BRAND.gold} strokeWidth={12} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - flickP} />
            )}
            {flecks.map((d, i) => {
              const k = pop(f, d.at, 10);
              return k > 0.01 ? <circle key={i} cx={d.x} cy={d.y} r={d.r * k} fill={d.c} /> : null;
            })}
          </g>
          {brush}
        </g>
      </svg>

      {/* lettering — paper-white, cut out of the paint band */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: cy,
          transform: `translateY(-50%) scale(${scale})`,
          display: 'flex',
          justifyContent: 'center',
          fontFamily: fonts.sans,
          fontWeight: 900,
          fontSize: TYPE.wordmark,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          whiteSpace: 'pre',
          color: PAPER,
          textShadow: '0 6px 0 rgba(23,18,13,0.18)',
        }}
      >
        {letters.map((ch, i) => {
          const p = prog(f, letterStart + i * 3, 22, ease.heavy);
          return (
            <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: 6, width: ch === ' ' ? '0.3em' : undefined }}>
              <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)` }}>{ch}</span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Line: React.FC<{ y: number; p: number; children: React.ReactNode; style: React.CSSProperties }> = ({ y, p, children, style }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 24}px)`, ...style }}>{children}</div>
);

/** 00:00–00:05 — the brand is painted on. */
export const OpenTitle: React.FC = () => {
  const f = useCurrentFrame();
  if (f > T.open[1] + 10) return null;
  const out = prog(f, T.open[1] - 44, 44, ease.exit);
  return (
    <AbsoluteFill>
      <BrushWordmark start={6} cx={960} cy={440} out={out} />
      <Line y={700} p={prog(f, 176, 30) * (1 - out)} style={{ fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 72, color: INK }}>
        {BRAND.tagline}
      </Line>
      <Line y={800} p={prog(f, 200, 30) * (1 - out)} style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 24, letterSpacing: '0.2em', color: 'rgba(23,18,13,0.7)' }}>
        HAND-PAINTED WALL ART · KERALA
      </Line>
    </AbsoluteFill>
  );
};

/** 00:52–01:00 — sign-off with contacts. */
export const ContactCard: React.FC = () => {
  const f = useCurrentFrame();
  const s = T.contact[0];
  if (f < s) return null;
  const a = (k: number) => prog(f, s + k, 30);
  const contact: React.CSSProperties = { fontFamily: fonts.mono, fontWeight: 700, fontSize: 34, letterSpacing: '0.14em', color: INK };
  return (
    <AbsoluteFill>
      <BrushWordmark start={s + 4} cx={960} cy={360} scale={0.86} />
      <Line y={566} p={a(170)} style={{ fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 64, color: INK }}>
        {BRAND.tagline}
      </Line>
      <div style={{ position: 'absolute', left: 560, width: 800, top: 672, height: 3, background: INK, transformOrigin: 'center', transform: `scaleX(${prog(f, s + 190, 36, ease.heavy)})` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 712, display: 'flex', justifyContent: 'center', gap: 64 }}>
        {[BRAND.web, BRAND.ig, BRAND.phone].map((t, i) => {
          const p = a(214 + i * 10);
          return (
            <div key={t} style={{ ...contact, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
              {t}
            </div>
          );
        })}
      </div>
      <Line y={818} p={a(262)} style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 24, letterSpacing: '0.2em', color: BRAND.orange }}>
        PAINTINGS COMPOSED FOR YOUR ROOM · FOR DESIGNERS & ARCHITECTS
      </Line>
    </AbsoluteFill>
  );
};
