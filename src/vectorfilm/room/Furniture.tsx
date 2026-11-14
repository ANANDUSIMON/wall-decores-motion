import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, T } from '../theme';
import { pop, prog, roleColor } from '../motion';
import { DrawPath, Layer } from './primitives';
import { floorPt } from './geometry';

/** Drops a piece into place from above with a springy settle, anchored at
 *  its base so it "lands" on the floor. */
const Drop: React.FC<{ start: number; ax: number; ay: number; lift?: number; children: React.ReactNode }> = ({
  start,
  ax,
  ay,
  lift = 70,
  children,
}) => {
  const f = useCurrentFrame();
  const p = pop(f, start);
  if (f < start) return null;
  const y = (1 - p) * -lift;
  const sc = 0.82 + 0.18 * p;
  return (
    <g
      opacity={Math.min(1, (f - start) / 6)}
      transform={`translate(${ax} ${ay + y}) scale(${sc}) translate(${-ax} ${-ay})`}
    >
      {children}
    </g>
  );
};

const leaf = (x: number, y: number, angleDeg: number, len: number, wid: number) => {
  const a = (angleDeg * Math.PI) / 180;
  const tx = x + Math.cos(a) * len;
  const ty = y + Math.sin(a) * len;
  const nx = -Math.sin(a) * wid;
  const ny = Math.cos(a) * wid;
  const mx = (x + tx) / 2;
  const my = (y + ty) / 2;
  return `M${x} ${y} Q${mx + nx} ${my + ny} ${tx} ${ty} Q${mx - nx} ${my - ny} ${x} ${y} Z`;
};

export const Furniture: React.FC = () => {
  const f = useCurrentFrame();
  const s = T.furnitureStart;
  const pillow = roleColor(f, 'field');
  const rug = roleColor(f, 'light');

  // Rug in true floor perspective
  const r0 = floorPt(-270, 0.8);
  const r1 = floorPt(270, 0.8);
  const r2 = floorPt(290, 0.97);
  const r3 = floorPt(-290, 0.97);
  const rugD = `M${r0.x} ${r0.y} L${r1.x} ${r1.y} L${r2.x} ${r2.y} L${r3.x} ${r3.y} Z`;

  const lamps = [
    { x: 226, top: 100, bottom: 430, r: 25, start: T.lampsStart },
    { x: 262, top: 76, bottom: 382, r: 19, start: T.lampsStart + 10 },
  ];
  const lampOn = prog(f, T.lampsStart + 40, 40);

  return (
    <Layer>
      <defs>
        <radialGradient id="vf-lamp-glow">
          <stop offset="0" stopColor={COLORS.glow} stopOpacity="0.95" />
          <stop offset="1" stopColor={COLORS.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vf-seat" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={COLORS.sofa} />
          <stop offset="1" stopColor={COLORS.sofaShade} />
        </linearGradient>
      </defs>

      {/* Rug */}
      <Drop start={s} ax={500} ay={930} lift={30}>
        <path d={rugD} fill={rug} opacity={0.7} />
        <path d={rugD} fill="none" stroke={COLORS.vase} strokeOpacity={0.5} strokeWidth={3} />
      </Drop>

      {/* Sofa */}
      <Drop start={s + 14} ax={500} ay={815}>
        <ellipse cx={500} cy={818} rx={240} ry={10} fill="#000" opacity={0.12} />
        <rect x={275} y={788} width={450} height={26} rx={6} fill={COLORS.walnut} />
        <rect x={300} y={640} width={400} height={106} rx={16} fill={COLORS.sofa} />
        <rect x={285} y={718} width={430} height={74} rx={14} fill="url(#vf-seat)" />
        <rect x={266} y={688} width={44} height={110} rx={14} fill={COLORS.sofa} />
        <rect x={690} y={688} width={44} height={110} rx={14} fill={COLORS.sofa} />
        <line x1={500} y1={722} x2={500} y2={790} stroke={COLORS.sofaShade} strokeWidth={3} />
      </Drop>

      {/* Pillows — they take the painting's field colour, so they re-tint in the palette section */}
      <Drop start={s + 34} ax={360} ay={718} lift={50}>
        <rect x={328} y={652} width={66} height={66} rx={12} fill={pillow} transform="rotate(-7 361 685)" />
      </Drop>
      <Drop start={s + 40} ax={640} ay={718} lift={50}>
        <rect x={606} y={652} width={66} height={66} rx={12} fill={pillow} transform="rotate(7 639 685)" />
      </Drop>

      {/* Coffee table + objects */}
      <Drop start={s + 56} ax={500} ay={905}>
        <ellipse cx={500} cy={908} rx={112} ry={12} fill="#000" opacity={0.15} />
        <rect x={392} y={880} width={216} height={22} rx={4} fill={COLORS.walnut} />
        <ellipse cx={500} cy={880} rx={118} ry={24} fill={COLORS.walnutLight} />
        <ellipse cx={468} cy={858} rx={15} ry={20} fill={COLORS.vase} />
        <rect x={512} y={866} width={46} height={9} rx={2} fill={COLORS.sofa} />
        <rect x={516} y={858} width={38} height={8} rx={2} fill={COLORS.gold} />
      </Drop>

      {/* Plant */}
      <Drop start={s + 74} ax={888} ay={985}>
        {[-150, -128, -105, -86, -66, -45, -118, -96].map((a, i) => (
          <path
            key={i}
            d={leaf(888, 905, a, 120 + (i % 3) * 26, 26)}
            fill={i % 2 ? COLORS.leafLight : COLORS.leaf}
          />
        ))}
        <path d="M852 902 Q846 958 868 986 H908 Q930 958 924 902 Z" fill={COLORS.vase} />
        <path d="M852 902 H924" stroke="#D9D2C6" strokeWidth={3} />
      </Drop>

      {/* Pendant lamps: cord extends from the ceiling, then the light turns on */}
      {lamps.map((l, i) => {
        const cord = prog(f, l.start, 26);
        if (cord <= 0) return null;
        const y = l.top + (l.bottom - l.top) * cord;
        return (
          <g key={i}>
            <circle cx={l.x} cy={y + l.r} r={l.r * 3.4} fill="url(#vf-lamp-glow)" opacity={lampOn} />
            <DrawPath d={`M${l.x} ${l.top} L${l.x} ${l.bottom}`} progress={cord} stroke={COLORS.ink} width={2} />
            <rect x={l.x - 7} y={y - 8} width={14} height={10} rx={2} fill={COLORS.brass} />
            <circle cx={l.x} cy={y + l.r} r={l.r} fill={lampOn > 0.5 ? '#FFF8E7' : '#E9E2D6'} />
            <path d={`M${l.x - l.r} ${y + l.r} A${l.r} ${l.r} 0 0 1 ${l.x + l.r} ${y + l.r}`} fill={COLORS.brass} />
          </g>
        );
      })}
    </Layer>
  );
};
