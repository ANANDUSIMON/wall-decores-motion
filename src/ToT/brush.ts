// Brush-stroke clip paths. Each stroke is a horizontal band whose leading edge is
// broken into bristle tips of different lengths, so the reveal reads as wet paint
// being dragged left → right rather than a straight wipe.

const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * One band, in local px. p = 0..1 progress of the stroke across width w.
 * dir 'in' paints the band from the left; 'out' erases it from the left
 * (used to remove the previous painting behind a new stroke).
 */
export function bandPath(
  w: number,
  y0: number,
  y1: number,
  p: number,
  seed: number,
  dir: "in" | "out" = "in",
): string {
  const tips = 9;
  const tipLen = Math.min(w * 0.12, 160);
  // leading edge x (before jitter); overshoot so the band fully covers at p=1
  const lead = -tipLen + p * (w + tipLen * 2);
  const h = y1 - y0;
  const pts: string[] = [];
  if (dir === "in") {
    pts.push(`M ${-10} ${y0}`);
    for (let i = 0; i <= tips; i++) {
      const t = i / tips;
      const y = y0 + t * h;
      const j = rand(seed + i * 1.7) * tipLen;
      pts.push(`L ${Math.max(-10, lead - j)} ${y}`);
    }
    pts.push(`L ${-10} ${y1} Z`);
  } else {
    // keep the part to the RIGHT of the leading edge
    pts.push(`M ${w + 10} ${y0}`);
    for (let i = 0; i <= tips; i++) {
      const t = i / tips;
      const y = y0 + t * h;
      const j = rand(seed + i * 1.7) * tipLen;
      pts.push(`L ${Math.min(w + 10, Math.max(-10, lead - j))} ${y}`);
    }
    pts.push(`L ${w + 10} ${y1} Z`);
  }
  return pts.join(" ");
}

/** A full-width stroke made of n bands with a slight stagger between them. */
export function strokePath(w: number, h: number, p: number, seed: number, dir: "in" | "out" = "in", n = 7, yOff = 0) {
  const stagger = 0.18;
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = rand(seed * 3.1 + i) * stagger;
    const lp = Math.min(1, Math.max(0, (p - d) / (1 - stagger)));
    const y0 = yOff + (i / n) * h - 6;
    const y1 = yOff + ((i + 1) / n) * h + 6;
    parts.push(bandPath(w, y0, y1, lp, seed + i * 11, dir));
  }
  return parts.join(" ");
}
