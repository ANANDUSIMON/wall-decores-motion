# Wall Decores Motion Graphics — Project Workflow

This project generates cinematic brand motion graphics for Wall Decores Artisan Collectives using Remotion, rendered remotely via GitHub Actions (not locally — this machine has 4GB RAM / i3, too weak to render).

## Brand assets (use these every time, unless told otherwise)
- Colors: gold #c8a870, emerald #1d9e75, burnt orange #d85a30, cream #e8dfd0, rose #d4537e, sky blue #378add
- Brand name: WALL DECORES / Artisan · Collectives
- Contact: walldecores.com · @wall_decores_artisan · 9037790012
- Default easing: cubic-bezier(.22,1,.36,1)
- Default format: 1920x1080, 30fps, unless told otherwise (vertical 1080x1920 for Reels when asked)

## Whenever asked to create or edit a video:
1. Write or edit the Remotion scene components in src/ (Scene1.tsx, Scene2.tsx, etc.), plus any shared engines (BrushEngine.ts, ParticleSystem.ts) needed for the requested effect.
2. Wire new scenes into Root.tsx.
3. Update .github/workflows/render.yml so its scene matrix list matches the current set of scene components exactly (add/remove entries as scenes are added/removed).
4. Commit all changes and push to origin main.
5. Run `gh workflow run render.yml` to trigger the render.
6. Run `gh run watch` to stream progress until it completes.
7. Run `gh run download --name final-video` to pull the finished MP4 into the out/ folder.
8. Tell me the video is ready and where the file landed. Never render locally with `npx remotion render` directly on this machine — always use the GitHub Actions path above.

## Render settings (never change without being asked)
- Codec: h264, --crf 18
- FFmpeg concat: concat demuxer with -c copy (no re-encoding during concat)

## File structure
- src/Root.tsx — composition registry (BrandFilm + standalone Shot1–6 compositions)
- src/BrandFilm.tsx — master `<Series>` timeline sequencing all shots
- src/shots/Shot*.tsx — individual shots
- src/theme.ts — palette, easing, per-shot frame counts
- src/BrushStroke.tsx — bristle-simulated brush stroke (SVG clipPath reveal)
- src/PostFX.tsx — film grain, vignette, chromatic fringe wrapper
- src/components/onda/ — installed Onda components (one folder per component)
- src/components/remocn/ — installed Remocn components
- src/lib/onda/ — Onda's shared helpers (easing, choreography, motion, canvas placement)
- .github/workflows/render.yml — the parallel matrix render + concat pipeline
- out/ — downloaded finished videos land here

## Installed component libraries & skills (use these instead of hand-rolling effects)

Three libraries are installed for this Remotion project. Reach for a ready component before writing a new effect from scratch.

### Onda (`ondajs` CLI) — 88 components, source-owned
Installed into `src/components/onda/<slug>/`, shared helpers in `src/lib/onda/`. Peer deps `zod` + `react` are already in package.json.
- Add more with: `npx ondajs add <slug>` (e.g. `npx ondajs add blur-reveal title-card stat-card`)
- Browse the full catalog: `npx ondajs list` (or `--category <name>` / `--json`)
- Categories: **entrances** (15 — blur-reveal, slide-in, typewriter, matrix-decode, word-stagger…), **transitions** (18 — cross-fade, wipe, iris, flip, morph, zoom, chromatic-aberration, grid-pixelate, glass-wipe, type-mask…), **graphics** (12 — draw-on, underline, highlight, confetti, rgb-glitch-text, node-graph…), **atmosphere** (5 — grain-overlay, mesh-gradient, dynamic-grid…), **cinematic** (5 — ken-burns, camera-shake, spotlight, parallax, vignette), **data** (7 — count-up, bar-chart, line-chart, pie-reveal…), **scenes** (7 — title-card, stat-card, lower-third, logo-sting…), **media** (4), **interface** (15 — code-block, terminal, cursor, bento-grid, pricing-card…).
- Known gap: the `fade-in` component's registry manifest is missing a declared `lib-canvas` dependency (upstream bug). If a future `ondajs add` errors with a missing `lib/onda/canvas` or `canvas-schemas` module, fetch `https://remotion.onda.video/r/lib-canvas.json` directly and write its two files into `src/lib/onda/`.

### Remocn (shadcn-CLI registry)
Installed into `src/components/remocn/` via the shadcn CLI against a custom registry. Requires the `components.json` + `tsconfig.json` `@/*` → `./src/*` path alias already set up in this repo (shadcn's framework auto-detect doesn't recognize a bare Remotion project, so don't re-run `shadcn init` — the existing `components.json` is hand-written and works).
- Add more with: `npx shadcn@latest add @remocn/<component-name>` (e.g. `npx shadcn@latest add @remocn/soft-blur-in`)
- Categories: animations, transitions, backgrounds, scenes — browse at remocn.dev

### shader-dev skill
Not a component library — a GLSL technique reference (ray marching, SDF modeling, fluid simulation, particle systems, procedural generation, lighting, glow/fog/water/soft-shadow effects, post-processing). Load it when a shot needs a custom shader effect that no Onda/Remocn component covers; it guides writing the shader, it doesn't ship one pre-built.

### `remotion` skill (digitalsamba/claude-code-video-toolkit)
Toolkit-specific Remotion patterns — custom transitions, shared components, project conventions. General Remotion framework knowledge still comes from the separate `remotion-official`/`remotion-best-practices` skills.

### Not part of this project's pipeline
`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`, `reverse-any-video`, `style-sampling`, `figma`, `remotion-to-hyperframes`, `slideshow` were installed alongside the above but belong to **HyperFrames**, a separate HTML-rendered-to-video toolchain — not the Remotion + GitHub Actions pipeline this project uses. Don't reach for them here unless explicitly asked to port this project to HyperFrames.
