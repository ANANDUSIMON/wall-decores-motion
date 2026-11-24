import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { strokePath } from "./brush";
import {
  AUDIO,
  C,
  CONTACT,
  FG_DEPTH_IN,
  FRAME_DEPTH_IN,
  H,
  PAINTINGS,
  PERSPECTIVE,
  Placement,
  ROOMS,
  Room,
  W,
  WIPE,
  cm,
  f,
} from "./config";
import { TL } from "./timeline";

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const easeIO = Easing.inOut(Easing.cubic);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const prog = (frame: number, startSec: number, durSec: number, e = ease) =>
  interpolate(frame, [f(startSec), f(startSec + durSec)], [0, 1], { ...clamp, easing: e });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const SERIF = "Cormorant Garamond, serif";
const SANS = "Inter, sans-serif";

// ---------- cold-open hook ----------
// Room 1 opens on the FINISHED wall — the painting already hung — then it whips off
// the wall and leaves the bare wall the rest of the reel works from.
// This lives inside room 1's existing opening seconds, so the 90.32s runtime and
// every voiceover timestamp stay exactly where they were.
const HOOK = {
  hold: 0.95, // s · finished room on screen
  rip: 0.6, // s · the painting accelerates up and out of frame
  tail: 0.75, // s · hook line lingers over the bare wall
  line: "Can you pick the right one?",
};
const HOOK_END = HOOK.hold + HOOK.rip;

// Text leads the voice by this much so the eye lands as the ear does.
const LEAD = 0.1;

