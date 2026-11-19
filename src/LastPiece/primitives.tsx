import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	getStaticFiles,
	interpolate,
	random,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {COLORS, FOLDER, GRADE, Point, Rect, RoomSetup} from './config';
import {hand, sans, serif} from './fonts';

// ── timing helpers ──────────────────────────────────────────────────────────
/** Slow-in, long settle. The house curve — luxury moves slowly. */
export const EASE = Easing.bezier(0.33, 0, 0.2, 1);
export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const ramp = (f: number, a: number, b: number, from = 0, to = 1) =>
	interpolate(f, [a, b], [from, to], {...CLAMP, easing: EASE});

/** Base unit: 1 at 1080p, same feel in 16:9 and 9:16. */
export const useUnit = () => {
	const {width, height} = useVideoConfig();
	return Math.min(width, height) / 1080;
};

// ── assets ──────────────────────────────────────────────────────────────────
const IMG_EXT = ['jpg', 'jpeg', 'png', 'webp'];
export const VIDEO_EXT = ['mp4', 'mov', 'webm'];

/** Returns a staticFile() url for public/last-piece/<stem>.<ext>, or null if absent. */
export const findAsset = (stems: string | string[], exts: string[] = IMG_EXT): string | null => {
	const files = getStaticFiles();
	const list = Array.isArray(stems) ? stems : [stems];
	for (const stem of list) {
		for (const ext of exts) {
			const name = `${FOLDER}/${stem}.${ext}`;
			if (files.some((f) => f.name === name)) {
				return staticFile(name);
			}
		}
	}
	return null;
};

// ── the stage: a cover-fitted box with the room photo's aspect ──────────────
export type Box = {left: number; top: number; w: number; h: number};

export const useStageBox = (aspect: number, focusX: number): Box => {
	const {width, height} = useVideoConfig();
	return useMemo(() => {
		let w: number;
		let h: number;
		if (width / height > aspect) {
			w = width;
			h = width / aspect;
		} else {
			h = height;
			w = height * aspect;
		}
		return {w, h, left: -(w - width) * focusX, top: -(h - height) / 2};
	}, [width, height, aspect, focusX]);
};

export const Stage: React.FC<{
	box: Box;
	scale?: number;
	origin?: Point;
	shiftX?: number;
	filter?: string;
	background?: string;
	children: React.ReactNode;
}> = ({box, scale = 1, origin = {x: 0.5, y: 0.5}, shiftX = 0, filter, background = COLORS.ink, children}) => (
	<AbsoluteFill style={{overflow: 'hidden', backgroundColor: background}}>
		<div
			style={{
				position: 'absolute',
				left: box.left,
				top: box.top,
				width: box.w,
				height: box.h,
				transform: `translateX(${shiftX * box.w}px) scale(${scale})`,
				transformOrigin: `${origin.x * 100}% ${origin.y * 100}%`,
				filter,
			}}
		>
			{children}
		</div>
	</AbsoluteFill>
);

// ── placeholders (render until the real image is dropped in) ────────────────
export const Placeholder: React.FC<{label: string; tone?: string}> = ({label, tone = COLORS.teal}) => (
	<div
		style={{
			position: 'absolute',
			inset: 0,
			backgroundColor: tone,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		}}
	>
		<div
			style={{
				fontFamily: sans,
				fontSize: 22,
				letterSpacing: '0.16em',
				color: 'rgba(247,237,221,0.72)',
				textTransform: 'uppercase',
				textAlign: 'center',
				padding: 48,
				lineHeight: 1.6,
			}}
		>
			{label}
		</div>
	</div>
);

const PaintingPlaceholder: React.FC = () => (
	<div style={{position: 'absolute', inset: 0, backgroundColor: '#E8DCC4', overflow: 'hidden'}}>
		<div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: '42%', backgroundColor: '#F2E9D8'}} />
		<div style={{position: 'absolute', left: 0, top: '42%', width: '40%', height: '32%', backgroundColor: COLORS.sienna}} />
		<div style={{position: 'absolute', left: '40%', top: '42%', width: '60%', height: '32%', backgroundColor: '#EBD9AE'}} />
		<div style={{position: 'absolute', left: 0, top: '74%', width: '100%', height: '26%', backgroundColor: COLORS.ochre}} />
	</div>
);

/** A photograph filling the stage. */
export const Photo: React.FC<{src: string | null; label: string; tone?: string; blur?: number}> = ({
	src,
	label,
	tone,
	blur = 0,
}) =>
	src ? (
		<Img
			src={src}
			style={{
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				objectFit: 'cover',
				filter: blur > 0 ? `${GRADE} blur(${blur}px)` : GRADE,
			}}
		/>
	) : (
		<Placeholder label={label} tone={tone} />
	);

