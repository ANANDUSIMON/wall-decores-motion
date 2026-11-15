import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { BRAND, INK, PAPER, ROOMS, T, ease, fonts, type RoomDef } from '../theme';
import { hexToHsl, lerpHex, pop, prog } from '../motion';
import { PAINTINGS } from '../paint/paintings';
import { PaintedCanvas } from '../paint/PaintedCanvas';

const CW = 320; // card width
const CG = 32; // gap   — 5 x 320 + 4 x 32 = 1728, margins 96
const X0 = 96;

/** A flat elevation of the room: wall, framed painting, sofa, rug. */
const Elevation: React.FC<{ room: RoomDef; i: number; t0: number }> = ({ room, i, t0 }) => {
  const f = useCurrentFrame();
  const wipe = prog(f, t0, 34, ease.paint);
  const art = pop(f, t0 + 26, 14);
  const sofa = pop(f, t0 + 36, 13);
  return (
    <svg width={CW} height={240} viewBox="0 0 320 240" style={{ display: 'block', borderRadius: 18, overflow: 'hidden' }}>
      <defs>
        <clipPath id={`el-wipe-${i}`}>
          <rect x={0} y={0} width={320} height={240 * wipe} />
        </clipPath>
      </defs>
      <rect width={320} height={240} fill={PAPER} />
      <g clipPath={`url(#el-wipe-${i})`}>
        <rect width={320} height={204} fill={room.wall} />
        <rect y={204} width={320} height={36} fill="#A2643B" />
        <rect y={204} width={320} height={4} fill="#83502D" />
      </g>
      {/* painting */}
      <g opacity={Math.min(1, art * 1.4)} transform={`translate(160 74) scale(${0.85 + 0.15 * art}) translate(-160 -74)`}>
        <rect x={56} y={20} width={208} height={108} fill="#000" opacity={0.18} transform="translate(3 5)" />
        <rect x={54} y={18} width={212} height={112} fill={BRAND.gold} />
        <PaintedCanvas painting={PAINTINGS[i]} f={f} uid={`el${i}`} x={58} y={22} w={204} h={102} complete weave={false} />
      </g>
      {/* sofa */}
      <g opacity={Math.min(1, sofa * 1.4)} transform={`translate(0 ${(1 - sofa) * 20})`}>
        <rect x={70} y={160} width={180} height={34} rx={8} fill={room.sofa} />
        <rect x={62} y={176} width={196} height={28} rx={8} fill={room.sofaShade} />
        <rect x={92} y={150} width={30} height={28} rx={6} fill={room.pillow} transform="rotate(-7 107 164)" />
        <rect x={198} y={150} width={30} height={28} rx={6} fill={room.pillow} transform="rotate(7 213 164)" />
        <rect x={40} y={214} width={240} height={14} rx={3} fill={room.rug} />
      </g>
    </svg>
  );
};

const Card: React.FC<{ room: RoomDef; i: number }> = ({ room, i }) => {
  const f = useCurrentFrame();
  const t0 = T.compose[0] + 44 + i * 14;
  const up = prog(f, t0, 40, ease.heavy);
  const txt = prog(f, t0 + 40, 30);
  return (
    <div style={{ position: 'absolute', left: X0 + i * (CW + CG), top: 336, width: CW, opacity: up, transform: `translateY(${(1 - up) * 80}px)` }}>
      <Elevation room={room} i={i} t0={t0 + 6} />
      <div style={{ marginTop: 26, opacity: txt, transform: `translateY(${(1 - txt) * 16}px)` }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 18, fontWeight: 700, letterSpacing: '0.14em', color: lerpHex(room.wall, '#000000', 0.15) }}>ROOM 0{room.id}</div>
        <div style={{ fontFamily: fonts.sans, fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', color: INK, marginTop: 10, whiteSpace: 'nowrap' }}>{room.fullName}</div>
        <div style={{ fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 32, color: 'rgba(23,18,13,0.8)', marginTop: 4, whiteSpace: 'nowrap' }}>{room.subject}</div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        {room.swatches.map((s, k) => {
          const p = pop(f, t0 + 56 + k * 5, 12);
          return (
            <div
              key={k}
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                background: s.hex,
                transform: `scale(${p})`,
                boxShadow: hexToHsl(s.hex).l > 0.85 ? 'inset 0 0 0 2px rgba(23,18,13,0.15)' : 'none',
              }}
            />
          );
        })}
      </div>
      <div style={{ marginTop: 18, fontFamily: fonts.mono, fontSize: 18, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(23,18,13,0.6)', opacity: prog(f, t0 + 84, 24), whiteSpace: 'nowrap' }}>
        {room.harmony}
      </div>
    </div>
  );
};

/** 00:44–00:52 — every room and its palette, side by side. */
export const Compose: React.FC = () => {
  const f = useCurrentFrame();
  const [s, e] = T.compose;
  if (f < s || f > e) return null;
  const out = prog(f, e - 34, 34, ease.exit);
  const head = prog(f, s + 20, 34, ease.heavy);
  const line = prog(f, s + 180, 60, ease.inOut);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div style={{ position: 'absolute', left: X0, top: 120, fontFamily: fonts.mono, fontSize: 22, fontWeight: 700, letterSpacing: '0.14em', color: INK, opacity: head }}>
        COLOUR COMPOSITION · ROOM ↔ PAINTING
      </div>
      <div style={{ position: 'absolute', left: X0, top: 160, display: 'flex', alignItems: 'baseline', gap: 26, overflow: 'hidden', paddingBottom: 10 }}>
        <span style={{ fontFamily: fonts.sans, fontWeight: 800, fontSize: 84, letterSpacing: '-0.035em', color: INK, transform: `translateY(${(1 - head) * 110}%)`, display: 'inline-block' }}>
          Five rooms.
        </span>
        <span style={{ fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 92, color: BRAND.orange, transform: `translateY(${(1 - prog(f, s + 30, 34, ease.heavy)) * 110}%)`, display: 'inline-block' }}>
          five palettes.
        </span>
      </div>
      {ROOMS.map((r, i) => (
        <Card key={r.id} room={r} i={i} />
      ))}
      {/* gold thread tying the five together */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <path d={`M${X0} 912 H${X0 + 5 * CW + 4 * CG}`} stroke={BRAND.gold} strokeWidth={4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - line} fill="none" />
        {ROOMS.map((r, i) => {
          const k = pop(f, s + 190 + i * 10, 11);
          return <circle key={r.id} cx={X0 + i * (CW + CG) + CW / 2} cy={912} r={11 * k} fill={r.wall} stroke={PAPER} strokeWidth={4} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