// Each painting carries its own hex in config.ts. Those are true pigment values, so some
// (deep teal, oxblood) are far too dark to read as type. This lifts any of them to a fixed
// brightness, keeping the hue so the text still belongs to the painting on screen.
const liftColor = (hex: string, L = 0.66, minS = 0.6) => {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6 : mx === g ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6;
  const l0 = (mx + mn) / 2;
  const s = Math.min(Math.max(d ? d / (1 - Math.abs(2 * l0 - 1)) : 0, minS), 0.95);
  const c = (1 - Math.abs(2 * L - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = L - c / 2;
  const seg = Math.floor(h * 6) % 6;
  const [rr, gg, bb] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][seg];
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(rr)}${to(gg)}${to(bb)}`;
};

// ---------- geometry ----------
type Rect = { x: number; y: number; w: number; h: number };
const rectOf = (room: Room, pl: Placement): Rect => {
  const w = pl.wIn * room.ppi;
  const h = pl.hIn * room.ppi;
  return { x: room.cx - w / 2, y: room.floorY - (pl.bottomIn + pl.hIn) * room.ppi, w, h };
};
const mixRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});

// ---------- 3D layers ----------
// Each depth layer is a full-frame plane pushed toward the camera by z and scaled back
// by (P - z) / P about the perspective origin, so at rest everything lines up exactly
// with the photograph. Depth only shows when the camera arcs.
const Layer: React.FC<{ z: number; origin: [number, number]; children: React.ReactNode; style?: React.CSSProperties }> = ({
  z,
  origin,
  children,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: W,
      height: H,
      transformStyle: "preserve-3d",
      transformOrigin: `${origin[0]}px ${origin[1]}px`,
      transform: `translateZ(${z}px) scale(${(PERSPECTIVE - z) / PERSPECTIVE})`,
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- framed painting as a real box standing off the wall ----------
const FRAME_FACE_IN = 1.3;
const GAP_IN = 0.4;

const FrameBox: React.FC<{
  r: Rect;
  ppi: number;
  depth: number; // px
  appear: number; // 0..1 hanging animation
  children: React.ReactNode; // canvas content
}> = ({ r, ppi, depth, appear, children }) => {
  const fr = FRAME_FACE_IN * ppi;
  const gap = GAP_IN * ppi;
  const ow = r.w + (fr + gap) * 2;
  const oh = r.h + (fr + gap) * 2;
  const d = depth * appear;
  const side = (s: React.CSSProperties) => ({ position: "absolute" as const, ...s });
  return (
    <div
      style={{
        position: "absolute",
        left: r.x - fr - gap,
        top: r.y - fr - gap,
        width: ow,
        height: oh,
        transformStyle: "preserve-3d",
        transform: `translateZ(${d}px)`,
        opacity: interpolate(appear, [0, 0.35], [0, 1], clamp),
      }}
    >
      {/* sides of the frame, running back to the wall (light from the left) */}
      <div style={side({ left: 0, top: 0, width: d, height: oh, background: "linear-gradient(90deg,#4a3a2c,#2e231a)", transformOrigin: "left center", transform: "rotateY(90deg)" })} />
      <div style={side({ left: ow, top: 0, width: d, height: oh, background: "linear-gradient(90deg,#120c08,#1c140e)", transformOrigin: "left center", transform: "rotateY(90deg)" })} />
      <div style={side({ left: 0, top: 0, width: ow, height: d, background: "linear-gradient(180deg,#5a4634,#33261c)", transformOrigin: "center top", transform: "rotateX(-90deg)" })} />
      <div style={side({ left: 0, top: oh, width: ow, height: d, background: "#140e0a", transformOrigin: "center top", transform: "rotateX(-90deg)" })} />
      {/* front face */}
      <div style={side({ left: 0, top: 0, width: ow, height: oh, background: "linear-gradient(135deg,#3a2c21 0%,#271c14 55%,#1d150f 100%)", boxShadow: "inset 0 0 0 3px rgba(255,230,190,0.10), inset 2px 2px 0 rgba(255,235,200,0.18)" })} />
      <div style={side({ left: fr, top: fr, width: r.w + gap * 2, height: r.h + gap * 2, background: "#0c0806" })} />
      <div style={side({ left: fr + gap, top: fr + gap, width: r.w, height: r.h, overflow: "hidden" })}>{children}</div>
    </div>
  );
};

// cast shadow of the frame on the wall plane
const FrameShadow: React.FC<{ r: Rect; ppi: number; depth: number; appear: number }> = ({ r, ppi, depth, appear }) => {
  const pad = (FRAME_FACE_IN + GAP_IN) * ppi;
  const d = depth * appear;
  return (
    <div
      style={{
        position: "absolute",
        left: r.x - pad,
        top: r.y - pad,
        width: r.w + pad * 2,
        height: r.h + pad * 2,
        boxShadow: `${0.7 * d}px ${1.0 * d}px ${1.6 * d + 10}px rgba(25,15,8,${0.42 * appear}), ${0.15 * d}px ${0.25 * d}px ${0.3 * d + 4}px rgba(25,15,8,${0.35 * appear})`,
      }}
    />
  );
};

const Canvas: React.FC<{ pl: Placement; p: number; seed: number; w: number; h: number }> = ({ pl, p, seed, w, h }) => (
  <>
    {p > 0 ? (
      <div style={{ position: "absolute", inset: 0, clipPath: p >= 1 ? undefined : `path('${strokePath(w, h, p, seed, "in", 6)}')` }}>
        <Img src={staticFile(PAINTINGS[pl.p].file)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    ) : null}
  </>
);

// ---------- dimension graphics ----------
type Ink = { line: string; under: string; pill: string; text: string };
const inkOf = (room: Room): Ink =>
  room.ink === "dark"
    ? { line: C.ink, under: "rgba(255,248,236,0.55)", pill: C.ink, text: C.cream }
    : { line: C.cream, under: "rgba(20,14,10,0.45)", pill: C.cream, text: C.ink };
const LW = 5;
const TICK = 22;

const Label: React.FC<{ x: number; y: number; text: string; ink: Ink; o: number; rotate?: boolean; size?: number }> = ({
  x,
  y,
  text,
  ink,
  o,
  rotate,
  size = 46,
}) => {
  const w = text.length * size * 0.56 + 48;
  const h = size + 30;
  return (
    <g transform={`translate(${x} ${y}) ${rotate ? "rotate(-90)" : ""} scale(${0.85 + 0.15 * o})`} opacity={o}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={ink.pill} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={500} fontSize={size} fill={ink.text} letterSpacing={1}>
        {text}
      </text>
    </g>
  );
};

const HDim: React.FC<{ x0: number; x1: number; y: number; refY?: number; text: string; ink: Ink; p: number }> = ({ x0, x1, y, refY, text, ink, p }) => {
  if (p <= 0) return null;
  const mid = (x0 + x1) / 2;
  const half = ((x1 - x0) / 2) * Math.min(1, p / 0.7);
  const tp = interpolate(p, [0.55, 0.85], [0, 1], clamp);
  const lo = interpolate(p, [0.6, 1], [0, 1], clamp);
  const lines = (s: string, a: number) => (
    <>
      {refY !== undefined ? (
        <>
          <line x1={x0} y1={refY} x2={x0} y2={lerp(refY, y - 26, tp)} stroke={s} strokeWidth={3 + a} />
          <line x1={x1} y1={refY} x2={x1} y2={lerp(refY, y - 26, tp)} stroke={s} strokeWidth={3 + a} />
        </>
      ) : null}
      <line x1={mid - half} y1={y} x2={mid + half} y2={y} stroke={s} strokeWidth={LW + a} strokeLinecap="round" />
      {tp > 0 ? (
        <>
          <line x1={x0 - TICK * tp} y1={y + TICK * tp} x2={x0 + TICK * tp} y2={y - TICK * tp} stroke={s} strokeWidth={LW + a} strokeLinecap="round" />
          <line x1={x1 - TICK * tp} y1={y + TICK * tp} x2={x1 + TICK * tp} y2={y - TICK * tp} stroke={s} strokeWidth={LW + a} strokeLinecap="round" />
        </>
      ) : null}
    </>
  );
  return (
    <g>
      {lines(ink.under, 4)}
      {lines(ink.line, 0)}
      <Label x={mid} y={y} text={text} ink={ink} o={lo} />
    </g>
  );
};

const VDim: React.FC<{ x: number; y0: number; y1: number; refX?: number; text: string; ink: Ink; p: number; rotate?: boolean; labelDx?: number }> = ({
  x,
  y0,
  y1,
  refX,
  text,
  ink,
  p,
  rotate = true,
  labelDx = 0,
}) => {
  if (p <= 0) return null;
  const mid = (y0 + y1) / 2;
  const half = ((y1 - y0) / 2) * Math.min(1, p / 0.7);
  const tp = interpolate(p, [0.55, 0.85], [0, 1], clamp);
  const lo = interpolate(p, [0.6, 1], [0, 1], clamp);
  const lines = (s: string, a: number) => (
    <>
      {refX !== undefined ? (
        <>
          <line x1={refX} y1={y0} x2={lerp(refX, x + 26, tp)} y2={y0} stroke={s} strokeWidth={3 + a} />
          <line x1={refX} y1={y1} x2={lerp(refX, x + 26, tp)} y2={y1} stroke={s} strokeWidth={3 + a} />
        </>
      ) : null}
      <line x1={x} y1={mid - half} x2={x} y2={mid + half} stroke={s} strokeWidth={LW + a} strokeLinecap="round" />
      {tp > 0 ? (
        <>
          <line x1={x - TICK * tp} y1={y0 + TICK * tp} x2={x + TICK * tp} y2={y0 - TICK * tp} stroke={s} strokeWidth={LW + a} strokeLinecap="round" />
          <line x1={x - TICK * tp} y1={y1 + TICK * tp} x2={x + TICK * tp} y2={y1 - TICK * tp} stroke={s} strokeWidth={LW + a} strokeLinecap="round" />
        </>
      ) : null}
    </>
  );
  return (
    <g>
      {lines(ink.under, 4)}
      {lines(ink.line, 0)}
      <Label x={x + labelDx} y={mid} text={text} ink={ink} o={lo} rotate={rotate} />
    </g>
  );
};

// measurements that belong to the painting (drawn on the painting's own depth plane)
const PaintingDims: React.FC<{ room: Room; r: Rect; wIn: number; hIn: number; bottomIn: number; p: number }> = ({ room, r, wIn, hIn, bottomIn, p }) => {
  const ink = inkOf(room);
  const st = (i: number) => interpolate(p, [i * 0.22, i * 0.22 + 0.5], [0, 1], clamp);
  const pad = (FRAME_FACE_IN + GAP_IN) * room.ppi;
  const right = r.x + r.w + pad;
  const top = r.y - pad;
  const centreIn = Math.round(bottomIn + hIn / 2);
  const lvl = st(2);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <HDim x0={r.x - pad} x1={right} y={top - 80} refY={top - 10} text={`${Math.round(wIn)}" · ${cm(wIn)} cm`} ink={ink} p={st(0)} />
      <VDim x={right + 80} y0={top} y1={r.y + r.h + pad} refX={right + 10} text={`${Math.round(hIn)}" · ${cm(hIn)} cm`} ink={ink} p={st(1)} />
      {/* centre-height level marker on the left */}
      {lvl > 0 ? (
        <g opacity={lvl}>
          <line x1={r.x - pad - 30} y1={r.y + r.h / 2} x2={r.x - pad - 30 - 70 * lvl} y2={r.y + r.h / 2} stroke={ink.under} strokeWidth={9} strokeLinecap="round" />
          <line x1={r.x - pad - 30} y1={r.y + r.h / 2} x2={r.x - pad - 30 - 70 * lvl} y2={r.y + r.h / 2} stroke={ink.line} strokeWidth={5} strokeLinecap="round" />
          <Label x={r.x - pad - 130} y={r.y + r.h / 2} text={`centre ${centreIn}" up`} ink={ink} o={lvl} rotate />
        </g>
      ) : null}
    </svg>
  );
};

