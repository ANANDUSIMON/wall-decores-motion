# The Last Piece — asset guide

All images live in `public/last-piece/`. Name them exactly as below — any of
`.jpg .jpeg .png .webp` works. **A missing file never breaks the render**: it
shows a labelled placeholder (or a fallback crop), so you can add assets one at
a time and re-render.

## Already included (from your sailboat bedroom and stained-glass room)

| File | What it is |
|---|---|
| `room1-empty.jpg` | Kerala bedroom, painting removed from the wall |
| `room2-empty.jpg` | Mauve reading room, painting removed |
| `painting1.jpg` | The sailboat canvas, flat |
| `painting2.jpg` | The stained-glass tree canvas, flat |
| `macro-texture.jpg` | **Stand-in only** — a crop of painting1. Replace with a real photo (below) |
| `fonts/*.woff2` | Cormorant Garamond, Inter, Kalam — OFL licensed, bundled so renders never depend on the internet |

## Shoot these yourself — they are the proof of handmade

| File | How |
|---|---|
| `macro-texture.jpg` | Phone in macro mode, 10–15 cm from a heavily textured canvas. Window light raking from the side, no flash. Include a canvas edge on one side. Landscape. |
| `ridge-macro.jpg` | Same, on one fresh ridge of paint straight after a knife stroke. Optional — falls back to the macro. |
| `studio.mp4` | 6–10 seconds, landscape, phone propped still: your hand loading the palette knife and laying a stroke. Window light. A photo `studio.jpg` also works. **This is the only slot that shows a placeholder until filled.** |
| `score.mp3` | Optional music bed. A single held, warm note works best. Licensed music only. |

## Generate these with an image AI (optional — the film already works without them)

| File | Falls back to |
|---|---|
| `room1-angle-empty.jpg` | a tight drifting crop of room 1 |
| `room1-evening-empty.jpg` | room 1 with an evening grade |
| `dining-empty.jpg`, `entrance-empty.jpg`, `suite-empty.jpg` | detail crops of rooms 1 and 2 |
| `painting3.jpg`, `painting4.jpg`, `painting5.jpg` | your other paintings for the triptych rooms |

**Best method for an empty room:** generate the room *with* a painting, then ask
the same tool: *"Remove the painting from the wall. Keep everything else in the
image identical — same light, same camera, same objects."* The wall then keeps
realistic light where your canvas will be composited back.

**Prompt starter (16:9):**
> Photorealistic interior photograph of a [premium Kerala-modern dining room],
> 16:9 landscape, eye-level camera facing the back wall straight-on, the back
> wall completely bare with a clear empty area for a large artwork, soft natural
> window light from the [left], rich warm materials — teak, terracotta,
> terrazzo, linen, brass — nothing hanging on the wall, 35mm lens,
> architectural photography.

**Never let the AI paint your artwork.** The film always composites your real
painting photo onto the wall, so the piece on screen is exactly the piece you sell.

## Mastering the final render (manual step)

No render pipeline for LastPiece is wired into this repo yet (`.github/workflows/render.yml`
only renders the unrelated, audio-free Gallery Film). Until one exists, master the
audio by hand right after whatever render produces `out/LastPiece.mp4`:

```
python3 master.py out/LastPiece.mp4 out/final.mp4
```

This runs two-pass EBU R128 to −14 LUFS / −1.0 dBTP via `ffmpeg-normalize`, then
re-measures the result with an independent meter (`pyloudnorm`) rather than trusting
the tool's own report. Deliver `out/final.mp4`, not the raw render — a single-pass
`ffmpeg -af loudnorm=I=-14:TP=-1` drifts on material with a quiet opening, which this
film has.

Setup once: `pip install -r audio-requirements.txt` (needs `ffmpeg`/`ffprobe` on PATH;
on Linux, Matchering also needs the system `libsndfile1` package).

## When you add a new room

Each room needs a `rect` in `src/LastPiece/config.ts` — where the canvas sits, as
fractions of the image:

- `x` = left edge px ÷ image width   `w` = canvas width px ÷ image width
- `y` = top edge px ÷ image height   `h` = canvas height px ÷ image height
- `aspect` = image width ÷ image height

Keep `w`, `h` in the painting's real proportions. Claude Code can open the image
and measure this for you.
