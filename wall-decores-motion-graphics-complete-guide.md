# Wall Decores Motion Graphics — Complete Guide

**Studio:** Wall Decores Artisan Collectives
**Location:** Angamaly, Kerala
**Founder:** Anandu P Simon
**Date:** November 2026

---

## 1. The Problem

Wall Decores needed studio-quality cinematic motion graphics for brand films and social media — the kind of work typically done in After Effects and Premiere Pro. But the constraints were:

- **No After Effects** — Anandu wanted a code-based, automated pipeline
- **Low-spec PC** — 4 GB RAM, Intel i3 processor (cannot render video locally)
- **Zero budget** — all tools and hosting must be free
- **One-person operation** — everything must be automated from a single terminal

---

## 2. The Solution: Three-Tier Architecture

### Tier 1 — GitHub Actions (Primary Render Farm)
- **What it is:** Free computers GitHub lends you whenever you push code
- **Specs:** 4 CPU cores, 16 GB RAM per machine — free and unlimited on public repos
- **How it works:** Matrix strategy spins up one machine per scene, all work simultaneously
- **Speed:** 6 scenes render in the time it takes to render 1 (parallel, not sequential)
- **Quality:** Pixel-perfect — scenes are joined with `-c copy` (no re-encoding)

### Tier 2 — Oracle Cloud Always Free (Dev/Preview Server)
- **Specs:** 2 OCPU (Ampere A1), 12 GB RAM — always on, free forever
- **Use:** Quick previews, testing single frames, running the Remotion studio
- **Not for:** Final renders (GitHub Actions is faster and more powerful)

### Tier 3 — Google Colab (GPU Specialist)
- **Specs:** ~12 GB RAM, GPU access (T4), ~12 hour session limits
- **Use:** Only when GPU is needed (Three.js 3D renders, heavy particle systems)
- **Not for:** Regular work (sessions disconnect, not reliable)

---

## 3. The Tool Stack

### Core Tools
| Tool | Purpose | Why This One |
|------|---------|-------------|
| **Remotion** | React framework that renders components as video frames to MP4 | Industry standard for code-based video, full React ecosystem |
| **FFmpeg** | Video encoding, joining scenes, adding audio | Universal, free, handles everything |
| **GitHub CLI (`gh`)** | Triggers renders, watches progress, downloads results | All from the terminal, no browser needed |
| **Claude Code** | Writes all the code, manages the pipeline | The brain that builds everything |

### Animation Libraries
| Library | Purpose | Rating |
|---------|---------|--------|
| **GSAP** | Timeline animation engine | 4.8/5 on Capterra |
| **Three.js** | 3D scenes, WebGL rendering | Industry standard for web 3D |
| **Mo.js** | Shape bursts, particle effects | Best for organic motion |
| **Anime.js** | SVG path drawing, morphing | Lightweight, precise |
| **Lottie** | Replaying exported animations | After Effects interop |

### Encoding Settings (Never Change Without Asking)
```
Codec: H.264 (libx264)
CRF: 18 (visually lossless)
Preset: veryfast
Pixel format: yuv420p
Resolution: 1920x1080
Frame rate: 30fps
Scene joining: -c copy (no re-encoding)
```

---

## 4. Project Structure

```
wall-decores-motion/
├── .github/
│   └── workflows/
│       └── render.yml          # GitHub Actions render pipeline
├── src/
│   ├── Root.tsx                # Registers compositions with Remotion
│   ├── BrandFilm.tsx           # Master timeline for all shots
│   ├── BrushStroke.tsx          # Bristle-simulated brush engine
│   ├── PostFX.tsx               # Grain, vignette, motion blur, aberration
│   ├── theme.ts                 # Palette, type scale, easing, grid
│   ├── BrushEngine.ts           # Canvas brush utilities
│   ├── ParticleSystem.ts        # Particle effect system
│   └── shots/
│       ├── Shot1.tsx            # Cold Open
│       ├── Shot2.tsx            # Every Surface
│       ├── Shot3.tsx            # Craft
│       ├── Shot4.tsx            # The Turn
│       ├── Shot5.tsx            # Scale
│       └── Shot6.tsx            # Brand Lock-up
├── public/                      # Static assets (images, fonts, brushes)
├── out/                         # Rendered output
├── CLAUDE.md                    # Workflow instructions for Claude Code
├── package.json
├── remotion.config.ts
└── tsconfig.json
```