// measurements that belong to the furniture (drawn on the furniture's depth plane)
const FurnDims: React.FC<{ room: Room; r: Rect; wIn: number; bottomIn: number; p: number }> = ({ room, r, wIn, bottomIn, p }) => {
  const ink = inkOf(room);
  const st = (i: number) => interpolate(p, [0.3 + i * 0.25, 0.3 + i * 0.25 + 0.45], [0, 1], clamp);
  const pad = (FRAME_FACE_IN + GAP_IN) * room.ppi;
  const furnTopY = room.floorY - room.furn.topIn * room.ppi;
  const clearIn = Math.round(bottomIn - room.furn.topIn);
  const ratio = room.furn.kind === "sofa" ? Math.round((wIn / room.furn.widthIn) * 100) : null;
  const cx = r.x + r.w / 2;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <VDim x={cx} y0={r.y + r.h + pad} y1={furnTopY} text={`${clearIn}" ${room.furn.kind === "sofa" ? "above the sofa" : "above the table"}`} ink={ink} p={st(0)} rotate={false} labelDx={0} />
      {room.furn.kind === "sofa" && room.furn.x0 !== undefined && room.furn.x1 !== undefined ? (
        <HDim x0={room.furn.x0} x1={room.furn.x1} y={furnTopY + 70} text={`Sofa ${room.furn.widthIn}" · art = ${ratio}% of it`} ink={ink} p={st(1)} />
      ) : null}
    </svg>
  );
};

