---
"satisium-ui": patch
---

Add portable Agent Skills bundle and Lumen House example

- Introduce five project-scoped AI agent skills under `.agents/skills/`: `satisium-component-authoring`, `satisium-component-discovery`, `satisium-contribution-validate`, `satisium-quality-review`, and `satisium-registry-docs`, each with a `SKILL.md` following the standard frontmatter contract. Shared contracts live in `.agents/skills/_shared/`.
- Add read-only Python freshness and structural audit scripts under `.agents/skills/satisium-contribution-validate/scripts/`.
- Add `.github/workflows/skills-freshness.yml`: a read-only CI workflow (`contents: read`) that runs `check_freshness.py` on every PR and supports `workflow_dispatch`.
- Add `scripts/install-skills.mjs`: a collision-safe Node.js utility for copying the skills bundle into a consumer agent config directory.
- Add `docs/agent-skills.md`: architecture reference for the Agent Skills system.
- Add Getting Started docs: `content/docs/getting-started/skills.mdx` and `content/docs/getting-started/lumen-house-example.mdx`. Wire both into `content/docs/getting-started/meta.json` navigation.
- Add `components/examples/lumen-house-preview.tsx` and register `LumenHouseExamplePreview` in `components/mdx-components.tsx` for use in the docs MDX page.
- Add Lumen House example: `examples/lumen-house/` (standalone Vite workspace with React Router, GSAP, and five Satisium UI component installs) and `public/examples/lumen-house/` (pre-built static output). Add six SPA rewrites in `next.config.mjs` and exclude the workspace from the root `tsconfig.json`.
- Add `.gitattributes` to suppress whitespace noise from Vite-generated bundle files.
