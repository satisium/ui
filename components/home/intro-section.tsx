"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useRef } from "react"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function IntroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeIndex = useRef<number>(0)
  const hasRevealedFirst = useRef<boolean>(false)

  // KILL-SWITCH for aborting color sweeps on rapid scroll
  const colorTimelineRef = useRef<gsap.core.Timeline | null>(null)

  const paragraphs = [
    "Satisium UI is a collection of meticulously crafted components, blocks, and templates by Satisium.",
    "Fully compatible with shadcn/ui themes. Simply copy the code, drop it into your Shadcn project, and watch it work flawlessly.",
    "The entire library is open-source. Explore, modify, contribute, and build.",
  ]

  const trailColors = [
    "text-red-500/80",
    "text-orange-500/90",
    "text-yellow-400",
    "text-foreground", // Resolves perfectly to your theme's off-black/white
  ]

  useGSAP(
    () => {
      const paras = gsap.utils.toArray<HTMLElement>(".para-item")
      if (!paras.length) return

      const ANGLE_STEP = 40

      // ========================================================
      // THE MASTER CONTROLLER
      // ========================================================
      const rollCylinder = (newIndex: number) => {
        if (newIndex === activeIndex.current) return
        activeIndex.current = newIndex

        // 1. ABORT PREVIOUS SWEEP
        if (colorTimelineRef.current) {
          colorTimelineRef.current.kill()
        }

        const tl = gsap.timeline()
        colorTimelineRef.current = tl

        // 2. THE 3D ROTATION (GSAP only animates rotation now, avoiding layout recalculations)
        tl.to(
          ".cylinder",
          {
            rotateX: newIndex * ANGLE_STEP,
            duration: 1.2,
            ease: "power3.inOut",
            overwrite: "auto",
          },
          0
        )

        // 3. RAPID EXIT STRATEGY (Fade out previous layers elegantly)
        paras.forEach((_, i) => {
          if (i !== newIndex) {
            gsap.to(`.para-${i}-layer`, {
              opacity: 0,
              duration: 0.2,
              ease: "power2.out",
              overwrite: "auto",
            })
          }
        })

        // 4. THE GPU-ACCELERATED OPACITY SWEEP
        const baseDelay = 0.4
        const wordStagger = 0.05
        const layerOffset = 0.12

        trailColors.forEach((_, layerIdx) => {
          tl.to(
            `.para-${newIndex}-color-${layerIdx}`,
            {
              opacity: 1,
              duration: 0.4,
              stagger: wordStagger,
              ease: "power1.inOut",
            },
            baseDelay + layerIdx * layerOffset
          )
        })
      }

      // ========================================================
      // SCROLL TRIGGERS
      // ========================================================
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 55%",
        onEnter: () => {
          // Play the initial sweep only once
          if (!hasRevealedFirst.current && activeIndex.current === 0) {
            hasRevealedFirst.current = true

            if (colorTimelineRef.current) colorTimelineRef.current.kill()
            const sweepTl = gsap.timeline()
            colorTimelineRef.current = sweepTl

            const wordStagger = 0.05
            const layerOffset = 0.12

            trailColors.forEach((_, layerIdx) => {
              sweepTl.to(
                `.para-0-color-${layerIdx}`,
                {
                  opacity: 1,
                  duration: 0.4,
                  stagger: wordStagger,
                  ease: "power1.inOut",
                },
                layerIdx * layerOffset
              )
            })
          }
        },
      })

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const progress = self.progress
          const total = paras.length
          let idx = Math.floor(progress * total)
          if (idx >= total) idx = total - 1
          rollCylinder(idx)
        },
      })
    },
    { scope: containerRef, dependencies: [] }
  )

  // ==========================================================
  // DOM LOGIC: Word-level stacking (Zero Layout Shifts)
  // ==========================================================
  const renderWord = (word: string, pIdx: number, wIdx: number) => (
    <span key={wIdx} className="relative inline-block whitespace-nowrap">
      {/* Base Layer: Always visible muted text providing the DOM structure natively on SSR */}
      <span className="text-muted-foreground/15">{word}</span>

      {/* Absolute Layers: The overlapping chromatic colors (Hidden on load via opacity-0) */}
      {trailColors.map((colorClass, layerIdx) => (
        <span
          key={`trail-${layerIdx}`}
          className={`para-${pIdx}-layer para-${pIdx}-color-${layerIdx} absolute top-0 left-0 opacity-0 ${colorClass}`}
        >
          {word}
        </span>
      ))}
    </span>
  )

  const renderContent = (text: string, pIdx: number) => {
    const tokens = text.split(/(\s+)/)
    return tokens.map((token, idx) => {
      if (/\s+/.test(token)) {
        return <span key={idx}>{token}</span>
      }
      return renderWord(token, pIdx, idx)
    })
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-muted"
      style={{ height: `calc(100vh + ${paragraphs.length * 50}vh)` }}
    >
      {/* 
        THE CSS 3D ENGINE 
        By rendering these variables in a style tag, the server pre-calculates 
        the geometry. The HTML arrives at the browser already structured in 3D.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .intro-3d-scene { --scene-radius: 320px; }
          @media (min-width: 768px) { .intro-3d-scene { --scene-radius: 500px; } }
        `,
        }}
      />

      <div
        className="intro-3d-scene sticky top-0 left-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden"
        style={{ perspective: "1000px" }}
      >
        {/* 
          WRAPPER 1: Z-Depth
          Pushes the entire 3D context away from the camera. 
          Isolated from GSAP so the variable isn't overwritten.
        */}
        <div
          className="relative flex w-full items-center justify-center"
          style={{
            transform: "translateZ(calc(-1 * var(--scene-radius)))",
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
          }}
        >
          {/* 
            WRAPPER 2: The Rotation Engine
            GSAP spins this specific element seamlessly on the X-axis.
          */}
          <div
            className="cylinder relative flex w-full items-center justify-center will-change-transform"
            style={{
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
            }}
          >
            {paragraphs.map((text, i) => (
              <h2
                key={`para-${i}`}
                className="para-item absolute m-0 w-full max-w-4xl px-4 text-center font-heading text-2xl leading-[1.3] font-medium tracking-tight sm:text-3xl md:px-12 md:text-4xl md:leading-[1.4] lg:text-5xl"
                style={{
                  // The items are pre-rotated and pushed back out toward the camera by the exact radius.
                  transform: `rotateX(${-i * 40}deg) translateZ(var(--scene-radius))`,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {renderContent(text, i)}
              </h2>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
