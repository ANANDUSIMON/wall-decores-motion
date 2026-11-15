import React from 'react';
import { useCurrentFrame } from 'remotion';
import { DrawPath, Layer } from '../../vectorfilm/room/primitives';
import {
  BW,
  CANVAS,
  CANVAS_CENTER,
  COVE,
  CURTAIN_FOLDS,
  CURTAINS,
  FLOOR_BOARDS,
  FLOOR_SEAMS,
  PLANES,
  SLAT_PANEL,
  SLATS,
  STRUCTURE_LINES,
  WINDOW,
  WINDOW_MULLIONS,
  floorPt,
} from '../../vectorfilm/room/geometry';
import { BRAND, HAIRLINE, INK, LAYOUT, MAT, PAPER, T, ease } from '../theme';
import { dressAt, lerp, lerpHex, pop, prog } from '../motion';
import { PAINTINGS } from '../paint/paintings';
import { PaintedCanvas } from '../paint/PaintedCanvas';
import { BrushGraphic, PaintingBrush } from '../paint/Brush';
import { getLength } from '@remotion/paths';
import { pointAt, tangentAt, zigzag } from '../paint/kit';

type D = ReturnType<typeof dressAt>;

/* ------------------------------------------------------------------ */
/* Structure: line-work draws, colour floods in, walls re-colour.       */
/* ------------------------------------------------------------------ */
const Structure: React.FC<{ f: number; d: D }> = ({ f, d }) => {
  const lineAt = (i: number, dur = 24, step = 5) => prog(f, T.lines + i * step, dur, ease.inOut);
  const fill = (delay: number) => prog(f, T.fill + delay, 30, ease.type);
  const inkOpacity = 1 - 0.72 * prog(f, T.fill + 34, 36);
  const glow = prog(f, T.lamps + 30, 40);
  const settled = (k: number) => fill(k) > 0.5;
  const slatLine = lerpHex(d.trim, '#000000', 0.28);

  // The roller sweeps left → right across the back wall
  const rollX = BW.x0 + (BW.x1 - BW.x0) * d.roll;

  return (
    <Layer>
      <defs>
        <filter id="vs-cove-glow" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <linearGradient id="vs-window" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor={MAT.sky} />
        </linearGradient>
        <linearGradient id="vs-wallshade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.06" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.1" />
        </linearGradient>
        <clipPath id="vs-roll-clip">
          <rect x={BW.x0} y={BW.y0} width={Math.max(0, rollX - BW.x0)} height={BW.y1 - BW.y0} />
        </clipPath>
      </defs>

      <path d={PLANES.ceiling} fill={d.ceiling} opacity={fill(0)} />
      <path d={PLANES.left} fill={d.wallSide} opacity={fill(6)} />
      <path d={PLANES.right} fill={d.wallSide} opacity={fill(6)} />
      {/* back wall: old colour underneath, new colour rolled on over it */}
      <path d={PLANES.back} fill={d.prevWall} opacity={fill(12)} />
      <path d={PLANES.back} fill={d.wall} opacity={fill(12)} clipPath="url(#vs-roll-clip)" />
      <path d={PLANES.back} fill="url(#vs-wallshade)" opacity={fill(12)} />
      <path d={PLANES.floor} fill={MAT.floor} opacity={fill(18)} />
      <path d={WINDOW} fill="url(#vs-window)" opacity={fill(24)} />
      {CURTAINS.map((p, i) => (
        <path key={i} d={p} fill={d.curtain} opacity={fill(30) * 0.95} />
      ))}
      <path d={SLAT_PANEL} fill={d.trim} opacity={fill(30)} />

      {FLOOR_BOARDS.map((p, i) => (
        <DrawPath key={`fb${i}`} d={p} progress={lineAt(5 + i * 0.5, 28, 5)} stroke={settled(18) ? MAT.floorLine : INK} width={2.2} opacity={settled(18) ? 0.85 : inkOpacity} />
      ))}
      {FLOOR_SEAMS.map((p, i) => (
        <DrawPath key={`fs${i}`} d={p} progress={lineAt(10 + i, 24, 5)} stroke={settled(18) ? MAT.floorLine : INK} width={1.6} opacity={settled(18) ? 0.6 : inkOpacity} />
      ))}
      {SLATS.map((sl, i) => (
        <DrawPath key={`sl${i}`} d={sl.d} progress={lineAt(16 + i * 0.4, 20, 5)} stroke={settled(30) ? slatLine : INK} width={settled(30) ? sl.w * 1.6 : 1.8} opacity={settled(30) ? 1 : inkOpacity} cap="butt" />
      ))}
      {WINDOW_MULLIONS.map((p, i) => (
        <DrawPath key={`wm${i}`} d={p} progress={lineAt(14 + i, 18, 5)} stroke={settled(24) ? MAT.vase : INK} width={settled(24) ? 4 : 1.8} opacity={settled(24) ? 1 : inkOpacity} />
      ))}
      {CURTAIN_FOLDS.map((p, i) => (
        <DrawPath key={`cf${i}`} d={p} progress={prog(f, T.fill + 34 + i * 3, 20)} stroke={lerpHex(d.curtain, '#000000', 0.15)} width={1.6} opacity={0.8} />
      ))}

      {STRUCTURE_LINES.map((p, i) => (
        <DrawPath key={`st${i}`} d={p} progress={lineAt(i, i === 0 ? 36 : 26)} stroke={INK} width={2.6} opacity={inkOpacity} />
      ))}
      <DrawPath d={WINDOW} progress={lineAt(12, 28)} stroke={INK} width={2} opacity={inkOpacity} />
      <DrawPath d={COVE} progress={lineAt(14, 28)} stroke={INK} width={2} opacity={inkOpacity * (1 - glow)} />
      <g opacity={glow}>
        <path d={COVE} fill="none" stroke={MAT.glow} strokeWidth={16} filter="url(#vs-cove-glow)" />
        <path d={COVE} fill="none" stroke="#FFFFFF" strokeWidth={3} />
      </g>

      {/* Paint roller — wet edge + roller + handle, only while rolling */}
      {d.i >= 0 && d.roll > 0 && d.roll < 1 && (
        <g>
          <rect x={rollX - 6} y={BW.y0} width={6} height={BW.y1 - BW.y0} fill={lerpHex(d.wall, '#ffffff', 0.25)} opacity={0.6} />
          <rect x={rollX - 4} y={BW.y0 + 6} width={30} height={BW.y1 - BW.y0 - 12} rx={14} fill={lerpHex(d.wall, '#000000', 0.08)} />
          <rect x={rollX + 2} y={BW.y0 + 6} width={8} height={BW.y1 - BW.y0 - 12} rx={4} fill={lerpHex(d.wall, '#ffffff', 0.35)} />
          <path d={`M${rollX + 11} ${(BW.y0 + BW.y1) / 2} H${rollX + 64} L${rollX + 104} ${(BW.y0 + BW.y1) / 2 + 250}`} fill="none" stroke="#9C9488" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
          <path d={`M${rollX + 104} ${(BW.y0 + BW.y1) / 2 + 250} L${rollX + 132} ${(BW.y0 + BW.y1) / 2 + 440}`} stroke={INK} strokeWidth={20} strokeLinecap="round" />
        </g>
      )}
    </Layer>
  );
};

