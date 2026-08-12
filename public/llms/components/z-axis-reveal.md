# Z-Axis Reveal Component Context

**Description:** A cinematic deep-space text reveal component for Satis UI. Elements fly in from the Z-axis, scaling down and un-blurring into focus. Fully optimizes GSAP's pinning features and utilizes clearProps matrix resets for pristine final anti-aliasing.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/z-axis-reveal.json
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop           | Type                         | Default           | Description                               |
| :------------- | :--------------------------- | :---------------- | :---------------------------------------- |
| `text`         | `string`                     | _Required_        | The text string.                          |
| `as`           | `React.ElementType`          | `"h1"`            | HTML element to render.                   |
| `splitBy`      | `"char" \| "word" \| "line"` | `"word"`          | Split mode.                               |
| `momentum`     | `number`                     | `1.5`             | Inertia scroll catch-up time.             |
| `startScale`   | `number`                     | `3`               | Starting scale value.                     |
| `blur`         | `boolean`                    | `true`            | Initial deep space blur.                  |
| `pin`          | `boolean`                    | `true`            | DOM pinning for scrollytelling.           |
| `triggerStart` | `string`                     | `"center center"` | Scroll trigger coordinate.                |
| `triggerEnd`   | `string`                     | _Dynamic_         | Auto-calculates based on children length. |

## 3. Core Component Source

**File Path:** `registry/ui/z-axis-reveal.tsx`

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

export type ZAxisSplitType = "char" | "word" | "line"

export interface ZAxisRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: ZAxisSplitType
  momentum?: number
  startScale?: number
  blur?: boolean
  pin?: boolean
  triggerStart?: string
  triggerEnd?: string
}

export const ZAxisReveal = React.forwardRef<HTMLElement, ZAxisRevealProps>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "word",
      momentum = 1.5,
      startScale = 3,
      blur = true,
      pin = true,
      triggerStart = pin ? "center center" : "top 85%",
      triggerEnd,
      ...props
    },
    ref
  ) => {
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const containerRef = React.useRef<any>(null)
    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current || !triggerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".z-axis-target",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        const distanceMultiplier =
          splitBy === "char" ? 20 : splitBy === "word" ? 40 : 150
        const calculatedEnd = pin
          ? `+=${elements.length * distanceMultiplier}`
          : "bottom 60%"
        const finalEnd = triggerEnd || calculatedEnd

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              opacity: 0,
              scale: startScale,
              filter: blur ? "blur(20px)" : "blur(0px)",
              z: 1,
            },
            {
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              z: 0,
              stagger: 0.1,
              ease: "power3.out",
              force3D: true,
              clearProps: blur ? "filter,transform" : "transform",
              scrollTrigger: {
                trigger: triggerRef.current,
                pin: pin,
                anticipatePin: 1,
                start: triggerStart,
                end: finalEnd,
                scrub: momentum,
                invalidateOnRefresh: true,
              },
            }
          )
        })

        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.fromTo(
            elements,
            { opacity: 0, scale: 1, filter: "none" },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              clearProps: "transform",
              scrollTrigger: {
                trigger: triggerRef.current,
                pin: pin,
                start: triggerStart,
                end: finalEnd,
                scrub: momentum,
              },
            }
          )
        })

        return () => mm.revert()
      },
      {
        scope: triggerRef,
        dependencies: [
          blur,
          momentum,
          startScale,
          triggerStart,
          triggerEnd,
          pin,
          splitBy,
          text,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: `scale(${startScale}) translateZ(0)`,
      filter: blur ? "blur(20px)" : "none",
      transformOrigin: "center center",
      willChange: "transform, opacity, filter",
    }

    const renderContent = () => {
      if (splitBy === "line") {
        return text.split("\n").map((line, idx) => (
          <span key={idx} className="block w-full">
            <span
              className="z-axis-target block whitespace-pre-wrap"
              style={ssrInitialStyles}
            >
              {line}
            </span>
          </span>
        ))
      }

      const words = text.split(/(\s+)/)
      return words.map((word, wordIdx) => {
        if (word.match(/\s+/)) {
          return (
            <span key={wordIdx} className="inline-block whitespace-pre">
              {word}
            </span>
          )
        }

        if (splitBy === "char") {
          return (
            <span key={wordIdx} className="inline-block whitespace-nowrap">
              {word.split("").map((char, charIdx) => (
                <span
                  key={`${wordIdx}-${charIdx}`}
                  className="z-axis-target inline-block"
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
            key={wordIdx}
            className="z-axis-target inline-block"
            style={ssrInitialStyles}
          >
            {word}
          </span>
        )
      })
    }

    const Component = as as any

    return (
      <div ref={triggerRef} className="relative w-full">
        <Component
          ref={containerRef}
          aria-label={text}
          className={cn(
            "relative m-0 overflow-visible whitespace-pre-wrap",
            className
          )}
          {...props}
        >
          <span
            aria-hidden="true"
            className="flex flex-wrap items-center justify-center text-center"
          >
            {renderContent()}
          </span>
        </Component>
      </div>
    )
  }
)

ZAxisReveal.displayName = "ZAxisReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { ZAxisReveal } from "@/registry/ui/z-axis-reveal"

export default function ExamplePage() {
  return (
    <main className="relative w-full">
      <section className="flex h-screen items-center justify-center">
        <ZAxisReveal
          as="h1"
          text="Deep space typography."
          className="text-6xl font-bold"
          splitBy="char"
          startScale={4}
          momentum={1.5}
        />
      </section>
      <div className="h-screen w-full" />
    </main>
  )
}
```
