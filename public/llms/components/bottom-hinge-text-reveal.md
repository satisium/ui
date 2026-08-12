# Bottom Hinge Text Reveal Component Context

**Description:** A high-impact 3D text reveal component for Satis UI. Elements start deep in the Z-axis, leaning backward, and aggressively swing up and slam into place using a tight perspective and heavy GSAP overshoot. Resolves correctly with strict `clearProps` anti-aliasing logic.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/bottom-hinge-text-reveal.json
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop           | Type                | Default     | Description                   |
| :------------- | :------------------ | :---------- | :---------------------------- |
| `text`         | `string`            | _Required_  | The text string.              |
| `as`           | `React.ElementType` | `"h1"`      | HTML element to render.       |
| `splitBy`      | `"word" \| "char"`  | `"char"`    | Split mode.                   |
| `startZ`       | `string \| number`  | `"-400px"`  | Starting Z-depth.             |
| `startAngleX`  | `number`            | `-70`       | Starting X-axis rotation.     |
| `duration`     | `number`            | `0.7`       | Animation duration.           |
| `delay`        | `number`            | `0`         | Intro delay.                  |
| `stagger`      | `number`            | `0.04`      | Stagger timing between items. |
| `viewportOnce` | `boolean`           | `true`      | Toggle repeating animations.  |
| `triggerStart` | `string`            | `"top 90%"` | Scroll trigger coordinate.    |

## 3. Core Component Source

**File Path:** `registry/ui/bottom-hinge-text-reveal.tsx`

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

export interface BottomHingeTextRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startZ?: string | number
  startAngleX?: number
  duration?: number
  delay?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const BottomHingeTextReveal = React.forwardRef<
  HTMLElement,
  BottomHingeTextRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startZ = "-400px",
      startAngleX = -70,
      duration = 0.7,
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

    const resolveZ = typeof startZ === "number" ? `${startZ}px` : startZ

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".hinge-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              z: resolveZ,
              rotateX: startAngleX,
              opacity: 0,
            },
            {
              z: 0,
              rotateX: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease: "back.out(2.5)",
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
          resolveZ,
          startAngleX,
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
      transform: `translateZ(${resolveZ}) rotateX(${startAngleX}deg)`,
      transformOrigin: "bottom center",
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
        style={{ perspective: "600px" }}
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
                      className="hinge-item inline-block"
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
                className="hinge-item inline-block"
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

BottomHingeTextReveal.displayName = "BottomHingeTextReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { BottomHingeTextReveal } from "@/registry/ui/bottom-hinge-text-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <BottomHingeTextReveal
        as="h1"
        text="Hard impact."
        className="text-6xl font-bold"
        splitBy="char"
        duration={2}
        stagger={0.06}
      />
    </main>
  )
}
```