/* ------------------------------------------------------------------ */
/* Furniture — drops in during BUILD, re-tints with each room.          */
/* ------------------------------------------------------------------ */
const Drop: React.FC<{ f: number; start: number; ax: number; ay: number; lift?: number; children: React.ReactNode }> = ({ f, start, ax, ay, lift = 70, children }) => {
  if (f < start) return null;
  const p = pop(f, start);
  return (
    <g opacity={Math.min(1, (f - start) / 6)} transform={`translate(${ax} ${ay + (1 - p) * -lift}) scale(${0.82 + 0.18 * p}) translate(${-ax} ${-ay})`}>
      {children}
    </g>
  );
};

const leaf = (x: number, y: number, deg: number, len: number, wid: number) => {
  const a = (deg * Math.PI) / 180;
  const tx = x + Math.cos(a) * len;
  const ty = y + Math.sin(a) * len;
  const nx = -Math.sin(a) * wid;
  const ny = Math.cos(a) * wid;
  const mx = (x + tx) / 2;
  const my = (y + ty) / 2;
  return `M${x} ${y} Q${mx + nx} ${my + ny} ${tx} ${ty} Q${mx - nx} ${my - ny} ${x} ${y} Z`;
};

const Furniture: React.FC<{ f: number; d: D }> = ({ f, d }) => {
  const s = T.furniture;
  const r0 = floorPt(-270, 0.8);
  const r1 = floorPt(270, 0.8);
  const r2 = floorPt(290, 0.97);
  const r3 = floorPt(-290, 0.97);
  const rugD = `M${r0.x} ${r0.y} L${r1.x} ${r1.y} L${r2.x} ${r2.y} L${r3.x} ${r3.y} Z`;
  const lampOn = prog(f, T.lamps + 30, 40);
  const lamps = [
    { x: 226, top: 100, bottom: 430, r: 25, start: T.lamps },
    { x: 262, top: 76, bottom: 382, r: 19, start: T.lamps + 8 },
  ];
  const rugEdge = lerpHex(d.rug, '#000000', 0.18);

  return (
    <Layer>
      <defs>
        <radialGradient id="vs-lamp-glow">
          <stop offset="0" stopColor={MAT.glow} stopOpacity="0.95" />
          <stop offset="1" stopColor={MAT.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vs-seat" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={d.sofa} />
          <stop offset="1" stopColor={d.sofaShade} />
        </linearGradient>
      </defs>

      <Drop f={f} start={s} ax={500} ay={930} lift={30}>
        <path d={rugD} fill={d.rug} opacity={0.9} />
        <path d={rugD} fill="none" stroke={rugEdge} strokeWidth={6} />
        <path d={rugD} fill="none" stroke={MAT.vase} strokeOpacity={0.55} strokeWidth={2} transform="translate(0 -3)" />
      </Drop>

      <Drop f={f} start={s + 12} ax={500} ay={815}>
        <ellipse cx={500} cy={818} rx={240} ry={10} fill="#000" opacity={0.14} />
        <rect x={275} y={788} width={450} height={26} rx={6} fill={MAT.walnut} />
        <rect x={300} y={640} width={400} height={106} rx={16} fill={d.sofa} />
        <rect x={285} y={718} width={430} height={74} rx={14} fill="url(#vs-seat)" />
        <rect x={266} y={688} width={44} height={110} rx={14} fill={d.sofa} />
        <rect x={690} y={688} width={44} height={110} rx={14} fill={d.sofa} />
        <line x1={500} y1={722} x2={500} y2={790} stroke={d.sofaShade} strokeWidth={3} />
      </Drop>

      <Drop f={f} start={s + 30} ax={360} ay={718} lift={50}>
        <rect x={328} y={652} width={66} height={66} rx={12} fill={d.pillow} transform="rotate(-7 361 685)" />
      </Drop>
      <Drop f={f} start={s + 36} ax={640} ay={718} lift={50}>
        <rect x={606} y={652} width={66} height={66} rx={12} fill={d.pillow} transform="rotate(7 639 685)" />
      </Drop>
      <Drop f={f} start={s + 40} ax={500} ay={718} lift={50}>
        <rect x={470} y={668} width={60} height={50} rx={10} fill={d.rug} />
      </Drop>

      <Drop f={f} start={s + 50} ax={500} ay={905}>
        <ellipse cx={500} cy={908} rx={112} ry={12} fill="#000" opacity={0.15} />
        <rect x={392} y={880} width={216} height={22} rx={4} fill={MAT.walnut} />
        <ellipse cx={500} cy={880} rx={118} ry={24} fill={MAT.walnutLight} />
        <ellipse cx={468} cy={858} rx={15} ry={20} fill={MAT.vase} />
        <rect x={512} y={866} width={46} height={9} rx={2} fill={d.pillow} />
        <rect x={516} y={858} width={38} height={8} rx={2} fill={BRAND.gold} />
      </Drop>

      <Drop f={f} start={s + 64} ax={888} ay={985}>
        {[-150, -128, -105, -86, -66, -45, -118, -96].map((a, i) => (
          <path key={i} d={leaf(888, 905, a, 120 + (i % 3) * 26, 26)} fill={i % 2 ? MAT.leafLight : MAT.leaf} />
        ))}
        <path d="M852 902 Q846 958 868 986 H908 Q930 958 924 902 Z" fill={MAT.vase} />
        <path d="M852 902 H924" stroke="#D9D2C6" strokeWidth={3} />
      </Drop>

      {lamps.map((l, i) => {
        const cord = prog(f, l.start, 24);
        if (cord <= 0) return null;
        const y = l.top + (l.bottom - l.top) * cord;
        return (
          <g key={i}>
            <circle cx={l.x} cy={y + l.r} r={l.r * 3.4} fill="url(#vs-lamp-glow)" opacity={lampOn} />
            <DrawPath d={`M${l.x} ${l.top} L${l.x} ${l.bottom}`} progress={cord} stroke={INK} width={2} />
            <rect x={l.x - 7} y={y - 8} width={14} height={10} rx={2} fill={MAT.brass} />
            <circle cx={l.x} cy={y + l.r} r={l.r} fill={lampOn > 0.5 ? '#FFF8E7' : '#E9E2D6'} />
            <path d={`M${l.x - l.r} ${y + l.r} A${l.r} ${l.r} 0 0 1 ${l.x + l.r} ${y + l.r}`} fill={MAT.brass} />
          </g>
        );
      })}
    </Layer>
  );
};

/* ------------------------------------------------------------------ */
/* Canvas: measured during BUILD, gessoed + repainted in every room.    */
/* ------------------------------------------------------------------ */
const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y} H${x + w} V${y + h} H${x} Z`;
const GESSO = zigzag(-30, 830, 30, 370, 4);
const GESSO_LEN = getLength(GESSO);

const Canvas: React.FC<{ f: number; d: D }> = ({ f, d }) => {
  const { x, y, w, h } = CANVAS;
  const dash = prog(f, T.canvasDash, 44, ease.inOut);
  const dashFade = 1 - prog(f, T.canvasPrime + 10, 18);
  const prime = prog(f, T.canvasPrime, 26);
  const frame = prog(f, T.canvasPrime + 20, 34, ease.inOut);

  const i = d.i;
  const l = d.l;
  const gesso = i >= 1 ? prog(l, T.prime[0], T.prime[1] - T.prime[0], ease.paint) : 1;
  const showOld = i >= 1 && gesso < 1;

  // Picture light: on when a painting is finished, off for the next gesso
  const lightOn = i < 0 ? 0 : prog(l, T.lightOn, 24) * (i === 4 ? 1 : 1 - prog(l, T.roomLen - 14, 14));
  const lightPrev = i >= 1 ? 1 - prog(l, 0, 14) : 0;
  const light = Math.max(lightOn, lightPrev);
  const barOn = prog(f, T.canvasPrime + 40, 24);

  // Gesso brush position
  const gLen = GESSO_LEN;
  const gPt = pointAt(GESSO, Math.max(1, gesso * gLen));
  const gTg = tangentAt(GESSO, Math.max(1, gesso * gLen));

  return (
    <Layer>
      <defs>
        <filter id="vs-soft" x="-10%" y="-10%" width="120%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <linearGradient id="vs-cone" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FFF4D6" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FFF4D6" stopOpacity="0" />
        </linearGradient>
        <mask id="vs-gesso-mask" maskUnits="userSpaceOnUse" x={-100} y={-100} width={1000} height={600}>
          <path d={GESSO} pathLength={1} fill="none" stroke="#fff" strokeWidth={120} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset={1 - gesso} />
        </mask>
      </defs>

      <rect x={x + 6} y={y + 10} width={w} height={h} fill="#000" opacity={prime * 0.2} filter="url(#vs-soft)" />

      {dash > 0 && dashFade > 0 && (
        <path d={rect(x, y, w, h)} fill="none" stroke={INK} strokeWidth={2.6} strokeDasharray="12 9" opacity={dashFade * Math.min(1, dash * 3)} />
      )}
      <rect x={x} y={y} width={w} height={h} fill={PAPER} opacity={prime} />

      {/* the previous room's painting, until the gesso covers it */}
      {showOld && <PaintedCanvas painting={PAINTINGS[i - 1]} f={f} uid={`old${i}`} x={x} y={y} w={w} h={h} complete />}
      {showOld && (
        <svg x={x} y={y} width={w} height={h} viewBox="0 0 800 400" overflow="hidden">
          <rect x={0} y={0} width={800} height={400} fill={PAPER} mask="url(#vs-gesso-mask)" />
        </svg>
      )}

      {/* the new painting */}
      {i >= 0 && <PaintedCanvas painting={PAINTINGS[i]} f={f} uid={`p${i}`} x={x} y={y} w={w} h={h} />}

      {/* gold float frame */}
      <DrawPath d={rect(x - 6, y - 6, w + 12, h + 12)} progress={frame} stroke={BRAND.gold} width={7} cap="square" />
      <DrawPath d={rect(x - 11, y - 11, w + 22, h + 22)} progress={frame} stroke={lerpHex(BRAND.gold, '#000000', 0.35)} width={2} cap="square" />

      {/* picture light */}
      <g opacity={barOn}>
        <path d={`M${x + 120} ${y - 34} L${x + w - 120} ${y - 34} L${x + w + 30} ${y + h} L${x - 30} ${y + h} Z`} fill="url(#vs-cone)" opacity={light * 0.45} style={{ mixBlendMode: 'screen' }} />
        <rect x={x + 120} y={y - 44} width={w - 240} height={14} rx={7} fill={MAT.brass} />
        <rect x={x + 196} y={y - 30} width={8} height={18} fill={MAT.brass} />
        <rect x={x + 120} y={y - 33} width={w - 240} height={3} fill="#FFF4D6" opacity={light} />
      </g>

      {/* gesso brush */}
      {showOld && (
        <svg x={x} y={y} width={w} height={h} viewBox="0 0 800 400" overflow="visible">
          <BrushGraphic x={gPt.x} y={gPt.y} color={PAPER} tilt={Math.atan2(gTg.y, gTg.x) * (180 / Math.PI)} lift={gesso < 0.04 ? 1 - gesso / 0.04 : 0} />
        </svg>
      )}

      {i >= 0 && <PaintingBrush painting={PAINTINGS[i]} f={f} x={x} y={y} w={w} h={h} />}
    </Layer>
  );
};

/* ------------------------------------------------------------------ */
/* Camera + viewport                                                    */
/* ------------------------------------------------------------------ */
export const ShowRoom: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.viewportIn || f > T.compose[0] + 60) return null;
  const d = dressAt(f);

  const v = LAYOUT.viewport;
  const enter = prog(f, T.viewportIn, 34, ease.heavy);
  const exit = prog(f, T.compose[0] - 6, 50, ease.inOut);

  const z = d.i < 0 ? 0 : prog(d.l, T.zoomIn[0], T.zoomIn[1], ease.inOut) - prog(d.l, T.zoomOut[0], T.zoomOut[1], ease.inOut);
  const size = v.size;
  const u = size / 1000;
  const cx = CANVAS_CENTER.x * u;
  const cy = CANVAS_CENTER.y * u;
  const s = lerp(1, 1.5, z);
  const tx = lerp(cx, size / 2, z);
  const ty = lerp(cy, size / 2, z);

  // gentle hand-held drift so the frame is never fully static
  const driftX = Math.sin(f / 90) * 4;
  const driftY = Math.cos(f / 110) * 3;

  return (
    <div
      style={{
        position: 'absolute',
        left: v.x,
        top: v.y,
        width: size,
        height: size,
        borderRadius: 28,
        overflow: 'hidden',
        background: PAPER,
        boxShadow: `0 0 0 2px ${HAIRLINE}, 0 30px 70px rgba(23,18,13,${0.12 * enter})`,
        opacity: enter * (1 - exit),
        transform: `translateY(${exit * 40}px) scale(${(0.94 + 0.06 * enter) * (1 - 0.12 * exit)})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: '0 0',
          transform: `translate(${tx + driftX}px, ${ty + driftY}px) scale(${s * 1.02}) translate(${-cx}px, ${-cy}px)`,
        }}
      >
        <Structure f={f} d={d} />
        <Furniture f={f} d={d} />
        <Canvas f={f} d={d} />
      </div>
    </div>
  );
};
