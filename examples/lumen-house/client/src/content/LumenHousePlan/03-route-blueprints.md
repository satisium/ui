# 03 — route blueprints

## Shared header and footer

Use `StudioShell` on each screen. Header is sticky, 76px high, white/translucent and has a border. Desktop has the exact route order **Showcase / Services / Journal / Contact**, 11px uppercase navigation with 0.1em tracking, and a small orange dot at the far edge. Mobile uses the existing Sheet and 56px route rows.

The shared footer is a dark rounded shell. Left: **Lumen House** and **Lose the noise.** Centre: mono **STUDIO**, exact location and email. Right: copyright, **View build plan** button, then one unboxed linked credit: the Satisium favicon followed by **Designed with love using satisium-ui-skills**. Do not add a card border, background, padding container, secondary label or arrow icon around this credit.

## Home — `/`

1. Create a white hero that is at least `min(790px, calc(100svh - 100px))`. Left label is orange-dot `PHOTOGRAPHY STUDIO`; right label is `EST. 2018`. Centre: `PORTRAIT · CAMPAIGN · EVENT`, heading **Lumen House** with only **Lumen** orange, then the editorial-revealed line **A considered frame for the work that matters.** Bottom-left black button: **Explore the showcase**. Bottom-right is the current London card. Place `ApertureOrbit` at the upper right.
2. Immediately after the hero, add `StudioFilm` from `06-site-tour.md`: white rounded section, left `A SHORT FILM` story copy and right 16:9 video in a neutral Satisium-aligned frame. It starts muted on load and exposes only one lower-right Play/Pause button; do not show native browser controls or settings.
3. Add muted selected-stories shell: `01 / SELECTED STORIES`, **Photography with a point of view.**, supporting copy, first three project tiles and a neutral button **View the showcase**.
4. Add white studio shell: `02 / THE STUDIO`, **A clear process leaves room for the unexpected.**, `SMALL CREW / INTENTIONAL SETS`, then three gray service cards.
5. Add muted journal shell: `03 / FROM THE JOURNAL`, **Behind the final image.**, supporting copy and three white journal cards.
6. Add white CTA shell: `NEW WORK STARTS WITH A CONVERSATION`, **Let’s make room for the first frame.** with only **first frame.** orange, and orange button **Start a project**.

## Showcase — `/showcase`

1. Opening white shell has upper label `LUMEN HOUSE / SELECTED COMMISSIONS`; left display heading **The work, held close.** with only **held close.** orange. Right copy is: “Portraits, campaigns and intimate events made with a calm eye, a small crew and enough time to let a real moment enter the frame.”
2. Beneath it, make a two-column editorial row. Left muted shell: `THE OPENING FRAME`, **A portrait can be quiet and still carry everything.**, then **Browse the selection** anchor button. Right: `GlassShowcaseFrame`, visually dominated by project 01.
3. Immediately follow with `ShowcaseReel`. This is the oversized, deliberate media sequence; do not reduce its stage or place it on Home.
4. Follow it with a white manifesto shell, label `A WAY OF LOOKING`, and the configured Manifesto Text Reveal: **Every image begins by making enough room for the person, the place and the unplanned thing that makes the work theirs.**
5. Finish with a muted collection shell: `THE FULL SELECTION`, **Find the right story.**, filters, project card grid, then orange **Start a conversation** button.

## Services — `/services`

1. White hero with orange label `SERVICES / STUDIO PRACTICE`, editorial-revealed **The work around the work matters.**, then “Every brief gets a clear process. The production can be quiet; the intention should never be vague.” Place `ApertureOrbit` at upper right.
2. Commission area has label `01 / COMMISSION`, a dark camera image at left, three substantial white service rows at right. Each row follows its exact data from `02-content-data.md`.
3. White process shell has label `02 / PROCESS`, four gray process cards and a quiet sentence at right.
4. Final white CTA says **Have a brief in mind?** with **brief** orange; use orange button **Send the first note →**.

## Journal — `/journal`

Create a white outer shell with gray hero: `FIELD NOTES`, **Notes from the room.**, and “Small observations on light, pacing and the decisions that sit behind the final image.” Under it, use a deliberately structured three-note composition: first entry as a broad text/image split, then entries two and three as vertically stacked split cards. Each has its exact label, heading, copy, image and **Read note →** action.

## Contact — `/contact`

Use a white outer shell with a two-column gray surface. Left: `CONTACT / FIRST FRAME`, **Make a little room for the work.**, “Tell us what is forming. A half-idea is a perfectly good place to begin.”, two camera images, `STUDIO NOTES / 06.24`, email and **Amsterdam · London · Available elsewhere**. Right: white form card with exact field labels and actions in `05-interaction-qa.md`.
