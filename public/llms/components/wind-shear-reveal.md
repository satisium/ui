# Wind Shear Reveal Component Context

**Description:** A high-velocity text reveal component for Satis UI. Elements slide in while leaning heavily against simulated wind resistance, utilizing elastic friction to snap forward into their resting positions. Features robust CSS `clearProps` anti-aliasing fixes and strict screen reader formatting.

## 1. Installation

To add this component to a project, run:

```bash
npx satisium-ui add wind-shear-reveal
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop           | Type                | Default           | Description                            |
| :------------- | :------------------ | :---------------- | :------------------------------------- |
| `text`         | `string`            | _Required_        | The text string.                       |
| `as`           | `React.ElementType` | `"h1"`            | HTML element to render.                |
| `splitBy`      | `"word" \| "char"`  | `"word"`          | Split mode.                            |
| `startX`       | `string \| number`  | `"1.5em"`         | Starting X offset.                     |
| `startingSkew` | `number`            | `-30`             | Starting skew angle (drag simulation). |
| `duration`     | `number`            | `1.2`             | Animation duration.                    |
| `delay`        | `number`            | `0`               | Intro delay.                           |
| `stagger`      | `number`            | `0.05`            | Stagger timing between items.          |
| `ease`         | `string`            | `"back.out(1.2)"` | GSAP ease function.                    |
| `viewportOnce` | `boolean`           | `true`            | Toggle repeating animations.           |
| `triggerStart` | `string`            | `"top 85%"`       | Scroll trigger coordinate.             |

## 3. Core Component Source

**File Path:** `components/ui/wind-shear-reveal.tsx`

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

export interface WindShearRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startX?: string | number
  startingSkew?: number
  duration?: number
  delay?: number
  stagger?: number
  ease?: string
  viewportOnce?: boolean
  triggerStart?: string
}

export const WindShearReveal = React.forwardRef<
  HTMLElement,
  WindShearRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "word",
      startX = "1.5em",
      startingSkew = -30,
      duration = 1.2,
      delay = 0,
      stagger = 0.05,
      ease = "back.out(1.2)",
      viewportOnce = true,
      triggerStart = "top 85%",
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<any>(null)
    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".wind-shear-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              x: startX,
              skewX: startingSkew,
              opacity: 0,
            },
            {
              x: 0,
              skewX: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease,
              force3D: true,
              clearProps: "transform,opacity",
              scrollTrigger: {
                trigger: containerRef.current,
                start: triggerStart,
                once: viewportOnce,
                toggleActions: viewportOnce
                  ? "play none none none"
                  : "play none none reverse",
              },
            }
          )
        })

        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(elements, { x: 0, skewX: 0 })

          gsap.fromTo(
            elements,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.5,
              delay,
              stagger,
              ease: "none",
              clearProps: "transform",
              scrollTrigger: {
                trigger: containerRef.current,
                start: triggerStart,
                once: viewportOnce,
                toggleActions: viewportOnce
                  ? "play none none none"
                  : "play none none reverse",
              },
            }
          )
        })

        return () => mm.revert()
      },
      {
        scope: containerRef,
        dependencies: [
          text,
          startX,
          startingSkew,
          duration,
          delay,
          stagger,
          ease,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: `translateX(${startX}) skewX(${startingSkew}deg)`,
      transformOrigin: "bottom left",
      willChange: "transform, opacity",
      display: "inline-block",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn(
          "flex flex-wrap text-left whitespace-pre-wrap",
          className
        )}
        {...props}
      >
        <span aria-hidden="true" className="flex flex-wrap">
          {words.map((word, wordIndex) => {
            if (word.match(/\s+/)) {
              return (
                <span key={wordIndex} className="inline-block whitespace-pre">
                  {word}
                </span>
              )
            }

            if (splitBy === "char") {
              return (
                <span key={wordIndex} className="inline-flex whitespace-nowrap">
                  {word.split("").map((char, charIndex) => (
                    <span
                      key={`${wordIndex}-${charIndex}`}
                      className="wind-shear-item"
                      style={ssrInitialStyles}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              )
            }

            return (
              <span
                key={wordIndex}
                className="wind-shear-item"
                style={ssrInitialStyles}
              >
                {word}
              </span>
            )
          })}
        </span>
      </Component>
    )
  }
)

WindShearReveal.displayName = "WindShearReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { WindShearReveal } from "@/components/ui/wind-shear-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <WindShearReveal
        as="h1"
        text="Velocity meets friction."
        className="text-6xl font-black"
        splitBy="char"
        duration={1.2}
        stagger={0.08}
        startingSkew={-35}
      />
    </main>
  )
}
```
