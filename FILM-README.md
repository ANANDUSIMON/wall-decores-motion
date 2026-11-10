# Wall Decores — Brand Film

24 seconds · 1920×1080 · 30fps · 720 frames

Verified: typechecks clean, all six shots render, motion blur confirmed in
motion, concat-safe (video-only, exact frame durations).

---

## Install

Copy these into `C:\Users\user\wall-decores-motion`, overwriting what's there:

```
src/                    (replaces the old Scene1/2/3 files entirely)
.github/workflows/render.yml
remotion.config.ts
```

Then:

```
npm install
git add -A
git commit -m "Brand film: six shots, bristle brush engine, velocity motion blur"
git push
gh workflow run render.yml
gh run watch
gh run download --name final-video
```

---

## The six shots

| # | Name | Time | What happens |
|---|------|------|--------------|
| 1 | Cold Open | 0.0–3.0 | Gold hairline opens, loaded brush swipes in a warm field, light bars rake past |
| 2 | The Drop | 3.0–8.0 | Five canvases fall into frame with real weight and motion blur, type lands after |
| 3 | Texture | 8.0–13.0 | Three strokes paint themselves down frame, raking light, claims roll through |
| 4 | The Grid | 13.0–17.5 | Twelve painted panels snap into a gallery wall on a diagonal stagger |
| 5 | The Turn | 17.5–21.0 | Hard cut to cream. NOT PRINTED. → PAINTED. The hero stroke |
| 6 | Lock-up | 21.0–24.0 | Gold sweep reveals the name in its wake, contact line, hold |

---

## What drives the look

**Velocity-driven motion blur.** Not a blur filter. Each moving element's own
position function is sampled at sub-frame intervals and those samples are
composited — the same thing After Effects does. Fast elements smear, settled
ones stay razor sharp, and the smear follows the actual path of travel.
Elements moving slower than 8px/frame skip the extra samples entirely, so the
render stays cheap. Lives in `src/lib/motion.ts`.

**Thresholded bloom.** The single biggest difference between "premium" and
"flat web graphic." A plain bloom lifts the whole frame and goes milky; this
one crushes everything below ~70% luminance to black before blurring, so only
genuinely bright things spill light. `src/components/PostFX.tsx`.

**Bristle brush strokes.** 60–80 independent tapered sub-strokes sharing one
bowed bezier spine, each with its own perpendicular offset, opacity and
length. A fraction get dropped mid-path for dry-brush skip. Revealed by a mask
that sweeps along the stroke's own angle, so it reads as *painted* rather than
faded in. `src/components/BrushStroke.tsx`.

**Palette-knife impasto.** Long narrow hard-edged slabs at a consistent
dominant angle, not soft ellipses. Round translucent blobs read as bokeh;
directional slabs read as paint worked by one hand.

---

## Grading

Each shot is graded separately in `src/BrandFilm.tsx` — one global bloom value
cannot serve both an ink shot and the cream inversion. Change the `fx` values
there:

```ts
{ id: 'Shot5', ..., fx: { bloom: 0.12, grain: 0.06, vignette: 0.30 } }
```

---

## Palette

```
ink          #0b0d0c      gold        #d4b26a
inkSoft      #15191a      goldBright  #eccf90
inkLift      #1e2423      emerald     #16b584
cream        #f2ece0      amber       #e8622f
creamDim     #d9d1c2      rose        #d4537e
                          teal        #2a9d9b
```

Rule: no more than two accent colours visible in any single shot. Vibrancy
comes from saturation and bloom, never from colour count.

---

## Adding music

Render stays video-only on purpose — that is what makes the six files concat
without drift. Add the track to the finished film in one pass:

```
ffmpeg -i wall-decores-brand-film.mp4 -i music.mp3 \
  -map 0:v -map 1:a -c:v copy -shortest final-with-music.mp4
```

`-c:v copy` means the picture is never re-encoded, so it costs nothing in
quality.

---

## Two things not to change without thinking

**`--muted` on every shot render.** Without it Remotion attaches a silent
audio track ~0.056s longer than the video. Six of those concatenated drift by
a third of a second.

**`-c copy` on the concat.** Glue, don't repaint. The final film is
bit-identical to what each machine produced. Re-encoding there would cost a
generation of quality for nothing.
