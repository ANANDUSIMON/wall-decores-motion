import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, CLAIMS, DURATION, f, H, MIX, ROOMS, Room, T, W } from "./config";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
const SERIF = "'Cormorant Garamond', serif";
const SANS = "'Inter', sans-serif";

// ═════════════════════════════════════════════════════════════
//  Dimension line — architectural drawing style: line, end ticks, centred pill
// ═════════════════════════════════════════════════════════════
const DimLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number; p: number;
  label?: string; sub?: string; labelP?: number; size?: number; vertical?: boolean; lift?: number;
}> = ({ x1, y1, x2, y2, p, label, sub, labelP = 0, size = 46, vertical, lift = 0 }) => {
  const ex = x1 + (x2 - x1) * p;
  const ey = y1 + (y2 - y1) * p;
  const tick = 30;
  const nx = vertical ? tick : 0;
  const ny = vertical ? 0 : tick;
  const mx = (Math.max(x1, 60) + Math.min(x2, W - 60)) / 2;
  const my = (y1 + y2) / 2 + lift;
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {[{ c: "rgba(0,0,0,0.38)", w: 11, d: 2 }, { c: C.line, w: 5, d: 0 }].map((s, i) => (
          <g key={i} stroke={s.c} strokeWidth={s.w} strokeLinecap="round" opacity={p > 0 ? 1 : 0}
            transform={`translate(0 ${s.d})`}>
            <line x1={x1} y1={y1} x2={ex} y2={ey} />
            <line x1={x1 - nx} y1={y1 - ny} x2={x1 + nx} y2={y1 + ny} />
            {p > 0.98 && <line x1={x2 - nx} y1={y2 - ny} x2={x2 + nx} y2={y2 + ny} />}
          </g>
        ))}
      </svg>
      {label && (
        <div style={{
          position: "absolute", left: mx, top: my,
          translate: vertical ? "-50% -50%" : "-50% -50%",
          opacity: labelP, scale: String(interpolate(labelP, [0, 1], [0.86, 1])),
          background: C.pill, color: C.cream, borderRadius: 999,
          padding: `${size * 0.32}px ${size * 0.62}px`, whiteSpace: "nowrap",
          display: "flex", alignItems: "baseline", gap: size * 0.4,
          fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: 1,
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        }}>
          <span>{label}</span>
          {sub && <span style={{ fontSize: size * 0.62, opacity: 0.72, fontWeight: 400 }}>{sub}</span>}
        </div>
      )}
    </>
  );
};

