import React, { useEffect, useMemo, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { Lottie, type LottieAnimationData } from '@remotion/lottie';

/**
 * Lottie JSON is fetched once per asset name and cached module-wide — six
 * shots pulling the same accent should not refetch it six times.
 */
const cache = new Map<string, LottieAnimationData>();

const hexToRgba = (hex: string): [number, number, number, number] => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
    1,
  ];
};

/**
 * Overrides every static solid fill/stroke color in the asset with one hex.
 * Only `{"a": 0, ...}` (non-animated) colors are touched — none of this
 * project's hand-authored assets animate color over time, so that is the
 * only case worth handling.
 */
const recolorShapes = (shapes: unknown[], rgba: number[]): unknown[] =>
  shapes.map((shape) => {
    const s = shape as { ty?: string; c?: { a?: number; k?: unknown }; it?: unknown[] };
    if ((s.ty === 'fl' || s.ty === 'st') && s.c && s.c.a === 0) {
      return { ...s, c: { ...s.c, k: rgba } };
    }
    if (s.ty === 'gr' && Array.isArray(s.it)) {
      return { ...s, it: recolorShapes(s.it, rgba) };
    }
    return s;
  });

const recolor = (data: LottieAnimationData, hex: string): LottieAnimationData => {
  const rgba = hexToRgba(hex);
  const layers = (data.layers as Array<Record<string, unknown>>).map((layer) =>
    Array.isArray(layer.shapes)
      ? { ...layer, shapes: recolorShapes(layer.shapes, rgba) }
      : layer,
  );
  return { ...data, layers };
};

export const LottieAccent: React.FC<{
  /** bare filename in public/lottie/, without the .json extension */
  name: string;
  style?: React.CSSProperties;
  loop?: boolean;
  from?: number;
  durationInFrames?: number;
  /** skip this many frames from the start of the asset's own timeline */
  trimBefore?: number;
  playbackRate?: number;
  /** overrides every solid fill/stroke in the asset with this hex */
  recolorTo?: string;
}> = ({ name, style, loop, from, durationInFrames, trimBefore, playbackRate, recolorTo }) => {
  const [data, setData] = useState<LottieAnimationData | null>(cache.get(name) ?? null);

  useEffect(() => {
    if (cache.has(name)) {
      return;
    }
    const handle = delayRender(`Loading lottie asset "${name}"`);
    fetch(staticFile(`lottie/${name}.json`))
      .then((res) => res.json())
      .then((json: LottieAnimationData) => {
        cache.set(name, json);
        setData(json);
        continueRender(handle);
      })
      .catch((err) => {
        continueRender(handle);
        throw err;
      });
  }, [name]);

  const recolored = useMemo(
    () => (data && recolorTo ? recolor(data, recolorTo) : data),
    [data, recolorTo],
  );

  if (!recolored) {
    return null;
  }

  return (
    <Lottie
      animationData={recolored}
      loop={loop}
      from={from}
      durationInFrames={durationInFrames}
      trimBefore={trimBefore}
      playbackRate={playbackRate}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }}
    />
  );
};
