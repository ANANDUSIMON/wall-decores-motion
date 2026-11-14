import React from 'react';

/** A full-size SVG layer in room space (1000 x 1000 units). Layers stack so
 *  each can be wrapped independently (e.g. motion blur only on furniture). */
export const Layer: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg
    viewBox="0 0 1000 1000"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', ...style }}
  >
    {children}
  </svg>
);

/**
 * Path that "draws itself" — progress 0→1 reveals the stroke along its length.
 * Uses pathLength=1 so no length measuring is needed.
 */
export const DrawPath: React.FC<{
  d: string;
  progress: number;
  stroke: string;
  width: number;
  opacity?: number;
  cap?: 'round' | 'butt' | 'square';
  transform?: string;
}> = ({ d, progress, stroke, width, opacity = 1, cap = 'round', transform }) => {
  if (progress <= 0) return null;
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap={cap}
      strokeLinejoin="round"
      strokeDasharray="1 1"
      strokeDashoffset={1 - Math.min(1, progress)}
      opacity={opacity}
      transform={transform}
    />
  );
};
