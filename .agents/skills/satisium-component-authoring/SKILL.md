---
name: satisium-component-authoring
description: Implement or modify Satisium UI animated React component source with the repository's TypeScript, SSR, GSAP/Motion, WebGL, accessibility, reduced-motion, and preview-container conventions. Use when adding or editing a Satisium UI component, public props, animation behavior, interaction, carousel, text reveal, image effect, or mouse trail.
license: MIT
---

# Satisium Component Authoring

Use this skill only for source-level component work. Keep registry wiring, docs, code strings and preview registration as a follow-on task handled by `satisium-registry-docs`.

## Classify the change

First determine whether this is a new component, a behavior change, a public-prop change, a bug fix, or a demo-only concern. Read a component in the same taxonomy and technology family before editing. Preserve the public contract unless the request explicitly authorizes a breaking change.

Read [the repository contract](../_shared/repository-contract.md) and [the motion and accessibility contract](../_shared/motion-a11y-contract.md) before implementation.

## Implement the source safely

1. Put distributable source in `registry/ui/<slug>.tsx`; use a kebab-case slug consistent with the component title.
2. Add `"use client"` only when hooks, events, browser APIs, GSAP, canvas, WebGL or client animation require it. Guard browser-only registration and access so server rendering remains safe.
3. Expose a typed prop interface. If the component wraps a DOM element, use a typed `React.forwardRef` and set `displayName`.
4. Compose `className` with `cn` and spread valid element attributes intentionally. Do not add hardcoded outer preview padding; the previewer owns surrounding space.
5. For GSAP, scope work to a ref, clean it up, and provide both standard and reduced-motion branches. For Motion, use an equivalent reduced-motion-safe behavior. Avoid a hidden SSR state that never becomes legible if JavaScript is unavailable.
6. For WebGL or async rendering, expose or integrate a stable fallback, release listeners/frame loops, and avoid work that scales without bound on pointer movement.
7. Use semantic HTML and accessible labels. Make controls keyboard-operable, preserve focus visibility, and avoid treating a visual effect as the only way to understand content.

## Hand off correctly

Before calling the work complete, compare the source with its real public docs and consumer target. If the component is new or its API, dependency, demo or preview changed, invoke `satisium-registry-docs` next. If the task is a fix, request `satisium-quality-review` for the relevant risk class.

Report the changed source path, public API changes, dependencies actually used, SSR/reduced-motion behavior, keyboard/screen-reader treatment, and downstream files still requiring update. Do not edit generated output manually or claim registry installability before registry work is complete.
