---
name: satisium-registry-docs
description: Wire and synchronize Satisium UI shadcn registry items, demos, code strings, preview runtime entries, MDX documentation, and AI context files. Use when adding or updating a Satisium component variant, registry manifest, preview, registry key, install command, component documentation, props table, Copy Code, or Copy for AI content.
license: MIT
---

# Satisium Registry and Documentation

Use this skill after source work or for a documentation/registry-only correction. It enforces the repository's multi-artifact pipeline without guessing generated file contents.

## Choose the update path

For a new component or public API change, update every affected representation: source, demo(s), code strings, manifest, runtime preview entry, human docs and AI context. For a demo-only or documentation-only change, identify the smallest subset that has become stale and confirm no install command or runtime key needs revision.

Read [the repository contract](../_shared/repository-contract.md) before editing. If the component has animated, pointer, WebGL or accessible interactions, read [the motion and accessibility contract](../_shared/motion-a11y-contract.md) before finalizing docs or demos.

## Synchronize the pipeline

1. Create or update `registry/demos/components/<slug>/` only for a real reusable demo variant. Import the local registry component rather than duplicating its logic.
2. Mirror the exact source and demo files in `registry/strings/<slug>.ts` so Copy Code is current.
3. Update `registry.json`. A source item must declare correct runtime dependencies, source path and `components/satisium-ui/` target. A demo item must point to an existing file and use the exact base registry URL in `registryDependencies`.
4. Update `registry/index.ts` for each docs-preview registry key. Verify dynamic import name, `direct` versus `iframe` render mode, preview URL, install command and code-string loader against actual files.
5. Create or update `content/docs/components/<slug>.mdx`. Use the category names from `lib/utils.ts`, schema from `source.config.ts`, actual install commands, real dependencies and a props table generated from the public interface—not invented defaults.
6. Create or update `public/llms/components/<slug>.md` with concise, source-grounded installation, usage, props, dependencies and accessibility/motion guidance.
7. Regenerate instead of manually editing derived outputs: run `pnpm registry:public`, `pnpm build:registry:meta`, and `pnpm llm` when their inputs changed.

## Verify the handoff

Confirm every MDX `registryKeys` entry has a matching runtime key; every manifest path exists; demo manifest items depend on a real base item; and generated output reflects the changed items. Then use `satisium-contribution-validate` for structural and repository checks.

Report the exact paths touched, generated commands run, any generated files changed, and open blockers. Do not publish, push, or write release metadata as part of this skill.