const Outline: React.FC<{ r: Rect; ppi: number; ink: Ink; p: number; fade: number }> = ({ r, ppi, ink, p, fade }) => {
  if (p <= 0 || fade >= 1) return null;
  const pad = (FRAME_FACE_IN + GAP_IN) * ppi;
  const x = r.x - pad,
    y = r.y - pad,
    w = r.w + pad * 2,
    h = r.h + pad * 2;
  const per = (w + h) * 2;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }} opacity={1 - fade}>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={ink.under} strokeWidth={10} strokeDasharray={`${per * p} ${per}`} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={ink.line} strokeWidth={5} strokeDasharray={`${per * p} ${per}`} />
      {[
        [x, y],
        [x + w, y],
        [x, y + h],
        [x + w, y + h],
      ].map(([a, b], i) => (
        <circle key={i} cx={a} cy={b} r={12} fill={ink.line} opacity={interpolate(p, [0.6, 1], [0, 1], clamp)} />
      ))}
    </svg>
  );
};

// ---------- heading + caption ----------
const voAt = (t: number) => TL.vo.find((v) => t >= v.at - 0.05 && t <= v.at + v.dur + 0.15);

const Caption: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  const v = voAt(t);
  if (!v) return null;
  const o = interpolate(t, [v.at - 0.05, v.at + 0.2, v.at + v.dur, v.at + v.dur + 0.15], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", top, left: 0, width: W, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          maxWidth: 1760,
          padding: "22px 44px",
          borderRadius: 34,
          background: "rgba(20,15,11,0.62)",
          color: C.cream,
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: 56,
          lineHeight: 1.3,
          textAlign: "center",
        }}
      >
        {v.text}
      </div>
    </div>
  );
};

const TXT_SHADOW = "0 4px 24px rgba(0,0,0,0.70), 0 2px 6px rgba(0,0,0,0.50)";
// White type stays white for legibility; the colour arrives as a soft halo around it,
// so the text reads as lit by the painting rather than outlined.
const glowShadow = (accent: string) =>
  `0 0 70px ${accent}59, 0 0 26px ${accent}3D, 0 4px 24px rgba(0,0,0,0.78), 0 2px 6px rgba(0,0,0,0.55)`;

const Heading: React.FC<{
  kicker: string;
  line: string;
  lineStart: number;
  frame: number;
  accent: string;
  tintLine?: boolean;
  chip?: { wall: string; art: string; text: string; o: number };
}> = ({ kicker, line, lineStart, frame, accent, tintLine, chip }) => {
  const k = interpolate(frame, [0, 20], [0, 1], { ...clamp, easing: ease });
  const l = interpolate(frame, [lineStart, lineStart + 24], [0, 1], { ...clamp, easing: ease });
  const rule = interpolate(frame, [lineStart + 10, lineStart + 38], [0, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: "absolute", left: 0, bottom: 860, width: W, textAlign: "center", color: "#FFFFFF" }}>
      {/* Every room is a muted version of its painting's palette, so accent-on-wall is always
          low contrast. The label rides a dark pill, which lets the colour run bright and still read. */}
      <div style={{ opacity: k }}>
        <div
          style={{
            display: "inline-block",
            padding: "16px 40px",
            borderRadius: 60,
            background: "rgba(10,7,5,0.76)",
            border: `3px solid ${accent}66`,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 58,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {kicker}
        </div>
      </div>
      <div key={line} style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 240, lineHeight: 1.04, marginTop: 22, color: "#FFFFFF", opacity: l, translate: `0 ${(1 - l) * 40}px`, textShadow: glowShadow(accent) }}>
        {line}
      </div>
      <div style={{ margin: "16px auto 0", width: (tintLine ? 420 : 300) * rule, height: 10, borderRadius: 6, background: accent, opacity: l, boxShadow: `0 0 34px ${accent}, 0 0 10px rgba(0,0,0,0.5)` }} />
      {chip && chip.o > 0 ? (
        <div
          style={{
            marginTop: 22,
            display: "inline-flex",
            alignItems: "center",
            gap: 22,
            padding: "18px 38px",
            borderRadius: 60,
            background: "rgba(0,0,0,0.60)",
            fontFamily: SANS,
            fontSize: 50,
            fontWeight: 600,
            color: "#FFFFFF",
            opacity: chip.o,
          }}
        >
          <span style={{ width: 44, height: 44, borderRadius: 22, background: chip.wall, border: "3px solid #fff" }} />
          <span style={{ opacity: 0.65 }}>→</span>
          <span style={{ width: 44, height: 44, borderRadius: 22, background: chip.art, border: "3px solid #fff" }} />
          <span>{chip.text}</span>
        </div>
      ) : null}
    </div>
  );
};

