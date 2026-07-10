# Magnetic Snap Reveal Component Context

**Description:** A kinetic, elastic text reveal component for Satis UI. Elements start in randomized, chaotic coordinates (rotated, scaled, translated) and magnetically snap into their correct layout positions using heavy spring physics. Includes clearProps rendering fixes and strict vestibular disorder failsafes.

## 1. Installation

To add this component to a project, run:

```bash
npx satis-ui add magnetic-snap-reveal
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop           | Type                | Default     | Description                   |
| :------------- | :------------------ | :---------- | :---------------------------- |
| `text`         | `string`            | _Required_  | The text string.              |
| `as`           | `React.ElementType` | `"h1"`      | HTML element to render.       |
| `splitBy`      | `"word" \| "char"`  | `"char"`    | Split mode.                   |
| `duration`     | `number`            | `1.2`       | Animation duration.           |
| `delay`        | `number`            | `0`         | Intro delay.                  |
| `stagger`      | `number`            | `0.02`      | Stagger timing between items. |
| `viewportOnce` | `boolean`           | `true`      | Toggle repeating animations.  |
| `triggerStart` | `string`            | `"top 85%"` | Scroll trigger coordinate.    |

## 3. Core Component Source

**File Path:** `components/ui/magnetic-snap-reveal.tsx`

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

export interface MagneticSnapRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  duration?: number
  delay?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const MagneticSnapReveal = React.forwardRef<
  HTMLElement,
  MagneticSnapRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      duration = 1.2,
      delay = 0,
      stagger = 0.02,
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
          ".magnetic-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              x: () => gsap.utils.random(-40, 40),
              y: () => gsap.utils.random(-40, 40),
              rotation: () => gsap.utils.random(-25, 25),
              scale: () => gsap.utils.random(0.8, 1.2),
              opacity: 0,
            },
            {
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease: "elastic.out(1.1, 0.4)",
              force3D: true,
              clearProps: "transform,scale,rotation,opacity",
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
          gsap.fromTo(
            elements,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.5,
              delay,
              stagger,
              ease: "none",
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
          duration,
          delay,
          stagger,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
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
                      className="magnetic-item"
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
                className="magnetic-item"
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

MagneticSnapReveal.displayName = "MagneticSnapReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { MagneticSnapReveal } from "@/components/ui/magnetic-snap-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <MagneticSnapReveal
        as="h1"
        text="Chaos into order."
        className="text-6xl font-bold"
        splitBy="char"
        duration={1.2}
        stagger={0.03}
      />
    </main>
  )
}
```
