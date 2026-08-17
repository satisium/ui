# Blur Reveal Component Context

**Description:** A cinematic, 3D text reveal component for Satis UI. Characters or words sweep in from an angled, blurry 3D perspective, utilizing deep easing to create a heavy, dramatic reveal. Features a built-in GSAP `clearProps` cleanup mechanism to guarantee flawless native anti-aliasing once the animation finishes.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/blur-reveal.json
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop           | Type                | Default        | Description                   |
| :------------- | :------------------ | :------------- | :---------------------------- |
| `text`         | `string`            | _Required_     | The string of text to reveal. |
| `as`           | `React.ElementType` | `"p"`          | HTML tag to render as.        |
| `splitBy`      | `"word" \| "char"`  | `"word"`       | Split mode.                   |
| `blur`         | `boolean`           | `true`         | Apply cinematic blur filter.  |
| `duration`     | `number`            | `1`            | Animation duration.           |
| `delay`        | `number`            | `0`            | Intro delay.                  |
| `stagger`      | `number`            | `0.03`         | Stagger timing between items. |
| `ease`         | `string`            | `"power3.out"` | Easing curve.                 |
| `viewportOnce` | `boolean`           | `true`         | Toggle repeating animations.  |
| `triggerStart` | `string`            | `"top 90%"`    | ScrollTrigger start position. |

## 3. Core Component Source

**File Path:** `registry/ui/blur-reveal.tsx`

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

export interface BlurRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  blur?: boolean
  duration?: number
  delay?: number
  stagger?: number
  ease?: string
  viewportOnce?: boolean
  triggerStart?: string
}

export const BlurReveal = React.forwardRef<
  HTMLElement,
  BlurRevealProps
>(
  (
    {
      text,
      as = "p",
      className,
      splitBy = "word",
      blur = true,
      duration = 1,
      delay = 0,
      stagger = 0.03,
      ease = "power3.out",
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
          ".blur-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              opacity: 0,
              y: 40,
              rotateX: -50,
              filter: blur ? "blur(12px)" : "none",
            },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              filter: blur ? "blur(0px)" : "none",
              duration,
              delay,
              stagger,
              ease,
              force3D: true,
              clearProps: blur ? "filter" : "",
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
          blur,
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
      transform: "translateY(40px) rotateX(-50deg)",
      filter: blur ? "blur(12px)" : "none",
      transformOrigin: "bottom center",
      willChange: "transform, opacity, filter",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("relative m-0 whitespace-pre-wrap", className)}
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
                      className="blur-item inline-block"
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
                className="blur-item inline-block"
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

BlurReveal.displayName = "BlurReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { BlurReveal } from "@/registry/ui/blur-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <BlurReveal
        as="h1"
        text="Motion creates emotion."
        className="text-6xl font-bold"
        splitBy="char"
        blur={true}
        duration={1.2}
        stagger={0.04}
      />
    </main>
  )
}
```