// ---------- one room ----------
type RoomTL = (typeof TL.rooms)[number];

const RoomScene: React.FC<{ room: Room; index: number; tl: RoomTL }> = ({ room, index, tl }) => {
  const frame = useCurrentFrame();
  const t = tl.start + frame / 60; // absolute seconds
  const rel = (abs: number) => abs - tl.start;
  const len = tl.end - tl.start;

  const rA = rectOf(room, room.A);
  const rB = rectOf(room, room.B);
  const outP = prog(frame, rel(tl.outline), 0.9);
  const hang = prog(frame, rel(tl.place), 0.7);
  const pA = prog(frame, rel(tl.wipeA), WIPE, easeIO);
  const pB = prog(frame, rel(tl.wipeB), WIPE, easeIO);
  const morph = prog(frame, rel(tl.wipeB), WIPE, easeIO);
  const dimsP = interpolate(frame, [f(rel(tl.dims)), f(rel(tl.dims) + 1.6)], [0, 1], clamp);
  const r = mixRect(rA, rB, morph);
  const wIn = lerp(room.A.wIn, room.B.wIn, morph);
  const hIn = lerp(room.A.hIn, room.B.hIn, morph);
  const bIn = lerp(room.A.bottomIn, room.B.bottomIn, morph);

  // camera: slow 3D arc across the room + gentle dolly toward the painting
  const ry = interpolate(frame, [0, f(len)], [5.5, -4.5], { ...clamp, easing: easeIO });
  const rx = interpolate(frame, [0, f(len)], [2.2, 0.6], { ...clamp, easing: easeIO });
  const sc = interpolate(frame, [0, f(len)], room.cam ?? [1.12, 1.2], { ...clamp, easing: easeIO });

  // Cold open: room 1 starts on the finished wall, no fade from black — frame 0 must
  // already be the painting, because that is what stops the scroll.
  const isHook = index === 0;
  const ripP = isHook ? prog(frame, HOOK.hold, HOOK.rip, Easing.in(Easing.cubic)) : 0;
  const inHook = isHook && t < HOOK_END;
  // The rip transform must ONLY exist during the hook window. After it, ripP clamps at 1
  // forever — so if we kept applying it, the painting would stay flung off-screen for the
  // whole room and the real reveal (hang / pA) would be invisible. Past the hook it is
  // identity + opaque, and visibility is handed back to hangEff / pAEff.
  const ripActive = isHook && t < HOOK_END + 0.05;
  const ripT = ripActive ? `translate(${ripP * 70}px, ${-ripP * H * 0.95}px) rotate(${-ripP * 7}deg) scale(${1 + ripP * 0.07})` : "none";
  const ripO = ripActive ? interpolate(ripP, [0, 0.78, 1], [1, 1, 0], clamp) : 1;
  const fadeIn = isHook ? 1 : interpolate(frame, [0, 12], [0, 1], clamp);
  const ox = rA.x + rA.w / 2;
  const oy = rA.y + rA.h / 2;
  const origin: [number, number] = [ox, oy];
  const depth = FRAME_DEPTH_IN * room.ppi;
  const fgZ = FG_DEPTH_IN * room.ppi;

  const ink = inkOf(room);
  let line: string;
  let lineStart: number;
  let tintLine = false;
  if (isHook && t < HOOK_END + HOOK.tail) {
    line = HOOK.line;
    lineStart = f(0.12);
  } else if (index === 0 && t < room.lineAt) {
    line = "Find the painting that belongs.";
    lineStart = f(HOOK_END + HOOK.tail);
  } else {
    // stays invisible until room.lineAt, so the words land with the voice that speaks them
    line = room.emptyLine;
    lineStart = f(rel(room.lineAt));
  }
  if (room.then && t >= room.then.at) {
    line = room.then.text;
    lineStart = f(rel(room.then.at));
  }
  if (t >= tl.wipeA) {
    line = "This…";
    lineStart = f(rel(tl.wipeA));
    tintLine = true;
  }
  if (t >= tl.wipeB) {
    line = "…or this?";
    lineStart = f(rel(tl.wipeB));
    tintLine = true;
  }
  const cur = t >= tl.wipeB ? room.B : room.A;
  const accent = liftColor(PAINTINGS[cur.p].hex);
  // during the cold open the painting is already hung and fully painted
  const hangEff = inHook ? 1 : hang;
  const pAEff = inHook ? 1 : pA;
  const chipO =
    t < tl.wipeA + 0.8 ? 0 : t < tl.wipeB ? prog(frame, rel(tl.wipeA + 0.8), 0.5) : prog(frame, rel(tl.wipeB + 0.8), 0.5);
  const canvasWH = { w: r.w, h: r.h };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeIn }}>
      <AbsoluteFill style={{ perspective: PERSPECTIVE, perspectiveOrigin: `${ox}px ${oy}px`, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: W,
            height: H,
            transformStyle: "preserve-3d",
            transformOrigin: `${ox}px ${oy}px`,
            transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${sc})`,
          }}
        >
          {/* wall plane */}
          <Layer z={0} origin={origin}>
            <Img src={staticFile(room.img)} style={{ position: "absolute", width: W, height: H }} />
            {/* the cast shadow unsticks fast as the painting lifts — leaving it behind
                would read as a ghost rectangle on the wall */}
            <FrameShadow r={r} ppi={room.ppi} depth={depth} appear={hangEff * interpolate(ripP, [0, 0.02], [1, 0], clamp)} />
            <Outline r={rA} ppi={room.ppi} ink={ink} p={outP} fade={hang} />
          </Layer>
          {/* the framed painting, standing off the wall */}
          <Layer z={0.01} origin={origin}>
            <div style={{ position: "absolute", inset: 0, transform: ripT, opacity: ripO, transformOrigin: `${ox}px ${oy}px` }}>
              <FrameBox r={r} ppi={room.ppi} depth={depth} appear={hangEff}>
                <Img src={staticFile("tot/img/linen.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
                <Canvas pl={room.A} p={pAEff} seed={index * 7 + 1} {...canvasWH} />
                <Canvas pl={room.B} p={pB} seed={index * 7 + 4} {...canvasWH} />
                {/* light falls from the window side */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg, rgba(255,244,225,0.10), rgba(0,0,0,0) 45%, rgba(0,0,0,0.16))", boxShadow: "inset 0 0 22px rgba(0,0,0,0.35)" }} />
              </FrameBox>
            </div>
          </Layer>
          <Layer z={depth + 24} origin={origin}>
            <PaintingDims room={room} r={r} wIn={wIn} hIn={hIn} bottomIn={bIn} p={dimsP} />
          </Layer>
          {/* furniture plane — sits in front of the wall so it moves against it */}
          <Layer z={fgZ} origin={origin}>
            <Img
              src={staticFile(room.img)}
              style={{
                position: "absolute",
                width: W,
                height: H,
                WebkitMaskImage: `linear-gradient(to bottom, transparent ${room.fgSeamY - 22}px, black ${room.fgSeamY + 22}px)`,
                maskImage: `linear-gradient(to bottom, transparent ${room.fgSeamY - 22}px, black ${room.fgSeamY + 22}px)`,
              }}
            />
          </Layer>
          <Layer z={fgZ + 40} origin={origin}>
            <FurnDims room={room} r={r} wIn={wIn} bottomIn={bIn} p={dimsP} />
          </Layer>
        </div>
      </AbsoluteFill>
      <Heading
        kicker={`0${index + 1} / 04  ·  ${room.label}`}
        line={line}
        lineStart={lineStart}
        frame={frame}
        accent={accent}
        tintLine={tintLine}
        chip={{ wall: room.wallHex, art: PAINTINGS[cur.p].hex, text: `${PAINTINGS[cur.p].name} · ${cur.reason}`, o: chipO }}
      />
    </AbsoluteFill>
  );
};

// ---------- making-of ----------
const STROKES = [
  { y0: 0.0, y1: 0.24, seed: 3 },
  { y0: 0.5, y1: 0.74, seed: 9 },
  { y0: 0.2, y1: 0.46, seed: 17 },
  { y0: 0.72, y1: 1.0, seed: 23 },
  { y0: 0.42, y1: 0.58, seed: 31 },
];

const MakingOf: React.FC = () => {
  const frame = useCurrentFrame();
  const t = TL.making.start + frame / 60;
  const s1 = TL.making.line1 - TL.making.start; // local
  const s2 = TL.making.line2 - TL.making.start;
  const P = { file: PAINTINGS.P4.file, ar: 1454 / 1082 };
  const strokeStart = s1 + 0.9;
  const strokeGap = (s2 - strokeStart - 0.4) / STROKES.length;
  const camScale = interpolate(
    frame,
    [0, f(s1), f(strokeStart), f(s2 - 0.2), f(s2 + 1.3)],
    [2.6, 2.45, 2.42, 1.3, 0.62],
    { ...clamp, easing: easeIO },
  );
  const erase = prog(frame, s1 - 0.1, 0.8);
  const strokeP = (i: number) => prog(frame, strokeStart + i * strokeGap, 0.7, easeIO);
  const cw = W;
  const ch = W / P.ar;
  const rebuilt = frame >= f(strokeStart);
  const allDone = frame >= f(strokeStart + (STROKES.length - 1) * strokeGap + 0.75);
  const paths: string[] = [];
  if (rebuilt)
    STROKES.forEach((s, i) => {
      const p = strokeP(i);
      if (p > 0) paths.push(strokePath(cw, (s.y1 - s.y0) * ch, p, s.seed, "in", 3, s.y0 * ch));
    });
  const clip = !rebuilt ? (erase > 0 ? `path('${strokePath(cw, ch, erase, 5, "out")}')` : undefined) : allDone ? undefined : `path('${paths.join(" ") || "M0 0"}')`;
  const pull = prog(frame, s2, 1.3);
  const callO = prog(frame, s2 + 1.1, 0.7);
  const sw = cw * 0.62,
    sh = ch * 0.62;
  return (
    <AbsoluteFill style={{ backgroundColor: "#E9E2D6" }}>
      <AbsoluteFill style={{ scale: camScale, transformOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: 0, top: (H - ch) / 2, width: cw, height: ch, boxShadow: pull > 0 ? `${30 * pull}px ${50 * pull}px ${100 * pull}px rgba(30,20,12,${0.45 * pull})` : undefined }}>
          <Img src={staticFile("tot/img/linen.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, clipPath: clip }}>
            <Img src={staticFile(P.file)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          {pull > 0 ? <div style={{ position: "absolute", inset: -40 * pull, border: `${40 * pull}px solid #2A2019` }} /> : null}
        </div>
      </AbsoluteFill>
      {callO > 0 ? (
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <HDim x0={W / 2 - sw / 2} x1={W / 2 + sw / 2} y={H / 2 - sh / 2 - 120} refY={H / 2 - sh / 2 - 40} text={`60" · ${cm(60)} cm`} ink={{ line: C.ink, under: "rgba(255,255,255,0.5)", pill: C.ink, text: C.cream }} p={callO} />
          <VDim x={W / 2 + sw / 2 + 120} y0={H / 2 - sh / 2} y1={H / 2 + sh / 2} refX={W / 2 + sw / 2 + 40} text={`44" · ${cm(44)} cm`} ink={{ line: C.ink, under: "rgba(255,255,255,0.5)", pill: C.ink, text: C.cream }} p={callO} />
        </svg>
      ) : null}
      {callO > 0 ? (
        <div style={{ position: "absolute", top: H / 2 + sh / 2 + 140, width: W, display: "flex", justifyContent: "center", gap: 28, opacity: callO }}>
          {["Oil on linen", "Palette-knife impasto", "Made to your wall"].map((x) => (
            <div key={x} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 44, padding: "16px 30px", borderRadius: 50, background: C.ink, color: C.cream }}>
              {x}
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- recap ----------
const Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const len = TL.montage.end - TL.montage.start;
  const each = len / 4;
  const i = Math.min(3, Math.floor(frame / f(each)));
  const room = ROOMS[i];
  const r = rectOf(room, room.A);
  const local = frame - i * f(each);
  const s = interpolate(local, [0, f(each)], [1.04, 1.1], clamp);
  const pad = (FRAME_FACE_IN + GAP_IN) * room.ppi;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ scale: s, transformOrigin: `${r.x + r.w / 2}px ${r.y + r.h / 2}px` }}>
        <Img src={staticFile(room.img)} style={{ width: W, height: H, position: "absolute" }} />
        <FrameShadow r={r} ppi={room.ppi} depth={FRAME_DEPTH_IN * room.ppi} appear={1} />
        <div style={{ position: "absolute", left: r.x - pad, top: r.y - pad, width: r.w + pad * 2, height: r.h + pad * 2, background: "#2a2019" }} />
        <Img src={staticFile(PAINTINGS[room.A.p].file)} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, objectFit: "cover" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 900, width: W, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 220, color: "#FFFFFF", textShadow: TXT_SHADOW }}>
        {["4 rooms.", "8 paintings.", "1 studio.", "All by hand."][i]}
      </div>
    </AbsoluteFill>
  );
};

