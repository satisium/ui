# 05 — interaction and QA contract

## Required interactions

### Showcase filters

Use native buttons for All, Portrait, Campaign and Event. The active option has `aria-pressed="true"`; selecting Portrait visibly leaves exactly project 01 and 05.

### Project cards

Every project card provides a real path forward. Each tile links to `/contact`, retains a visible focus ring and does not rely on hover.

### Showcase reel

Viewers can explore images deliberately. Wheel input inside the stage does not move the document before the carousel receives it; scroll outside the stage moves the page normally; no automatic rotation runs.

### Mobile menu

The Sheet has an accessible trigger named **Open navigation**. Keyboard/touch can open it, choose every route and close it.

### Build Plan dialog

The existing Radix dialog retains its title, description, focus trapping and Escape dismissal. `DialogContent` is `flex-col`, viewport bounded, and has `shrink-0` header/actions plus a `min-h-0 flex-1 overflow-y-auto` reading region. The dialog presents each kit file as a selectable navigation item; its complete copy action aggregates every file. The active-file reading region must retain scroll height greater than client height for long files.

### Copy Plan

A trusted click copies the complete folder specification. The button reads **Copied** after success and `aria-live` announces **Build plan copied to clipboard.** Retain a `document.execCommand("copy")` fallback.

### Contact form

On empty required submission, an alert explains that name, email and message are required. With a name, valid email and message, success text is **The first note is in.** and a **Send another note** control resets local form state.

### Site tour film

The film starts muted on load and uses a poster. It has `autoPlay`, `muted`, `playsInline`, `preload="auto"`, the exact source/poster paths and a 16:9 layout. Do not set `controls` or `loop`. The only visible interactive media control is one named Play/Pause button.

## Accessibility and reduced motion

Use native buttons and inputs; preserve labels, names, focus rings, keyboard activation and at least 44×44px interactive targets. Meaningful photos use the supplied alt text. Decorative SVG/canvas layers are `aria-hidden`. Body and page content must never be placed under an overflow rule that hides essential text or focus outlines.

At `prefers-reduced-motion: reduce`, disable smooth scrolling and nonessential transition/animation. Registry components must leave all text/image content in a legible end state. Do not mount Glass Slices in this mode. The film may begin in its stable muted state, but the single Play/Pause control must continue to work. Showcase cards, buttons, plan file navigation, complete-kit copy and form actions must continue to work.

## Handoff proof

Run `pnpm exec prettier --check` for changed sources, `pnpm check`, `pnpm build` and `git diff --check`. Capture all five canonical routes at `1440×960` and `390×844`; inspect for clipping, horizontal overflow, contrast and touch spacing. Directly request every remote image URL plus both site-tour storage paths and require HTTP 200. In browser, test muted autoplay, poster, the single named Play/Pause control, resume after manual Play, end state and absence of native settings; then test filters, form error/success, modal file navigation, complete-kit Copy click and native Escape.

Document large deferred WebGL chunks as a limitation rather than hiding the build warning. It is acceptable only because Glass Slices is lazy-loaded, desktop-only, reduced-motion-safe and not essential to reading the featured project.
