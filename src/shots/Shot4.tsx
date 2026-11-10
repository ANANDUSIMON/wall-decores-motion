import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { palette, type, grid, ease, FONT_STACK } from '../theme';
import { MaskRise } from '../components/KineticText';
import { mulberry32 } from '../lib/motion';

/** SHOT 4 — THE GRID · 135 frames (4.5s)
 *  The gallery wall. Twelve panels snap into a grid on a fast stagger, each
 *  arriving with a scale overshoot and a blur that resolves — the trick that
 *  makes a grid feel assembled rather than simply drawn.
 */
export const Shot4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const COLS = 4;
  const ROWS = 3;
  const gapX = 28;
  const gapY = 28;
  const boxW = (grid.usable - gapX * (COLS - 1)) / COLS;
  const boxH = 232;
  const topY = 190;

  /**
   * Deep, saturated pairs — each panel runs from its colour down into a much
   * darker version of itself, so the grid reads as twelve painted surfaces
   * under raking light rather than twelve flat colour swatches.
   * Fixed order, not random: a shuffle kept putting two pinks side by side.
   */
  const tones: [string, string][] = [
    [palette.emerald, '#05382a'],
    ['#b98f3f', '#3d2a0d'],
    [palette.amber, '#5c1f08'],
    [palette.teal, '#06332f'],
    ['#a8365f', '#3a0d1e'],
    [palette.gold, '#4a3415'],
    ['#0f8a66', '#042820'],
    [palette.amberDeep, '#3d1405'],
    [palette.rose, '#45122a'],
    ['#1aa07c', '#063026'],
    ['#c9913d', '#432d0e'],
    ['#cf5428', '#4a1806'],
  ];

  const cells = React.useMemo(() => {
    const rnd = mulberry32(90210);
    return Array.from({ length: COLS * ROWS }, (_, i) => {
      const r = Math.floor(i / COLS);
      const c = i % COLS;
      const t = tones[i % tones.length];
      // diagonal stagger: top-left first, bottom-right last
      return {
        i,
        x: grid.margin + c * (boxW + gapX),
        y: topY + r * (boxH + gapY),
        from: t[0],
        to: t[1],
        delay: 2 + (r + c) * 4,
        seed: Math.floor(rnd() * 9999),
      };
    });
  }, []);

  const pullBack = interpolate(frame, [60, 135], [1.05, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: palette.ink }}>
      <AbsoluteFill style={{ transform: `scale(${pullBack})` }}>
        {cells.map((cell) => {
          const p = spring({
            frame: frame - cell.delay,
            fps,
            config: { damping: 13, mass: 0.8, stiffness: 130 },
            durationInFrames: 26,
          });
          const s = interpolate(p, [0, 1], [0.64, 1]);
          const blur = interpolate(p, [0, 0.55, 1], [16, 3, 0], {
            extrapolateRight: 'clamp',
          });
          const op = interpolate(p, [0, 0.3], [0, 1], {
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={cell.i}
              style={{
                position: 'absolute',
                left: cell.x,
                top: cell.y,
                width: boxW,
                height: boxH,
                background: `linear-gradient(138deg, ${cell.from} 0%, ${cell.to} 100%)`,
                transform: `scale(${s})`,
                opacity: op,
                filter: `blur(${blur.toFixed(2)}px)`,
                boxShadow: `0 18px 44px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)`,
                overflow: 'hidden',
                willChange: 'transform, filter',
              }}
            >
              {/* Knife marks, matching the canvases in Shot 2 — without them
                  a rich gradient still reads as a colour swatch, not paint. */}
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0 }}
              >
                {(() => {
                  const r = mulberry32(cell.seed * 7919);
                  const dominant = -30 + r() * 60;
                  return Array.from({ length: 18 }, (_, k) => {
                    const cx = r() * 112 - 6;
                    const cy = r() * 112 - 6;
                    const rot = dominant + (r() - 0.5) * 40;
                    const light = r() > 0.48;
                    return (
                      <ellipse
                        key={k}
                        cx={cx}
                        cy={cy}
                        rx={16 + r() * 34}
                        ry={1.6 + r() * 3.4}
                        transform={`rotate(${rot} ${cx} ${cy})`}
                        fill={light ? '#ffffff' : '#000000'}
                        opacity={(0.10 + r() * 0.2) * (light ? 0.6 : 0.8)}
                        style={{ mixBlendMode: light ? 'soft-light' : 'multiply' }}
                      />
                    );
                  });
                })()}
              </svg>

              {/* canvas weave */}
              <svg
                width="100%"
                height="100%"
                style={{ position: 'absolute', inset: 0, opacity: 0.22 }}
              >
                <filter id={`g4-${cell.seed}`}>
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.9"
                    numOctaves={3}
                    seed={cell.seed}
                  />
                  <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect
                  width="100%"
                  height="100%"
                  filter={`url(#g4-${cell.seed})`}
                  style={{ mixBlendMode: 'multiply' }}
                />
              </svg>
              {/* raking light: a narrow highlight band, then a long fall into
                  shadow — not a flat white wash across the whole panel */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(122deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.04) 18%, rgba(0,0,0,0.10) 52%, rgba(0,0,0,0.42) 100%)',
                }}
              />
            </div>
          );
        })}

        {/* headline over the grid */}
        <div
          style={{
            position: 'absolute',
            left: grid.margin,
            top: 56,
          }}
        >
          <MaskRise
            start={44}
            duration={18}
            color={palette.cream}
            style={{ ...type.heading }}
          >
            EVERY SURFACE
          </MaskRise>
        </div>

        <div
          style={{
            position: 'absolute',
            right: grid.margin,
            top: 74,
            ...type.annotation,
            fontFamily: FONT_STACK,
            color: palette.gold,
            opacity: interpolate(frame, [56, 70], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          Residential · Hospitality · Commercial
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