// ── your real painting, sitting on the wall ─────────────────────────────────
export const PaintingOnWall: React.FC<{
	setup: RoomSetup;
	box: Box;
	/** painting-local reveal edge for the light sweep. Undefined = fully visible. */
	revealEdge?: number;
	overlay?: React.ReactNode;
}> = ({setup, box, revealEdge, overlay}) => {
	const src = findAsset(setup.painting);
	const {rect} = setup;
	const pw = rect.w * box.w;
	const ph = rect.h * box.h;
	const away = setup.lightFrom === 'left' ? 1 : -1; // shadow falls away from the window
	const shadow = `${away * pw * 0.012}px ${ph * 0.018}px ${ph * 0.014}px rgba(12,9,7,0.45), ${away * pw * 0.045}px ${ph * 0.06}px ${ph * 0.1}px rgba(12,9,7,0.3)`;

	const mask =
		revealEdge === undefined
			? undefined
			: `linear-gradient(90deg, #000 ${(revealEdge - 0.07) * 100}%, transparent ${(revealEdge + 0.07) * 100}%)`;
	const shadowOpacity = revealEdge === undefined ? 1 : interpolate(revealEdge, [0, 0.4], [0, 1], CLAMP);
	// same reveal edge, re-expressed in the shadow layer's wider box (-15% … 115%)
	const se = revealEdge === undefined ? undefined : (revealEdge + 0.15) / 1.3;
	const shadowMask =
		se === undefined ? undefined : `linear-gradient(90deg, #000 ${(se - 0.06) * 100}%, transparent ${(se + 0.06) * 100}%)`;

	return (
		<div
			style={{
				position: 'absolute',
				left: rect.x * box.w,
				top: rect.y * box.h,
				width: pw,
				height: ph,
				transform: setup.rotateY ? `perspective(${box.w * 1.4}px) rotateY(${setup.rotateY}deg)` : undefined,
				transformOrigin: 'left center',
			}}
		>
			{/* the shadow is revealed by the same light as the canvas */}
			<div
				style={{
					position: 'absolute',
					left: '-15%',
					top: '-15%',
					width: '130%',
					height: '130%',
					WebkitMaskImage: shadowMask,
					maskImage: shadowMask,
					opacity: shadowOpacity,
				}}
			>
				<div style={{position: 'absolute', left: '11.54%', top: '11.54%', width: '76.92%', height: '76.92%', boxShadow: shadow}} />
			</div>
			<div style={{position: 'absolute', inset: 0, overflow: 'hidden', WebkitMaskImage: mask, maskImage: mask}}>
				{setup.frame ? <div style={{position: 'absolute', inset: 0, backgroundColor: setup.frame.color}} /> : null}
				<div style={{position: 'absolute', inset: setup.frame ? setup.frame.width * pw : 0, overflow: 'hidden'}}>
					{src ? (
						<Img src={src} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', filter: GRADE}} />
					) : (
						<PaintingPlaceholder />
					)}
				</div>
				{/* matches the painting to the room's light */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: `linear-gradient(${setup.lightFrom === 'left' ? 90 : 270}deg, rgba(255,244,222,0.12), rgba(20,14,10,0.16))`,
						mixBlendMode: 'soft-light',
					}}
				/>
				{overlay}
			</div>
		</div>
	);
};

/** Room photo + your painting, with camera move. Overlays draw in stage pixels. */
export const RoomComposite: React.FC<{
	setup: RoomSetup;
	roomSrcOverride?: string | null;
	label?: string;
	showPainting?: boolean;
	revealEdge?: number;
	scale?: number;
	origin?: Point;
	shiftX?: number;
	roomBlur?: number;
	filter?: string;
	paintingOverlay?: React.ReactNode;
	overlay?: (box: Box) => React.ReactNode;
	background?: string;
}> = ({
	setup,
	roomSrcOverride,
	label,
	showPainting = true,
	revealEdge,
	scale,
	origin,
	shiftX,
	roomBlur,
	filter,
	paintingOverlay,
	overlay,
	background,
}) => {
	const box = useStageBox(setup.aspect, setup.focusX);
	const roomSrc = roomSrcOverride === undefined ? findAsset(setup.room) : roomSrcOverride;
	return (
		<Stage box={box} scale={scale} origin={origin} shiftX={shiftX} filter={filter} background={background}>
			<Photo src={roomSrc} label={label ?? `${setup.room} — room photo, bare wall`} blur={roomBlur} />
			{showPainting ? <PaintingOnWall setup={setup} box={box} revealEdge={revealEdge} overlay={paintingOverlay} /> : null}
			{overlay ? overlay(box) : null}
		</Stage>
	);
};

