# 07 — download bundle

## Purpose

The downloadable Lumen House package must recreate the current source project **and** retain the approved site-tour media. A coding agent receives the folder plan, all implementation files and local media copies together; it does not need to infer or regenerate the film. A plan-only download is not sufficient: without the approved MP4 and poster, the result cannot match the source studio exactly.

The public **Download package** action in the Build Plan dialog serves the complete portable archive. It includes the entire source project, `LumenHousePlan/`, `client/public/media/lumen-house-site-tour-v2.mp4`, and `client/public/media/lumen-house-site-tour-poster.jpg` together.

For this release, the runtime archive path is `/examples/lumen-house/downloads/lumen-house-studio-example-2.4.0.zip`.

## Required ZIP root

Use one root folder named `lumen-house-studio-example-2.4.0/`.

```text
lumen-house-studio-example-2.4.0/
├── client/
│   ├── src/
│       ├── components/
│       ├── content/
│       │   └── LumenHousePlan/
│       └── pages/
│   └── public/
│       └── media/
│           ├── lumen-house-site-tour-v2.mp4
│           └── lumen-house-site-tour-poster.jpg
├── components/
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
└── README.md
```

Exclude `node_modules/`, `dist/`, `.git/`, `.manus-logs/` and generated caches. The source project references public owner-hosted paths at runtime; `client/public/media/` is included so a coding agent can reproduce the film and poster without regenerating them.

## Exact media copies

### `client/public/media/lumen-house-site-tour-v2.mp4`

This is the approved `LumenHouseSiteTour` V2 export: H.264, `1920×1080`, `30 fps`, `1350` frames, `45.000` seconds and no audio stream. Runtime playback begins muted and provides only a Play/Pause control. Its SHA-256 is `ada0b9d70a913d17102c67bf75c96c1af4d1b13adb07d38491a82fbb25219085`.

### `client/public/media/lumen-house-site-tour-poster.jpg`

This is the `1920×1080` JPEG poster exported from `00:05` of the approved final MP4. Its SHA-256 is `30c9f5a6deec8ee75ff39d669ce3aff1c166f4efc604d524a3d7538edc391a89`.

## Re-upload contract

If a new host requires fresh static asset URLs, retain these two files under its static public directory. Update only the `src` and `poster` fields of `siteTour` in `client/src/content/site.ts`, then run the full `05-interaction-qa.md` suite. Preserve the media properties, public placement, muted autoplay and single Play/Pause behavior in `06-site-tour.md`.

## ZIP verification

Before delivering the archive, list it and verify all ten `LumenHousePlan` files appear: `README.md`, `00-brief.md` through `07-download-bundle.md`, and `manifest.json`. Verify both files under `client/public/media/`, open the MP4 with metadata inspection, calculate both media SHA-256 values against the values above, and download the archive once from the public runtime path.
