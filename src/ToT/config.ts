// "This… or This?" v2 — 90s vertical reel, 2160×3840 @ 60fps
// Paced by the voiceover (see timeline.ts). Every on-screen measurement is computed
// from real inches using a per-room pixels-per-inch calibration.
import { TL } from "./timeline";

export const FPS = 60;
export const W = 2160;
export const H = 3840;
export const DURATION = Math.round(TL.total * FPS);
export const f = (s: number) => Math.round(s * FPS);

export const C = { ink: "#1C1612", cream: "#F6EFE3", gold: "#C9A45C" };

// ---------- 3D ----------
export const PERSPECTIVE = 2600; // px; smaller = stronger depth
export const FRAME_DEPTH_IN = 2.25; // float frame depth + stand-off from the wall
export const FG_DEPTH_IN = 16; // how far in front of the wall the furniture layer sits

// ---------- paintings ----------
export type PaintingId = "N10" | "N5" | "N3" | "N8" | "P3" | "P4" | "N2" | "P1";
export const PAINTINGS: Record<PaintingId, { file: string; name: string; hex: string }> = {
  N10: { file: "tot/img/N10.jpg", name: "Coral Hibiscus", hex: "#D7431E" },
  N5: { file: "tot/img/N5.jpg", name: "Desert Strata", hex: "#C35917" },
  N3: { file: "tot/img/N3.jpg", name: "Krishna in Saffron", hex: "#D57A27" },
  N8: { file: "tot/img/N8.jpg", name: "Banana Leaf", hex: "#B7A638" },
  P3: { file: "tot/img/P3.jpg", name: "Ember Bloom", hex: "#C84210" },
  P4: { file: "tot/img/P4.jpg", name: "Gold Seam", hex: "#79190C" },
  N2: { file: "tot/img/N2.jpg", name: "Heliconia", hex: "#0C433A" },
  P1: { file: "tot/img/P1.jpg", name: "Monsoon Canopy", hex: "#146D70" },
};

export type Placement = { p: PaintingId; wIn: number; hIn: number; bottomIn: number; reason: string };

export type Room = {
  id: string;
  label: string;
  emptyLine: string; // headline while the wall is bare
  // Absolute second the bare-wall headline lands. It echoes words the voiceover speaks, so it is
  // cued to the moment those words are said — not to the start of the room. Measured by where the
  // phrase sits inside its voice line in timeline.ts, set ~0.15s early so the text leads the voice.
  lineAt: number;
  // Optional second bare-wall beat, for a voice line that turns halfway ("Lovely light… | but that wall?").
  then?: { at: number; text: string };
  img: string;
  overlay?: { file: string; x: number; y: number; w: number; h: number };
  wallHex: string;
  ink: "dark" | "light";
  ppi: number; // pixels per inch on the wall plane
  floorY: number;
  cx: number;
  captionTop?: number;
  cam?: [number, number]; // camera scale start → end
  fgSeamY: number; // everything below this line is furniture (moves in front of the wall in the 3D pan)
  furn: { kind: "sofa" | "table"; label: string; widthIn: number; topIn: number; x0?: number; x1?: number };
  A: Placement;
  B: Placement;
};

/* Calibration (output px, image 2160 wide):
   oat      sofa back 389→1728 = 84"  → 15.94 px/in ; back top 31.9"
   olive    sofa back 313→1879 = 84"  → 18.64 px/in ; back top 28.6"
   golden   sofa back 378→1750 = 84"  → 16.33 px/in ; back top 25.9"
   dining   table far end 38" = 864px → 22.50 px/in ; table top 29.7"   */
export const ROOMS: Room[] = [
  {
    id: "R4",
    label: "Oat living room",
    emptyLine: "Lovely light…",
    lineAt: 7.75, // voice says these words here
    then: { at: 10.37, text: "…but an empty wall." }, // VO01 "It feels a little empty" starts 10.47s
    img: "tot/img/R4.jpg",
    wallHex: "#C5A686",
    ink: "dark",
    ppi: 15.94,
    floorY: 2748,
    cx: 1058,
    fgSeamY: 2215,
    furn: { kind: "sofa", label: "Sofa", widthIn: 84, topIn: 32, x0: 389, x1: 1728 },
    A: { p: "N10", wIn: 60, hIn: 40, bottomIn: 40, reason: "Coral warms it · teal keeps it fresh" },
    B: { p: "N5", wIn: 60, hIn: 40, bottomIn: 40, reason: "Same warm family · 3× the saturation" },
  },
  {
    id: "R2",
    label: "Sage-olive living room",
    emptyLine: "Calm… but quiet.",
    lineAt: 31.65, // voice says these words here
    img: "tot/img/R2.jpg",
    wallHex: "#928A70",
    ink: "light",
    ppi: 18.64,
    floorY: 3126,
    cx: 1097,
    fgSeamY: 2490,
    furn: { kind: "sofa", label: "Sofa", widthIn: 84, topIn: 29, x0: 313, x1: 1879 },
    A: { p: "N3", wIn: 60, hIn: 40, bottomIn: 38, reason: "Saffron & blue glow against olive" },
    B: { p: "N8", wIn: 60, hIn: 40, bottomIn: 38, reason: "Green on green · just brighter" },
  },
  {
    id: "R1",
    label: "Golden living room",
    emptyLine: "A bright room needs depth.",
    lineAt: 44.2, // voice says these words here
    img: "tot/img/R1.jpg",
    wallHex: "#EFD39F",
    ink: "dark",
    ppi: 16.33,
    floorY: 2907,
    cx: 1064,
    fgSeamY: 2470,
    furn: { kind: "sofa", label: "Sofa", widthIn: 84, topIn: 26, x0: 378, x1: 1750 },
    A: { p: "P3", wIn: 60, hIn: 44, bottomIn: 36, reason: "Darkest art on the lightest wall" },
    B: { p: "P4", wIn: 60, hIn: 44, bottomIn: 36, reason: "Crimson & gold · more dramatic" },
  },
  {
    id: "R3",
    label: "Terracotta dining room",
    emptyLine: "Go the opposite way.",
    lineAt: 59.2, // voice says these words here
    img: "tot/img/R3.jpg",
    wallHex: "#C0713B",
    ink: "dark",
    ppi: 22.5,
    floorY: 2888,
    cx: 1072,
    fgSeamY: 1975,
    captionTop: 2600,
    cam: [1.04, 1.1],
    furn: { kind: "table", label: "Table", widthIn: 38, topIn: 30 },
    A: { p: "N2", wIn: 54, hIn: 36, bottomIn: 44, reason: "Teal opposes · coral echoes the wall" },
    B: { p: "P1", wIn: 56, hIn: 32, bottomIn: 46, reason: "Complementary · 157° apart" },
  },
];

export const AUDIO = {
  music: "tot/audio/v2/music.mp3",
  musicVol: 0.38,
  duck: 0.5, // music level under the voice
  brush: "tot/audio/brush.mp3",
  brushVol: 0.4,
  swish: "reel/audio/swish.mp3",
  swishVol: 0.22,
};

export const WIPE = 1.1; // seconds for a brush stroke reveal — slower than v1

export const CONTACT = {
  web: "walldecores.com",
  ig: "@wall_decores_artisan",
  phone: "+91 90377 90012",
  city: "Angamaly · Kerala",
};

export const cm = (inch: number) => Math.round(inch * 2.54);
