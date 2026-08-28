# 04 — Skills and registry contract

## Install commands

Run these exact commands from the project root. Use the installed code as-is; never rewrite registry source or paste source from a Satisium documentation page.

```bash
npx skills add satisium/ui --all --yes
npx shadcn@latest add https://ui.satisium.com/r/editorial-reveal.json --yes
npx shadcn@latest add https://ui.satisium.com/r/blur-reveal.json --yes
npx shadcn@latest add https://ui.satisium.com/r/ascent-carousel.json --yes
npx shadcn@latest add https://ui.satisium.com/r/glass-slices.json --yes
npx shadcn@latest add https://ui.satisium.com/r/manifesto-text-reveal.json --yes
```

The project has five installed Skills: component discovery, component authoring, registry/docs, quality review and contribution validation. Use them in that order of responsibility. Registry consumers live at `components/satisium-ui/`; configure both Vite and TypeScript so `@/components/satisium-ui/*` points there while `@/*` points to `client/src/*`.

## Exact component assignments

### Editorial Reveal

Import from `@/components/satisium-ui/editorial-reveal`. Use it for the Home statement and Services hero headline. The Home statement uses `as="p"`, `blockClassName="bg-primary"`, `duration={0.5}`, `stagger={0.035}`, and `reverseOnScroll={false}`.

### Blur Reveal

Import from `@/components/satisium-ui/blur-reveal`. Use it for supporting phrases through shared `SectionHeading`. Supporting content must be fully readable after animation completes.

### Ascent Carousel

Import from `@/components/satisium-ui/ascent-carousel`. Use it in `ShowcaseReel` only, with all six project images. The outer stage is `h-[min(68svh,760px)] min-h-[420px]`, `sm:min-h-[560px]`, `bg-muted`, fine `border-border`, `p-1.5` and rounded; its component interior is `bg-background` with a smaller rounded radius.

Pass `visibleItems={2}`, `maxHeight={760}`, `minHeight={210}`, `{640:{visibleItems:3,maxHeight:760,minHeight:260}}`, `{1024:{visibleItems:4,maxHeight:760,minHeight:320}}`, `scrollMultiplier={0.003}`, and `friction={0.96}`. Do not enable auto movement. Prevent document wheel scrolling while the pointer is over the stage; scrolling resumes outside.

### Glass Slices

Import from `@/components/satisium-ui/glass-slices`. Use it only as the decorative layer in `GlassShowcaseFrame`. The native project-01 `<img>` is always visible. Lazy-import Glass Slices and mount it only for `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`. Its canvas is `aria-hidden`.

Pass `mediaUrl`, `slices={18}`, `hoverRadius={0.19}`, `minSliceWidth={0.7}`, `shiftY={0.06}`, `imageZoom={1.08}`, `mouseLerpSpeed={4}`, and `enterLeaveSpeed={2.5}`.

### Manifesto Text Reveal

Import from `@/components/satisium-ui/manifesto-text-reveal`. Use it for the Showcase manifesto. Pass `as="h2"`, `splitLevel="word"`, `scrub={0.7}`, `inactiveOpacity={0.22}`, `triggerStart="top 78%"`, and `triggerEnd="bottom 55%"`.

## Isolation rule

The page never announces a component’s name, package or behavior. The public viewer sees a studio selection; the agent sees this plan. Every motion-rich component has a semantic reading path: images, text and actions must remain usable without hover, wheel gesture, animation, WebGL or JavaScript enhancement.
