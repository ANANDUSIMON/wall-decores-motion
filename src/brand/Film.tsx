import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion';
import { PAL, INTERIOR, INK, CREAM, FONT_STACK, SAFE, W, H } from './theme';
import { Ground, PetalArcs, Grain } from './components/Ground';
import { Interior, SizePanel } from './components/Room';
import { PaintCrop } from './components/PaintCrop';
import { Rise, Kicker } from './components/Type';
import { PaletteCard } from './components/PaletteCard';
import { LottieAccent } from '../components/LottieAccent';

const ramp = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

/** Centred text stack, pinned clear of the Instagram-crop safe margins. */
const Block: React.FC<{ top?: number; bottom?: number; gap?: number; children: React.ReactNode }> = ({
  top,
  bottom,
  gap = 18,
  children,
}) => (
  <div
    style={{
      position: 'absolute',
      left: SAFE,
      right: SAFE,
      ...(top !== undefined ? { top } : {}),
      ...(bottom !== undefined ? { bottom } : {}),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap,
    }}
  >
    {children}
  </div>
);

/* ===================================================== S1 — BRAND OPEN */

export const S1: React.FC = () => {
  const f = useCurrentFrame();
  const p = PAL.celestialCoral;
  return (
    <AbsoluteFill>
      <Ground pal={p} />
      <PetalArcs pal={p} cx={540} cy={1420} r={540} opacity={0.2} speed={0.6} />
      <LottieAccent name="shimmer-v" loop recolorTo={INTERIOR.brass} style={{ opacity: 0.4 }} />
      <Block bottom={620} gap={22}>
        <Rise text="WALL DECORES" size={92} delay={10} color={INK.warm} weight={800} tracking="0.01em" />
        <Kicker text="Handcrafted Artisan Wall Art · Angamaly, Kerala" size={20} delay={46} color={INK.soft} />
      </Block>
    </AbsoluteFill>
  );
};

/* ================================================ S2 — HOW WE MAKE IT */

const STEP_DUR = 105;
const STEPS = [
  {
    label: 'Hand-sketched composition',
    caption: 'Pencil studies set the form before colour ever touches canvas.',
    color: '#F17F70',
    cx: 0.5,
    cy: 0.42,
    zoom: 1.0,
  },
  {
    label: 'Sculptural impasto texture',
    caption: 'Palette-knife ridges build real relief into the surface.',
    color: '#2C9B8E',
    cx: 0.3,
    cy: 0.62,
    zoom: 2.0,
  },
  {
    label: 'Layered oil & acrylic glazes',
    caption: 'Translucent glazes stack colour until the light moves through it.',
    color: '#F4B89B',
    cx: 0.65,
    cy: 0.28,
    zoom: 1.7,
  },
  {
    label: 'Gold-leaf & fine detailing',
    caption: 'Hand-set gold leaf picks out the finishing detail.',
    color: INTERIOR.brass,
    cx: 0.72,
    cy: 0.6,
    zoom: 2.4,
  },
];

