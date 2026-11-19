// ─────────────────────────────────────────────────────────────────────────────
// "THE LAST PIECE" — 60 second brand film, Wall Decores Artisan Collectives
//
// Everything you normally change lives in THIS file.
//
// Images go in:  public/last-piece/
// Name them exactly as the stems below (any of .jpg .jpeg .png .webp works).
// A missing image renders as a labelled placeholder, so the film always
// renders — drop images in one at a time and re-render.
// ─────────────────────────────────────────────────────────────────────────────

export type Point = {x: number; y: number}; // 0–1 fractions
export type Rect = {x: number; y: number; w: number; h: number}; // 0–1 fractions of the ROOM photo

export type RoomSetup = {
	/** file stem of the room photo WITHOUT a painting on the wall */
	room: string;
	/** file stem(s) of YOUR real painting photo — first one found is used */
	painting: string[];
	/** where the canvas sits on the wall, as fractions of the room photo */
	rect: Rect;
	/** room photo width ÷ height. 1536×1024 = 1.5, 1920×1080 = 1.778 */
	aspect: number;
	/** which side stays in frame when cropped to vertical 9:16 (0 = left, 1 = right) */
	focusX: number;
	/** side the window light comes from — decides which way the shadow falls */
	lightFrom: 'left' | 'right';
	/** degrees — only for an angled room photo */
	rotateY?: number;
	/** optional thin frame: colour + width as a fraction of the canvas width */
	frame?: {color: string; width: number};
};

export const FPS = 30;
export const DURATION = 1800; // 60s

export const FOLDER = 'last-piece';

export const COLORS = {
	sienna: '#C9502B',
	siennaDeep: '#8E3A1E',
	ochre: '#E0A22E',
	light: '#F2C66B',
	teal: '#14514C',
	tealDeep: '#0D3936',
	emerald: '#2D7049',
	brass: '#C08A3E',
	cream: '#F7EDDD',
	ink: '#191310',
};

/** Grade on every photograph. Rich, never pale. */
export const GRADE = 'saturate(1.1) contrast(1.05)';

// ── ROOMS ───────────────────────────────────────────────────────────────────
// Generate rooms at 16:9 (e.g. 1920×1080) so nothing is cropped in the
// landscape cut. rect defaults are a starting guess — set them to YOUR photo:
//   x = left edge px ÷ image width      w = canvas width px ÷ image width
//   y = top edge px ÷ image height      h = canvas height px ÷ image height

export const ROOM1: RoomSetup = {
	// Kerala bedroom, teal wall — measured from the 1536×1024 render
	room: 'room1-empty',
	painting: ['painting1'],
	rect: {x: 0.334, y: 0.2051, w: 0.2376, h: 0.3438},
	aspect: 1536 / 1024,
	focusX: 0.425,
	lightFrom: 'right',
	frame: {color: '#B48654', width: 0.012},
};

/** Optional: same room, camera ~30° to the side. Falls back to a tight crop of ROOM1. */
export const ROOM1_ANGLE: RoomSetup = {
	room: 'room1-angle-empty',
	painting: ['painting1'],
	rect: {x: 0.3, y: 0.2, w: 0.26, h: 0.36},
	aspect: 16 / 9,
	focusX: 0.45,
	lightFrom: 'right',
	rotateY: 24,
};

/** Optional: room 1 photographed at evening. Falls back to ROOM1 with an evening grade. */
export const ROOM1_EVENING_STEM = 'room1-evening-empty';

/** Where the lamp is in ROOM1 (evening glow) */
export const LAMP: Point = {x: 0.846, y: 0.625};

export const ROOM2: RoomSetup = {
	// mauve reading room — measured from the 1374×1145 render
	room: 'room2-empty',
	painting: ['painting2', 'painting1'],
	rect: {x: 0.4549, y: 0.2445, w: 0.2162, h: 0.3127},
	aspect: 1374 / 1145,
	focusX: 0.62,
	lightFrom: 'left',
	frame: {color: '#3A2A1E', width: 0.012},
};

export const TRIPTYCH: RoomSetup[] = [
	{room: 'dining-empty', painting: ['painting3', 'painting1'], rect: {x: 0.33, y: 0.18, w: 0.34, h: 0.3}, aspect: 16 / 9, focusX: 0.5, lightFrom: 'left'},
	{room: 'entrance-empty', painting: ['painting4', 'painting2', 'painting1'], rect: {x: 0.43, y: 0.12, w: 0.14, h: 0.5}, aspect: 16 / 9, focusX: 0.5, lightFrom: 'right'},
	{room: 'suite-empty', painting: ['painting5', 'painting1'], rect: {x: 0.25, y: 0.2, w: 0.5, h: 0.24}, aspect: 16 / 9, focusX: 0.5, lightFrom: 'right'},
];

// ── TEXTURE & STUDIO ────────────────────────────────────────────────────────
export const TEXTURE = {
	/** macro photo of your impasto — include a canvas edge on one side */
	macro: 'macro-texture',
	macroAspect: 3 / 2,
	/** macro of a single fresh ridge. Falls back to the macro photo. */
	ridge: 'ridge-macro',
	/** phone video (.mp4/.mov, 6s+) or photo of the palette knife at work */
	studio: 'studio',
	studioAspect: 16 / 9,
};

/** optional music bed: public/last-piece/score.mp3 */
export const AUDIO_STEM = 'score';

// ── THE MATCH (shots 09–10) ─────────────────────────────────────────────────
// onPainting: where the colour sits IN the painting (fractions of the painting)
// inRoom:     what it answers IN room 1 (fractions of the room photo)
export const SWATCHES = [
	// colours sampled from painting1 and room1
	{color: '#8B3614', label: 'the heliconia', onPainting: {x: 0.17, y: 0.49}, inRoom: {x: 0.256, y: 0.505}},
	{color: '#AB7A46', label: 'the teak', onPainting: {x: 0.2, y: 0.72}, inRoom: {x: 0.449, y: 0.664}},
	{color: '#F3CE91', label: 'the curtains', onPainting: {x: 0.855, y: 0.648}, inRoom: {x: 0.859, y: 0.39}},
];

// ── COPY ────────────────────────────────────────────────────────────────────
export const COPY = {
	finished: 'The room was finished.',
	wasnt: "The wall wasn't.",
	handmade: 'Handmade. In light, it moves.',
	chosen: 'Every piece is chosen for its room.',
	different: 'A different room asks a different piece.',
	place: 'Angamaly, Kerala.',
	line: 'Not decoration. Completion.',
	wordmark: 'WALL DECORES',
	sub: 'ARTISAN COLLECTIVES',
	tagline: 'Handmade canvas & texture art — Kerala',
	url: 'walldecores.com',
};

// ── TIMING (frames at 30fps) — must add up to DURATION ──────────────────────
export const SHOTS = {
	s01: 90, // macro impasto
	s02: 90, // surface resolves
	s03: 90, // wide room, empty
	s04: 150, // hold the bare wall + two lines
	s05: 120, // the light sweep
	s06: 120, // wide, complete
	s07: 120, // three-quarter
	s08: 120, // macro in situ
	s09: 120, // palette lifts
	s10: 120, // swatches land
	s11: 120, // room two
	s12: 120, // triptych
	s13: 150, // studio
	s14: 90, // the ridge
	s15: 120, // evening
	s16: 60, // wordmark
};
