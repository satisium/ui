# 06 — site tour film

## Asset contract

The Home page contains one real Lumen House film. Treat it as a first-class project asset, not a decorative background and not a technical demo.

- **Title:** `Make room for the frame.`
- **Eyebrow:** `A SHORT FILM`
- **Supporting copy:** `A quiet passage through the people, pauses and small decisions that give a photograph room to stay with you.`
- **Caption:** `Lumen House / a moving selection`
- **Duration label:** `45 seconds / a moving selection`
- **Visible duration:** `00:45`
- **MP4 source:** `/examples/lumen-house/media/lumen-house-site-tour-v2.mp4`
- **Poster:** `/examples/lumen-house/media/lumen-house-site-tour-poster.jpg`

The supplied asset is a no-audio H.264 video: `1920×1080`, `30 fps`, `1350` frames, and exactly `45.000` seconds. It is derived from the approved Lumen House Remotion V2 composition, `LumenHouseSiteTour`. Preserve these properties when replacing or re-uploading the asset.

## Public placement and presentation

Insert `StudioFilm` on Home immediately after the opening hero and before `01 / SELECTED STORIES`. Use a white rounded shell with a left-aligned story introduction and a right-aligned 16:9 media figure. The figure has a muted outer surface, fine border, 6px inset padding, 1.4rem outer radius and 1.1rem inner radius. Start the film muted on load, preserve its first frame/poster before it is ready, and place one compact Play/Pause control at the lower right. Do not use a black full-width gallery slab, browser chrome, looping or a decorative background video.

The public viewer sees only studio-facing copy. No visible label may say registry, implementation, Remotion, asset, player, fallback, browser compatibility, WebGL, agent or demo.

## Playback and accessibility

The audited Satisium registry has no dedicated video-player or player-frame item. Its five video-capable items—Glass Slices, Liquid Marble, Proximity Grid, Velocity Grid and Velocity Strips—are cursor-driven WebGL media effects whose source hard-codes `muted: true`, `loop: true` and `start: true`; do not use them as a player or copy their source. Preserve the current neutral frame, which follows the owner site's surface grammar without pretending it is a registry player.

Use a native `<video>` element with `autoPlay`, `muted`, `playsInline`, `preload="auto"`, `poster` and one `video/mp4` source. It must not use `controls` or `loop`. Add one visible native `<button>` that toggles only `video.play()` and `video.pause()`, has a dynamic accessible name of **Play film** or **Pause film**, a 44px minimum target, visible focus and no menu/settings affordance. Because the film has no audio or spoken dialogue, no transcript/captions track is required. Its associated figure caption provides a concise contextual description and duration for assistive technology.

The one Play/Pause button is the only playback interaction. It remains keyboard accessible, has no settings menu and stays available at every viewport. If autoplay is denied, it remains in the **Play** state without surfacing an internal error. If the browser cannot play the file, retain concise neutral fallback text inside the `<video>` element. Do not add seeking, volume, captions, playback-rate or fullscreen controls.

## Source structure

Define the exact `siteTour` object in `client/src/content/site.ts`; it owns `eyebrow`, `title`, `copy`, `caption`, `duration`, `durationLabel`, `src` and `poster`. `StudioFilm` lives in `client/src/components/studio/StudioFilm.tsx`, imports that object, and is consumed by `client/src/pages/Home.tsx`. Store the MP4 and poster at `client/public/media/`, which Vite emits under `/examples/lumen-house/media/` for the owner-hosted preview.

## QA assertions

Request both `src` and `poster` directly and require HTTP `200`. On desktop and mobile, confirm muted autoplay begins, the one Play/Pause control is visible and named correctly, the video keeps a 16:9 ratio, no horizontal overflow occurs and no audio track is present. Pause/resume and reach the end; video must not jump, error, loop, expose native controls or show a settings surface. Use `07-download-bundle.md` to include the local MP4/poster copies in the portable ZIP.