---

## 5. CLAUDE.md — The Persistence File

This file lives in the project root. Claude Code reads it automatically every session. It contains:

- **Brand assets:** Palette (gold `#c8a870`, emerald `#1d9e75`, burnt orange `#d85a30`, cream `#e8dfd0`, rose `#d4537e`, sky blue `#378add`), brand name, contact info
- **Default settings:** 1920x1080, 30fps, cinematic easing `cubic-bezier(.22,1,.36,1)`
- **8-step render procedure:** Write code → commit → push → trigger → watch → download
- **Critical rule:** "Never render locally with `npx remotion render` directly on this machine — always use the GitHub Actions path above."
- **Render settings:** h264, CRF 18, concat demuxer with `-c copy`

**Why it matters:** Without this file, every new Claude Code session starts from zero. With it, Claude Code automatically follows the full pipeline every time you ask for a video.

---

## 6. The Render Pipeline — How It Works

### In Non-Technical Terms

Think of it like a mural commission. Your video has 6 scenes. Instead of one person (your PC) painting all 6 panels one after another, you send each panel to a different painter (GitHub machine) in a different studio — all working on the same day. When they finish, you join the panels edge to edge into one mural. Same quality, just faster.

### The Technical Flow

```
You type a prompt in Claude Code
        │
        ▼
Claude Code writes all .tsx files
        │
        ▼
git commit + git push
        │
        ▼
gh workflow run render.yml
        │
        ▼
GitHub Actions reads render.yml
        │
        ▼
Matrix strategy spins up 6 machines
        │
        ├── Machine 1 renders Shot1.mp4
        ├── Machine 2 renders Shot2.mp4
        ├── Machine 3 renders Shot3.mp4
        ├── Machine 4 renders Shot4.mp4
        ├── Machine 5 renders Shot5.mp4
        └── Machine 6 renders Shot6.mp4
                    │
                    ▼
        All 6 finish → concat job starts
                    │
                    ▼
        ffmpeg -f concat -c copy → final.mp4
        (glue, don't repaint — zero quality loss)
                    │
                    ▼
        Upload as GitHub artifact
                    │
                    ▼
gh run download --name final-video
        │
        ▼
final.mp4 lands on your PC
```

### The Three Terminal Commands

| Command | What It Does |
|---------|-------------|
| `gh workflow run render.yml` | Rings the bell — tells GitHub to start |
| `gh run watch` | Watch through the window — see progress live |
| `gh run download --name final-video` | Collect the delivery — download finished MP4 |

### Why Quality Is Preserved

The joining step uses `-c copy`, which means "glue, don't repaint." It stitches existing video data together without re-processing. If it re-encoded, you'd lose quality — like photocopying a photocopy. Because it only glues, the final film is pixel-for-pixel identical to what each machine produced.

---

## 7. The render.yml File

```yaml
name: Render Video
on: workflow_dispatch
jobs:
  render-scene:
    strategy:
      matrix:
        scene: [1, 2, 3, 4, 5, 6]
    runs-on: ubuntu-latest   # 4 CPU, 16GB RAM, free on public repos
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm install
      - run: npx remotion render src/index.ts Scene${{ matrix.scene }} out/scene${{ matrix.scene }}.mp4 --codec h264 --crf 18
      - uses: actions/upload-artifact@v4
        with:
          name: scene-${{ matrix.scene }}
          path: out/scene${{ matrix.scene }}.mp4

  concat:
    needs: render-scene
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { path: scenes }
      - run: |
          ls scenes/*/*.mp4 | sort | sed 's/^/file /' > list.txt
          ffmpeg -f concat -safe 0 -i list.txt -c copy out/final.mp4
      - uses: actions/upload-artifact@v4
        with:
          name: final-video
          path: out/final.mp4
```