// ═════════════════════════════════════════════════════════════
//  Room scene
// ═════════════════════════════════════════════════════════════
const RoomScene: React.FC<{ room: Room; index: number; quick?: boolean }> = ({ room, index, quick }) => {
  const fr = useCurrentFrame();
  const k = W / room.imgW;
  const Hd = room.imgH * k;
  const sx = (u: number) => u * W;
  const sy = (v: number) => (v - room.v0) * Hd;
  const [px0, py0, px1, py1] = room.p;
  const pcx = sx((px0 + px1) / 2);
  const pcy = sy((py0 + py1) / 2);

  // camera: punch in on the cut, then keep pushing slowly toward the painting
  const zoom = quick
    ? interpolate(fr, [0, 10, 30], [1.12, 1.04, 1.06], { ...clamp, easing: out })
    : interpolate(fr, [0, 20, f(T.roomLen)], [1.14, 1.035, 1.055], { ...clamp, easing: out });
  const blur = interpolate(fr, [0, quick ? 5 : 9], [16, 0], clamp);

  const prog = (a: number, b: number) => (quick ? 1 : interpolate(fr, [a, b], [0, 1], { ...clamp, easing: inOut }));
  const appear = (a: number, b: number) => (quick ? 1 : interpolate(fr, [a, b], [0, 1], { ...clamp, easing: out }));

  const gap = 42; // px offset of dimension lines from the frame
  const wLineY = sy(py0) - gap;
  const hLineX = Math.max(sx(px0) - gap, 40);

  return (
    <AbsoluteFill style={{ background: "#0d0b09", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: String(zoom), transformOrigin: `${pcx}px ${pcy}px`, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
        <Img src={staticFile(room.img)} style={{
          position: "absolute", left: 0, top: -room.v0 * Hd, width: W, height: Hd,
        }} />

        {/* painting outline brackets */}
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {[[px0, py0, 1, 1], [px1, py0, -1, 1], [px0, py1, 1, -1], [px1, py1, -1, -1]].map(([u, v, dx, dy], i) => {
            const b = appear(4, 22) * 64;
            const x = sx(u) - dx * 18;
            const y = sy(v) - dy * 18;
            const d = `M ${x} ${y + dy * b} L ${x} ${y} L ${x + dx * b} ${y}`;
            return (
              <g key={i} opacity={appear(4, 14)} fill="none" strokeLinecap="round">
                <path d={d} stroke="rgba(0,0,0,0.36)" strokeWidth={12} transform="translate(0 2)" />
                <path d={d} stroke={C.cream} strokeWidth={6} />
              </g>
            );
          })}
        </svg>

        {/* painting width + size */}
        <DimLine x1={sx(px0)} y1={wLineY} x2={sx(px1)} y2={wLineY} p={prog(10, 34)}
          label={room.size} sub={room.sizeFt} labelP={appear(26, 40)} size={54} />
        {/* painting height */}
        <DimLine x1={hLineX} y1={sy(py0)} x2={hLineX} y2={sy(py1)} p={prog(22, 46)} vertical />
        {/* furniture width */}
        <DimLine x1={sx(room.furn.x0)} y1={sy(room.furn.y)} x2={sx(room.furn.x1)} y2={sy(room.furn.y)}
          p={prog(34, 60)} label={room.furn.label} labelP={appear(50, 64)} size={44} lift={-62} />
        {/* clearance between painting and furniture */}
        {room.clear && (
          <DimLine x1={sx(room.clear.u)} y1={sy(py1) + 14} x2={sx(room.clear.u)} y2={sy(room.clear.yTop) - 14}
            p={prog(46, 64)} vertical label={`${room.clear.inches}"`} labelP={appear(58, 70)} size={38} />
        )}
      </AbsoluteFill>

      {/* lower-third scrim for legibility */}
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(13,10,8,0.86) 0%, rgba(13,10,8,0.55) 22%, rgba(13,10,8,0) 40%)" }} />

      {!quick && (
        <div style={{ position: "absolute", left: 150, right: 150, top: 2800 }}>
          {/* kicker row: number + room type, colour-match swatches on the right */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            opacity: appear(14, 30), translate: `${interpolate(appear(14, 30), [0, 1], [-40, 0])}px 0px`,
          }}>
            <div style={{ fontFamily: SANS, fontSize: 40, letterSpacing: 10, color: C.cream, textTransform: "uppercase" }}>
              <span style={{ color: C.terracotta, fontWeight: 500 }}>{String(index + 1).padStart(2, "0")}</span>
              <span style={{ opacity: 0.55 }}>  /  </span>
              {room.label}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {room.swatches.map((c, i) => {
                const s = appear(40 + i * 6, 54 + i * 6);
                const accent = i === room.swatches.length - 1;
                return (
                  <React.Fragment key={i}>
                    {accent && <div style={{ width: 2, height: 54, background: C.cream, opacity: 0.4 * s, margin: "0 6px" }} />}
                    <div style={{
                      width: 62, height: 62, borderRadius: "50%", background: c, scale: String(s),
                      border: `4px solid ${C.cream}`, boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                    }} />
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div style={{
            fontFamily: SANS, fontSize: 32, letterSpacing: 6, color: C.cream, opacity: 0.6 * appear(56, 72),
            textAlign: "right", marginTop: 16, textTransform: "uppercase",
          }}>
            Painting palette  ·  room accent
          </div>
          {/* headline */}
          <div style={{
            fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 140, lineHeight: 1.02,
            color: C.cream, marginTop: 34, textShadow: "0 4px 30px rgba(0,0,0,0.5)",
            opacity: appear(20, 40), translate: `0px ${interpolate(appear(20, 44), [0, 1], [50, 0])}px`,
            filter: `blur(${interpolate(appear(20, 36), [0, 1], [10, 0])}px)`,
          }}>
            {room.headline}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ═════════════════════════════════════════════════════════════
//  Hook — the brushstroke close-up
// ═════════════════════════════════════════════════════════════
const Hook: React.FC = () => {
  const fr = useCurrentFrame();
  const zoom = interpolate(fr, [0, f(4)], [1.28, 1.06], { ...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1) });
  const rot = interpolate(fr, [0, f(4)], [-4, 0], clamp);
  const fadeIn = interpolate(fr, [0, 18], [0, 1], clamp);
  const line = (a: number) => interpolate(fr, [a, a + 22], [0, 1], { ...clamp, easing: out });
  const l1 = line(f(0.53));
  const l2 = line(f(2.03));
  const swap = interpolate(fr, [f(1.85), f(2.03)], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: fadeIn, scale: String(zoom), rotate: `${rot}deg` }}>
        <Img src={staticFile("reel/img/oil.jpg")} style={{ width: W, height: H, objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: C.cream }}>
        <div style={{ position: "absolute", top: 1560, width: W, opacity: l1 * swap }}>
          <div style={{ fontFamily: SANS, fontSize: 44, letterSpacing: 18, textTransform: "uppercase", opacity: 0.85 }}>
            Oil on canvas
          </div>
          <div style={{
            fontFamily: SERIF, fontWeight: 600, fontSize: 250, lineHeight: 1, marginTop: 30,
            letterSpacing: interpolate(l1, [0, 1], [40, 2]), textShadow: "0 6px 40px rgba(0,0,0,0.55)",
          }}>
            Hand-painted.
          </div>
        </div>
        <div style={{ position: "absolute", top: 1500, width: W, opacity: l2 }}>
          <div style={{
            fontFamily: SERIF, fontStyle: "italic", fontWeight: 500, fontSize: 200, lineHeight: 1.0,
            textShadow: "0 6px 40px rgba(0,0,0,0.55)", translate: `0px ${(1 - l2) * 60}px`,
          }}>
            Made for<br />your walls.
          </div>
          <div style={{ width: 220 * l2, height: 5, background: C.terracotta, margin: "56px auto 0" }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ═════════════════════════════════════════════════════════════
//  Montage overlay — rapid spec-sheet flips
// ═════════════════════════════════════════════════════════════
const MontageText: React.FC = () => {
  const fr = useCurrentFrame();
  const a = interpolate(fr, [0, 14, f(1.4), f(1.5)], [0, 1, 1, 0], clamp);
  const b = interpolate(fr, [f(1.5), f(1.5) + 14, f(3) - 4, f(3)], [0, 1, 1, 1], clamp);
  const st = (o: number) => ({
    position: "absolute" as const, top: 2880, width: W, textAlign: "center" as const, opacity: o,
    fontFamily: SERIF, fontStyle: "italic" as const, fontWeight: 500, fontSize: 170, color: C.cream,
    textShadow: "0 6px 40px rgba(0,0,0,0.6)", translate: `0px ${(1 - o) * 40}px`,
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(to top, rgba(13,10,8,0.85) 0%, rgba(13,10,8,0) 38%)" }} />
      <div style={st(a)}>Made to measure.</div>
      <div style={st(b)}>Matched to your colours.</div>
    </AbsoluteFill>
  );
};

// ═════════════════════════════════════════════════════════════
//  Claims — what we do, line by line on the beat
// ═════════════════════════════════════════════════════════════
const Claims: React.FC = () => {
  const fr = useCurrentFrame();
  const dur = f(T.endStart - T.claimsStart);
  const zoom = interpolate(fr, [0, dur], [1.08, 1.22]);
  const rot = interpolate(fr, [0, dur], [3, -1]);
  const exit = interpolate(fr, [dur - 12, dur], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: String(zoom), rotate: `${rot}deg` }}>
        <Img src={staticFile("reel/img/oil.jpg")} style={{ width: W, height: H, objectFit: "cover", transform: "scaleX(-1)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.45)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exit }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 70, alignItems: "flex-start" }}>
          {CLAIMS.map((c, i) => {
            const a = interpolate(fr, [f(0.5 + i * 0.5), f(0.5 + i * 0.5) + 18], [0, 1], { ...clamp, easing: out });
            return (
              <div key={c} style={{
                display: "flex", alignItems: "center", gap: 46, opacity: a,
                translate: `${(1 - a) * -80}px 0px`,
              }}>
                <div style={{ width: 70 * a, height: 5, background: C.terracotta }} />
                <div style={{
                  fontFamily: SERIF, fontWeight: 500, fontSize: 112, color: C.cream,
                  textShadow: "0 4px 30px rgba(0,0,0,0.6)",
                }}>{c}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ═════════════════════════════════════════════════════════════
//  End card
// ═════════════════════════════════════════════════════════════
const EndCard: React.FC = () => {
  const fr = useCurrentFrame();
  const hit = interpolate(fr, [0, 26], [0, 1], { ...clamp, easing: out });
  const wipe = interpolate(fr, [2, 34], [0, 100], { ...clamp, easing: inOut });
  const rule = interpolate(fr, [18, 46], [0, 1], { ...clamp, easing: out });
  const meta = interpolate(fr, [30, 56], [0, 1], { ...clamp, easing: out });
  const cta = interpolate(fr, [48, 74], [0, 1], { ...clamp, easing: out });
  const bgZoom = interpolate(fr, [0, f(4)], [1.15, 1.25]);
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: String(bgZoom), opacity: hit }}>
        <Img src={staticFile("reel/img/oil-end.jpg")} style={{ width: W, height: H, objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", color: C.cream }}>
        <div style={{ scale: String(interpolate(hit, [0, 1], [1.08, 1])) }}>
          <div style={{
            fontFamily: SERIF, fontWeight: 500, fontSize: 190, letterSpacing: 30, lineHeight: 1,
            clipPath: `inset(0 ${100 - wipe}% 0 0)`, paddingLeft: 30,
          }}>WALL DECORES</div>
          <div style={{
            fontFamily: SANS, fontWeight: 400, fontSize: 52, letterSpacing: 26, marginTop: 40,
            opacity: meta, textTransform: "uppercase",
          }}>Artisan Collectives</div>
          <div style={{ width: 360 * rule, height: 5, background: C.terracotta, margin: "80px auto" }} />
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 104, opacity: meta, lineHeight: 1.1 }}>
            Handcrafted canvas art,<br />made for your space.
          </div>
          <div style={{
            marginTop: 140, opacity: cta, translate: `0px ${(1 - cta) * 30}px`,
            fontFamily: SANS, fontSize: 50, letterSpacing: 4, lineHeight: 1.9,
          }}>
            <div style={{
              display: "inline-block", border: `3px solid ${C.cream}`, borderRadius: 999,
              padding: "26px 70px", fontWeight: 500, letterSpacing: 10, textTransform: "uppercase", fontSize: 44,
            }}>Commission your painting</div>
            <div style={{ marginTop: 60, opacity: 0.9 }}>walldecores.com  ·  +91 90377 90012</div>
            <div style={{ opacity: 0.7 }}>@wall_decores_artisan  ·  Angamaly, Kerala</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ═════════════════════════════════════════════════════════════
//  Film grain + vignette (whole film)
// ═════════════════════════════════════════════════════════════
const Finish: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 58%, rgba(0,0,0,0.42) 100%)", pointerEvents: "none" }} />
      <AbsoluteFill style={{
        backgroundImage: `url(${staticFile("reel/img/grain.png")})`, backgroundSize: "512px 512px",
        backgroundPosition: `${(fr * 97) % 512}px ${(fr * 131) % 512}px`, opacity: 0.06, mixBlendMode: "overlay",
        pointerEvents: "none",
      }} />
    </>
  );
};

// ═════════════════════════════════════════════════════════════
export const Reel: React.FC = () => {
  const roomFrames = f(T.roomLen);
  const montageOrder = [0, 1, 2, 3, 4, 5];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence from={0} durationInFrames={f(T.roomsStart)} name="Hook · brushstrokes">
        <Hook />
      </Sequence>

      {ROOMS.map((r, i) => (
        <Sequence key={r.id} from={f(T.roomsStart + i * T.roomLen)} durationInFrames={roomFrames} name={`${i + 1} ${r.label}`}>
          <RoomScene room={r} index={i} />
        </Sequence>
      ))}

      {montageOrder.map((ri, i) => (
        <Sequence key={`m${i}`} from={f(T.montageStart + i * T.montageCut)} durationInFrames={f(T.montageCut)} name={`Montage ${ROOMS[ri].id}`}>
          <RoomScene room={ROOMS[ri]} index={ri} quick />
        </Sequence>
      ))}
      <Sequence from={f(T.montageStart)} durationInFrames={f(T.claimsStart - T.montageStart)} name="Montage text">
        <MontageText />
      </Sequence>

      <Sequence from={f(T.claimsStart)} durationInFrames={f(T.endStart - T.claimsStart)} name="What we do">
        <Claims />
      </Sequence>

      <Sequence from={f(T.endStart)} durationInFrames={DURATION - f(T.endStart)} name="End card">
        <EndCard />
      </Sequence>

      <Finish />

      {/* ── Sound ── */}
      {/* Pre-mastered ElevenLabs music + SFX, -14 LUFS (rebuild: scripts/mix_reel_audio.py) */}
      <Audio src={staticFile(MIX)} />
    </AbsoluteFill>
  );
};
