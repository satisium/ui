# LumenHousePlan — exact build kit

Use this directory to recreate the **Lumen House** example exactly. This is a folder-based build specification, not a loose creative prompt. The output is a real client-facing five-route photography studio with an embedded, user-controlled 45-second site tour. Technical explanations, package names and fallback details belong in this plan or internal QA only; they must never appear in the visible site except inside the hidden-on-load **View build plan** dialog.

Read each file in sequence, then implement them without substituting a different aesthetic, copy system, image set, route name or component. The canonical public path is `/showcase`; `/work` remains a legacy alias but is never visible in navigation.

| Order | File                                                   | Locks                                                                                    |
| ----- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| 1     | [`00-brief.md`](./00-brief.md)                         | Product purpose, information architecture and non-negotiable public language.            |
| 2     | [`01-visual-system.md`](./01-visual-system.md)         | Design tokens, type, geometry, logo and decorative-motion rules.                         |
| 3     | [`02-content-data.md`](./02-content-data.md)           | Exact projects, images, services, process and journal content.                           |
| 4     | [`03-route-blueprints.md`](./03-route-blueprints.md)   | Exact section order, visible copy, surfaces and CTAs for every route.                    |
| 5     | [`04-registry-contract.md`](./04-registry-contract.md) | Exact Skills/registry installs, imports, props, component locations and isolation rules. |
| 6     | [`05-interaction-qa.md`](./05-interaction-qa.md)       | Keyboard, modal, progressive-enhancement and validation assertions.                      |
| 7     | [`06-site-tour.md`](./06-site-tour.md)                 | Exact film asset, public placement, playback and provenance contract.                    |
| 8     | [`07-download-bundle.md`](./07-download-bundle.md)     | Exact ZIP contents, asset paths and reconstruction handoff.                              |
| 9     | [`manifest.json`](./manifest.json)                     | Machine-readable build identifiers for an agent to check before handoff.                 |

## Required execution sequence

1. Install all selected Skills and registry components exactly as stated in `04-registry-contract.md`. Inspect installed exports; do not copy or edit registry component source.
2. Set global tokens and shared shell before creating routes. Use the files in this order: data model, brand shell, Home and its site tour, Showcase, Services, Journal, Contact.
3. Implement every visible string, named image, aspect ratio, component prop, route and interaction from the numbered files. Use no invented testimonials, ratings, case studies or fake client claims.
4. Test against every assertion in `05-interaction-qa.md`. If a test exposes a defect, repair it before declaring parity.
5. Assemble the portable ZIP described in `07-download-bundle.md`; it must contain the plan folder, source project and local video/poster copies.

## Parity rule

> The correct result is not “a similar photography studio.” It is **Lumen House** with the exact route hierarchy, content, image sources, visual grammar, installed component usage and interactions documented here.

If an implementation environment cannot provide an optional visual enhancement, preserve its reserved composition and semantic static media; never replace visible studio content with a technical error, loader, or implementation caption.
