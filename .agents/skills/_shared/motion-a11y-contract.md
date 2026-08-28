# Satisium UI Motion, SSR and Accessibility Contract

Use this reference for any animation, pointer interaction, media effect or component review.

## Motion and lifecycle

Use `motion/react` or the repository's established GSAP pattern. Scope animations to a component ref, clean them up on unmount, and use `gsap.matchMedia()` or an equivalent mechanism for both `prefers-reduced-motion: no-preference` and `prefers-reduced-motion: reduce`. Give reduced-motion users a stable, legible end state; never leave content hidden or a control unusable.

When initial animation state would otherwise flash after hydration, render a safe SSR initial state and restore the final state through the client animation. Do not access `window`, `document`, WebGL APIs or random browser-only state during server rendering. Register browser-only plugins behind an environment guard.

## Semantics and interaction

Use native interactive elements whenever possible. Provide an accessible name for icon-only controls. Support keyboard navigation, Enter/Space activation where applicable and Escape dismissal for dismissible overlays. Keep focus visible and prevent pointer-only behavior from being the only route to complete an essential task. Meet a minimum 44×44 px touch target for interactive controls and maintain normal-text contrast of at least WCAG AA 4.5:1.

## Media and WebGL

Provide a stable fallback for async or WebGL rendering. Constrain canvas work to the visible area when possible, clean listeners and animation frames, and avoid unbounded per-pointer allocations. A decorative effect must not duplicate screen-reader content; an essential image must have meaningful alternative text.

## Review result format

Report each finding as `severity`, `evidence`, `impact`, and `smallest compliant fix`. Use `blocker` only when the component is inaccessible, fails to render safely, or corrupts the consumer integration. State `no finding observed` only after checking the relevant source path.
