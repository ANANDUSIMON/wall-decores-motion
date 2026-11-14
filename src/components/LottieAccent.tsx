import React, { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { Lottie, type LottieAnimationData } from '@remotion/lottie';

/**
 * Lottie JSON is fetched once per asset name and cached module-wide — six
 * shots pulling the same accent should not refetch it six times.
 */
const cache = new Map<string, LottieAnimationData>();

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
}> = ({ name, style, loop, from, durationInFrames, trimBefore, playbackRate }) => {
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

  if (!data) {
    return null;
  }

  return (
    <Lottie
      animationData={data}
      loop={loop}
      from={from}
      durationInFrames={durationInFrames}
      trimBefore={trimBefore}
      playbackRate={playbackRate}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }}
    />
  );
};
