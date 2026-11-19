import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Series, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, COPY, GRADE, LAMP, Point, ROOM1, ROOM1_ANGLE, ROOM1_EVENING_STEM, ROOM2, RoomSetup, SHOTS, SWATCHES, TEXTURE, TRIPTYCH} from './config';
import {sans, serif} from './fonts';
import {
	CLAMP,
	Caption,
	Chip,
	DrawnPath,
	Handwritten,
	Overlay,
	Photo,
	Placeholder,
	RakingLight,
	RoomComposite,
	Stage,
	VIDEO_EXT,
	bezierAt,
	findAsset,
	handArrow,
	handEllipse,
	handRect,
	paintingCenter,
	ramp,
	rectPx,
	useStageBox,
	useUnit,
} from './primitives';

const PC1 = paintingCenter(ROOM1);

// ═══ ACT ONE — THE TENSION ═══════════════════════════════════════════════════

/** 01 · Extreme macro. Unidentifiable. Light travels across the ridges. */
export const Shot01: React.FC = () => {
	const f = useCurrentFrame();
	const box = useStageBox(TEXTURE.macroAspect, 0.5);
	return (
		<Stage
			box={box}
			scale={interpolate(f, [0, SHOTS.s01], [2.3, 2.38], CLAMP)}
			shiftX={interpolate(f, [0, SHOTS.s01], [0.025, -0.02], CLAMP)}
			origin={{x: 0.4, y: 0.5}}
		>
			<Photo src={findAsset(TEXTURE.macro)} label="macro-texture — close-up of your impasto" tone={COLORS.siennaDeep} />
			<RakingLight progress={ramp(f, 0, SHOTS.s01, 0, 0.55)} strength={0.42} />
		</Stage>
	);
};

/** 02 · Pull back. The surface resolves into a made object. */
export const Shot02: React.FC = () => {
	const f = useCurrentFrame();
	const box = useStageBox(TEXTURE.macroAspect, 0.5);
	return (
		<Stage
			box={box}
			scale={ramp(f, 0, SHOTS.s02, 2.38, 1.06)}
			shiftX={ramp(f, 0, SHOTS.s02, -0.02, 0)}
			origin={{x: 0.4, y: 0.5}}
		>
			<Photo src={findAsset(TEXTURE.macro)} label="macro-texture — close-up of your impasto" tone={COLORS.siennaDeep} />
			<RakingLight progress={ramp(f, 0, SHOTS.s02, 0.55, 1)} strength={0.36} />
		</Stage>
	);
};

/** 03 · Wide. The room is finished. One wall is bare. No text — let them find it. */
export const Shot03: React.FC = () => {
	const f = useCurrentFrame();
	return <RoomComposite setup={ROOM1} showPainting={false} scale={interpolate(f, [0, SHOTS.s03], [1, 1.04], CLAMP)} origin={PC1} />;
};

/** 04 · Hold on the bare wall. The pencil marks it. Two lines. */
export const Shot04: React.FC = () => {
	const f = useCurrentFrame();
	const u = useUnit();
	return (
		<AbsoluteFill>
			<RoomComposite
				setup={ROOM1}
				showPainting={false}
				scale={interpolate(f, [0, SHOTS.s04], [1.04, 1.13], CLAMP)}
				origin={PC1}
				overlay={(box) => {
					const r = rectPx(ROOM1.rect, box);
					return (
						<Overlay w={box.w} h={box.h}>
							<DrawnPath d={handRect(r.x, r.y, r.w, r.h, 'wall')} progress={ramp(f, 14, 62)} width={3.2 * u} />
						</Overlay>
					);
				}}
			/>
			<Caption text={COPY.finished} from={58} y={0.16} />
			<Caption text={COPY.wasnt} from={112} y={0.09} color={COLORS.light} scrim={false} />
		</AbsoluteFill>
	);
};

// ═══ ACT TWO — THE ARRIVAL ═══════════════════════════════════════════════════

/** 05 · The signature move: a band of light crosses the wall and the painting exists in its wake. */
export const Shot05: React.FC = () => {
	const f = useCurrentFrame();
	const {rect} = ROOM1;
	const bandX = ramp(f, 12, 100, rect.x - 0.16, rect.x + rect.w + 0.16);
	const edge = (bandX - rect.x) / rect.w;
	const bandOpacity = interpolate(f, [8, 22, 90, 112], [0, 1, 1, 0], CLAMP);
	return (
		<RoomComposite
			setup={ROOM1}
			revealEdge={edge}
			scale={1.1}
			origin={PC1}
			overlay={(box) => (
				<div
					style={{
						position: 'absolute',
						left: (bandX - 0.08) * box.w,
						top: 0,
						width: 0.16 * box.w,
						height: box.h,
						background:
							'linear-gradient(90deg, rgba(255,236,196,0) 0%, rgba(255,236,196,0.42) 50%, rgba(255,236,196,0) 100%)',
						mixBlendMode: 'screen',
						opacity: bandOpacity,
					}}
				/>
			)}
		/>
	);
};

