# Editorial Reveal Component Context

**Description:** A premium, Awwwards-level text reveal component. Uses GSAP and ScrollTrigger to create a sophisticated, staggered redaction-block reveal that triggers exactly when the text enters the viewport. Includes full screen reader accessibility and vestibular disorder failsafes.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/editorial-reveal.json
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

## 3. Core Component Source

**File Path:** `components/ui/editorial-reveal.tsx`

```tsx
"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface EditorialRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  blockClassName?: string
  triggerStart?: string
  duration?: number
  stagger?: number
  ease?: string
  reverseOnScroll?: boolean
}

export const EditorialReveal = React.forwardRef<
  HTMLElement,
  EditorialRevealProps
>(
  (
    {
      text,
      as = "p",
      className,
      blockClassName = "bg-foreground",
      triggerStart = "top 85%",
      duration = 0.5,
      stagger = 0.015,
      ease = "power3.in",
      reverseOnScroll = true,
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<any>(null)

    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const blockNodes = gsap.utils.toArray<HTMLElement>(
          ".editorial-block",
          containerRef.current
        )
        if (blockNodes.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          ScrollTrigger.batch(blockNodes, {
            start: triggerStart,
            onEnter: (batch) =>
              gsap.to(batch, {
                scaleX: 0,
                duration,
                stagger,
                ease,
                overwrite: true,
              }),
            onLeaveBack: (batch) => {
              if (reverseOnScroll) {
                gsap.to(batch, {
                  scaleX: 1,
                  duration,
                  stagger,
                  ease,
                  overwrite: true,
                })
              }
            },
          })
        })

        mm.add("(prefers-reduced-motion: reduce)", () => {
          ScrollTrigger.batch(blockNodes, {
            start: triggerStart,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 0,
                duration,
                stagger,
                ease: "none",
                overwrite: true,
              }),
            onLeaveBack: (batch) => {
              if (reverseOnScroll) {
                gsap.to(batch, {
                  opacity: 1,
                  duration,
                  stagger,
                  ease: "none",
                  overwrite: true,
                })
              }
            },
          })
        })

        return () => mm.revert()
      },
      {
        scope: containerRef,
        dependencies: [triggerStart, duration, stagger, ease, reverseOnScroll],
      }
    )

    const ssrBlockStyles: React.CSSProperties = {
      transform: "scaleX(1)",
      transformOrigin: "right center",
      willChange: "transform",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("relative m-0 whitespace-pre-wrap", className)}
        {...props}
      >
        <span aria-hidden="true">
          {words.map((word, i) => {
            if (word.match(/\s+/)) {
              return (
                <span key={i} className="inline-block whitespace-pre">
                  {word}
                </span>
              )
            }

            return (
              <span key={i} className="relative inline-block">
                <span>{word}</span>
                <span
                  className={cn(
                    "editorial-block absolute -inset-x-[0.02em] inset-y-[0.05em] z-10",
                    blockClassName
                  )}
                  style={ssrBlockStyles}
                />
              </span>
            )
          })}
        </span>
      </Component>
    )
  }
)

EditorialReveal.displayName = "EditorialReveal"
```

## 4. Example Implementation

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
