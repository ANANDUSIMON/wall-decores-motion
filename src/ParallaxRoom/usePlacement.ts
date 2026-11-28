import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';
import { PlacementConfig } from './types';

// Module-level cache so every scene sharing this hook only fetches once per
// render, and so the user can tweak placement.json without touching code.
let cached: PlacementConfig | null = null;

export const usePlacement = (): PlacementConfig | null => {
  const [data, setData] = useState<PlacementConfig | null>(cached);

  useEffect(() => {
    if (cached) return;
    const handle = delayRender('Loading parallax-room/placement.json');
    fetch(staticFile('parallax-room/placement.json'))
      .then((res) => res.json())
      .then((json: PlacementConfig) => {
        cached = json;
        setData(json);
        continueRender(handle);
      })
      .catch((err) => {
        continueRender(handle);
        throw err;
      });
  }, []);

  return data;
};
