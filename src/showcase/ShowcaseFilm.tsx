import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SECTIONS, PALETTES as ROOMS, BRAND, W, H } from './theme';
import { BrushIntro } from './scenes/BrushIntro';
import { RoomScene } from './scenes/RoomScene';
import { PaletteShowcase } from './scenes/PaletteShowcase';
import { SignOff } from './scenes/SignOff';

/* ------------------------------------------------------------------ */
/*  Helper: look up a section by name                                  */
/* ------------------------------------------------------------------ */
const sec = (name: string) => {
  const s = SECTIONS.find((x) => x.id === name);
  if (!s) throw new Error(`Section ${name} not found`);
  return s;
};

/* ------------------------------------------------------------------ */
/*  ShowcaseFilm                                                       */
/* ------------------------------------------------------------------ */
export const ShowcaseFilm: React.FC = () => {
  const intro = sec('INTRO');
  const room1 = sec('ROOM1');
  const room2 = sec('ROOM2');
  const room3 = sec('ROOM3');
  const room4 = sec('ROOM4');
  const room5 = sec('ROOM5');
  const palette = sec('PALETTE');
  const signoff = sec('SIGNOFF');

  return (
    <AbsoluteFill style={{ background: BRAND.cream }}>
      {/* Scene 1: Brand intro with brush strokes */}
      <BrushIntro from={intro.from} to={intro.to} />

      {/* Scenes 2-6: Five rooms with matching paintings */}
      <RoomScene palette={ROOMS[0]} from={room1.from} to={room1.to} index={0} />
      <RoomScene palette={ROOMS[1]} from={room2.from} to={room2.to} index={1} />
      <RoomScene palette={ROOMS[2]} from={room3.from} to={room3.to} index={2} />
      <RoomScene palette={ROOMS[3]} from={room4.from} to={room4.to} index={3} />
      <RoomScene palette={ROOMS[4]} from={room5.from} to={room5.to} index={4} />

      {/* Scene 7: All palettes side by side */}
      <PaletteShowcase from={palette.from} to={palette.to} />

      {/* Scene 8: Sign-off with contact info */}
      <SignOff from={signoff.from} to={signoff.to} />
    </AbsoluteFill>
  );
};