### What Each Section Means

- **`on: workflow_dispatch`** — Only runs when you ring the bell (`gh workflow run`), not on every push
- **`matrix: scene: [1, 2, 3, 4, 5, 6]`** — "Run this same job once per scene, all at the same time"
- **`runs-on: ubuntu-latest`** — Each job gets a fresh Linux machine (4 CPU, 16 GB RAM)
- **`upload-artifact`** — Puts each finished scene in a locker for pickup
- **`needs: render-scene`** — The concat job waits until ALL scenes are done
- **`-c copy`** — Glue without re-encoding

---

## 8. The Nike-Style Brand Film

### Spec
- 20 seconds, 1920x1080, 30fps, 600 frames
- Remotion composition named "BrandFilm"

### Design System
- **Palette:** near-black `#0a0a0a`, cream `#e8dfd0`, gold `#c8a870`, emerald `#1d9e75`, burnt orange `#d85a30`, rose `#d4537e`
- **Display type:** 180px / weight 900 / 0.85 leading / -0.03em tracking
- **Heading:** 64px / weight 800
- **Body:** 24px / weight 500
- **Kicker:** 11px / weight 600 / 0.4em tracking / uppercase
- **Grid:** 12 columns, 120px side margins
- **Entrance easing:** `cubic-bezier(.16,1,.3,1)` — explosive start, long settle
- **Exit easing:** `cubic-bezier(.7,0,.84,0)` — slow start, snap out
- **Rule:** Never animate opacity alone. Always pair with transform.

### Brush Stroke System (BrushStroke.tsx)
The After Effects matte-reveal technique, rebuilt in code:
- 40–80 individual tapered sub-strokes on a shared bezier spine
- Each bristle has independent opacity (0.3–1.0), perpendicular Gaussian offset, directional noise
- Width taper: thick center, thin ends
- Dry-brush edges: randomly drop 8–15% of bristles mid-path (gaps like real paint)
- End caps: sharp flick with 15–25% velocity-based extension
- Paint-on animation: SVG clipPath sweeps along stroke direction (0.5–0.9s reveal)
- Canvas-weave texture: procedural noise multiply overlay at 6% opacity
- Props: `color, spine path, thickness, bristleCount, dryness, revealStart, revealDuration, angle`

### Shot List

| Shot | Time | Description |
|------|------|-------------|
| **1 — Cold Open** | 0.0–2.5s | Gold hairline draws outward, diagonal brush swipe at 23°, cream texture field, kicker "ANGAMALY · KERALA" |
| **2 — Every Surface** | 2.5–6.0s | "EVERY" / "SURFACE" revealed by brush matte, impasto texture, emerald diagonal expands to become the cut |
| **3 — Craft** | 6.0–10.0s | Three vertical brush strokes (gold/emerald/orange), rolling text: HAND-MIXED → HAND-LAID → HAND-FINISHED |
| **4 — The Turn** | 10.0–13.5s | Hard cut to cream, "NOT PRINTED." then "PAINTED.", hero burnt-orange stroke with maximum bristle detail |
| **5 — Scale** | 13.5–17.0s | Gold lines draw a canvas-stretcher frame, texture scales inside, IMPASTO / OIL ON CANVAS / BESPOKE SCALE |
| **6 — Brand Lock-up** | 17.0–20.0s | Gold stroke reveals "WALL DECORES" via matte technique, hairline, "ARTISAN · COLLECTIVES", contact line |

