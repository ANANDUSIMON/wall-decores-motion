import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { art as lookupArt, type Art } from '../art';
import { palette } from '../theme';
import { shutterSamples, velocity2D, samplesFor, clamp } from '../lib/motion';

/** Everything a painting is doing at one instant. */
export type Pose = {
  /** centre of the painting, in frame pixels */
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
  /**
   * How far off the wall it is, 0 = hung and settled, 1 = fully lifted.
   * Drives the shadow: a lifted canvas casts a large soft shadow, a hung one
   * casts a tight dark one. Animating this is what makes a painting look like
   * it is being placed rather than fading in.
   */
  lift?: number;
};

type Props = {
  /** id from the manifest, e.g. "a3-bloom-white" */
  art: string | Art;
  /** display height in px; width follows the painting's real aspect ratio */
  h: number;
  /** the pose at any frame — sampled sub-frame for motion blur */
  at: (frame: number) => Pose;
  /** angle of the room light, degrees. Keep it the same across one shot. */
  lightAngle?: number;
  /** adds a thin gallery frame around the canvas */
  framed?: boolean;
  /** render the stretcher side-face on this edge for depth */
  side?: 'left' | 'right' | 'none';
  /** cheap mode: skips motion blur for background paintings */
  still?: boolean;
};

/**
 * A stretched canvas hanging on a wall.
 *
 * The hard part of putting a photograph of a painting on a white background
 * is that it arrives looking like a sticker. Four things fix that, and all
 * four are here:
 *
 *   Two shadows, not one. A tight contact shadow in the gap between canvas
 *   and wall, plus a wide ambient one much further down. A single shadow
 *   always reads as fake; the pair is what the eye actually expects.
 *
 *   Lit and shadowed edges. The stretcher has thickness, so the edge facing
 *   the light is a hair brighter and the opposite edge a hair darker.
 *
 *   A side face. Seen from anywhere but dead centre, a gallery-wrapped canvas
 *   shows one of its sides — a narrow darkened strip of the painting itself.
 *
 *   A shared raking light. One angle across every painting in a shot, which
 *   is what makes them look like they are in the same room rather than
 *   pasted onto the same page.
 */
export const GalleryCanvas: React.FC<Props> = ({
  art,
  h,
  at,
  lightAngle = 118,
  framed = false,
  side = 'none',
  still = false,
}) => {
  const frame = useCurrentFrame();
  const piece = typeof art === 'string' ? lookupArt(art) : art;
  const w = h * piece.aspect;

  const pose = at(frame);
  const opacity = pose.opacity ?? 1;
  const lift = clamp(pose.lift ?? 0, 0, 1);

  // --- motion blur ------------------------------------------------------
  // Sample the pose function itself, so the smear follows the real path of
  // travel rather than a guessed direction.
  const speed = still ? 0 : velocity2D((f) => at(f), frame);
  const count = still ? 1 : Math.min(samplesFor(speed), 8);
  const samples = shutterSamples(frame, count, 0.8);

  // --- shadows ----------------------------------------------------------
  // Lifted: far from the wall, so the shadow is large, soft and weak.
  // Settled: close to the wall, so it is small, tight and dark.
  const contactBlur = 10 + lift * 40;
  const contactY = 5 + lift * 26;
  const contactOp = 0.34 - lift * 0.17;

  const ambientBlur = 54 + lift * 110;
  const ambientY = 26 + lift * 70;
  const ambientOp = 0.2 - lift * 0.08;

  const sh = (o: number) => {
    const r = parseInt(palette.shadow.slice(1, 3), 16);
    const g = parseInt(palette.shadow.slice(3, 5), 16);
    const b = parseInt(palette.shadow.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${o.toFixed(3)})`;
  };

  const src = staticFile(piece.file);

  const body = (ghost: number) => (
    <div
      style={{
        width: w,
        height: h,
        position: 'relative',
        boxShadow:
          ghost === 0
            ? [
                `0 ${contactY.toFixed(1)}px ${contactBlur.toFixed(1)}px ${sh(contactOp)}`,
                `0 ${ambientY.toFixed(1)}px ${ambientBlur.toFixed(1)}px ${sh(ambientOp)}`,
                framed ? `0 0 0 1px rgba(0,0,0,0.10)` : '',
              ]
                .filter(Boolean)
                .join(', ')
            : 'none',
        // The painting is the only thing allowed to be fully saturated in
        // frame, so nothing clips it.
        overflow: 'visible',
      }}
    >
      {/* the stretcher side face — a narrow, darkened sliver of the painting
          turning away from the lens */}
      {ghost === 0 && side !== 'none' && (() => {
        // Narrow, and only slightly darkened. An earlier version used a wide,
        // heavily darkened strip with a skew on it, and every painting ended
        // up with what looked like a black bar stuck to one edge. A gallery
        // wrap turning away from the light is subtle — a few pixels, a
        // gradient into shadow at the outer edge, and nothing else.
        const sw = clamp(h * 0.009, 3, 9);
        return (
          <div
            style={{
              position: 'absolute',
              top: 2,
              bottom: 1,
              width: sw,
              [side === 'right' ? 'right' : 'left']: -sw,
              overflow: 'hidden',
            }}
          >
            <Img
              src={src}
              style={{
                width: w,
                height: h,
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                [side === 'right' ? 'right' : 'left']: 0,
                filter: 'brightness(0.74) saturate(0.9)',
              }}
            />
            {/* the fall into shadow as the edge turns away */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(to ${side === 'right' ? 'right' : 'left'},
                  rgba(23,18,13,0) 0%,
                  rgba(23,18,13,0.42) 100%)`,
              }}
            />
          </div>
        );
      })()}

      {/* the painting */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          background: palette.wallShade,
          border: framed ? `${Math.max(6, h * 0.016)}px solid #fbf9f5` : 'none',
          boxSizing: 'border-box',
        }}
      >
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        {/* raking light across the surface — same angle for every painting
            in the shot, which is what puts them in one room */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(${lightAngle}deg,
              rgba(255,255,255,0.17) 0%,
              rgba(255,255,255,0.04) 26%,
              rgba(0,0,0,0) 54%,
              rgba(0,0,0,0.13) 100%)`,
            pointerEvents: 'none',
          }}
        />

        {/* canvas curves away at its edges, so they sit a touch darker */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: `inset 0 0 ${(h * 0.07).toFixed(0)}px rgba(23,18,13,0.11)`,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* lit edge / shadowed edge on the stretcher */}
      {ghost === 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            boxShadow: `inset 1.5px 1.5px 0 rgba(255,255,255,0.30),
                        inset -1.5px -1.5px 0 rgba(23,18,13,0.26)`,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );

  return (
    <>
      {samples.map((s, i) => {
        const p = at(s.f);
        const sScale = p.scale ?? 1;
        const sRot = p.rotate ?? 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x - w / 2,
              top: p.y - h / 2,
              transform: `scale(${sScale.toFixed(4)}) rotate(${sRot.toFixed(3)}deg)`,
              transformOrigin: '50% 50%',
              // The weights sum to 1, so compositing them in normal blend is
              // a true average of where the subject was while the shutter was
              // open. Screen blend would work on ink but blows straight to
              // white on a light wall.
              opacity: (p.opacity ?? opacity) * s.opacity,
              filter: s.age === 0 ? 'none' : `blur(${(s.age * 0.9).toFixed(2)}px)`,
              willChange: 'transform, opacity',
            }}
          >
            {body(s.age)}
          </div>
        );
      })}
    </>
  );
};
