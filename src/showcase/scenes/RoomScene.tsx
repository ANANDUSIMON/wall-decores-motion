import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Sequence,
} from 'remotion';
import { RoomPalette, FONT, TYPE, ease, W, H, BRAND } from '../theme';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface RoomSceneProps {
  palette: RoomPalette;
  /** Global frame this section starts at */
  from: number;
  /** Global frame this section ends at */
  to: number;
  /** Which room index (0-4) — determines painting variation */
  index: number;
}

/* ------------------------------------------------------------------ */
/*  Vector Room (SVG)                                                  */
/* ------------------------------------------------------------------ */
const VectorRoom: React.FC<{ p: RoomPalette; progress: number }> = ({ p, progress }) => {
  const r = p.room;

  // Line draw progress
  const lineP = Math.min(progress * 3, 1);
  // Fill progress
  const fillP = interpolate(progress, [0.2, 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Furniture progress
  const furnP = interpolate(progress, [0.5, 0.85], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const strokeDash = `${1600 * lineP} ${1600 * (1 - lineP)}`;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {/* Floor */}
      <rect
        x={0} y={720} width={W} height={360}
        fill={r.floor}
        opacity={fillP}
      />
      {/* Floor lines */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line
          key={i}
          x1={i * 280 + 40}
          y1={720}
          x2={i * 280 + 40}
          y2={1080}
          stroke={r.floorLine}
          strokeWidth={1.5}
          opacity={fillP * 0.4}
        />
      ))}

      {/* Back wall */}
      <rect
        x={0} y={0} width={W} height={720}
        fill={r.wall}
        opacity={fillP}
      />

      {/* Accent wall (left third) */}
      <rect
        x={0} y={0} width={640} height={720}
        fill={r.wallAccent}
        opacity={fillP * 0.6}
      />

      {/* Baseboard */}
      <rect
        x={0} y={700} width={W} height={20}
        fill={r.trim}
        opacity={fillP}
      />

      {/* Wall molding line */}
      <line
        x1={0} y1={120} x2={W} y2={120}
        stroke={r.trim}
        strokeWidth={2}
        opacity={fillP * 0.5}
        strokeDasharray={strokeDash}
      />

      {/* Furniture — sofa */}
      <g opacity={furnP}>
        {/* Sofa body */}
        <rect
          x={160} y={540} width={480} height={160} rx={12}
          fill={r.furniture}
        />
        {/* Sofa shade */}
        <rect
          x={160} y={640} width={480} height={60} rx={8}
          fill={r.furnitureShade}
        />
        {/* Sofa cushions */}
        <rect x={180} y={555} width={140} height={80} rx={8} fill={r.furnitureShade} />
        <rect x={340} y={555} width={140} height={80} rx={8} fill={r.furnitureShade} />
        <rect x={500} y={555} width={120} height={80} rx={8} fill={r.furnitureShade} />
        {/* Sofa legs */}
        <rect x={180} y={700} width={8} height={24} rx={2} fill={r.trim} />
        <rect x={620} y={700} width={8} height={24} rx={2} fill={r.trim} />
      </g>

      {/* Side table */}
      <g opacity={furnP}>
        <rect x={700} y={600} width={80} height={100} rx={4} fill={r.trim} />
        <rect x={690} y={590} width={100} height={12} rx={4} fill={r.furniture} />
        {/* Lamp */}
        <rect x={725} y={490} width={30} height={100} rx={2} fill={r.trim} />
        <ellipse cx={740} cy={480} rx={50} ry={30} fill={r.accent} opacity={0.7} />
        {/* Lamp glow */}
        <ellipse cx={740} cy={500} rx={80} ry={60} fill={r.accent} opacity={0.1} />
      </g>

      {/* Plant (right side) */}
      <g opacity={furnP}>
        <rect x={1580} y={560} width={60} height={140} rx={8} fill={r.furniture} />
        {/* Leaves */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = -60 + i * 30;
          return (
            <ellipse
              key={i}
              cx={1610}
              cy={540 - i * 15}
              rx={35}
              ry={12}
              fill={p.painting.accent}
              opacity={0.7}
              transform={`rotate(${angle} 1610 ${540 - i * 15})`}
            />
          );
        })}
      </g>

      {/* Shelving / bookshelf (far right) */}
      <g opacity={furnP}>
        <rect x={1720} y={300} width={160} height={400} rx={4} fill={r.furniture} />
        <rect x={1730} y={320} width={140} height={4} fill={r.furnitureShade} />
        <rect x={1730} y={420} width={140} height={4} fill={r.furnitureShade} />
        <rect x={1730} y={520} width={140} height={4} fill={r.furnitureShade} />
        <rect x={1730} y={620} width={140} height={4} fill={r.furnitureShade} />
        {/* Books */}
        <rect x={1740} y={330} width={18} height={86} rx={2} fill={r.accent} opacity={0.8} />
        <rect x={1762} y={345} width={15} height={71} rx={2} fill={p.painting.primary} opacity={0.6} />
        <rect x={1780} y={335} width={20} height={81} rx={2} fill={p.painting.secondary} opacity={0.6} />
        <rect x={1740} y={430} width={22} height={86} rx={2} fill={p.painting.accent} opacity={0.6} />
        <rect x={1766} y={440} width={16} height={76} rx={2} fill={r.accent} opacity={0.5} />
      </g>

      {/* Ceiling light */}
      <g opacity={furnP * 0.6}>
        <line x1={960} y1={0} x2={960} y2={60} stroke={r.trim} strokeWidth={2} />
        <ellipse cx={960} cy={70} rx={60} ry={20} fill={r.trim} />
        <ellipse cx={960} cy={90} rx={120} ry={80} fill={r.accent} opacity={0.05} />
      </g>

      {/* Rug under sofa */}
      <g opacity={furnP * 0.7}>
        <rect x={120} y={730} width={560} height={180} rx={6} fill={p.painting.secondary} opacity={0.3} />
        <rect x={140} y={750} width={520} height={140} rx={4} fill={p.painting.primary} opacity={0.15} />
      </g>

      {/* Room structure lines — drawn on top */}
      <g
        fill="none"
        stroke={BRAND.ink}
        strokeWidth={2}
        opacity={lineP * 0.3}
      >
        {/* Floor line */}
        <line x1={0} y1={720} x2={W} y2={720} />
        {/* Vertical wall division */}
        <line x1={640} y1={0} x2={640} y2={720} />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Abstract Painting (SVG — 5 variations)                             */