### Post-Processing (PostFX.tsx)
- **Film grain:** 5% opacity procedural noise, regenerated per frame
- **Vignette:** Radial gradient, transparent center to 45% black at corners
- **Motion blur:** 3 sub-frame samples averaged (for anything moving faster than 8px/frame)
- **Chromatic aberration:** 1px, only on the hard cuts at 10.0s and 11.1s

---

## 9. Instagram Reels Workflow (The Simpler Path)

For daily social content — showing paintings in different rooms, frames, and interiors. Much faster than the brand film pipeline.

### What These Videos Are
- 9:16 vertical (1080x1920) for Instagram Reels
- AI-generated luxury interior images
- Slideshow with transitions, text overlays, green checkmarks
- Background music
- 15–60 seconds

### The Workflow

| Step | What | Time |
|------|------|------|
| 1 | Generate 4–5 AI room images using the `interior-focal-prompt` skill | 5 min |
| 2 | Drop images in `public/` folder | 30 sec |
| 3 | Paste a reel prompt into Claude Code | 30 sec |
| 4 | Claude builds and renders locally with FFmpeg | 1–2 min |
| **Total** | | **~8 min per reel** |

### Why This Renders Locally
It's just images with transitions — no complex animation. FFmpeg stitches JPEGs together with crossfades and text overlays. Even a 4 GB i3 handles this in under 2 minutes.

### Sample Prompt for Claude Code
```
Make a 9:16 Instagram Reel (1080x1920, 30fps, 15 seconds) from images in public/:

1. room-bare.jpg — hold 2s, slow push-in zoom
2. Slide-left to room-painting1.jpg — green checkmark, hold 3s,
   subtitle "Oil on canvas — perfect for warm lighting"
3. Slide-left to room-painting2.jpg — green checkmark, hold 3s,
   subtitle "Impasto texture adds depth and dimension"
4. Slide-left to room-painting3.jpg — green checkmark, hold 3s,
   subtitle "Custom sizes for any wall"
5. End card: black, Wall Decores logo, @wall_decores_artisan, 3s

Add cinematic background music. Export as MP4.
```

---

## 10. Two Types of Videos

| | Brand Films | Instagram Reels |
|---|---|---|
| **Purpose** | Website, presentations, brand moments | Daily social content |
| **Style** | Nike-style motion graphics, typography, brush strokes | AI room images, slideshow transitions |
| **Complexity** | High (custom animation engine) | Low (images + FFmpeg) |
| **Renders on** | GitHub Actions (6 parallel machines) | Your PC locally |
| **First-time setup** | 15–20 min | None |
| **Each new video** | 5–8 min | 8 min (including image generation) |
| **Aspect ratio** | 16:9 (1920x1080) | 9:16 (1080x1920) |

---

## 11. Template System for Faster Future Videos

After the first brand film is built, create `src/templates/` with copies of each finished shot. Add this to CLAUDE.md:

```
When making a new video:
1. COPY the closest matching template shot — never write from scratch
2. Only change: text, colors, timing, and stroke directions
3. Reuse BrushStroke.tsx, PostFX.tsx, and theme.ts as-is
```

### Speed with Templates

| What | Time |
|------|------|
| Claude copies templates and changes text/color | 30–45 sec |
| Git push | 15 sec |
| GitHub spins up machines | 30 sec |
| Renders scenes | 1–2 min |
| Download | 15 sec |
| **Total** | **~3–4 min** |

### The 1-Shot Trick (Fastest)
For quick social clips, make 1 scene instead of 6:

```
Make a single-shot 8-second reel using the Shot4 template.
Change text to "LUXURY TEXTURES". Use emerald palette.
```

One machine, one scene, under 2.5 minutes total.

---

## 12. After Effects vs This Pipeline — Honest Comparison

### What This Pipeline Does Better
- **Zero cost** — everything is free
- **Reusability** — every video is code, reusable forever
- **Version control** — Git tracks every change, rollback anytime
- **Automation** — one prompt produces a finished video
- **Scale** — 6 machines rendering simultaneously, free

