import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, T, ease } from '../theme';
import { prog } from '../motion';
import { DrawPath, Layer } from './primitives';
import { CANVAS } from './geometry';

const rectPath = (x: number, y: number, w: number, h: number) => `M${x} ${y} H${x + w} V${y + h} H${x} Z`;

/**
 * The empty canvas arrives in three beats:
 *   1. a dashed pencil outline is measured onto the wall
 *   2. primed canvas fills the outline
 *   3. a walnut float-frame draws around it
 * plus coral dimension lines (the numbers themselves live in the caption
 * zone at full size, never shrunk inside the room).
 */
export const CanvasMount: React.FC = () => {
  const f = useCurrentFrame();
  const { x, y, w, h } = CANVAS;

  const dash = prog(f, T.canvasDash, 50, ease.inOut);
  const dashFade = 1 - prog(f, T.canvasPrime + 10, 20);
  const prime = prog(f, T.canvasPrime, 30);
  const frame = prog(f, T.canvasFrame, 40, ease.inOut);
  const dims = prog(f, T.dimensions, 36, ease.inOut);
  const dimsFade = 1 - prog(f, T.zoomIn[0], 30);

  const shadow = prime * 0.18;

  return (
    <Layer>
      {/* Wall shadow under the canvas */}
      <rect x={x + 6} y={y + 10} width={w} height={h} fill="#000" opacity={shadow} filter="url(#vf-soft)" />
      <defs>
        <filter id="vf-soft" x="-10%" y="-10%" width="120%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* 1. dashed pencil outline */}
      {dash > 0 && dashFade > 0 && (
        <>
          <mask id="vf-dash-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
            <DrawPath d={rectPath(x, y, w, h)} progress={dash} stroke="#fff" width={14} />
          </mask>
          <path
            d={rectPath(x, y, w, h)}
            fill="none"
            stroke={COLORS.ink}
            strokeWidth={2.6}
            strokeDasharray="12 9"
            opacity={dashFade}
            mask="url(#vf-dash-reveal)"
          />
        </>
      )}

      {/* 2. primed canvas */}
      <rect x={x} y={y} width={w} height={h} fill={COLORS.paper} opacity={prime} />

      {/* 3. walnut float frame */}
      <DrawPath d={rectPath(x - 5, y - 5, w + 10, h + 10)} progress={frame} stroke={COLORS.walnut} width={8} cap="square" />

      {/* Dimension lines */}
      <g opacity={dimsFade}>
        <DrawPath d={`M${x} ${y - 32} H${x + w}`} progress={dims} stroke={COLORS.coral} width={2.4} />
        <DrawPath d={`M${x} ${y - 44} V${y - 20}`} progress={dims} stroke={COLORS.coral} width={2.4} />
        <DrawPath d={`M${x + w} ${y - 44} V${y - 20}`} progress={dims} stroke={COLORS.coral} width={2.4} />
        <DrawPath d={`M${x + w + 32} ${y} V${y + h}`} progress={dims} stroke={COLORS.coral} width={2.4} />
        <DrawPath d={`M${x + w + 20} ${y} H${x + w + 44}`} progress={dims} stroke={COLORS.coral} width={2.4} />
        <DrawPath d={`M${x + w + 20} ${y + h} H${x + w + 44}`} progress={dims} stroke={COLORS.coral} width={2.4} />
      </g>
    </Layer>
  );
};