/** 06 · Shot 03's framing, returned. Now complete. */
export const Shot06: React.FC = () => {
	const f = useCurrentFrame();
	return <RoomComposite setup={ROOM1} scale={interpolate(f, [0, SHOTS.s06], [1, 1.02], CLAMP)} origin={PC1} />;
};

/** 07 · Three-quarter. Uses the angled room photo if present, else a tight drifting crop. */
export const Shot07: React.FC = () => {
	const f = useCurrentFrame();
	if (findAsset(ROOM1_ANGLE.room)) {
		return <RoomComposite setup={ROOM1_ANGLE} shiftX={ramp(f, 0, SHOTS.s07, 0, -0.025)} origin={paintingCenter(ROOM1_ANGLE)} />;
	}
	return (
		<RoomComposite
			setup={ROOM1}
			scale={1.55}
			origin={{x: ROOM1.rect.x + ROOM1.rect.w * 0.85, y: PC1.y}}
			shiftX={ramp(f, 0, SHOTS.s07, 0.018, -0.018)}
		/>
	);
};

/** 08 · Macro in situ: the canvas edge meeting the wall. Light moves across the paint.
 *  In 9:16 the frame slides so the edge sits at 30% width and the line lands on bare wall. */
export const Shot08: React.FC = () => {
	const f = useCurrentFrame();
	const {width: W, height: H} = useVideoConfig();
	const box = useStageBox(ROOM1.aspect, ROOM1.focusX);
	const vertical = W < H;
	const edgeX = ROOM1.rect.x + ROOM1.rect.w;
	const edgeScreen = box.left + edgeX * box.w;
	return (
		<AbsoluteFill>
			<RoomComposite
				setup={ROOM1}
				scale={ramp(f, 0, SHOTS.s08, 3.4, 3.6)}
				origin={{x: edgeX, y: ROOM1.rect.y + ROOM1.rect.h * 0.55}}
				shiftX={vertical ? (W * 0.3 - edgeScreen) / box.w : 0}
				roomBlur={3}
				paintingOverlay={<RakingLight progress={ramp(f, 0, SHOTS.s08, 0.1, 0.9)} strength={0.34} />}
			/>
			<Caption text={COPY.handmade} from={44} x={vertical ? 0.65 : 0.79} size={vertical ? 40 : 46} />
		</AbsoluteFill>
	);
};

// ═══ ACT THREE — THE RANGE & THE MATCH ═══════════════════════════════════════

/** 09 · The painting flat-on. Its colours lift out as chips. */
export const Shot09: React.FC = () => {
	const f = useCurrentFrame();
	const u = useUnit();
	const {width: W, height: H} = useVideoConfig();
	const src = findAsset(ROOM1.painting);
	const pa = (ROOM1.rect.w * ROOM1.aspect) / ROOM1.rect.h; // painting aspect, from its size on the wall
	const vertical = W < H;
	const Wp = vertical ? W * 0.7 : H * 0.58 * pa;
	const Hp = Wp / pa;
	const left = vertical ? (W - Wp) / 2 : W * 0.5 - Wp * 0.5 - W * 0.08;
	const top = vertical ? H * 0.2 : H * 0.14;
	const chip = 64 * u;

	return (
		<AbsoluteFill style={{backgroundColor: COLORS.tealDeep}}>
			<div
				style={{
					position: 'absolute',
					left,
					top,
					width: Wp,
					height: Hp,
					boxShadow: `0 ${18 * u}px ${48 * u}px rgba(4,14,13,0.55)`,
					opacity: ramp(f, 0, 14),
				}}
			>
				{src ? (
					<Img src={src} style={{width: '100%', height: '100%', objectFit: 'fill', filter: GRADE}} />
				) : (
					<Placeholder label="painting1 — your painting" tone={COLORS.sienna} />
				)}
			</div>
			<Overlay w={W} h={H}>
				{SWATCHES.map((s, i) => (
					<DrawnPath
						key={s.label}
						d={handEllipse(left + s.onPainting.x * Wp, top + s.onPainting.y * Hp, chip * 0.62, chip * 0.52, `p${i}`)}
						progress={ramp(f, 12 + i * 12, 34 + i * 12)}
						width={3 * u}
					/>
				))}
			</Overlay>
			{SWATCHES.map((s, i) => {
				const t = ramp(f, 26 + i * 12, 58 + i * 12);
				const sx = left + s.onPainting.x * Wp;
				const sy = top + s.onPainting.y * Hp;
				const tx = vertical ? W / 2 + (i - 1) * W * 0.22 : left + Wp + W * 0.09;
				const ty = vertical ? top + Hp + H * 0.08 : top + Hp * (0.2 + i * 0.3);
				return (
					<Chip
						key={s.label}
						color={s.color}
						x={sx + (tx - sx) * t}
						y={sy + (ty - sy) * t}
						size={chip}
						scale={0.4 + 0.6 * t}
						opacity={t > 0 ? 1 : 0}
					/>
				);
			})}
			<Caption text={COPY.chosen} from={72} y={0.07} scrim={false} />
		</AbsoluteFill>
	);
};

