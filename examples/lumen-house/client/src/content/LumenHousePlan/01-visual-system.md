# 01 — visual system

## Design grammar

Follow Satisium UI’s neutral structural grammar. The experience is composed from large white and gray rounded shells rather than a separate studio theme. Photography supplies color and personality. Orange is a sharply controlled signal, never a whole campaign background.

## Locked tokens

- `--radius`: `1.4rem`. Use this for major shells only, and `1rem` or `1.1rem` for media interiors.
- `--background`: `oklch(1 0 0)`. Use for page cards and the light canvas.
- `--foreground`: `oklch(0.14 0 0)`. Use for primary type and the dark footer only.
- `--primary`: `oklch(0.6404 0.2153 35.9003)`. Use for an orange active state, small dot, button or selected phrase.
- `--muted`: `oklch(0.96 0 0)`. Use for the page surround and structural gray shells.
- `--muted-foreground`: `oklch(0.55 0 0)`. Use for supporting copy.
- `--border`: `oklch(0.92 0 0)`. Use for fine separators.

Use **Plus Jakarta Sans** (400/500/600/700/800) for every display and interface line. Use **IBM Plex Mono** (400/500) for micro labels, IDs, dates, locations and metadata. Headings are black, bold, tightly tracked (`-0.055em` to `-0.075em`) and can use `0.84–0.98` line-height. Keep normal support copy at 14–16px with a 1.5–1.75 line-height. Do not use Inter. Do not display Caveat.

## Spatial system

The outer page shell is `bg-muted`, `overflow-x-clip` and has 12px/20px responsive gutters. Every route uses three or five units of vertical separation between rounded surfaces. Inside a major shell, use 20px mobile, 32px tablet and 48px desktop horizontal padding. Limit editorial content to `max-w-[1440px]`; manifesto copy limits to `max-w-[1120px]`.

Do not use generic centered hero blocks as a default. Home’s hero is intentionally centered only because its wordmark is the primary identity. Other sections should use asymmetrical paired columns, left-aligned display type, media balancing copy, and visible white/gray surface contrast.

## Logo and atmosphere

`LumenMark` is a 48×48 inline SVG: a black rounded-square (`rx=14`) with three white rounded status bars (`13×5`, `22×5`, `9×5`) and two orange rounded status tokens (`7×7`, `9×7`). It is an abstract utility symbol, not a camera icon. In the header, render it at 44px beside a Plus Jakarta Sans wordmark with **LUMEN HOUSE** (bold) and **PHOTOGRAPHY STUDIO** (8px mono). Add the custom favicon SVG to `client/public/favicon.svg` and reference it in `client/index.html`.

`ApertureOrbit` is decorative only. Use it on the Home and Services hero as `aria-hidden` and `pointer-events-none`, positioned partly outside the upper-right shell. It has three pale rounded status tracks (`372×62`, `286×122`, `132×44`), a pale central pill and three small orange rounded tokens. It cannot overlap actionable copy, resemble a lens, aperture, target, camera viewfinder or crop mark. It must stop movement under `prefers-reduced-motion: reduce`.

The footer is the only dark surface. Showcase media must instead sit in white or muted neutral shells with a fine border and padded interior. No large black marketing slab, black gallery stage or full-orange slab is allowed.