/* ------------------------------------------------------------------ */
const Painting: React.FC<{
  p: RoomPalette;
  index: number;
  progress: number;
  brushProgress: number;
}> = ({ p, index, progress, brushProgress }) => {
  const c = p.painting;
  const pw = 340;
  const ph = 240;

  // Brush reveal clipPath
  const clipId = `paint-clip-${index}`;
  const revealW = pw * brushProgress;

  return (
    <svg
      width={pw}
      height={ph}
      viewBox={`0 0 ${pw} ${ph}`}
      style={{
        position: 'absolute',
        left: 920,
        top: 260,
        opacity: progress,
        filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.15))`,
      }}
    >
      {/* Frame */}
      <rect x={0} y={0} width={pw} height={ph} rx={2} fill="#2A2118" />
      <rect x={8} y={8} width={pw - 16} height={ph - 16} rx={1} fill={c.bg} />

      {/* Clip for brush reveal */}
      <defs>
        <clipPath id={clipId}>
          <rect x={8} y={8} width={revealW} height={ph - 16} />
        </clipPath>
      </defs>

      {/* Painting content, clipped by brush reveal */}
      <g clipPath={`url(#${clipId})`}>
        {index === 0 && (
          /* Abstract Sunset — warm layered arcs */
          <g>
            <ellipse cx={170} cy={200} rx={160} ry={100} fill={c.primary} opacity={0.8} />
            <ellipse cx={170} cy={180} rx={130} ry={80} fill={c.secondary} opacity={0.7} />
            <ellipse cx={170} cy={160} rx={100} ry={60} fill={c.accent} opacity={0.6} />
            <ellipse cx={170} cy={145} rx={70} ry={40} fill={c.highlight} opacity={0.8} />
            {/* Rays */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={60 + i * 55} y1={30} x2={60 + i * 55} y2={120} stroke={c.accent} strokeWidth={3} opacity={0.3} />
            ))}
          </g>
        )}
        {index === 1 && (
          /* Seascape Waves — flowing curves */
          <g>
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M 8,${60 + i * 40} Q ${85 + i * 10},${40 + i * 40} 170,${65 + i * 40} T 332,${55 + i * 40}`}
                fill="none"
                stroke={i % 2 === 0 ? c.primary : c.secondary}
                strokeWidth={i === 2 ? 8 : 4}
                opacity={0.7 - i * 0.08}
              />
            ))}
            <circle cx={280} cy={50} r={25} fill={c.accent} opacity={0.4} />
          </g>
        )}
        {index === 2 && (
          /* Botanical Leaves — overlapping leaf shapes */
          <g>
            {[
              { cx: 120, cy: 80, rx: 60, ry: 30, rot: -20, fill: c.primary },
              { cx: 200, cy: 120, rx: 50, ry: 25, rot: 30, fill: c.secondary },
              { cx: 160, cy: 160, rx: 70, ry: 28, rot: -10, fill: c.primary },
              { cx: 240, cy: 60, rx: 45, ry: 22, rot: 45, fill: c.accent },
              { cx: 100, cy: 150, rx: 55, ry: 24, rot: -35, fill: c.secondary },
              { cx: 270, cy: 170, rx: 48, ry: 20, rot: 15, fill: c.primary },
            ].map(({ cx, cy, rx, ry, rot, fill }, i) => (
              <ellipse
                key={i}
                cx={cx}
                cy={cy}
                rx={rx}
                ry={ry}
                fill={fill}
                opacity={0.7}
                transform={`rotate(${rot} ${cx} ${cy})`}
              />
            ))}
            {/* Stems */}
            <path d="M 120,90 Q 140,130 160,160" fill="none" stroke={c.accent} strokeWidth={3} opacity={0.5} />
          </g>
        )}
        {index === 3 && (
          /* Abstract Florals — soft circles and petals */
          <g>
            {[
              { cx: 140, cy: 100, r: 45, fill: c.primary },
              { cx: 220, cy: 130, r: 35, fill: c.secondary },
              { cx: 100, cy: 160, r: 30, fill: c.accent },
              { cx: 260, cy: 80, r: 28, fill: c.secondary },
              { cx: 180, cy: 180, r: 40, fill: c.primary },
            ].map(({ cx, cy, r, fill }, i) => (
              <React.Fragment key={i}>
                <circle cx={cx} cy={cy} r={r} fill={fill} opacity={0.6} />
                <circle cx={cx} cy={cy} r={r * 0.5} fill={c.highlight} opacity={0.4} />
              </React.Fragment>
            ))}
          </g>
        )}
        {index === 4 && (
          /* Geometric Art Deco — angular patterns */
          <g>
            <rect x={30} y={30} width={100} height={180} fill={c.primary} opacity={0.7} />
            <rect x={140} y={50} width={80} height={140} fill={c.secondary} opacity={0.6} />
            <rect x={230} y={20} width={90} height={200} fill={c.accent} opacity={0.5} />
            {/* Diamond shapes */}
            <polygon points="170,30 210,120 170,210 130,120" fill={c.highlight} opacity={0.4} />
            {/* Gold lines */}
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={30 + i * 80} y1={20} x2={30 + i * 80} y2={220} stroke={c.accent} strokeWidth={2} opacity={0.6} />
            ))}
            {/* Arcs */}
            <path d="M 50,50 A 60,60 0 0 1 110,110" fill="none" stroke={c.highlight} strokeWidth={3} opacity={0.5} />
            <path d="M 250,40 A 50,50 0 0 0 300,90" fill="none" stroke={c.primary} strokeWidth={3} opacity={0.5} />
          </g>
        )}
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/*  Colour Palette Swatches                                            */
/* ------------------------------------------------------------------ */
const SwatchBar: React.FC<{
  swatches: string[];
  progress: number;
  label: string;
}> = ({ swatches, progress, label }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
    }}
  >
    <div
      style={{
        fontFamily: FONT,
        ...TYPE.label,
        color: BRAND.ink,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </div>
    <div style={{ display: 'flex', gap: 16 }}>
      {swatches.map((color, i) => {
        const delay = i * 0.15;
        const swatchP = interpolate(progress, [delay, delay + 0.3], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                background: color,
                transform: `scale(${swatchP})`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />
            <div
              style={{
                fontFamily: FONT,
                ...TYPE.swatchLabel,
                color: '#8E857A',
                opacity: swatchP,
              }}
            >
              {color}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Text overlay (room style + painting subject)                       */
/* ------------------------------------------------------------------ */
const RoomText: React.FC<{
  style: string;
  subject: string;
  progress: number;
  exitProgress: number;
}> = ({ style: roomStyle, subject, progress, exitProgress }) => (
  <div
    style={{
      position: 'absolute',
      top: 60,
      left: 80,
      opacity: progress * exitProgress,
    }}
  >
    <div
      style={{
        fontFamily: FONT,
        ...TYPE.label,
        color: '#8E857A',
        textTransform: 'uppercase',
        marginBottom: 8,
        transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
      }}
    >
      {roomStyle}
    </div>
    <div
      style={{
        fontFamily: FONT,
        ...TYPE.headline,
        color: BRAND.ink,
        transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
      }}
    >
      {subject}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main RoomScene                                                     */
/* ------------------------------------------------------------------ */
export const RoomScene: React.FC<RoomSceneProps> = ({
  palette,
  from,
  to,
  index,
}) => {
  const frame = useCurrentFrame();
  const dur = to - from;
  const local = frame - from;

  // Only render when in range
  if (frame < from || frame >= to) return null;

  const localNorm = local / dur; // 0→1

  // Room builds in first 40% of section
  const roomP = interpolate(localNorm, [0, 0.4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  // Painting reveals 25%→65%
  const paintP = interpolate(localNorm, [0.2, 0.35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.brush,
  });
  const brushP = interpolate(localNorm, [0.25, 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.brush,
  });

  // Swatches appear 50%→80%
  const swatchP = interpolate(localNorm, [0.5, 0.75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  // Text
  const textP = interpolate(localNorm, [0.05, 0.2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  // Exit
  const exitP = interpolate(localNorm, [0.88, 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.exit,
  });

  // Entrance
  const entranceScale = interpolate(localNorm, [0, 0.05], [1.05, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.cinematic,
  });

  return (
    <AbsoluteFill
      style={{
        background: palette.room.wall,
        opacity: interpolate(localNorm, [0, 0.03, 0.92, 1], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        transform: `scale(${entranceScale})`,
      }}
    >
      <VectorRoom p={palette} progress={roomP} />
      <Painting p={palette} index={index} progress={paintP} brushProgress={brushP} />
      <RoomText style={palette.style} subject={palette.subject} progress={textP} exitProgress={exitP} />
      <SwatchBar swatches={palette.swatches} progress={swatchP} label={palette.name} />
    </AbsoluteFill>
  );
};
