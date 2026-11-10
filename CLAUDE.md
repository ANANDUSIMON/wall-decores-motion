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
- src/Root.tsx — composition registry
- src/Scene*.tsx — individual scenes
- src/BrushEngine.ts — brush stroke rendering
- src/ParticleSystem.ts — particle physics
- .github/workflows/render.yml — the parallel matrix render + concat pipeline
- out/ — downloaded finished videos land here
