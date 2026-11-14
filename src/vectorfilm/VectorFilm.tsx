import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, SECTIONS, T } from './theme';
import { HUD } from './HUD';
import { Room } from './room/Room';
import { Headline } from './text/Headline';
import { CanvasData, PaintData, Swatches } from './text/Captions';
import { OpenTitle, SignOff } from './text/Brand';

const sec = (id: string) => SECTIONS.find((s) => s.id === id)!;

/** Static paper grain over the whole frame — one cheap filter, no motion. */
const Grain: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'multiply', opacity: 0.07 }}>
    <svg width="100%" height="100%">
      <filter id="vf-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="2" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#vf-grain)" />
    </svg>
  </AbsoluteFill>
);

/**
 * VectorFilm — 60s / 60fps / 1080x1920 / silent.
 *
 *  01 OPEN     0–360     lotus mark + WALL DECORES
 *  02 ROOM     360–960   a room draws itself line by line, colour floods in,
 *                        furniture drops into place, the lights come on
 *  03 CANVAS   960–1320  an empty canvas is measured onto the wall (180×90 cm)
 *  04 PAINT    1320–2340 camera pushes in; a brush paints the lotus stroke by stroke
 *  05 COLOUR   2340–3060 palette swaps re-tint the painting AND the room
 *  06 CONTACT  3060–3600 the room becomes a framed card; name + contacts
 */
export const VectorFilm: React.FC = () => {
  const room = sec('ROOM');
  const canvas = sec('CANVAS');
  const paint = sec('PAINT');
  const colour = sec('COLOUR');

  return (
    <AbsoluteFill style={{ background: COLORS.cream }}>
      <Room />

      <OpenTitle />

      <Headline from={room.from + 20} to={room.to} lines={[[{ t: 'Every' }, { t: 'room' }], [{ t: 'deserves', italic: true }, { t: 'a', italic: true }, { t: 'story.', italic: true }]]} />
      <Headline from={canvas.from} to={canvas.to} lines={[[{ t: 'Made' }, { t: 'to' }], [{ t: 'measure.', italic: true }]]} />
      <Headline from={paint.from} to={paint.to} lines={[[{ t: 'Painted' }], [{ t: 'by', italic: true }, { t: 'hand.', italic: true }]]} />
      <Headline
        from={colour.from}
        to={T.shrink[0]}
        lines={[[{ t: 'Colour,' }], [{ t: 'composed', italic: true }, { t: 'for', italic: true }, { t: 'you.', italic: true }]]}
      />

      <CanvasData />
      <PaintData />
      <Swatches />

      <SignOff />

      <Grain />
      <HUD />
    </AbsoluteFill>
  );
};
