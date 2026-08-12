# Fluid Ink Reveal Component Context

**Description:** A liquid text reveal component for Satis UI. Uses a dynamically animated SVG color matrix to warp blurry elements into sharp liquid droplets that merge and snap into crisp typography. Flawlessly interpolates back to native browser anti-aliasing to prevent snapping artifacts.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/fluid-ink-reveal.json
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop           | Type                | Default     | Description                   |
| :------------- | :------------------ | :---------- | :---------------------------- |
| `text`         | `string`            | _Required_  | The text string.              |
| `as`           | `React.ElementType` | `"h1"`      | HTML tag to render.           |
| `splitBy`      | `"word" \| "char"`  | `"char"`    | Split mode.                   |
| `startBlur`    | `string`            | `"12px"`    | Initial blur filter value.    |
| `duration`     | `number`            | `1.4`       | Animation duration.           |
| `delay`        | `number`            | `0`         | Intro delay.                  |
| `stagger`      | `number`            | `0.08`      | Stagger timing between items. |
| `viewportOnce` | `boolean`           | `true`      | Toggle repeating animations.  |
| `triggerStart` | `string`            | `"top 90%"` | ScrollTrigger start position. |

## 3. Core Component Source

**File Path:** `components/ui/fluid-ink-reveal.tsx`

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

export interface FluidInkRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startBlur?: string
  duration?: number
  delay?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const FluidInkReveal = React.forwardRef<
  HTMLElement,
  FluidInkRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startBlur = "12px",
      duration = 1.4,
      delay = 0,
      stagger = 0.08,
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<any>(null)
    const matrixRef = React.useRef<SVGFEColorMatrixElement>(null)
    const filterId = React.useId()

    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".ink-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: triggerStart,
              once: viewportOnce,
              toggleActions: viewportOnce
                ? "play none none none"
                : "play none none reverse",
            },
          })

          const matrixProxy = { a: 18, b: -7 }

          tl.set(containerRef.current, { filter: `url(#goo-${filterId})` })
          tl.set(matrixProxy, { a: 18, b: -7 })

          tl.fromTo(
            elements,
            {
              opacity: 0,
              filter: `blur(${startBlur})`,
              scale: 1.1,
            },
            {
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
              duration,
              delay,
              stagger,
              ease: "power2.inOut",
              force3D: true,
            }
          )

          tl.to(
            matrixProxy,
            {
              a: 1,
              b: 0,
              duration: 0.6,
              ease: "power2.out",
              onUpdate: () => {
                if (matrixRef.current) {
                  matrixRef.current.setAttribute(
                    "values",
                    `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${matrixProxy.a} ${matrixProxy.b}`
                  )
                }
              },
            },
            "-=0.6"
          )

          tl.set(containerRef.current, { filter: "none" })
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
          startBlur,
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
      filter: `blur(${startBlur})`,
      transform: "scale(1.1)",
      willChange: "opacity, filter, transform",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <>
        <svg
          width="0"
          height="0"
          className="absolute hidden"
          aria-hidden="true"
        >
          <defs>
            <filter id={`goo-${filterId}`}>
              <feColorMatrix
                ref={matrixRef}
                in="SourceGraphic"
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 18 -7
                "
              />
            </filter>
          </defs>
        </svg>

        <Component
          ref={containerRef}
          aria-label={text}
          className={cn("flex flex-wrap text-left whitespace-pre-wrap", className)}
          style={{
            filter: `url(#goo-${filterId})`,
            WebkitTransform: "translateZ(0)",
            padding: "0.2em 0",
          }}
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
                        className="ink-item inline-block"
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
                  className="ink-item inline-block"
                  style={ssrInitialStyles}
                >
                  {word}
                </span>
              )
            })}
          </span>
        </Component>
      </>
    )
  }
)

FluidInkReveal.displayName = "FluidInkReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { FluidInkReveal } from "@/components/ui/fluid-ink-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <FluidInkReveal
        as="h1"
        text="Surface tension."
        className="text-6xl font-bold"
        splitBy="char"
        startBlur="32px"
        duration={1.5}
        stagger={0.08}
      />
    </main>
  )
}
```
