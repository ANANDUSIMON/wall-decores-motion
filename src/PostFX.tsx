import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const PostFX: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      {children}

      {/* Film grain — animated 5 % overlay */}
      <AbsoluteFill
        style={{mixBlendMode: 'overlay', opacity: 0.05, pointerEvents: 'none'}}
      >
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves={3}
              seed={frame}
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>

      {/* Canvas-weave texture */}
      <AbsoluteFill
        style={{
          opacity: 0.04,
          pointerEvents: 'none',
          backgroundImage: [
            'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.3) 3px,rgba(0,0,0,.3) 4px)',
            'repeating-linear-gradient(90deg,transparent,transparent 3px,rgba(0,0,0,.3) 3px,rgba(0,0,0,.3) 4px)',
          ].join(', '),
        }}
      />

      {/* Vignette + 1 px chromatic fringe */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
          boxShadow:
            'inset 1px 0 0 rgba(255,0,0,0.06), inset -1px 0 0 rgba(0,100,255,0.06)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
