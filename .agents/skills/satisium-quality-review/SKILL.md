---
name: satisium-quality-review
description: Review Satisium UI components and demos for SSR safety, hydration, FOUC, GSAP or Motion cleanup, reduced-motion behavior, semantic HTML, keyboard and focus access, contrast, touch targets, WebGL fallback, and interaction performance. Use when auditing or repairing visual quality, accessibility, animation, hydration, performance, or browser-only behavior.
license: MIT
---

# Satisium Quality Review

Use this skill to examine a concrete component, demo, preview or diff. It is a review workflow, not an invitation to restyle unrelated code.

## Scope the review

Identify the changed component paths, demo paths and documented public props. Read the implementation first, then inspect the specific interaction or render path in a preview when available. Do not extrapolate a finding from a component name or marketing description.

Read [the repository contract](../_shared/repository-contract.md) and [the motion and accessibility contract](../_shared/motion-a11y-contract.md).

## Review in risk order

1. Check SSR and hydration. Browser-only APIs, plugin registration, random initial state and DOM reads must not execute during server rendering.
2. Check lifecycle and motion. Timelines, listeners, media queries, observers and animation frames must be scoped and cleaned up. Standard and reduced-motion branches must produce legible, usable final content.
3. Check semantics and input. Interactive controls need names, native semantics when applicable, keyboard operation, visible focus and Escape behavior for dismissible overlays. Pointer effects cannot be the sole path for essential content.
4. Check visual and responsive safety. Avoid FOUC, unreadable text, clipped focus indicators, hidden overflow that conceals essential content, and insufficient touch targets.
5. Check performance and media. WebGL or canvas needs a fallback; pointer handling should not allocate unbounded state; expensive work should stop on unmount or invisibility when the component architecture supports it.

## Report and repair

Use this result shape for each finding:

- **Severity:** `blocker`, `high`, `medium`, `low`, or `none`.
- **Evidence:** File path plus exact behavior or code evidence.
- **User impact:** What fails and for whom.
- **Smallest compliant fix:** A focused correction consistent with existing patterns.

When implementing a verified correction, change only the relevant source and then invoke `satisium-registry-docs` if public API, docs, demos or generated artifacts changed. Do not mark a component accessible merely because it renders; make an evidence-based statement limited to the checks performed.