// ---------- outro ----------
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const ctaAt = TL.vo[17].at - TL.outro.start;
  // VO16 "Wall Decores. | Art that completes the room." — each line lands on its words
  const word = prog(frame, TL.vo[16].at - TL.outro.start - LEAD, 1.1);
  const tag = prog(frame, TL.vo[16].at + 1.15 - TL.outro.start - LEAD, 0.8);
  const cta = prog(frame, ctaAt, 0.7);
  const info = prog(frame, ctaAt + 1.0, 0.8);
  return (
    <AbsoluteFill style={{ backgroundColor: "#16110E" }}>
      <Img src={staticFile("tot/img/outro_bg.jpg")} style={{ width: W, height: H, opacity: 0.55, scale: interpolate(frame, [0, f(9)], [1.08, 1], clamp) }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(22,17,14,0.25), rgba(22,17,14,0.85))" }} />
      <div style={{ position: "absolute", top: 1180, width: W, textAlign: "center", color: C.cream }}>
        <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 250, letterSpacing: 4, clipPath: `inset(0 ${(1 - word) * 100}% 0 0)` }}>Wall Decores</div>
        <div style={{ width: 420 * word, height: 4, background: C.gold, margin: "30px auto" }} />
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 104, opacity: tag }}>Art that completes the room.</div>
        <div style={{ marginTop: 130, display: "inline-block", padding: "26px 56px", border: `3px solid ${C.gold}`, borderRadius: 80, fontFamily: SANS, fontWeight: 500, fontSize: 54, opacity: cta, scale: 0.9 + 0.1 * cta }}>
          Which would you hang? Comment A or B
        </div>
        <div style={{ marginTop: 120, fontFamily: SANS, fontWeight: 400, fontSize: 52, lineHeight: 1.75, opacity: info }}>
          {CONTACT.web}
          <br />
          {CONTACT.ig}
          <br />
          {CONTACT.phone} · {CONTACT.city}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- audio ----------
