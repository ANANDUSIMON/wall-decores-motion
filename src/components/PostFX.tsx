import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

/**
 * The final grade.
 *
 * A light-background film needs the opposite treatment to a dark one. On ink
 * you add bloom, because light spilling from bright elements is what sells
 * it. On a white wall bloom is fatal — it lifts the whole frame, the wall
 * goes milky, and every painting loses its edge. So there is no bloom here.
 *
 * What a light frame needs instead is depth: a touch more contrast so the
 * near-whites separate, a corner fall so the frame has edges, and grain so
 * the flat areas have a surface. Restraint is the whole job — the paintings
 * are the only thing in frame allowed to be loud.
 */
export const PostFX: React.FC<{
  children: React.ReactNode;
  grain?: number;
  vignette?: number;
  /** warmth of the print, 0 neutral */
  warmth?: number;
  /** local frames where a cut lands — a 2-frame lens artefact fires there */
  cutFrames?: number[];
}> = ({ children, grain = 0.045, vignette = 0.3, warmth = 0.5, cutFrames = [] }) => {
  const frame = useCurrentFrame();
  const atCut = cutFrames.some((c) => frame >= c && frame < c + 2);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          // Gentle. Anything stronger and the wall starts to posterise in
          // the near-whites, which is very visible after h264.
          filter: 'contrast(1.045) saturate(1.07) brightness(1.004)',
        }}
      >
        {children}
      </AbsoluteFill>

      {/* a cut lands harder with two frames of lens error */}
      {atCut && (
        <>
          <AbsoluteFill
            style={{
              transform: 'translateX(-1.2px)',
              mixBlendMode: 'screen',
              opacity: 0.3,
              filter: 'url(#fx-red)',
            }}
          >
            {children}
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              transform: 'translateX(1.2px)',
              mixBlendMode: 'screen',
              opacity: 0.3,
              filter: 'url(#fx-blue)',
            }}
          >
            {children}
          </AbsoluteFill>
        </>
      )}

      {/* warm print bias — a hair of amber in the whites */}
      {warmth > 0 && (
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(170deg, rgba(255,236,206,0.5) 0%, rgba(255,246,232,0.22) 55%, rgba(236,226,210,0.4) 100%)',
            mixBlendMode: 'multiply',
            opacity: warmth * 0.22,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* corner fall — on white this has to be far softer than on ink or it
          reads as a vignette filter rather than a lens */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 78% 72% at 50% 46%,
            rgba(42,33,24,0) 52%,
            rgba(42,33,24,0.1) 78%,
            rgba(42,33,24,0.26) 100%)`,
          opacity: vignette,
          pointerEvents: 'none',
        }}
      />

      {/* grain, regenerated every frame so it moves like film rather than
          sitting on the picture like a texture */}
      {grain > 0 && (
        <svg
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: grain,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
          }}
        >
          <filter id={`grain-${frame}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves={2}
              seed={frame * 3 + 11}
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grain-${frame})`} />
        </svg>
      )}

      {/* channel-separation filters used by the cut artefact above */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="fx-red">
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          />
        </filter>
        <filter id="fx-blue">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
          />
        </filter>
      </svg>
    </AbsoluteFill>
  );
};
