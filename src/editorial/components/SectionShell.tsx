import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { GrainOverlay } from '@/components/onda/grain-overlay/GrainOverlay';
import { DynamicGrid } from '@/components/onda/dynamic-grid/DynamicGrid';
import { lerpHex } from '../motion';
import { lineColorFor } from '../theme';

export type SectionShellProps = {
  background: string;
  /** previous section's background — if given, the first 10 frames crossfade
   * into `background` instead of cutting, so the colour switch reads as a
   * designed transition. */
  prevBackground?: string;
  grid?: boolean;
  children: React.ReactNode;
};

const CROSSFADE_FRAMES = 10;

/**
 * Flat solid background per section, a hairline-opacity grain pass, an
 * optional very-low-opacity dynamic grid, and a 10-frame colour crossfade at
 * the section's own boundary. No gradients, no photo backgrounds — the
 * colour switch itself is the transition.
 */
export const SectionShell: React.FC<SectionShellProps> = ({ background, prevBackground, grid = true, children }) => {
  const frame = useCurrentFrame();
  const resolvedBackground =
    prevBackground && frame < CROSSFADE_FRAMES
      ? lerpHex(prevBackground, background, frame / CROSSFADE_FRAMES)
      : background;

  return (
    <AbsoluteFill style={{ background: resolvedBackground }}>
      {grid && (
        <DynamicGrid
          kind="dynamic-grid"
          cell={56}
          variant="lines"
          color={lineColorFor(background)}
          speed={0.15}
          opacity={0.05}
          glow={false}
          glowColor="transparent"
          background="transparent"
        />
      )}

      {children}

      <GrainOverlay kind="grain-overlay" opacity={0.035} baseFrequency={0.9} numOctaves={1} seed={7} />
    </AbsoluteFill>
  );
};