/** 10 · Each colour travels to the material it answers. The visual is the argument.
 *  If a target would fall outside the frame (the 9:16 cut), the room scales down to
 *  fit every target, over a blurred copy of itself — the standard Reels treatment. */
export const Shot10: React.FC = () => {
	const f = useCurrentFrame();
	const u = useUnit();
	const {width: W} = useVideoConfig();
	const box = useStageBox(ROOM1.aspect, ROOM1.focusX);
	const r = ROOM1.rect;
	const xs = [...SWATCHES.map((s) => s.inRoom.x), r.x, r.x + r.w];
	const a = Math.min(...xs) - 0.06;
	const b = Math.max(...xs) + 0.06;
	const visA = -box.left / box.w;
	const visB = (W - box.left) / box.w;
	const fit = a < visA || b > visB;
	const s = fit ? Math.min(1, (0.92 * W) / ((b - a) * box.w)) : 1;
	const ox = fit ? (0.04 * W - box.left - a * box.w * s) / (box.w * (1 - s)) : 0.5;
	const k = 1 / s; // keeps pen marks, chips and handwriting the same size on screen

	return (
		<AbsoluteFill style={{backgroundColor: COLORS.ink}}>
			{fit ? <RoomComposite setup={ROOM1} showPainting={false} roomBlur={28} filter="brightness(0.42)" scale={1.2} /> : null}
			<RoomComposite
				setup={ROOM1}
				scale={s}
				origin={{x: ox, y: 0.5}}
				background={fit ? 'transparent' : undefined}
				overlay={(bx) => (
					<>
						<Overlay w={bx.w} h={bx.h}>
							{SWATCHES.map((sw, i) => {
								const from = {x: (r.x + sw.onPainting.x * r.w) * bx.w, y: (r.y + sw.onPainting.y * r.h) * bx.h};
								const to = {x: sw.inRoom.x * bx.w, y: sw.inRoom.y * bx.h};
								const arrow = handArrow(from, to, i % 2 === 0 ? 0.22 : -0.22);
								const t0 = 6 + i * 12;
								return (
									<g key={sw.label}>
										<DrawnPath d={arrow.shaft} progress={ramp(f, t0, t0 + 34)} width={3 * u * k} />
										<DrawnPath d={arrow.head} progress={ramp(f, t0 + 33, t0 + 41)} width={3 * u * k} />
										<DrawnPath
											d={handEllipse(to.x, to.y, 52 * u * k, 38 * u * k, `t${i}`)}
											progress={ramp(f, t0 + 38, t0 + 58)}
											width={3 * u * k}
										/>
									</g>
								);
							})}
						</Overlay>
						{SWATCHES.map((sw, i) => {
							const from = {x: (r.x + sw.onPainting.x * r.w) * bx.w, y: (r.y + sw.onPainting.y * r.h) * bx.h};
							const to = {x: sw.inRoom.x * bx.w, y: sw.inRoom.y * bx.h};
							const arrow = handArrow(from, to, i % 2 === 0 ? 0.22 : -0.22);
							const t0 = 6 + i * 12;
							const t = ramp(f, t0, t0 + 34);
							const p = bezierAt(from, arrow.ctrl, to, t);
							const size = 38 * u * k;
							const gap = 62 * u * k;
							const est = sw.label.length * size * 0.44; // Kalam is narrow
							// visible stage-px range on screen
							const Ox = ox * bx.w;
							const pmin = Ox + (0 - box.left - Ox) / s + 12 * k;
							const pmax = Ox + (W - box.left - Ox) / s - 12 * k;
							const canvas = {x0: r.x * bx.w, x1: (r.x + r.w) * bx.w, y0: r.y * bx.h, y1: (r.y + r.h) * bx.h};
							const lift = to.y < bx.h * 0.22 ? 40 * u * k : -80 * u * k;
							const awayLeft = to.x < (r.x + r.w / 2) * bx.w;
							type Spot = {x: number; y: number; anchor: 'left' | 'right'; x0: number; x1: number};
							const left: Spot = {x: to.x - gap, y: to.y + lift, anchor: 'right', x0: to.x - gap - est, x1: to.x - gap};
							const right: Spot = {x: to.x + gap, y: to.y + lift, anchor: 'left', x0: to.x + gap, x1: to.x + gap + est};
							const below: Spot = {x: to.x - est / 2, y: to.y + 46 * u * k, anchor: 'left', x0: to.x - est / 2, x1: to.x + est / 2};
							const clear = (sp: Spot) => {
								const onScreen = sp.x0 >= pmin && sp.x1 <= pmax;
								const hitsCanvas = sp.x1 > canvas.x0 && sp.x0 < canvas.x1 && sp.y + size > canvas.y0 && sp.y < canvas.y1;
								return onScreen && !hitsCanvas;
							};
							const spot = [awayLeft ? left : right, awayLeft ? right : left, below].find(clear) ?? below;
							return (
								<React.Fragment key={sw.label}>
									<Chip
										color={sw.color}
										x={p.x}
										y={p.y}
										size={46 * u * k}
										opacity={t > 0 ? interpolate(f, [t0 + 38, t0 + 50], [1, 0], CLAMP) : 0}
									/>
									<Handwritten
										text={sw.label}
										x={spot.x}
										y={spot.y}
										progress={ramp(f, t0 + 46, t0 + 70)}
										size={size}
										anchor={spot.anchor}
									/>
								</React.Fragment>
							);
						})}
					</>
				)}
			/>
		</AbsoluteFill>
	);
};

