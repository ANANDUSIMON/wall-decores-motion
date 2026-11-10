import React from 'react';
import { useCurrentFrame, AbsoluteFill } from 'remotion';

type Props = {
  children: React.ReactNode;
  /** frames where a hard cut lands — gets a 1px colour split */
  cutFrames?: number[];
  /** 0 to 1 — how much glow spills off bright areas */
  bloom?: number;
  grain?: number;
  vignette?: number;
};

/**
 * Final grade and film texture.
 *
 * Four passes, in the order a colourist would apply them:
 *   1. bloom    — bright areas spill light, the single biggest contributor
 *                 to "premium" rather than "flat web graphic"
 *   2. grade    — slight contrast lift and saturation push
 *   3. vignette — pulls the eye to centre frame
 *   4. grain    — regenerated every frame so it never looks like a static
 *                 overlay sitting on top of the picture
 */
export const PostFX: React.FC<Props> = ({
  children,
  cutFrames = [],
  bloom = 0.42,
  grain = 0.05,
  vignette = 0.45,
}) => {
  const frame = useCurrentFrame();

  // Chromatic aberration only on the frame of a hard cut and the one after.
  const nearCut = cutFrames.some((c) => frame >= c && frame < c + 2);
  const ab = nearCut ? 1.4 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* base */}
      <AbsoluteFill
        style={{
          filter: `contrast(1.06) saturate(1.12) brightness(1.01)`,
        }}
      >
        {children}
      </AbsoluteFill>

      {/*
        Bloom — thresholded, not a blanket glow.

        The `contrast(2.9) brightness(0.55)` pass crushes everything below
        roughly 70% luminance to black BEFORE the blur, so only genuinely
        bright elements spill light. Without the threshold the whole frame
        lifts and light shots go milky — which is the single most common way
        a code-rendered film gives itself away.
      */}
      {bloom > 0 && (
        <AbsoluteFill
          style={{
            mixBlendMode: 'screen',
            opacity: bloom,
            filter:
              'brightness(0.55) contrast(2.9) blur(22px) brightness(1.45) saturate(1.25)',
            pointerEvents: 'none',
          }}
        >
          {children}
        </AbsoluteFill>
      )}

      {/* chromatic aberration on cuts */}
      {ab > 0 && (
        <>
          <AbsoluteFill
            style={{
              mixBlendMode: 'screen',
              opacity: 0.4,
              transform: `translateX(${ab}px)`,
              filter: 'url(#fx-red)',
            }}
          >
            {children}
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              mixBlendMode: 'screen',
              opacity: 0.4,
              transform: `translateX(${-ab}px)`,
              filter: 'url(#fx-cyan)',
            }}
          >
            {children}
          </AbsoluteFill>
        </>
      )}

      {/* vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 72% 68% at 50% 48%,
            rgba(0,0,0,0) 38%,
            rgba(0,0,0,${vignette * 0.4}) 74%,
            rgba(0,0,0,${vignette}) 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* film grain — new noise field every frame */}
      <AbsoluteFill
        style={{
          opacity: grain,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }}
      >
        <svg width="100%" height="100%">
          <filter id={`grain-${frame}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.82"
              numOctaves={2}
              seed={frame * 3 + 11}
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grain-${frame})`} />
        </svg>
      </AbsoluteFill>

      {/* colour-channel filters used by the aberration pass */}
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id="fx-red">
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          />
        </filter>
        <filter id="fx-cyan">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
          />
        </filter>
      </svg>
    </AbsoluteFill>
  );
};
