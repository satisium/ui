# 00 — product brief and public language

## Product

Build **Lumen House**, a professional photography studio for portraits, brand campaigns and intimate events. The site should feel calm, considered and commercially credible. It is a studio website with a strong visual system; it is not a component gallery, a developer demo, a concept board or a generic agency landing page.

The positioning line is: **“A considered frame for the work that matters.”** The supporting studio voice is direct and quiet: _lose the noise; make room; stay with the image; find the right story._ Keep sentences short and observational. Avoid superlatives, vague luxury language, marketing claims, technical labels and filler.

## Public information architecture

| Navigation label | Canonical route | Purpose                                                |
| ---------------- | --------------- | ------------------------------------------------------ |
| Showcase         | `/showcase`     | A paced viewing experience for selected commissions.   |
| Services         | `/services`     | What the studio makes and how a commission progresses. |
| Journal          | `/journal`      | Short notes from recent work and the studio process.   |
| Contact          | `/contact`      | An approachable first-project inquiry.                 |

Home is `/`. The old `/work` route must render the same screen as `/showcase` for compatibility only. Never show **Work** in the header, Sheet, Home CTA, page heading, footer or metadata.

## Hard public-language exclusions

Do not put any of these terms on public routes: **component**, **registry**, **installed**, **fallback**, **enhancement**, **WebGL**, **agent**, **implementation**, **motion-safe**, **static reading path**, **effect note**, **demo**, or a library component name. The build-plan modal is exempt because visitors open it deliberately to inspect the implementation plan.

## Source structure

Use a shared `StudioShell` around every route. It owns the sticky header, mobile Sheet, footer, visual identity and both Build Plan triggers. Keep content as data in `client/src/content/site.ts`. Keep consumer wrappers in `client/src/components/studio/`; keep unmodified installed Satisium registry items under `components/satisium-ui/`.
