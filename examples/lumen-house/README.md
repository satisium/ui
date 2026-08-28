# Lumen House Photography Studio

Lumen House is a five-route photography studio example built through the proposed Satisium UI Skills workflow. It includes the approved **Make room for the frame** site tour as a client-facing video section on Home.

## Run locally

Use Node.js 20.9 or newer and pnpm 10 or newer.

### Review from this repository ZIP

The recommended review path is the main repository command in `LOCAL_REVIEW.md`. It serves the already-built owner-hosted preview from `public/examples/lumen-house/` at:

```text
http://localhost:3000/docs/getting-started/lumen-house-example
http://localhost:3000/examples/lumen-house/
```

### Work on the source workspace

```bash
cd examples/lumen-house
pnpm install --frozen-lockfile
pnpm dev
```

On Windows, use the pinned pnpm command without administrator-level Node.js configuration:

```powershell
Set-Location examples\lumen-house
npx --yes pnpm@10.12.4 install --frozen-lockfile
npx --yes pnpm@10.12.4 check
npx --yes pnpm@10.12.4 dev
```

When run inside the Satisium UI repository, the workspace reads the owner-hosted video, poster and package from `../../public/examples/lumen-house/` and serves itself below `/examples/lumen-house/`. The self-contained download package includes the same MP4/poster inside `client/public/media/` and defaults to `/` when opened on its own. Run the project checks before handoff:

```bash
pnpm check
pnpm build
```

## Rebuild the example exactly

Do not use this README as a creative prompt. Read `client/src/content/LumenHousePlan/README.md` first, then work through the numbered files in its stated order. The folder is the canonical specification for the product, route structure, public copy, design tokens, registry-installed components, native interactions, site tour and QA checks.

`client/src/content/AGENT_BUILD_PLAN.md` remains only as a compatibility pointer to the folder kit.

## Site tour media

The runtime video and poster are referenced through the `siteTour` object in `client/src/content/site.ts`. The owner-hosted preview serves them from `public/examples/lumen-house/media/`; the portable download package contains exact source copies at the paths below so a coding agent can reproduce the studio without regenerating the film:

```text
client/public/media/lumen-house-site-tour-v2.mp4
client/public/media/lumen-house-site-tour-poster.jpg
```

The MP4 is H.264, 1920×1080, 30 fps, 1,350 frames, exactly 45 seconds and contains no audio stream. It starts muted and the public film surface exposes only Play/Pause. Its expected SHA-256 is `ada0b9d70a913d17102c67bf75c96c1af4d1b13adb07d38491a82fbb25219085`.

When hosting elsewhere, retain those files under the target platform’s static public directory, change only `siteTour.src` and `siteTour.poster`, then rerun the assertions in `05-interaction-qa.md`.

## Boundaries

The example uses registry-installed Satisium UI components; it does not copy component source from the Satisium website. The public studio pages must remain free of internal implementation language. Do not add fabricated customer reviews, ratings, testimonials or client claims.

This source package is a contributor/example artifact. It does not publish, deploy, commit, push or open a pull request by itself.