/** 11 · Hard cut. A brighter room asks a different piece. */
export const Shot11: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			<RoomComposite setup={ROOM2} scale={interpolate(f, [0, SHOTS.s11], [1, 1.05], CLAMP)} origin={paintingCenter(ROOM2)} />
			<Caption text={COPY.different} from={38} />
		</AbsoluteFill>
	);
};

/** 12 · Three cuts on stillness. Dining, entrance, suite.
 *  Any of the three rooms not yet in public/last-piece is replaced by a tight
 *  detail crop of rooms 1 and 2, so the film never shows an empty panel. */
type Panel = {setup: RoomSetup; from: number; to: number; origin: Point};
const FALLBACK_PANELS: Panel[] = [
	{setup: ROOM2, from: 1.35, to: 1.37, origin: paintingCenter(ROOM2)},
	{setup: ROOM1, from: 1.9, to: 1.93, origin: {x: ROOM1.rect.x + ROOM1.rect.w * 0.3, y: ROOM1.rect.y + ROOM1.rect.h * 0.45}},
	{setup: ROOM2, from: 2.6, to: 2.64, origin: {x: ROOM2.rect.x + ROOM2.rect.w * 0.62, y: ROOM2.rect.y + ROOM2.rect.h * 0.5}},
];

export const Shot12: React.FC = () => {
	const ready: Panel[] = TRIPTYCH.filter((s) => findAsset(s.room)).map((s) => ({setup: s, from: 1, to: 1.015, origin: paintingCenter(s)}));
	const panels = [...ready, ...FALLBACK_PANELS].slice(0, 3);
	const each = Math.floor(SHOTS.s12 / 3);
	return (
		<Series>
			{panels.map((panel, i) => (
				<Series.Sequence key={i} durationInFrames={i === 2 ? SHOTS.s12 - each * 2 : each}>
					<TriptychPanel panel={panel} duration={each} />
				</Series.Sequence>
			))}
		</Series>
	);
};

const TriptychPanel: React.FC<{panel: Panel; duration: number}> = ({panel, duration}) => {
	const f = useCurrentFrame();
	return <RoomComposite setup={panel.setup} scale={interpolate(f, [0, duration], [panel.from, panel.to], CLAMP)} origin={panel.origin} />;
};

// ═══ ACT FOUR — THE CRAFT & THE CLOSE ════════════════════════════════════════