export const paintingCenter = (s: RoomSetup): Point => ({x: s.rect.x + s.rect.w / 2, y: s.rect.y + s.rect.h / 2});

// ── light ───────────────────────────────────────────────────────────────────
/** A band of warm light travelling across whatever it sits on. progress 0→1 = left→right. */
export const RakingLight: React.FC<{progress: number; width?: number; strength?: number; angle?: number}> = ({
	progress,
	width = 14,
	strength = 0.5,
	angle = 12,
}) => {
	const p = progress * 140 - 20;
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				background: `linear-gradient(${90 + angle}deg, rgba(255,236,196,0) ${p - width}%, rgba(255,236,196,${strength}) ${p}%, rgba(255,236,196,0) ${p + width}%)`,
				mixBlendMode: 'screen',
			}}
		/>
	);
};

// ── type ────────────────────────────────────────────────────────────────────
export const Caption: React.FC<{
	text: string;
	from: number;
	until?: number;
	/** distance from bottom, fraction of frame height */
	y?: number;
	/** horizontal centre, fraction of frame width (default centred) */
	x?: number;
	color?: string;
	size?: number;
	/** soft dark gradient under the line so it reads over bright linen and chairs */
	scrim?: boolean;
}> = ({text, from, until, y = 0.1, x, color = COLORS.cream, size = 46, scrim = true}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const u = useUnit();
	const inOp = interpolate(frame, [from, from + 16], [0, 1], CLAMP);
	const outOp = until === undefined ? 1 : interpolate(frame, [until - 12, until], [1, 0], CLAMP);
	const rise = ramp(frame, from, from + 26, 10 * u, 0);
	const centred = x === undefined;
	return (
		<>
			{scrim ? (
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: 0,
						height: height * (y + 0.24),
						background: 'linear-gradient(to top, rgba(10,8,6,0.5), rgba(10,8,6,0.22) 55%, rgba(10,8,6,0))',
						opacity: inOp * outOp,
					}}
				/>
			) : null}
			<div
				style={{
					position: 'absolute',
					left: centred ? 0 : width * x,
					right: centred ? 0 : undefined,
					bottom: height * y,
					textAlign: 'center',
					whiteSpace: centred ? undefined : 'nowrap',
					fontFamily: serif,
					fontWeight: 400,
					fontSize: size * u,
					letterSpacing: '0.01em',
					color,
					opacity: inOp * outOp,
					transform: `${centred ? '' : 'translateX(-50%) '}translateY(${rise}px)`,
					textShadow: '0 2px 22px rgba(10,8,6,0.6)',
					padding: centred ? `0 ${60 * u}px` : 0,
				}}
			>
				{text}
			</div>
		</>
	);
};

/** Handwriting that writes itself on, left to right. x,y in container px.
 *  anchor 'right' puts the END of the word at x — use it to keep labels off the painting. */
export const Handwritten: React.FC<{
	text: string;
	x: number;
	y: number;
	progress: number;
	size: number;
	color?: string;
	rotate?: number;
	anchor?: 'left' | 'right';
}> = ({text, x, y, progress, size, color = COLORS.light, rotate = -3, anchor = 'left'}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			fontFamily: hand,
			fontSize: size,
			color,
			whiteSpace: 'nowrap',
			transform: `${anchor === 'right' ? 'translateX(-100%) ' : ''}rotate(${rotate}deg)`,
			transformOrigin: anchor === 'right' ? 'right center' : 'left center',
			clipPath: `inset(-30% ${(1 - progress) * 100}% -30% -4%)`,
			textShadow: '0 1px 14px rgba(10,8,6,0.6)',
		}}
	>
		{text}
	</div>
);

// ── hand-drawn marks (style A: mixed media) ─────────────────────────────────
export const Overlay: React.FC<{w: number; h: number; children: React.ReactNode}> = ({w, h, children}) => (
	<svg
		width={w}
		height={h}
		viewBox={`0 0 ${w} ${h}`}
		style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}
	>
		{children}
	</svg>
);

/** Draws a path on, 0 → 1. */
export const DrawnPath: React.FC<{d: string; progress: number; color?: string; width?: number}> = ({
	d,
	progress,
	color = COLORS.light,
	width = 3,
}) => {
	if (progress <= 0.001) {
		return null;
	}
	return (
		<path
			d={d}
			pathLength={1}
			fill="none"
			stroke={color}
			strokeWidth={width}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeDasharray="1 1"
			strokeDashoffset={1 - Math.min(progress, 1)}
			style={{filter: 'drop-shadow(0 1px 6px rgba(10,8,6,0.5))'}}
		/>
	);
};

