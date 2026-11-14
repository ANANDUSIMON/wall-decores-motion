import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { COLORS, PALETTES, TYPE, T, ease, fonts } from '../theme';
import { pop, prog } from '../motion';

const BRAND = 'WALL DECORES';

/** Lotus mark — 8 vector petals, each spring-rotated into place. */
const LotusMark: React.FC<{ start: number; size: number; exit: number }> = ({ start, size, exit }) => {
  const f = useCurrentFrame();
  const pal = PALETTES[0].roles;
  const colors = [pal.tip, pal.field, pal.gold, pal.body];
  const petal = 'M0 0 C -34 -40 -30 -110 0 -150 C 30 -110 34 -40 0 0 Z';
  return (
    <svg width={size} height={size} viewBox="-180 -180 360 360" style={{ overflow: 'visible' }}>
      <g transform={`scale(${1 - exit * 0.4}) rotate(${exit * -40})`} opacity={1 - exit}>
        {Array.from({ length: 8 }, (_, i) => {
          const k = pop(f, start + i * 4, 12);
          const a = i * 45;
          return (
            <path
              key={i}
              d={petal}
              fill={colors[i % 4]}
              opacity={0.92}
              transform={`rotate(${a - (1 - k) * 90}) scale(${k})`}
              style={{ mixBlendMode: 'multiply' }}
            />
          );
        })}
        <circle r={22 * pop(f, start + 34, 10)} fill={COLORS.ink} />
      </g>
    </svg>
  );
};

/** Wordmark with letters arriving one by one. */
const Wordmark: React.FC<{ start: number; y: number; exit?: number }> = ({ start, y, exit = 0 }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        transform: `translateY(-50%) translateY(${-exit * 60}px)`,
        opacity: 1 - exit,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: fonts.headline,
        fontWeight: 900,
        fontSize: TYPE.wordmark,
        letterSpacing: '-0.035em',
        color: COLORS.ink,
        whiteSpace: 'pre',
        lineHeight: 1,
      }}
    >
      {BRAND.split('').map((ch, i) => {
        const p = prog(f, start + i * 3, 24, ease.heavy);
        return (
          <span key={i} style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 110}px)` }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

const MonoLine: React.FC<{ text: string; y: number; start: number; size?: number; color?: string; exit?: number; weight?: number }> = ({
  text,
  y,
  start,
  size = TYPE.caption,
  color = COLORS.ink,
  exit = 0,
  weight = 500,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, start, 24);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        transform: `translateY(-50%) translateY(${(1 - p) * 26 - exit * 60}px)`,
        opacity: p * (1 - exit),
        textAlign: 'center',
        fontFamily: fonts.mono,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: '0.16em',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

const Rule: React.FC<{ y: number; start: number; width: number; color: string; exit?: number }> = ({ y, start, width, color, exit = 0 }) => {
  const f = useCurrentFrame();
  const p = prog(f, start, 36, ease.heavy);
  return (
    <div
      style={{
        position: 'absolute',
        left: (1080 - width) / 2,
        width,
        top: y,
        height: 4,
        background: color,
        transform: `scaleX(${p})`,
        opacity: 1 - exit,
      }}
    />
  );
};

/** 01 · OPEN — lotus mark blooms, the name arrives, then everything lifts away. */
export const OpenTitle: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 372) return null;
  const exit = prog(f, 300, 50, ease.exit);
  const moving = f < 120 || f > 296;
  const body = (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center' }}>
        <LotusMark start={14} size={460} exit={exit} />
      </div>
      <Wordmark start={70} y={1110} exit={exit} />
      <MonoLine text="ARTISAN WALL ART · KERALA" y={1215} start={140} exit={exit} />
      <Rule y={1282} start={170} width={260} color={COLORS.coral} exit={exit} />
    </AbsoluteFill>
  );
  return moving ? (
    <CameraMotionBlur shutterAngle={220} samples={6}>
      {body}
    </CameraMotionBlur>
  ) : (
    body
  );
};

/** 06 · CONTACT — the room becomes a framed card; name and contacts settle under it. */
export const SignOff: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.wordmark) return null;
  const s = T.wordmark;
  const c = T.contacts;
  const moving = f < s + 70;
  const body = (
    <AbsoluteFill>
      <Wordmark start={s} y={1150} />
      <MonoLine text="ARTISAN WALL ART · KERALA" y={1252} start={s + 50} />
      <Rule y={1310} start={s + 70} width={840} color={COLORS.ink} />
      <MonoLine text="WALLDECORES.COM" y={1385} start={c} weight={700} />
      <MonoLine text="@WALL_DECORES_ARTISAN" y={1442} start={c + 8} weight={700} />
      <MonoLine text="+91 90377 90012" y={1499} start={c + 16} weight={700} />
      <MonoLine text="FOR DESIGNERS & ARCHITECTS" y={1600} start={c + 40} size={28} color={COLORS.coral} weight={700} />
    </AbsoluteFill>
  );
  return moving ? (
    <CameraMotionBlur shutterAngle={220} samples={6}>
      {body}
    </CameraMotionBlur>
  ) : (
    body
  );
};
