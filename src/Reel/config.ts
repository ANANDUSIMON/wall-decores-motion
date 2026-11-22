// ─────────────────────────────────────────────────────────────
//  WALL DECORES — 40s vertical reel · 2160×3840 · 60fps
//  Every timing and measurement in the film lives in this file.
// ─────────────────────────────────────────────────────────────
export const FPS = 60;
export const W = 2160;
export const H = 3840;
export const DURATION = 40 * FPS;
export const f = (sec: number) => Math.round(sec * FPS);

// Music is 120 BPM: a beat every 0.5s, a phrase every 4s.
// The first downbeat sits 0.03s into the track, so every cut is offset by that.
export const BEAT0 = 0.03;
export const beat = (n: number) => BEAT0 + n * 0.5;

export const C = {
  cream: "#F4ECDF",
  ink: "#15110E",
  terracotta: "#C8643C",
  line: "#F4ECDF",
  pill: "rgba(21,17,14,0.74)",
};

// ── Scene timing (seconds) ────────────────────────────────────
export const T = {
  hookStart: 0,
  roomsStart: beat(8), // 4.03
  roomLen: 4, // one phrase per room
  montageStart: beat(56), // 28.03
  montageCut: 0.5, // one beat per room
  claimsStart: beat(62), // 31.03
  endStart: beat(72), // 36.03
};

export type Room = {
  id: string;
  label: string;
  headline: string;
  img: string;
  imgW: number;
  imgH: number;
  v0: number; // top of the image shown in frame (fraction of image height)
  // painting frame edges, as fractions of the image
  p: [number, number, number, number];
  size: string; // painting size, inches
  sizeFt: string;
  furn: { label: string; x0: number; x1: number; y: number };
  clear?: { inches: number; u: number; yTop: number };
  swatches: string[]; // three painting colours + the room's echo accent (last)
  tape?: boolean;
};

// Painting and furniture sizes are set from each image's real proportions,
// so a line drawn longer on screen always carries the larger number.
export const ROOMS: Room[] = [
  {
    id: "living",
    label: "Living room",
    headline: "Sized to your sofa.",
    img: "reel/img/living.jpg",
    imgW: 1184,
    imgH: 2612,
    v0: 0.07,
    p: [0.149, 0.214, 0.877, 0.525],
    size: '54 × 54"',
    sizeFt: "4.5 × 4.5 ft",
    furn: { label: 'Sofa · 96"', x0: 0.012, x1: 1.08, y: 0.592 },
    clear: { inches: 12, u: 0.8, yTop: 0.6 },
    swatches: ["#E2452B", "#1F5A55", "#3E7A4E", "#2D6A66"],
    tape: true,
  },
  {
    id: "dining",
    label: "Dining pavilion",
    headline: "Painted in your colours.",
    img: "reel/img/dining.jpg",
    imgW: 1196,
    imgH: 2612,
    v0: 0.09,
    p: [0.067, 0.278, 0.925, 0.499],
    size: '64 × 36"',
    sizeFt: "5.3 × 3 ft",
    furn: { label: 'Dining table · 84"', x0: -0.08, x1: 1.08, y: 0.612 },
    swatches: ["#D2601E", "#9A2F14", "#E8B66A", "#B4552A"],
  },
  {
    id: "bedroom",
    label: "Bedroom suite",
    headline: "Proportioned to your bed.",
    img: "reel/img/bedroom.jpg",
    imgW: 1180,
    imgH: 2612,
    v0: 0.08,
    p: [0.051, 0.253, 0.949, 0.501],
    size: '66 × 40"',
    sizeFt: "5.5 × 3.3 ft",
    furn: { label: 'Queen bed · 60"', x0: 0.098, x1: 0.937, y: 0.545 },
    clear: { inches: 8, u: 0.82, yTop: 0.551 },
    swatches: ["#DCD3C3", "#3E5F78", "#D9B37A", "#5E7A92"],
    tape: true,
  },
  {
    id: "lobby",
    label: "Hotel lobby",
    headline: "Statement art for hotels.",
    img: "reel/img/lobby.jpg",
    imgW: 1180,
    imgH: 2612,
    v0: 0.1,
    p: [0.192, 0.204, 0.9, 0.525],
    size: '60 × 60"',
    sizeFt: "5 × 5 ft",
    furn: { label: 'Lounge chair · 34"', x0: 0.068, x1: 0.471, y: 0.612 },
    clear: { inches: 21, u: 0.84, yTop: 0.619 },
    swatches: ["#7E1E1E", "#C7792A", "#7A7A2E", "#6E6A2A"],
  },
  {
    id: "spa",
    label: "Spa reception",
    headline: "Calm, for wellness spaces.",
    img: "reel/img/spa.jpg",
    imgW: 1184,
    imgH: 2612,
    v0: 0.045,
    p: [0.166, 0.104, 0.841, 0.531],
    size: '44 × 60"',
    sizeFt: "3.7 × 5 ft",
    furn: { label: 'Console · 62"', x0: 0.024, x1: 0.98, y: 0.603 },
    clear: { inches: 11, u: 0.76, yTop: 0.61 },
    swatches: ["#A9B266", "#5D6B2C", "#2F4A2A", "#8C8C6E"],
    tape: true,
  },
  {
    id: "penthouse",
    label: "Penthouse living",
    headline: "Bold, for modern homes.",
    img: "reel/img/penthouse.jpg",
    imgW: 1196,
    imgH: 2612,
    v0: 0.09,
    p: [0.104, 0.257, 0.958, 0.5],
    size: '66 × 40"',
    sizeFt: "5.5 × 3.3 ft",
    furn: { label: "Sofa · 9 ft", x0: 0.013, x1: 1.08, y: 0.586 },
    clear: { inches: 16, u: 0.84, yTop: 0.593 },
    swatches: ["#EE4A12", "#1E3FA8", "#B3160F", "#1D3EA6"],
  },
];

export const CLAIMS = [
  "Hand-painted canvas art",
  "Made to your wall size",
  "Colour-matched to your interior",
  "For homes · hotels · spas",
];

// ── Sound (all ElevenLabs) ────────────────────────────────────
export const MUSIC = { file: "reel/audio/music_edit.wav", volume: 0.9 };
const cuts = [T.roomsStart, ...ROOMS.map((_, i) => T.roomsStart + i * T.roomLen).slice(1), T.montageStart, T.claimsStart];
export const SFX: { file: string; at: number; volume: number }[] = [
  ...cuts.map((t) => ({ file: "reel/audio/swish.mp3", at: t - 0.06, volume: 0.32 })),
  ...ROOMS.map((r, i) => ({ r, i }))
    .filter(({ r }) => r.tape)
    .map(({ i }) => ({ file: "reel/audio/tape.mp3", at: T.roomsStart + i * T.roomLen + 0.17, volume: 0.42 })),
  { file: "reel/audio/boom.mp3", at: T.endStart - 0.02, volume: 0.62 },
];
export const MIX = "reel/audio/mix_master.wav";
