---
name: satisium-component-discovery
description: Find, select, install, import, and compose existing Satisium UI animated components from its shadcn registry. Use when a task mentions Satisium UI, a component name, carousel, text reveal, image effect, mouse trail, registry URL, installation, import, demo, or choosing the right interaction.
license: MIT
---

# Satisium Component Discovery

Use this skill to consume existing Satisium UI components without copying implementation code from the documentation website. Prefer the registry install path and inspect local project artifacts before giving code.

## Decide the task

If the task asks to **find or use an existing component**, continue below. If it asks to create or modify component source, use `satisium-component-authoring`. If it asks to wire a registry entry, docs, code strings, or previews, use `satisium-registry-docs`.

## Discover before selecting

1. In a consumer project, inspect `components.json`. Confirm that shadcn is initialized and note aliases, Tailwind configuration and icon library.
2. In the Satisium repository, read `public/llms.txt`, the relevant component MDX file and `registry/meta.ts`. Use `registry.json` as the manifest authority.
3. Match the requested intent to the library taxonomy: `text-reveals` for typographic entrance/typewriter effects, `carousels` for spatial media navigation, `image-effects` for WebGL or interactive media, and `mouse-trails` for pointer-driven decorative interactions.
4. Read the exact component props before recommending it. Do not infer a prop, variant, runtime dependency, preview key, or render mode from its name.

Read [the repository contract](../_shared/repository-contract.md) whenever the task runs in the Satisium repository. For motion-sensitive or WebGL components, also read [the motion and accessibility contract](../_shared/motion-a11y-contract.md).

## Install and compose

Use the exact manifest URL for the selected item:

```bash
npx shadcn@latest add https://ui.satisium.com/r/<registry-item>.json
```

For a demo or variant, install its own registry item rather than manually recreating source files. After installation, inspect the copied source and import it from the project target configured by the registry, normally `@/components/satisium-ui/<item>`.

When the item uses GSAP, Three.js or React Three Fiber, let the registry install dependencies first. If a project needs a manual dependency repair, derive the exact package list from the selected `registry.json` item. For WebGL or asynchronous effects, supply a stable `fallback` where the component API supports it and reserve layout space to avoid shift.

## Deliver a consumer-ready result

State the selected item, the reason it fits, exact install command, import path verified from the target, minimal usage snippet based on actual props, and any dependency, fallback, reduced-motion or performance consideration. Mention one alternative only when a real alternative exists in the registry.

Do not modify the upstream registry, publish an artifact, or claim an installation succeeded without running the command in the target project.
