import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';

/**
 * Shared colour treatment for every scene's visuals (never applied to text):
 * a slight warm tint to unify the AI-generated room photos, plus a faint
 * tiled grain overlay.
 */
export const Grade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ overflow: 'hidden' }}>
    <AbsoluteFill style={{ filter: 'sepia(0.06) saturate(1.08) brightness(1.02)' }}>{children}</AbsoluteFill>
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('parallax-room/grain.png')})`,
        backgroundSize: '256px 256px',
        mixBlendMode: 'overlay',
        opacity: 0.04,
      }}
    />
  </AbsoluteFill>
);