const jit = (seed: string, amt: number) => (random(seed) - 0.5) * 2 * amt;

/** A pen loop that slightly overshoots where it started. */
export const handEllipse = (cx: number, cy: number, rx: number, ry: number, seed: string): string => {
	const start = -2.3 + jit(`${seed}-s`, 0.3);
	const ph1 = random(`${seed}-a`) * 6;
	const ph2 = random(`${seed}-b`) * 6;
	const steps = 48;
	const pts: string[] = [];
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const a = start + t * 1.12 * Math.PI * 2;
		const wob = 1 + 0.035 * Math.sin(a * 2 + ph1) + 0.02 * Math.sin(a * 3 + ph2) + (t > 0.86 ? (t - 0.86) * 0.7 : 0);
		pts.push(`${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * rx * wob).toFixed(1)} ${(cy + Math.sin(a) * ry * wob).toFixed(1)}`);
	}
	return pts.join(' ');
};

/** Four bowed strokes with crossing corners — a pencil rectangle. */
export const handRect = (x: number, y: number, w: number, h: number, seed: string): string => {
	const o = Math.min(w, h) * 0.06;
	const b = (k: string) => jit(`${seed}-${k}`, Math.min(w, h) * 0.014);
	return [
		`M${x - o} ${y + b('a')}`,
		`Q${x + w / 2} ${y + b('b') * 2} ${x + w + o * 0.6} ${y + b('c')}`,
		`M${x + w + b('d')} ${y - o}`,
		`Q${x + w + b('e') * 2} ${y + h / 2} ${x + w + b('f')} ${y + h + o * 0.6}`,
		`M${x + w + o} ${y + h + b('g')}`,
		`Q${x + w / 2} ${y + h + b('h') * 2} ${x - o * 0.6} ${y + h + b('i')}`,
		`M${x + b('k')} ${y + h + o}`,
		`Q${x + b('l') * 2} ${y + h / 2} ${x + b('m')} ${y - o * 0.6}`,
	].join(' ');
};

export type Arrow = {shaft: string; head: string; ctrl: Point};

/** Curved arrow. bend: + curves left of travel, − right. */
export const handArrow = (from: Point, to: Point, bend: number): Arrow => {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const len = Math.hypot(dx, dy) || 1;
	const nx = -dy / len;
	const ny = dx / len;
	const ctrl = {x: (from.x + to.x) / 2 + nx * len * bend, y: (from.y + to.y) / 2 + ny * len * bend};
	const tx = to.x - ctrl.x;
	const ty = to.y - ctrl.y;
	const tl = Math.hypot(tx, ty) || 1;
	const ux = -tx / tl;
	const uy = -ty / tl;
	const hs = Math.max(14, len * 0.07);
	const rot = (a: number) => ({x: ux * Math.cos(a) - uy * Math.sin(a), y: ux * Math.sin(a) + uy * Math.cos(a)});
	const l = rot(0.5);
	const r = rot(-0.5);
	return {
		shaft: `M${from.x.toFixed(1)} ${from.y.toFixed(1)} Q${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
		head: `M${(to.x + l.x * hs).toFixed(1)} ${(to.y + l.y * hs).toFixed(1)} L${to.x.toFixed(1)} ${to.y.toFixed(1)} L${(to.x + r.x * hs).toFixed(1)} ${(to.y + r.y * hs).toFixed(1)}`,
		ctrl,
	};
};

export const bezierAt = (a: Point, c: Point, b: Point, t: number): Point => ({
	x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
	y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
});

/** A colour chip, centred on x,y. */
export const Chip: React.FC<{color: string; x: number; y: number; size: number; opacity?: number; scale?: number}> = ({
	color,
	x,
	y,
	size,
	opacity = 1,
	scale = 1,
}) => (
	<div
		style={{
			position: 'absolute',
			left: x - size / 2,
			top: y - size / 2,
			width: size,
			height: size,
			backgroundColor: color,
			border: `${Math.max(2, size * 0.07)}px solid ${COLORS.cream}`,
			boxSizing: 'border-box',
			boxShadow: `0 ${size * 0.08}px ${size * 0.3}px rgba(10,8,6,0.45)`,
			opacity,
			transform: `scale(${scale})`,
		}}
	/>
);

export const rectPx = (r: Rect, box: Box) => ({x: r.x * box.w, y: r.y * box.h, w: r.w * box.w, h: r.h * box.h});
