import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { palette, type, grid, ease, FONT_STACK } from '../theme';
import { BrushStroke } from '../components/BrushStroke';
import { MaskRise } from '../components/KineticText';

/** SHOT 5 — THE TURN · 105 frames (3.5s)
 *  The punch of the film. Hard cut to cream — a full inversion with no
 *  transition, because the point is contrast. "NOT PRINTED." holds, cuts,
 *  "PAINTED." lands, and the biggest, driest stroke in the film sweeps
 *  underneath it with its bristle detail fully visible.
 */
export const Shot5: React.FC = () => {
  const frame = useCurrentFrame();

  const CUT = 36; // frame where NOT PRINTED becomes PAINTED
  const second = frame >= CUT;

  // the cream ground has a faint paper tone and a warm corner lift
  return (
    <AbsoluteFill style={{ backgroundColor: palette.cream }}>
      {/* Paper tone, not blank white. A gentle lift top-left and a warm
          gold cast bottom-right give the cream somewhere to go; without it
          the inversion reads as a blown-out frame rather than a surface. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 80% 70% at 28% 26%,
            rgba(255,252,246,0.55) 0%,
            rgba(232,224,208,0) 58%),
            radial-gradient(ellipse 70% 65% at 86% 88%,
            rgba(184,146,78,0.30) 0%,
            rgba(184,146,78,0) 72%),
            linear-gradient(168deg,
            rgba(0,0,0,0) 55%,
            rgba(70,58,40,0.13) 100%)`,
        }}
      />

      {/* paper grain */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, opacity: 0.1 }}
      >
        <filter id="paper5">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={4} seed={9} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper5)" style={{ mixBlendMode: 'multiply' }} />
      </svg>

      {!second ? (
        <div
          style={{
            position: 'absolute',
            left: grid.margin,
            top: grid.height / 2 - 120,
          }}
        >
          <MaskRise start={2} duration={16} color={palette.ink} style={{ ...type.display }}>
            NOT
          </MaskRise>
          <MaskRise start={7} duration={16} color={palette.ink} style={{ ...type.display }}>
            PRINTED.
          </MaskRise>
        </div>
      ) : (
        <>
          <div
            style={{
              position: 'absolute',
              left: grid.margin,
              top: grid.height / 2 - 120,
            }}
          >
            <MaskRise
              start={CUT + 1}
              duration={14}
              color={palette.ink}
              style={{ ...type.display }}
            >
              PAINTED.
            </MaskRise>
          </div>

          {/* the hero stroke — biggest, driest, most textured in the film */}
          {/* Two passes of the same stroke: a dense loaded base, then a drier
              pass on top. One pass alone spread 80 bristles over 150px and
              came out thin and pale — a real loaded brush lays down solid
              colour first and the dry skip shows at the edges. */}
          <BrushStroke
            from={[grid.margin - 20, grid.height / 2 + 108]}
            to={[1480, grid.height / 2 + 132]}
            color={palette.amberDeep}
            thickness={132}
            bristles={80}
            dryness={0.22}
            revealStart={CUT + 8}
            revealDuration={26}
            bow={-22}
            seed={777}
            opacity={1}
          />
          <BrushStroke
            from={[grid.margin - 14, grid.height / 2 + 104]}
            to={[1476, grid.height / 2 + 128]}
            color={palette.amber}
            thickness={150}
            bristles={80}
            dryness={0.64}
            revealStart={CUT + 8}
            revealDuration={26}
            bow={-22}
            seed={913}
            opacity={0.95}
          />

          {/* rose square punctuating the end of the stroke */}
          <div
            style={{
              position: 'absolute',
              left: 1512,
              top: grid.height / 2 + 96,
              width: 44,
              height: 44,
              background: palette.rose,
              transform: `scale(${interpolate(
                frame,
                [CUT + 30, CUT + 40],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.entrance }
              )}) rotate(${interpolate(frame, [CUT + 30, CUT + 46], [-20, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: ease.entrance,
              })}deg)`,
              boxShadow: `0 10px 30px rgba(0,0,0,0.2)`,
            }}
          />
        </>
      )}

      <div
        style={{
          position: 'absolute',
          left: grid.margin,
          bottom: grid.margin,
          ...type.kicker,
          fontFamily: FONT_STACK,
          color: '#6b6256',
          opacity: interpolate(frame, [CUT + 40, CUT + 54], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Every piece mixed, laid and finished by hand
      </div>
    </AbsoluteFill>
  );
};
