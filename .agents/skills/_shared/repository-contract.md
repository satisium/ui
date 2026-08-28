# Satisium UI Repository Contract

Read this reference before changing component, registry, documentation, LLM-context or validation artifacts. Treat the checked-out repository as authoritative when it differs from an example or prose guide.

## Source of truth

- **Supported docs categories:** `lib/utils.ts`. Use only `text-reveals`, `image-effects`, `carousels`, or `mouse-trails`.
- **MDX frontmatter:** `source.config.ts`. Use the configured schema, including `component`, optional `badge`, `category`, `links`, `registryKeys` and `media`.
- **Component source:** `registry/ui/<slug>.tsx`. Export the public typed React component. Do not include preview-owned container padding.
- **Demo implementations:** `registry/demos/components/<slug>/`. A demo imports the local registry component and is represented as a registry item when distributable.
- **Copy Code source:** `registry/strings/<slug>.ts`. Keep raw code strings synchronized with their corresponding source/demo files.
- **Consumer manifest:** `registry.json`. Source items target `components/satisium-ui/`; demo items use a real `registryDependencies` URL and correct dependencies.
- **Docs preview runtime:** `registry/index.ts`. Map every demo key to the correct import, preview URL, render mode and code-string loader.
- **Generated preview metadata:** `registry/meta.ts`. Do not edit directly. Run `pnpm build:registry:meta` after editing `registry/index.ts`.
- **Human docs:** `content/docs/components/<slug>.mdx`. Use the exact current installation URL and document real props/defaults.
- **AI context:** `public/llms/components/<slug>.md`. Mirror the user-relevant installation and usage guidance. Generated aggregations are built by `pnpm llm`.

## Package and CI contract

Use the root `package.json` scripts rather than inventing commands. The declared contributor checks are `pnpm registry:public`, `pnpm build:registry:meta`, `pnpm llm`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`. The CI workflow currently also references `scripts/validate-changesets.mjs`; if that script is absent in the checkout, report the discrepancy instead of bypassing it.

## Invariants

Keep source code, code strings, manifest entries, preview runtime, MDX docs and LLM context consistent. Do not update generated artifacts by hand when a documented generator owns them. Do not introduce a new runtime dependency without declaring it in the relevant registry item. Preserve the existing shadcn target convention and public `https://ui.satisium.com/r/<item>.json` install URL.

## Freshness contract

Run `python .agents/skills/satisium-contribution-validate/scripts/check_freshness.py --repo .` before claiming a component pipeline is synchronized. The checker is read-only: it verifies every source component against its code string, base manifest item, component MDX, LLM context and generated public registry item; it also verifies each documented preview key against `registry.json`, `registry/index.ts`, `registry/meta.ts` and public registry output.

Use `--changed-files <newline-delimited-paths>` when reviewing a diff. A `REVIEW` output for `lib/utils.ts`, `source.config.ts`, `scripts/build-llms.mjs`, `scripts/build-registry-meta.mjs` or this repository contract means the taxonomy or pipeline may have evolved; inspect and intentionally update the skills if their workflow guidance is no longer accurate. A new component that obeys the existing contract does not by itself require editing a `SKILL.md`.
