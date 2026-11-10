import React, {useMemo} from 'react';

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface BristlePath {
  d: string;
  strokeWidth: number;
  opacity: number;
  dashArray?: string;
}

export function generateBristles(opts: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width?: number;
  count?: number;
  seed?: number;
}): BristlePath[] {
  const {x1, y1, x2, y2, width = 80, count = 60, seed = 42} = opts;
  const rand = mulberry32(seed);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const perpX = Math.cos(angle + Math.PI / 2);
  const perpY = Math.sin(angle + Math.PI / 2);

  return Array.from({length: count}, () => {
    const offset = (rand() - 0.5) * width;
    const wobble1 = (rand() - 0.5) * width * 0.4;
    const wobble2 = (rand() - 0.5) * width * 0.3;
    const sw = 0.4 + rand() * 2.2;
    const op = 0.25 + rand() * 0.75;
    const isDry = rand() < 0.2;

    const sx = x1 + perpX * offset;
    const sy = y1 + perpY * offset;
    const mx = (x1 + x2) / 2 + perpX * (offset + wobble1);
    const my = (y1 + y2) / 2 + perpY * (offset + wobble1);
    const ex = x2 + perpX * (offset + wobble2);
    const ey = y2 + perpY * (offset + wobble2);

    return {
      d: `M${sx.toFixed(1)},${sy.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`,
      strokeWidth: sw,
      opacity: op,
      dashArray: isDry
        ? `${(3 + rand() * 10).toFixed(1)} ${(2 + rand() * 8).toFixed(1)}`
        : undefined,
    };
  });
}

interface BrushStrokeProps {
  color: string;
  progress: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width?: number;
  bristleCount?: number;
  seed?: number;
}

export const BrushStroke: React.FC<BrushStrokeProps> = ({
  color,
  progress,
  x1,
  y1,
  x2,
  y2,
  width = 80,
  bristleCount = 60,
  seed = 42,
}) => {
  const bristles = useMemo(
    () => generateBristles({x1, y1, x2, y2, width, count: bristleCount, seed}),
    [x1, y1, x2, y2, width, bristleCount, seed],
  );

  if (progress <= 0) return null;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const strokeLen = Math.sqrt(dx * dx + dy * dy);
  const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
  const pad = width + 30;
  const revealLen = (strokeLen + 2 * pad) * progress;
  const clipId = `brush-${seed}`;

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={-pad}
            y={-pad}
            width={revealLen}
            height={pad * 2}
            transform={`translate(${x1}, ${y1}) rotate(${angleDeg})`}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {bristles.map((b, i) => (
          <path
            key={i}
            d={b.d}
            stroke={color}
            strokeWidth={b.strokeWidth}
            fill="none"
            opacity={b.opacity}
            strokeLinecap="round"
            strokeDasharray={b.dashArray}
          />
        ))}
      </g>
    </svg>
  );
};
