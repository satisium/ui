export const multiColorTrailCharDemoString = `
import { MultiColorTrailReveal } from "@/components/satisium-ui/multi-color-trail-reveal"

const text1 = "“Can a man still be brave if he's afraid?” Asked Bran.\\n“That is the only time a man can be brave,” says Ned."
const text2 = "“What is honor compared to a woman's love? What is duty against the feel of a newborn son in your arms . . . or the memory of a brother's smile? Wind and words. Wind and words. We are only human, and the gods have fashioned us for love. That is our great glory, and our great tragedy.”"
const text3 = "“Never forget what you are, for surely the world will not. Make it your strength. Then it can never be your weakness. Armour yourself in it, and it will never be used to hurt you.”"

export default function MultiColorTrailCharDemo() {
  return (
    <main className="w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <section className="flex h-screen w-full flex-col items-center justify-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest text-primary uppercase">Character Mode</span>
        <span className="text-xs">Scroll slowly to spell</span>
        <div className="mt-8 h-16 w-[1px] bg-border" />
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 text-xs font-mono font-medium tracking-widest text-emerald-500 uppercase">
            01 // Char × Soft
          </p>
          <MultiColorTrailReveal
            as="h2" splitBy="char" edge="soft"
            text={text1}
            className="text-4xl font-medium leading-[1.35] tracking-tight md:text-5xl"
            trailLength={16}
            trailColors={["text-emerald-500", "text-teal-400", "text-cyan-400"]}
          />
        </div>
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 text-xs font-mono font-medium tracking-widest text-violet-500 uppercase">
            02 // Char × Liquid
          </p>
          <MultiColorTrailReveal
            as="h2" splitBy="char" edge="liquid"
            text={text2}
            className="text-4xl font-medium leading-[1.35] tracking-tight md:text-5xl"
            trailLength={12}
            trailColors={["text-violet-600", "text-fuchsia-500", "text-pink-400"]}
          />
        </div>
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 text-xs font-mono font-medium tracking-widest text-amber-500 uppercase">
            03 // Char × Hard
          </p>
          <MultiColorTrailReveal
            as="h2" splitBy="char" edge="hard"
            text={text3}
            className="text-4xl font-medium leading-[1.35] tracking-tight md:text-5xl"
            trailLength={10}
            trailColors={["text-amber-500", "text-yellow-400"]}
          />
        </div>
      </section>

      <section className="h-[30vh] w-full" />
    </main>
  )
}
`

export const multiColorTrailWordDemoString = `
import { MultiColorTrailReveal } from "@/components/satisium-ui/multi-color-trail-reveal"

const text1 = "“Can a man still be brave if he's afraid?” Asked Bran.\\n“That is the only time a man can be brave,” says Ned."
const text2 = "“What is honor compared to a woman's love? What is duty against the feel of a newborn son in your arms . . . or the memory of a brother's smile? Wind and words. Wind and words. We are only human, and the gods have fashioned us for love. That is our great glory, and our great tragedy.”"
const text3 = "“Never forget what you are, for surely the world will not. Make it your strength. Then it can never be your weakness. Armour yourself in it, and it will never be used to hurt you.”"

export default function MultiColorTrailWordDemo() {
  return (
    <main className="w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <section className="flex h-screen w-full flex-col items-center justify-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest text-primary uppercase">Word Mode</span>
        <span className="text-xs">Scroll to read</span>
        <div className="mt-8 h-16 w-[1px] bg-border" />
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 text-xs font-mono font-medium tracking-widest text-orange-500 uppercase">
            01 // Word × Soft
          </p>
          <MultiColorTrailReveal
            as="h2" splitBy="word" edge="soft"
            text={text1}
            className="text-4xl font-medium leading-[1.35] tracking-tight md:text-5xl"
            trailLength={5}
            trailColors={["text-red-500", "text-orange-500", "text-yellow-400"]}
          />
        </div>
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 text-xs font-mono font-medium tracking-widest text-blue-500 uppercase">
            02 // Word × Liquid
          </p>
          <MultiColorTrailReveal
            as="h2" splitBy="word" edge="liquid"
            text={text2}
            className="text-4xl font-medium leading-[1.35] tracking-tight md:text-5xl"
            trailLength={8}
            trailColors={["text-blue-600", "text-indigo-400", "text-cyan-300"]}
          />
        </div>
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 text-xs font-mono font-medium tracking-widest text-rose-500 uppercase">
            03 // Word × Hard
          </p>
          <MultiColorTrailReveal
            as="h2" splitBy="word" edge="hard"
            text={text3}
            className="text-4xl font-medium leading-[1.35] tracking-tight md:text-5xl"
            trailLength={6}
            trailColors={["text-rose-600", "text-rose-400"]}
          />
        </div>
      </section>

      <section className="h-[30vh] w-full" />
    </main>
  )
}
`

