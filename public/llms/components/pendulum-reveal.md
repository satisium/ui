# Pendulum Reveal Component Context

**Description:** A kinetic text reveal component for Satis UI. Elements drop down from a top hinge point, utilizing a heavy elastic ease to simulate a swinging pendulum settling into place. Includes `clearProps` anti-aliasing fixes and robust screen reader formatting.

## 1. Installation

To add this component to a project, run:

```bash
npx satisium-ui add pendulum-reveal
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop           | Type                | Default     | Description                   |
| :------------- | :------------------ | :---------- | :---------------------------- |
| `text`         | `string`            | _Required_  | The text string.              |
| `as`           | `React.ElementType` | `"h1"`      | HTML element to render.       |
| `splitBy`      | `"word" \| "char"`  | `"char"`    | Split mode.                   |
| `startAngleX`  | `number`            | `90`        | Starting X-axis rotation.     |
| `startAngleZ`  | `number`            | `-8`        | Starting Z-axis twist.        |
| `duration`     | `number`            | `1.6`       | Animation duration.           |
| `delay`        | `number`            | `0`         | Intro delay.                  |
| `stagger`      | `number`            | `0.04`      | Stagger timing between items. |
| `viewportOnce` | `boolean`           | `true`      | Toggle repeating animations.  |
| `triggerStart` | `string`            | `"top 90%"` | Scroll trigger coordinate.    |

## 3. Core Component Source

**File Path:** `components/ui/pendulum-reveal.tsx`

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

export interface PendulumRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startAngleX?: number
  startAngleZ?: number
  duration?: number
  delay?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const PendulumReveal = React.forwardRef<
  HTMLElement,
  PendulumRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startAngleX = 90,
      startAngleZ = -8,
      duration = 1.6,
      delay = 0,
      stagger = 0.04,
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
          ".pendulum-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              rotateX: startAngleX,
              rotateZ: startAngleZ,
              y: "-0.3em",
              opacity: 0,
            },
            {
              rotateX: 0,
              rotateZ: 0,
              y: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease: "elastic.out(1.2, 0.4)",
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
          duration,
          delay,
          stagger,
          startAngleX,
          startAngleZ,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: `translateY(-0.3em) rotateX(${startAngleX}deg) rotateZ(${startAngleZ}deg)`,
      transformOrigin: "top center",
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
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
        style={{ perspective: "1000px" }}
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
                      className="pendulum-item inline-block"
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
                className="pendulum-item inline-block"
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

PendulumReveal.displayName = "PendulumReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { PendulumReveal } from "@/components/ui/pendulum-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <PendulumReveal
        as="h1"
        text="Kinetic typography."
        className="text-6xl font-bold"
        splitBy="char"
        duration={1.8}
        stagger={0.05}
      />
    </main>
  )
}
```