const Sound: React.FC = () => {
  const cues: { at: number; file: string; vol: number }[] = [];
  TL.rooms.forEach((r, i) => {
    cues.push({ at: r.wipeA - 0.05, file: AUDIO.brush, vol: AUDIO.brushVol });
    cues.push({ at: r.wipeB - 0.05, file: AUDIO.brush, vol: AUDIO.brushVol });
    if (i > 0) cues.push({ at: r.start - 0.15, file: AUDIO.swish, vol: AUDIO.swishVol });
  });
  return (
    <>
      <Audio
        src={staticFile(AUDIO.music)}
        volume={(fr) => {
          const t = fr / 60;
          const fadeOut = interpolate(t, [TL.total - 2.2, TL.total], [1, 0], clamp);
          const talking = TL.vo.some((v) => t >= v.at - 0.25 && t <= v.at + v.dur + 0.1);
          return AUDIO.musicVol * fadeOut * (talking ? AUDIO.duck : 1);
        }}
      />
      {TL.vo.map((v, i) => (
        <Sequence key={`vo${i}`} from={f(v.at)} layout="none">
          <Audio src={staticFile(v.file)} />
        </Sequence>
      ))}
      {cues.map((c, i) => (
        <Sequence key={`sfx${i}`} from={Math.max(0, f(c.at))} layout="none">
          <Audio src={staticFile(c.file)} volume={c.vol} />
        </Sequence>
      ))}
    </>
  );
};

export const ThisOrThis: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {ROOMS.map((room, i) => {
      const tl = TL.rooms[i];
      return (
        <Sequence key={room.id} from={f(tl.start)} durationInFrames={f(tl.end) - f(tl.start)}>
          <RoomScene room={room} index={i} tl={tl} />
        </Sequence>
      );
    })}
    <Sequence from={f(TL.making.start)} durationInFrames={f(TL.making.end) - f(TL.making.start)}>
      <MakingOf />
    </Sequence>
    <Sequence from={f(TL.montage.start)} durationInFrames={f(TL.montage.end) - f(TL.montage.start)}>
      <Montage />
    </Sequence>
    <Sequence from={f(TL.outro.start)} durationInFrames={f(TL.outro.end) - f(TL.outro.start)}>
      <Outro />
    </Sequence>
    <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.22) 100%)" }} />
    {withAudio ? <Sound /> : null}
  </AbsoluteFill>
);