export const multiColorTrailLineDemoString = `
import { MultiColorTrailReveal } from "@/components/satisium-ui/multi-color-trail-reveal"

const text1 = "“Can a man still be brave if he's afraid?” Asked Bran.\\n“That is the only time a man can be brave,” says Ned."
const text2 = "“What is honor compared to a woman's love?\\nWhat is duty against the feel of a newborn son in your arms . . .\\nor the memory of a brother's smile? Wind and words. Wind and words.\\nWe are only human, and the gods have fashioned us for love.\\nThat is our great glory, and our great tragedy.”"
const text3 = "“Never forget what you are, for surely the world will not.\\nMake it your strength. Then it can never be your weakness.\\nArmour yourself in it, and it will never be used to hurt you.”"

export default function MultiColorTrailLineDemo() {
  return (
    <main className="w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <section className="flex h-screen w-full flex-col items-center justify-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest text-primary uppercase">Line Mode</span>
        <span className="text-xs">Scroll to unveil</span>
        <div className="mt-8 h-16 w-[1px] bg-border" />
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 text-xs font-mono font-medium tracking-widest text-zinc-400 uppercase">
            01 // Line × Soft
          </p>
          <MultiColorTrailReveal
            as="h2" splitBy="line" edge="soft"
            text={text1}
            className="text-4xl font-medium leading-[1.35] tracking-tight md:text-5xl"
            trailLength={1} 
            trailColors={["text-zinc-400", "text-zinc-100"]}
          />
        </div>
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 text-xs font-mono font-medium tracking-widest text-cyan-500 uppercase">
            02 // Line × Liquid
          </p>
          <MultiColorTrailReveal
            as="h2" splitBy="line" edge="liquid"
            text={text2}
            className="text-4xl font-medium leading-[1.35] tracking-tight md:text-5xl"
            trailLength={2}
            trailColors={["text-sky-500", "text-cyan-300"]}
          />
        </div>
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 text-xs font-mono font-medium tracking-widest text-indigo-500 uppercase">
            03 // Line × Hard
          </p>
          <MultiColorTrailReveal
            as="h2" splitBy="line" edge="hard"
            text={text3}
            className="text-4xl font-medium leading-[1.35] tracking-tight md:text-5xl"
            trailLength={1}
            trailColors={["text-indigo-500", "text-blue-400"]}
          />
        </div>
      </section>

      <section className="h-[30vh] w-full" />
    </main>
  )
}
`

export const multiColorTrailRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export type TrailEdgeType = "hard" | "liquid" | "soft"
export type TrailSplitType = "char" | "word" | "line"

export interface MultiColorTrailRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: TrailSplitType
  edge?: TrailEdgeType
  mutedClassName?: string
  trailColors?: string[]
  finalClassName?: string
  trailLength?: number
  momentum?: number | boolean
  pin?: boolean
  triggerStart?: string
  triggerEnd?: string
}

export const MultiColorTrailReveal = React.forwardRef<
  HTMLElement,
  MultiColorTrailRevealProps