/** 13 · The studio. Hands, knife, pigment. The only handheld-feeling shot. */
export const Shot13: React.FC = () => {
	const f = useCurrentFrame();
	const video = findAsset(TEXTURE.studio, VIDEO_EXT);
	const box = useStageBox(TEXTURE.studioAspect, 0.5);
	return (
		<AbsoluteFill style={{backgroundColor: COLORS.ink}}>
			{video ? (
				<OffthreadVideo src={video} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: GRADE}} />
			) : (
				<Stage box={box} scale={ramp(f, 0, SHOTS.s13, 1.02, 1.09)} shiftX={Math.sin(f / 23) * 0.003}>
					<Photo src={findAsset(TEXTURE.studio)} label="studio — palette knife at work (video or photo)" tone="#3A2A20" />
				</Stage>
			)}
			<Caption text={COPY.place} from={34} />
		</AbsoluteFill>
	);
};

/** 14 · The knife lifts away; light catches the new ridge. Rhymes with Shot 01. */
export const Shot14: React.FC = () => {
	const f = useCurrentFrame();
	const box = useStageBox(TEXTURE.macroAspect, 0.5);
	return (
		<Stage box={box} scale={interpolate(f, [0, SHOTS.s14], [1.7, 1.78], CLAMP)} origin={{x: 0.74, y: 0.42}}>
			<Photo src={findAsset([TEXTURE.ridge, TEXTURE.macro])} label="ridge-macro — a single fresh ridge" tone={COLORS.siennaDeep} />
			<RakingLight progress={ramp(f, 0, SHOTS.s14, 0.15, 0.85)} strength={0.5} />
		</Stage>
	);
};

/** 15 · Room one, evening. Lamp on, painting under its own light. The line. */
export const Shot15: React.FC = () => {
	const f = useCurrentFrame();
	const box = useStageBox(ROOM1.aspect, ROOM1.focusX);
	const evening = findAsset(ROOM1_EVENING_STEM);
	const glow = ramp(f, 0, 30, 0.6, 1);
	const r = ROOM1.rect;
	const sx = (x: number) => box.left + x * box.w;
	const sy = (y: number) => box.top + y * box.h;
	return (
		<AbsoluteFill>
			<RoomComposite
				setup={ROOM1}
				roomSrcOverride={evening ?? findAsset(ROOM1.room)}
				filter={evening ? undefined : 'brightness(0.5) saturate(1.2) sepia(0.22) contrast(1.12)'}
				paintingOverlay={
					<div
						style={{
							position: 'absolute',
							inset: 0,
							background: 'linear-gradient(180deg, rgba(255,210,140,0.55), rgba(255,210,140,0.08) 70%)',
							mixBlendMode: 'screen',
							opacity: glow,
						}}
					/>
				}
			/>
			{/* lamp */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at ${sx(LAMP.x)}px ${sy(LAMP.y)}px, rgba(255,196,112,0.8), rgba(255,168,84,0.28) 13%, rgba(255,160,80,0) 34%)`,
					mixBlendMode: 'screen',
					opacity: glow,
				}}
			/>
			{/* picture light washing the wall above the canvas */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse ${r.w * box.w * 0.9}px ${r.h * box.h * 0.55}px at ${sx(r.x + r.w / 2)}px ${sy(r.y)}px, rgba(255,206,138,0.42), rgba(255,206,138,0) 100%)`,
					mixBlendMode: 'screen',
					opacity: glow,
				}}
			/>
			<Caption text={COPY.line} from={28} size={54} />
		</AbsoluteFill>
	);
};

/** 16 · Wordmark. Two seconds. Nothing moves once it lands. */
export const Shot16: React.FC = () => {
	const f = useCurrentFrame();
	const u = useUnit();
	return (
		<AbsoluteFill style={{backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
			<div style={{width: ramp(f, 0, 22, 0, 90 * u), height: 2 * u, backgroundColor: COLORS.sienna, marginBottom: 34 * u}} />
			<div
				style={{
					fontFamily: serif,
					fontSize: 92 * u,
					fontWeight: 500,
					letterSpacing: `${ramp(f, 4, 30, 0.14, 0.09)}em`,
					color: COLORS.ink,
					lineHeight: 1,
					opacity: ramp(f, 4, 26),
				}}
			>
				{COPY.wordmark}
			</div>
			<div style={{fontFamily: sans, fontSize: 19 * u, letterSpacing: '0.32em', color: COLORS.siennaDeep, marginTop: 20 * u, opacity: ramp(f, 14, 34)}}>
				{COPY.sub}
			</div>
			<div style={{fontFamily: sans, fontSize: 21 * u, color: '#4A3B2E', marginTop: 40 * u, opacity: ramp(f, 20, 40)}}>{COPY.tagline}</div>
			<div style={{fontFamily: sans, fontSize: 21 * u, color: '#7A5A3A', marginTop: 10 * u, opacity: ramp(f, 24, 44)}}>{COPY.url}</div>
		</AbsoluteFill>
	);
};
