import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, T, ease } from '../theme';
import { prog } from '../motion';
import { DrawPath, Layer } from './primitives';
import {
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
} from './geometry';

/**
 * The room is built in two passes, like an architect's drawing becoming a
 * render:
 *   1. ink line-work draws itself (walls → floor boards → window → slats)
 *   2. flat colour floods each plane, and the line-work settles back to a
 *      quiet hairline so it reads as finished vector illustration.
 */
export const RoomStructure: React.FC = () => {
  const f = useCurrentFrame();

  const s = T.structureStart;
  const lineAt = (i: number, dur = 26, step = 7) => prog(f, s + i * step, dur, ease.inOut);

  const fill = (delay: number) => prog(f, T.fillStart + delay, 34, ease.type);
  // Ink line-work fades from full ink to a hairline once colour arrives.
  const inkOpacity = 1 - 0.72 * prog(f, T.fillStart + 40, 40);
  const ink = COLORS.ink;

  const glow = prog(f, T.lampsStart + 40, 40);

  return (
    <Layer>
      <defs>
        <filter id="vf-cove-glow" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <linearGradient id="vf-window-light" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor={COLORS.sky} />
        </linearGradient>
      </defs>

      {/* --- Pass 2: flat colour planes (drawn under the line-work) --- */}
      <path d={PLANES.ceiling} fill={COLORS.ceiling} opacity={fill(0)} />
      <path d={PLANES.left} fill={COLORS.wallSide} opacity={fill(6)} />
      <path d={PLANES.right} fill={COLORS.wallSide} opacity={fill(6)} />
      <path d={PLANES.back} fill={COLORS.wall} opacity={fill(12)} />
      <path d={PLANES.floor} fill={COLORS.floor} opacity={fill(18)} />
      <path d={WINDOW} fill="url(#vf-window-light)" opacity={fill(24)} />
      {CURTAINS.map((d, i) => (
        <path key={i} d={d} fill={COLORS.curtain} opacity={fill(30) * 0.92} />
      ))}
      <path d={SLAT_PANEL} fill={COLORS.walnutLight} opacity={fill(30)} />

      {/* Floor board lines + slats become part of the coloured surface */}
      {FLOOR_BOARDS.map((d, i) => (
        <DrawPath key={`fb${i}`} d={d} progress={lineAt(5 + i * 0.5, 30, 6)} stroke={fill(18) > 0.5 ? COLORS.floorLine : ink} width={2.2} opacity={fill(18) > 0.5 ? 0.85 : inkOpacity} />
      ))}
      {FLOOR_SEAMS.map((d, i) => (
        <DrawPath key={`fs${i}`} d={d} progress={lineAt(10 + i, 26, 6)} stroke={fill(18) > 0.5 ? COLORS.floorLine : ink} width={1.6} opacity={fill(18) > 0.5 ? 0.6 : inkOpacity} />
      ))}
      {SLATS.map((sl, i) => (
        <DrawPath key={`sl${i}`} d={sl.d} progress={lineAt(16 + i * 0.4, 22, 6)} stroke={fill(30) > 0.5 ? COLORS.walnut : ink} width={fill(30) > 0.5 ? sl.w * 1.6 : 1.8} opacity={fill(30) > 0.5 ? 1 : inkOpacity} cap="butt" />
      ))}
      {WINDOW_MULLIONS.map((d, i) => (
        <DrawPath key={`wm${i}`} d={d} progress={lineAt(14 + i, 20, 6)} stroke={fill(24) > 0.5 ? COLORS.vase : ink} width={fill(24) > 0.5 ? 4 : 1.8} opacity={fill(24) > 0.5 ? 1 : inkOpacity} />
      ))}
      {CURTAIN_FOLDS.map((d, i) => (
        <DrawPath key={`cf${i}`} d={d} progress={prog(f, T.fillStart + 34 + i * 3, 22)} stroke="#B5A48B" width={1.6} opacity={0.8} />
      ))}

      {/* --- Pass 1: architectural line-work --- */}
      {STRUCTURE_LINES.map((d, i) => (
        <DrawPath key={`st${i}`} d={d} progress={lineAt(i, i === 0 ? 40 : 28)} stroke={ink} width={2.6} opacity={inkOpacity} />
      ))}
      <DrawPath d={WINDOW} progress={lineAt(12, 30)} stroke={ink} width={2} opacity={inkOpacity} />
      <DrawPath d={COVE} progress={lineAt(14, 30)} stroke={ink} width={2} opacity={inkOpacity * (1 - glow)} />

      {/* Cove light switches on with the lamps */}
      <g opacity={glow}>
        <path d={COVE} fill="none" stroke={COLORS.glow} strokeWidth={16} filter="url(#vf-cove-glow)" />
        <path d={COVE} fill="none" stroke="#FFFFFF" strokeWidth={3} />
      </g>
    </Layer>
  );
};
