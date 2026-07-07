# Editorial Reveal Component Context

**Description:** A premium, Awwwards-level text reveal component. Uses GSAP and ScrollTrigger to create a sophisticated, staggered redaction-block reveal that triggers exactly when the text enters the viewport. Includes full screen reader accessibility and vestibular disorder failsafes.

## 1. Installation

To add this component to a project, run:

```bash
npx satis-ui add editorial-reveal
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop              | Type                | Default           | Description                                                       |
| :---------------- | :------------------ | :---------------- | :---------------------------------------------------------------- |
| `text`            | `string`            | _Required_        | The full string of text to reveal. Automatically splits by words. |
| `as`              | `React.ElementType` | `"p"`             | The HTML tag to render as (e.g., `'h1'`, `'h2'`, `'p'`).          |
| `blockClassName`  | `string`            | `"bg-foreground"` | Tailwind class for the redaction block color.                     |
| `triggerStart`    | `string`            | `"top 85%"`       | Viewport threshold for when the animation should start.           |
| `duration`        | `number`            | `0.5`             | The duration of the reveal for each individual block in seconds.  |
| `stagger`         | `number`            | `0.015`           | The stagger delay between each word revealing in seconds.         |
| `ease`            | `string`            | `"power3.in"`     | GSAP easing function for the scale animation.                     |
| `reverseOnScroll` | `boolean`           | `true`            | Whether the blocks should close again when scrolling back up.     |

## 3. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { EditorialReveal } from "@/components/ui/editorial-reveal"

export default function ExamplePage() {
  return (
    <main className="relative min-h-[200vh] w-full bg-background flex flex-col items-center justify-center">
      <div className="pt-[50vh]">
        <EditorialReveal
          as="h1"
          text="Meticulously crafted components for modern web applications."
          className="text-4xl md:text-6xl font-bold tracking-tight"
          blockClassName="bg-primary rounded-[2px]"
          duration={0.6}
          stagger={0.02}
        />
      </div>
    </main>
  )
}
```