export const S2: React.FC = () => {
  const f = useCurrentFrame();
  const stepIndex = Math.min(STEPS.length - 1, Math.floor(f / STEP_DUR));
  const step = STEPS[stepIndex];
  const stepStart = stepIndex * STEP_DUR;
  const captionOp = ramp(f, stepStart + 30, stepStart + 46);

  return (
    <AbsoluteFill style={{ backgroundColor: INK.warm }}>
      <PaintCrop src="Softly_Closed_Lotus_Bloom" cx={step.cx} cy={step.cy} zoom={step.zoom} />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 380,
          background: 'linear-gradient(to bottom, rgba(20,12,6,0.6), rgba(20,12,6,0))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 340,
          background: 'linear-gradient(to top, rgba(20,12,6,0.58), rgba(20,12,6,0))',
        }}
      />

      <Block top={150} gap={10}>
        <Kicker text={`How we make it · ${stepIndex + 1}/${STEPS.length}`} size={18} delay={stepStart + 2} color="#F4E1C5" />
      </Block>

      <Block bottom={160} gap={14}>
        <Rise text={step.label} size={46} delay={stepStart + 16} color={CREAM} maxWidth={880} />
        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: 21,
            fontWeight: 500,
            color: '#E7D9C2',
            maxWidth: 780,
            textAlign: 'center',
            opacity: captionOp,
          }}
        >
          {step.caption}
        </div>
      </Block>

      {stepIndex === 3 && (
        <div style={{ position: 'absolute', left: W / 2 - 150, top: H / 2 - 150, width: 300, height: 300 }}>
          <LottieAccent name="sparkle-burst" from={stepStart + 30} recolorTo={INTERIOR.brass} />
        </div>
      )}

      {STEPS.slice(0, -1).map((_, i) => {
        const boundary = (i + 1) * STEP_DUR;
        return (
          <LottieAccent
            key={i}
            name="brush-wipe-v"
            from={boundary - 10}
            durationInFrames={28}
            recolorTo={STEPS[i + 1].color}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ============================================= S3 — OUR COLOUR STORY */

const STORY_PALETTES = [PAL.celestialCoral, PAL.lotusLagoon, PAL.coralJade];

export const S3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: INTERIOR.plaster }}>
    <LottieAccent name="shimmer-v" loop recolorTo={INTERIOR.brass} style={{ opacity: 0.22 }} />
    <Block top={140} gap={14}>
      <Kicker text="Our Colour Story" size={22} delay={4} color={INTERIOR.walnut} />
    </Block>
    {STORY_PALETTES.map((pal, i) => (
      <PaletteCard key={pal.id} pal={pal} delay={30 + i * 34} x={540} y={620 + i * 320} />
    ))}
    <Block bottom={140} gap={10}>
      <Rise
        text="Every palette is composed for your room's light — soft fields, one focal glow."
        size={30}
        delay={150}
        color={INK.warm}
        weight={600}
        maxWidth={840}
        lineHeight={1.4}
      />
    </Block>
  </AbsoluteFill>
);

/* ================================================== S4 — IN YOUR SPACE */

const ROOM_DUR = 120;
const ROOMS = [
  {
    src: '01_entrance',
    title: 'Entrance Lotus · 152×101 cm (60×40 in)',
    pal: PAL.celestialCoral,
    focusFrom: 0.3,
    focusTo: 0.12,
    focusY: 0.42,
    glowAt: { x: 0.095, y: 0.37 },
  },
  {
    src: '02_sofa',
    title: 'Living Feature · 180×90 cm (72×36 in)',
    pal: PAL.coralJade,
    focusFrom: 0.65,
    focusTo: 0.82,
    focusY: 0.38,
    glowAt: { x: 0.84, y: 0.32 },
  },
  {
    src: '04_pooja_wall',
    title: 'Pooja Lotus · 122×122 cm (48×48 in)',
    pal: PAL.lotusLagoon,
    focusFrom: 0.55,
    focusTo: 0.4,
    focusY: 0.44,
    glowAt: { x: 0.37, y: 0.43 },
  },
  {
    src: '03_entry_wall',
    title: 'Entry Diptych · 180×75 cm ea (72×30 in)',
    pal: PAL.celestialCoral,
    focusFrom: 0.65,
    focusTo: 0.85,
    focusY: 0.38,
    glowAt: { x: 0.92, y: 0.32 },
  },
];

/** Sizes above are the placeholders from the brief — confirmed to stand in
 * until the real dimensions are supplied. */
export const S4: React.FC = () => (
  <AbsoluteFill>
    {ROOMS.map((room, i) => (
      <Sequence key={room.src} from={i * ROOM_DUR} durationInFrames={ROOM_DUR} name={room.src}>
        <Interior
          src={room.src}
          focusFrom={room.focusFrom}
          focusTo={room.focusTo}
          focusY={room.focusY}
          zoomFrom={1.0}
          zoomTo={1.16}
          dur={ROOM_DUR}
          glowAt={room.glowAt}
          glowColor="#FFF4DD"
        />
        <LottieAccent
          name="shimmer-v"
          from={Math.round(ROOM_DUR * 0.3) - 6}
          durationInFrames={40}
          recolorTo={INTERIOR.brass}
          style={{ opacity: 0.5 }}
        />
        <Block top={70} gap={6}>
          <Kicker text="Colour-matched to walnut, plaster & brass interiors." size={16} delay={10} color="#FFF4E0" />
        </Block>
        <SizePanel title={room.title} sizeLabel={`${room.pal.id} · ${room.pal.name}`} pal={room.pal} delay={24} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

/* ===================================================== S5 — CLOSE / CTA */

export const S5: React.FC = () => {
  const f = useCurrentFrame();
  const p = PAL.coralJade;
  const fadeOut = interpolate(f, [150, 180], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <Ground pal={p} mirror energy={0.9} />
      <PetalArcs pal={p} cx={540} cy={760} r={560} opacity={0.22} speed={0.5} />
      <LottieAccent name="shimmer-v" loop recolorTo={INTERIOR.brass} style={{ opacity: 0.4 }} />
      <Block top={880} gap={18}>
        <Rise text="WALL DECORES" size={70} delay={8} color={INK.warm} weight={800} tracking="0.02em" />
        <Rise
          text="Artisan Wall Art for Premium Interiors"
          size={28}
          delay={30}
          color={INTERIOR.walnut}
          weight={600}
          maxWidth={840}
        />
        <Rise
          text="Commissioned through Designers & Architects"
          size={24}
          delay={50}
          color={INTERIOR.walnut}
          italic
          maxWidth={800}
        />
        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: 24,
            fontWeight: 600,
            color: INK.warm,
            opacity: ramp(f, 70, 90),
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          walldecores.com &nbsp;·&nbsp; @wall_decores_artisan &nbsp;·&nbsp; +91 90377 90012
        </div>
      </Block>
    </AbsoluteFill>
  );
};

/* ========================================================= film root */

export const SCENES: { id: string; C: React.FC; dur: number }[] = [
  { id: 'VS1', C: S1, dur: 120 },
  { id: 'VS2', C: S2, dur: 420 },
  { id: 'VS3', C: S3, dur: 300 },
  { id: 'VS4', C: S4, dur: 480 },
  { id: 'VS5', C: S5, dur: 180 },
];

export const TOTAL = SCENES.reduce((a, s) => a + s.dur, 0);

export const VibrantFilm: React.FC = () => {
  let from = 0;
  const items = SCENES.map((s) => {
    const item = { ...s, from };
    from += s.dur;
    return item;
  });
  return (
    <AbsoluteFill style={{ backgroundColor: PAL.coralJade.colors[1] }}>
      {items.map(({ id, C, from: f, dur }) => (
        <Sequence key={id} from={f} durationInFrames={dur} name={id}>
          <C />
        </Sequence>
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