### What After Effects Still Does Better
- **Automatic motion blur** — AE calculates it natively; we simulate with 3 sub-frame samples
- **Plugin ecosystem** — thousands of effects, particle systems, 3D tools
- **Footage manipulation** — compositing real video, color grading, tracking
- **Visual iteration** — instant preview, drag and adjust; code requires re-render
- **Raster effects** — glow, blur, distortion are one click; we build each from scratch

### The Verdict
For typography-driven, shape-and-texture motion graphics (which is exactly what Wall Decores needs), this pipeline produces **90–95% of After Effects quality at zero cost**. The remaining 5–10% gap is in advanced effects and rapid visual iteration.

---

## 13. Setup Checklist

### Software Installed
- [x] Node.js v24.15.0
- [x] Git v2.55.0
- [x] GitHub CLI v2.103.3
- [x] Claude Code v2.1.318

### Project Created
- [x] Folder: `C:\Users\user\wall-decores-motion`
- [x] Git initialized
- [x] Public repo: `https://github.com/ANANDUSIMON/wall-decores-motion`
- [x] Remotion scaffolded (`package.json` present)
- [x] `node_modules` installed
- [x] `CLAUDE.md` created

### Pending
- [ ] Nike-style brand film files built (12 files)
- [ ] `.github/workflows/render.yml` created
- [ ] First render triggered and completed
- [ ] Template system set up after first successful render

---

## 14. Troubleshooting

### "gh: not recognized"
Close the terminal completely and open a fresh one. PATH updates don't apply to already-open windows.

### "workflow render.yml not found"
The `.github/workflows/render.yml` file doesn't exist in the repo yet, or wasn't pushed. Check:
```
dir .github\workflows
git status
```

### "no runs found"
No workflow has been triggered. Push code first, then run:
```
gh workflow run render.yml
```

### Render takes too long (over 10 minutes)
Check status:
```
gh run list --limit 5
gh run view
```
If stuck in "queued" for more than 20 minutes, cancel and retry:
```
gh run cancel
gh workflow run render.yml
```

### "node version" → MODULE_NOT_FOUND
This is a typo. Use `node -v` (with a hyphen), not `node version`.

### Claude Code disconnects mid-build
Resume with:
```
claude --resume <session-id>
```
If the session is lost, open Claude Code fresh and paste the prompt again.

---

## 15. Key Commands Reference

### Daily Use
```bash
cd C:\Users\user\wall-decores-motion    # Go to project
claude                                    # Open Claude Code
# Paste your video prompt                # Claude builds everything
```

### Checking Render Status
```bash
gh run list --limit 5                    # List recent runs
gh run view                              # Detailed status
gh run view --log-failed                 # See what went wrong
gh run watch                             # Live progress
```

### Getting the Video
```bash
gh run download --name final-video       # Download finished MP4
```

### Starting Over
```bash
gh run cancel                            # Stop current render
gh workflow run render.yml               # Re-trigger
```

---

## 16. Brand Assets Quick Reference

```
Brand Name: WALL DECORES
Tagline: Artisan · Collectives
Website: walldecores.com
Instagram: @wall_decores_artisan
Phone: 9037790012

Palette:
  Gold:         #c8a870
  Emerald:      #1d9e75
  Burnt Orange:  #d85a30
  Cream:        #e8dfd0
  Rose:         #d4537e
  Sky Blue:     #378add
  Near Black:   #0a0a0a

Default Easing: cubic-bezier(.22,1,.36,1)
Entrance Easing: cubic-bezier(.16,1,.3,1)
Exit Easing: cubic-bezier(.7,0,.84,0)

Resolution: 1920x1080 (brand films) / 1080x1920 (reels)
Frame Rate: 30fps
Codec: H.264, CRF 18
```

---

*This document is a complete reference for the Wall Decores motion graphics pipeline. Keep it alongside your project for future reference.*
