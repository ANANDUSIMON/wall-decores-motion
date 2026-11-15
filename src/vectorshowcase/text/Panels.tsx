import React from 'react';
import { useCurrentFrame } from 'remotion';
import { INK, LAYOUT, ROOMS, T, TYPE, ease, fonts, roomStart, type RoomDef } from '../theme';
import { hexToHsl, lerpHex, pop, prog } from '../motion';
import { PAINTINGS } from '../paint/paintings';

const P = LAYOUT.panel;

const mono = (size: number, weight = 500, color = INK): React.CSSProperties => ({
  fontFamily: fonts.mono,
  fontSize: size,
  fontWeight: weight,
  letterSpacing: '0.14em',
  color,
  whiteSpace: 'nowrap',
  lineHeight: 1,
});

/** A line that rises out of a clip (words stay crisp, no fade-only reveals). */
const Rise: React.FC<{ p: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; dist?: number }> = ({
  p,
  out = 0,
  children,
  style,
  dist = 1.1,
}) => (
  <div style={{ overflow: 'hidden', paddingBottom: '0.12em', ...style }}>
    <div style={{ transform: `translateY(${(1 - p) * dist * 100}%) translateY(${-out * 30}px)`, opacity: Math.min(1, p * 1.6) * (1 - out) }}>{children}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Harmony wheel — hue ring, wall dot, painting dots, linking chords.   */
/* ------------------------------------------------------------------ */
const HarmonyWheel: React.FC<{ room: RoomDef; p: number; size: number }> = ({ room, p, size }) => {
  const R = size / 2 - 8;
  const segs = 36;
  const pt = (hue: number, r: number) => {
    const a = ((hue - 90) * Math.PI) / 180;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  };
  const wall = hexToHsl(room.wall);
  const others = room.swatches.slice(2).map((s) => ({ hex: s.hex, hsl: hexToHsl(s.hex) })).filter((o) => o.hsl.s > 0.25 && o.hsl.l < 0.9);
  const w = pt(wall.h, R * 0.68);
  return (
    <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{ overflow: 'visible' }}>
      <g transform={`rotate(${(1 - p) * -90}) scale(${0.7 + 0.3 * p})`} opacity={p}>
        {Array.from({ length: segs }, (_, i) => {
          const a0 = ((i * 360) / segs - 90) * (Math.PI / 180);
          const a1 = (((i + 1) * 360) / segs - 90) * (Math.PI / 180);
          const r0 = R * 0.84;
          const d = `M${Math.cos(a0) * r0} ${Math.sin(a0) * r0} L${Math.cos(a0) * R} ${Math.sin(a0) * R} A${R} ${R} 0 0 1 ${Math.cos(a1) * R} ${Math.sin(a1) * R} L${Math.cos(a1) * r0} ${Math.sin(a1) * r0} A${r0} ${r0} 0 0 0 ${Math.cos(a0) * r0} ${Math.sin(a0) * r0} Z`;
          return <path key={i} d={d} fill={`hsl(${(i * 360) / segs + 5}, 70%, 58%)`} />;
        })}
        {others.map((o, i) => {
          const q = pt(o.hsl.h, R * 0.68);
          return <line key={`l${i}`} x1={w.x} y1={w.y} x2={q.x} y2={q.y} stroke={INK} strokeWidth={2} strokeDasharray="4 4" opacity={0.55} />;
        })}
        {others.map((o, i) => {
          const q = pt(o.hsl.h, R * 0.68);
          return <circle key={`d${i}`} cx={q.x} cy={q.y} r={9} fill={o.hex} stroke="#fff" strokeWidth={3} />;
        })}
        <circle cx={w.x} cy={w.y} r={14} fill={room.wall} stroke={INK} strokeWidth={3} />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* Room panel                                                           */
/* ------------------------------------------------------------------ */
const SW = 132; // swatch width
const SG = 25; // swatch gap — 5 x 132 + 4 x 25 = 760 = panel width

const RoomPanel: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const room = ROOMS[i];
  const s = roomStart(i);
  const end = i === ROOMS.length - 1 ? T.compose[0] + 10 : s + T.roomLen;
  if (f < s || f > end + 2) return null;
  const l = f - s;
  const out = prog(f, end - 26, 26, ease.exit);
  const a = (k: number, dur = 30) => prog(l, k, dur, ease.type);

  const paint = PAINTINGS[i];
  const total = paint.marks.length;
  const done = paint.marks.filter((m) => f >= m.end).length;
  const pct = Math.round(prog(f, paint.marks[0].start, paint.end - paint.marks[0].start, (x) => x) * 100);
  const titleColor = lerpHex(room.wall, '#000000', 0.12);

  return (
    <div style={{ position: 'absolute', left: P.x, top: 0, width: P.w, height: 1080 }}>
      {/* kicker */}
      <div style={{ position: 'absolute', top: 150, left: 0, display: 'flex', alignItems: 'center', gap: 16, opacity: a(4) * (1 - out) }}>
        <div style={{ width: 18, height: 18, borderRadius: 9, background: room.wall, transform: `scale(${pop(f, s + 4)})` }} />
        <span style={mono(TYPE.kicker, 700)}>ROOM {String(room.id).padStart(2, '0')} / 05</span>
        <span style={mono(TYPE.kicker, 500, 'rgba(23,18,13,0.55)')}>· WALL {room.wall.toUpperCase()}</span>
      </div>

      {/* room name */}
      <div style={{ position: 'absolute', top: 192, left: 0 }}>
        <Rise p={a(8, 34)} out={out}>
          <div style={{ fontFamily: fonts.sans, fontWeight: 800, fontSize: TYPE.hero, letterSpacing: '-0.035em', lineHeight: 0.98, color: INK }}>{room.name[0]}</div>
        </Rise>
        <Rise p={a(16, 34)} out={out}>
          <div style={{ fontFamily: fonts.serif, fontStyle: 'italic', fontSize: TYPE.heroItalic, lineHeight: 0.92, color: titleColor }}>{room.name[1]}</div>
        </Rise>
      </div>

      {/* the painting */}
      <div style={{ position: 'absolute', top: 444, left: 0, width: P.w, opacity: 1 - out }}>
        <div style={{ ...mono(TYPE.label, 700, 'rgba(23,18,13,0.6)'), opacity: a(40) }}>THE PAINTING</div>
        <Rise p={a(46, 34)} style={{ marginTop: 12 }}>
          <div style={{ fontFamily: fonts.serif, fontStyle: 'italic', fontSize: TYPE.subject, lineHeight: 1, color: INK }}>
            → {room.subject}
          </div>
        </Rise>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 18, opacity: a(60) }}>
          <div style={{ flex: 1, height: 6, background: 'rgba(23,18,13,0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${room.swatches[2].hex}, ${room.swatches[3].hex})` }} />
          </div>
          <span style={{ ...mono(TYPE.label, 700), width: 250, textAlign: 'right' }}>
            STROKE {String(done).padStart(2, '0')} / {total}
          </span>
        </div>
      </div>

      {/* colour composition */}
      <div style={{ position: 'absolute', top: 628, left: 0, width: P.w, opacity: 1 - out }}>
        <div style={{ ...mono(TYPE.label, 700, 'rgba(23,18,13,0.6)'), opacity: a(80) }}>COLOUR COMPOSITION</div>
        {/* brackets: in the room / in the painting */}
        <div style={{ position: 'relative', height: 40, marginTop: 14 }}>
          {[
            { x: 0, w: SW * 2 + SG, label: 'IN THE ROOM', at: 92 },
            { x: (SW + SG) * 2, w: SW * 3 + SG * 2, label: 'IN THE PAINTING', at: 112 },
          ].map((b) => {
            const p = a(b.at, 28);
            return (
              <div key={b.label} style={{ position: 'absolute', left: b.x, width: b.w, top: 0 }}>
                <div style={{ ...mono(TYPE.label, 700), opacity: p }}>{b.label}</div>
                <div style={{ marginTop: 10, height: 10, borderLeft: `2px solid ${INK}`, borderRight: `2px solid ${INK}`, borderTop: `2px solid ${INK}`, transformOrigin: 'left', transform: `scaleX(${p})`, opacity: 0.7 }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: SG, marginTop: 6 }}>
          {room.swatches.map((sw, k) => {
            const p = pop(f, s + 96 + k * 9, 12);
            const t = a(104 + k * 9, 24);
            const light = hexToHsl(sw.hex).l > 0.85;
            return (
              <div key={k} style={{ width: SW }}>
                <div
                  style={{
                    height: 112,
                    borderRadius: 14,
                    background: sw.hex,
                    boxShadow: light ? `inset 0 0 0 2px rgba(23,18,13,0.15)` : 'none',
                    transform: `scale(${p})`,
                    transformOrigin: 'bottom center',
                  }}
                />
                <div style={{ ...mono(TYPE.label, 700), marginTop: 14, opacity: t }}>{sw.label}</div>
                <div style={{ ...mono(TYPE.label, 500, 'rgba(23,18,13,0.6)'), marginTop: 8, opacity: t, letterSpacing: '0.06em' }}>{sw.hex.toUpperCase()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* harmony */}
      <div style={{ position: 'absolute', top: 902, left: 0, width: P.w, display: 'flex', alignItems: 'center', gap: 26, opacity: 1 - out }}>
        <HarmonyWheel room={room} p={a(150, 40)} size={104} />
        <div style={{ opacity: a(164) }}>
          <div style={mono(TYPE.label, 700)}>{room.harmony}</div>
          <div style={{ fontFamily: fonts.serif, fontStyle: 'italic', fontSize: TYPE.body, color: INK, marginTop: 10, lineHeight: 1 }}>{room.note}</div>
        </div>
      </div>
    </div>
  );
};

export const RoomPanels: React.FC = () => (
  <>
    {ROOMS.map((_, i) => (
      <RoomPanel key={i} i={i} />
    ))}
  </>
);

/* ------------------------------------------------------------------ */
/* BUILD panel — what we do, in three beats                             */
/* ------------------------------------------------------------------ */
export const BuildPanel: React.FC = () => {
  const f = useCurrentFrame();
  const [s, e] = T.build;
  if (f < s || f > e + 2) return null;
  const out = prog(f, e - 24, 24, ease.exit);
  const a = (k: number, dur = 30) => prog(f, s + k, dur, ease.type);
  const steps = ['READ THE ROOM', 'COMPOSE THE PALETTE', 'PAINT IT BY HAND'];
  return (
    <div style={{ position: 'absolute', left: P.x, top: 0, width: P.w, height: 1080 }}>
      <div style={{ position: 'absolute', top: 250, ...mono(TYPE.kicker, 700), opacity: a(10) * (1 - out) }}>WHAT WE DO</div>
      <div style={{ position: 'absolute', top: 296 }}>
        <Rise p={a(16, 34)} out={out}>
          <div style={{ fontFamily: fonts.sans, fontWeight: 800, fontSize: TYPE.hero, letterSpacing: '-0.035em', lineHeight: 0.98, color: INK }}>Every room</div>
        </Rise>
        <Rise p={a(26, 34)} out={out}>
          <div style={{ fontFamily: fonts.serif, fontStyle: 'italic', fontSize: TYPE.heroItalic, lineHeight: 0.92, color: '#D85A30' }}>has a colour.</div>
        </Rise>
      </div>
      <div style={{ position: 'absolute', top: 600, display: 'flex', flexDirection: 'column', gap: 26 }}>
        {steps.map((t, k) => {
          const p = a(58 + k * 16, 28);
          return (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: p * (1 - out), transform: `translateX(${(1 - p) * 40}px)` }}>
              <span style={{ ...mono(26, 700), color: ['#D85A30', '#1D9E75', '#D4537E'][k] }}>0{k + 1}</span>
              <span style={mono(28, 700)}>{t}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', top: 852, fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 40, color: 'rgba(23,18,13,0.75)', opacity: a(110) * (1 - out) }}>
        Five rooms. Five paintings. One studio.
      </div>
    </div>
  );
};

