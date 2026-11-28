import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, useCurrentFrame } from 'remotion';
import { CONTACT, FPS, px } from './timeline';
import { interFontFamily, serifFontFamily } from './fonts';
import { Grade } from './Grade';

const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const ease = Easing.bezier(0.22, 1, 0.36, 1);

const FADE_IN = 0.3; // s, per text element

const useReveal = (localSec: number, atSec: number) => {
  const opacity = interpolate(localSec, [atSec, atSec + FADE_IN], [0, 1], { ...clamp, easing: ease });
  const rise = (1 - opacity) * px(14);
  // Centered absolutely-positioned children need `translateX(-50%)` composed
  // in front of their own reveal rise.
  return { opacity, centered: (extra = '') => `translateX(-50%) translateY(${rise}px) ${extra}`.trim() };
};

type Props = {
  backgroundSrc: string;
  paintingSrc: string;
  startFrame: number;
};

export const EndCard: React.FC<Props> = ({ backgroundSrc, paintingSrc, startFrame }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const localSec = local / FPS;

  const fadeUpFromBlack = interpolate(local, [0, 9], [1, 0], { ...clamp, easing: ease });
  const paintingScale = interpolate(local, [0, 15], [1.02, 1.0], { ...clamp, easing: ease });

  const wordmark = useReveal(localSec, 0.5);
  const rule = useReveal(localSec, 0.7);
  const tagline = useReveal(localSec, 1.2);
  const pill = useReveal(localSec, 1.5);
  const web = useReveal(localSec, 1.7);

  const paintingBox = px(480);

  return (
    <Grade>
      <AbsoluteFill>
        <Img
          src={backgroundSrc}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(18px) brightness(0.55)',
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: px(240),
            width: paintingBox,
            height: paintingBox,
            transform: `translateX(-50%) scale(${paintingScale})`,
          }}
        >
          <Img src={paintingSrc} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: px(800),
            fontFamily: interFontFamily,
            fontWeight: 600,
            fontSize: px(48),
            letterSpacing: '0.30em',
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            opacity: wordmark.opacity,
            transform: wordmark.centered(),
          }}
        >
          {CONTACT.wordmark}
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: px(880),
            width: px(96),
            height: px(4),
            background: '#F6A058',
            opacity: rule.opacity,
            transform: rule.centered(),
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: px(920),
            fontFamily: serifFontFamily,
            fontStyle: 'italic',
            fontSize: px(42),
            color: '#FFFFFF',
            textAlign: 'center',
            maxWidth: px(840),
            opacity: tagline.opacity,
            transform: tagline.centered(),
          }}
        >
          {CONTACT.sub}
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: px(1060),
            height: px(54),
            display: 'inline-flex',
            alignItems: 'center',
            padding: `0 ${px(18)}px`,
            borderRadius: px(27),
            background: 'rgba(10,20,22,0.75)',
            border: `${px(2)}px solid rgba(88,222,212,0.55)`,
            opacity: pill.opacity,
            transform: pill.centered(),
          }}
        >
          <span
            style={{
              fontFamily: interFontFamily,
              fontWeight: 600,
              fontSize: px(27),
              letterSpacing: '0.1em',
              color: '#58DED4',
              whiteSpace: 'nowrap',
            }}
          >
            {CONTACT.handle}
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: px(1140),
            fontFamily: interFontFamily,
            fontWeight: 500,
            fontSize: px(28),
            color: '#C8C4BC',
            whiteSpace: 'nowrap',
            opacity: web.opacity,
            transform: web.centered(),
          }}
        >
          {CONTACT.web}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ background: '#000000', opacity: fadeUpFromBlack }} />
    </Grade>
  );
};