>(
  (
    {
      text,
      as = "p",
      className,
      splitBy = "char",
      edge = "soft",
      mutedClassName = "text-muted-foreground/20",
      trailColors = ["text-primary/40", "text-primary/80"],
      finalClassName = "text-foreground",
      trailLength,
      momentum = 1.2,
      pin = true,
      triggerStart = pin ? "center center" : "top 80%",
      triggerEnd,
      ...props
    },
    ref
  ) => {
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const containerRef = React.useRef<any>(null)
    
    React.useImperativeHandle(ref, () => containerRef.current)

    const resolvedTrailLength =
      trailLength !== undefined
        ? trailLength
        : splitBy === "char"
          ? 12
          : splitBy === "word"
            ? 4
            : 1

    useGSAP(
      () => {
        if (!containerRef.current || !triggerRef.current) return

        const totalAnimatedLayers = trailColors.length + 1
        const layers: HTMLElement[][] = []

        for (let i = 0; i < totalAnimatedLayers; i++) {
          layers.push(
            gsap.utils.toArray<HTMLElement>(
              \`.trail-layer-\${i}\`,
              containerRef.current
            )
          )
        }

        if (layers[0].length === 0) return

        if (typeof document !== "undefined") {
          document.fonts.ready.then(() => {
            ScrollTrigger.refresh()
          })
        }

        const mm = gsap.matchMedia()

        const distanceMultiplier =
          splitBy === "char" ? 25 : splitBy === "word" ? 60 : 300
        const calculatedEnd = pin
          ? \`+=\${layers[0].length * distanceMultiplier}\`
          : "bottom 40%"
        const finalEnd = triggerEnd || calculatedEnd

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: triggerRef.current,
              pin: pin,
              start: triggerStart,
              end: finalEnd,
              scrub: momentum,
              invalidateOnRefresh: true,
            },
          })

          const isSoft = edge === "soft"
          const isLiquid = edge === "liquid"

          const baseStagger =
            splitBy === "char" ? 0.05 : splitBy === "word" ? 0.15 : 0.4

          const animDuration = isSoft
            ? baseStagger * 8
            : isLiquid
              ? baseStagger * 4
              : baseStagger * 3

          const divisor = Math.max(1, totalAnimatedLayers - 1)

          const liquidKeyframes = [
            { clipPath: "polygon(0% 0%, 30% 0%, 50% 50%, 20% 100%, 0% 100%)" },
            { clipPath: "polygon(0% 0%, 80% 0%, 60% 50%, 90% 100%, 0% 100%)" },
            { clipPath: "polygon(0% 0%, 110% 0%, 110% 50%, 110% 100%, 0% 100%)" },
          ]

          layers.forEach((layerElements, index) => {
            const delay = index * baseStagger * (resolvedTrailLength / divisor)

            if (isSoft) {
              tl.to(
                layerElements,
                {
                  opacity: 1,
                  ease: "power1.inOut",
                  stagger: baseStagger,
                  duration: animDuration,
                  force3D: true,
                },
                delay
              )
            } else if (isLiquid) {
              tl.to(
                layerElements,
                {
                  keyframes: liquidKeyframes,
                  ease: "none",
                  stagger: baseStagger,
                  duration: animDuration,
                  force3D: true,
                },
                delay
              )
            } else {
              tl.to(
                layerElements,
                {
                  clipPath: "inset(0% 0% 0% 0%)",
                  ease: "none",
                  stagger: baseStagger,
                  duration: animDuration,
                  force3D: true,
                },
                delay
              )
            }
          })
        })

        mm.add("(prefers-reduced-motion: reduce)", () => {
          layers.forEach((layerElements) => {
            if (edge === "soft") {
              gsap.set(layerElements, { opacity: 1 })
            } else {
              gsap.set(layerElements, { clipPath: "inset(0% 0% 0% 0%)" })
            }
          })
        })

        return () => mm.revert()
      },
      {
        scope: triggerRef,
        dependencies: [
          momentum,
          resolvedTrailLength,
          triggerStart,
          triggerEnd,
          pin,
          text,
          trailColors,
          edge,
          splitBy,
        ],
      }
    )

    const getSsrStyle = (edgeType: TrailEdgeType): React.CSSProperties => {
      const base: React.CSSProperties = {
        WebkitFontSmoothing: "antialiased",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }

      if (edgeType === "soft") {
        return { ...base, opacity: 0, willChange: "opacity" }
      }
      if (edgeType === "liquid") {
        return {
          ...base,
          clipPath: "polygon(0% 0%, 0% 0%, 0% 50%, 0% 100%, 0% 100%)",
          willChange: "clip-path",
        }
      }
      return {
        ...base,
        clipPath: "inset(0% 100% 0% 0%)",
        willChange: "clip-path",
      }
    }

    const ssrInitialStyle = getSsrStyle(edge)

    const renderLayeredStack = (content: string, key: string | number) => (
      <span
        key={key}
        className="relative inline-grid whitespace-pre-wrap [grid-template-areas:'stack']"
      >
        <span className={cn("[grid-area:stack]", mutedClassName)}>
          {content}
        </span>
        {trailColors.map((colorClass, layerIdx) => (
          <span
            key={\`trail-\${layerIdx}\`}
            className={cn(
              \`trail-layer-\${layerIdx} [grid-area:stack]\`,
              colorClass
            )}
            style={ssrInitialStyle}
          >
            {content}
          </span>
        ))}
        <span
          className={cn(
            \`trail-layer-\${trailColors.length} [grid-area:stack]\`,
            finalClassName
          )}
          style={ssrInitialStyle}
        >
          {content}
        </span>
      </span>
    )

    const renderContent = () => {
      if (splitBy === "line") {
        return text.split("\\n").map((line, idx) => (
          <span key={idx} className="block w-full">
            {renderLayeredStack(line, idx)}
          </span>
        ))
      }

      const words = text.split(/(\\s+)/)
      return words.map((word, wordIdx) => {
        if (word.match(/\\s+/)) {
          return (
            <span key={wordIdx} className="inline-block whitespace-pre">
              {word}
            </span>
          )
        }

        if (splitBy === "char") {
          return (
            <span key={wordIdx} className="inline-block whitespace-nowrap">
              {word
                .split("")
                .map((char, charIdx) =>
                  renderLayeredStack(char, \`\${wordIdx}-\${charIdx}\`)
                )}
            </span>
          )
        }

        return renderLayeredStack(word, wordIdx)
      })
    }

    const Component = as as any

    return (
      <div ref={triggerRef} className="relative w-full">
        <Component
          ref={containerRef}
          aria-label={text.replace(/\\n/g, " ")}
          className={cn("relative m-0 text-left", className)}
          {...props}
        >
          <span
            aria-hidden="true"
            className="flex flex-wrap whitespace-pre-wrap"
          >
            {renderContent()}
          </span>
        </Component>
      </div>
    )
  }
)

MultiColorTrailReveal.displayName = "MultiColorTrailReveal"
`

export const multiColorTrailRevealFile = {
  "multi-color-trail-reveal.tsx": {
    code: multiColorTrailRevealString,
    language: "tsx",
  },
}
