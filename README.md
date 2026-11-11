# Wall Decores — Gallery Film

26 seconds · 1920×1080 · 30fps · 780 frames · warm white gallery wall

Built around your actual paintings. Fourteen of them are already cropped out
of the four grids you sent and sitting in `public/art/`.

---

## Install and render

```
cd C:\Users\user\wall-decores-motion
npm install
npm run manifest
git add -A
git commit -m "Gallery film: real paintings on a white wall"
git push
gh workflow run render.yml
gh run watch
gh run download --name final-video
```

Six machines render one shot each in parallel, so expect 10–14 minutes rather
than the hour it would take in sequence.

To preview locally before pushing: `npm run studio`.

---

## THE IMAGES — what to do with them

This is the part that decides whether the film looks like a real studio or a
stock template, so it is worth getting right.

### What is already done

Your four grids were split into fourteen individual paintings:

| file | from | shape |
|---|---|---|
| `a1-heliconia-pink` | grid 1 | square |
| `a2-reader-stone` | grid 1 | square |
| `a3-bloom-white` | grid 1 | square |
| `a4-pods-amber` | grid 1 | square |
| `b1-dancer-rose` | 2-panel | portrait |
| `b2-leaf-green` | 2-panel | portrait |
| `c1-grasses-sage` | grid 3 | landscape |
| `c2-figures-vermilion` | grid 3 | landscape |
| `c3-strata-rust` | grid 3 | landscape |
| `c4-seascape-silver` | grid 3 | landscape |
| `d1-origami-red` | grid 4 | square |
| `d2-reader-blue` | grid 4 | square |
| `d3-spiral-white` | grid 4 | square |
| `d4-pods-burgundy` | grid 4 | square |

### Adding your own paintings

1. **One painting per file.** Never a grid, never two pieces in one image —
   the film treats each file as a single canvas and will hang a grid on the
   wall as though it were one painting.

2. **Crop to the canvas edge.** No wall, no floor, no frame, no hand holding
   it. The film supplies its own wall, shadow and stretcher edge; anything
   extra in the file fights with them.

3. **Shoot or scan it square on.** A photograph taken at an angle has
   perspective baked in, and when the film then hangs it flat on a wall the
   two disagree and it looks wrong in a way that is hard to place.

4. **Long edge 1200–2000 px, JPEG.** Smaller than 1200 goes soft in the
   push shot. Larger than 2000 just makes the repo heavy and the render
   slower without looking any better.

5. **Even lighting, no glare.** A hotspot from a flash or a window reflection
   reads as a defect once the piece is on a clean wall.

6. **Name it `set-subject-colour.jpg`** — lowercase, hyphens, no spaces. The
   name becomes the id you refer to in the shot files.

Then:

```
npm run manifest
```

That reads every file's real dimensions and rewrites `src/art.ts`. Run it
every time you add, replace or remove a painting. Nothing else needs editing
for the manifest to pick a new piece up.

### Choosing which painting goes where

**The single most important rule: strong colour wins on a white wall.**

Your pale pieces — the cream bloom, the silver seascape, the sage grasses —
nearly disappear against warm white, however well they are lit. The deep
greens, rusts, burgundies and reds sing against it. The first cut of this
film used the pale dancer as the opening hero and the whole shot looked
washed out; swapping in the dark green and hot pink heliconia fixed it
completely.

So: lead every shot with a strong piece, and use at most one quiet piece per
shot as a breather.

The exception is the texture shot, where the cream impasto bloom is exactly
right — pushed in close it fills the frame, so there is no wall left to
compete with it, and the shot is about surface rather than colour.

### Swapping a painting into a shot

Each shot names its paintings by id at the top of its file:

```ts
// src/shots/Shot2.tsx
const HANG: Hang[] = [
  { id: 'c3-strata-rust', x: 400, y: 432, h: 250, delay: 0, rot: 0, side: 'right' },
  ...
];
```

Change `id` to any file in `public/art`. `h` is the display height in pixels;
the width follows the painting's real aspect ratio automatically, so a
portrait and a landscape at the same `h` will be different widths and the
hang stays correct. `delay` is how many frames to wait before it arrives.

---

## The six shots

| # | Name | Time | What happens |
|---|---|---|---|
| 1 | Arrival | 0.0–3.5 | Empty wall. One painting slides in and settles. |
| 2 | The Hang | 3.5–8.5 | Five pieces go up on a stagger, camera drifts right. |
| 3 | Texture | 8.5–13.0 | Slow push into the impasto. The shot that sells. |
| 4 | The Wall | 13.0–17.5 | Nine-piece salon hang, camera pulls back. |
| 5 | Made to Size | 17.5–21.5 | Measurement brackets draw around one piece. |
| 6 | Lock-up | 21.5–26.0 | The piece travels out, the name wipes in. |

---

## What drives the look

**Velocity-driven motion blur.** Not a blur filter. Each moving element's own
position function is sampled at sub-frame intervals and those samples are
composited — the same thing After Effects does. The smear follows the real
path of travel, so a painting sliding in sideways smears sideways. Anything
moving slower than 7 px per frame skips the extra samples entirely, so the
render stays cheap. `src/lib/motion.ts`.

**Two shadows per painting, never one.** A tight contact shadow in the gap
between canvas and wall, plus a wide ambient one much further down. A single
shadow always reads as a sticker. Both are driven by a `lift` value that runs
from 1 to 0 as a piece settles, so the shadow starts large and soft and
tightens as the canvas comes to rest — that is the whole illusion of it being
placed rather than fading in.

**No bloom.** A dark film wants bloom; a light one is destroyed by it. Bloom
lifts the whole frame, the wall goes milky and every painting loses its edge.
What a light frame needs instead is contrast, a corner fall and grain.
`src/components/PostFX.tsx`.

**2.5D parallax.** Paintings sit on a nearer plane than the wall, so when the
camera drifts they sweep across faster than the background. It is the
cheapest way to turn a flat composition into a room. `src/components/Camera.tsx`.

**A shared light angle.** Every painting in a shot gets the same raking-light
gradient across its surface, which is what makes them look like they are in
one room rather than pasted onto one page.

---

## Grading

Per shot, in `src/GalleryFilm.tsx`. One setting cannot serve a wide wall shot
and a close texture push — the texture shot wants almost no vignette so the
surface stays even, the wide shots want more so the frame has edges.

```ts
{ id: 'Shot3', ..., fx: { grain: 0.04, vignette: 0.16, warmth: 0.45 } }
```

---

## Adding music

The render stays video-only on purpose — that is what makes the six files
concat without drift. Put the track on the finished film in one pass:

```
ffmpeg -i wall-decores-gallery-film.mp4 -i music.mp3 \
  -map 0:v -map 1:a -c:v copy -shortest final-with-music.mp4
```

`-c:v copy` means the picture is never re-encoded, so it costs nothing.

---

## Two things not to change without thinking

**`--muted` on every shot render.** Without it Remotion attaches a silent
audio track about 0.056s longer than the video. Six of those concatenated
drift by a third of a second.

**`-c copy` on the concat.** Glue, don't repaint. Re-encoding there would
cost a generation of quality for nothing.
