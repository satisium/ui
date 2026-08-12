# Flip 3D Reveal Component Context

**Description:** A premium, mechanical text reveal component for Satis UI. Characters or words rotate into view along the Y-axis, creating a Rolodex or split-flap display effect with a microscopic physics bounce. Built with GSAP ScrollTrigger and features strict accessibility compliance.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/flip-3d-reveal.json
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop           | Type                | Default     | Description                         |
| :------------- | :------------------ | :---------- | :---------------------------------- |
| `text`         | `string`            | _Required_  | The string of text to reveal.       |
| `as`           | `React.ElementType` | `"h1"`      | HTML tag to render.                 |
| `splitBy`      | `"word" \| "char"`  | `"char"`    | Split text granularity.             |
| `startAngle`   | `number`            | `90`        | Starting Y-axis rotation (degrees). |
| `startX`       | `string`            | `"-0.2em"`  | Initial horizontal offset.          |
| `duration`     | `number`            | `0.8`       | Animation duration per piece.       |
| `delay`        | `number`            | `0`         | Intro delay.                        |
| `stagger`      | `number`            | `0.03`      | Stagger timing.                     |
| `viewportOnce` | `boolean`           | `true`      | Toggle repeating on scroll.         |
| `triggerStart` | `string`            | `"top 90%"` | Scroll trigger start position.      |

## 3. Core Component Source

**File Path:** `registry/ui/flip-3d-reveal.tsx`

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

export interface Flip3DRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startAngle?: number
  startX?: string
  duration?: number
  delay?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const Flip3DReveal = React.forwardRef<HTMLElement, Flip3DRevealProps>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startAngle = 90,
      startX = "-0.2em",
      duration = 0.8,
      delay = 0,
      stagger = 0.03,
      viewportOnce = true,
      triggerStart = "top 90%",
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
          ".flip-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              rotateY: startAngle,
              x: startX,
              opacity: 0,
            },
            {
              rotateY: 0,
              x: 0,
              opacity: 1,
              duration: duration,
              delay: delay,
              stagger: stagger,
              ease: "back.out(1.2)",
              force3D: true,
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
              duration: 0.6,
              delay: delay,
              stagger: stagger,
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
          startAngle,
          startX,
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
      transform: `rotateY(${startAngle}deg) translateX(${startX})`,
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("flex flex-wrap whitespace-pre-wrap", className)}
        style={{ perspective: "1200px" }}
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
                <span
                  key={wordIndex}
                  className="inline-block whitespace-nowrap"
                >
                  {word.split("").map((char, charIndex) => (
                    <span
                      key={`${wordIndex}-${charIndex}`}
                      className="flip-item inline-block"
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
                className="flip-item inline-block"
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

Flip3DReveal.displayName = "Flip3DReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { Flip3DReveal } from "@/registry/ui/flip-3d-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <Flip3DReveal
        as="h1"
        text="Spatial computing."
        className="text-6xl font-medium tracking-tighter"
        splitBy="char"
        stagger={0.04}
      />
    </main>
  )
}
```
