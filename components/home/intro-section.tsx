"use client"

import { cn } from "@/lib/utils"
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

  // KILL-SWITCH: Stores active color sweeps to abort them safely mid-scroll
  const colorTimelineRef = useRef<gsap.core.Timeline | null>(null)

  const paragraphs = [
    "Satisium UI is a collection of meticulously crafted components, blocks, and templates by Satisium.",
    "Fully compatible with shadcn/ui themes. Simply copy the code, drop it into your Shadcn project, and watch it work flawlessly.",
    "The entire library is open-source. Explore, modify, contribute, and build.",
  ]

  const trailColors = [
    "text-red-500/60",
    "text-orange-500/80",
    "text-yellow-400/90",
  ]
  const finalClassName = "text-foreground"
  const mutedClassName = "text-muted-foreground/15"

  useGSAP(
    () => {
      const paras = gsap.utils.toArray<HTMLElement>(".para-item")
      if (!paras.length) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          isMobile: "(max-width: 768px)",
          isDesktop: "(min-width: 769px)",
        },
        (context) => {
          const { isMobile } = context.conditions as { isMobile: boolean }

          // 3D GEOMETRY: Tighter radius on mobile to perfectly hug the screen
          const RADIUS = isMobile ? 320 : 500
          const ANGLE_STEP = 40

          gsap.set(".cylinder", {
            z: -RADIUS,
            transformStyle: "preserve-3d",
          })

          paras.forEach((para, i) => {
            gsap.set(para, {
              transform: `rotateX(${-i * ANGLE_STEP}deg) translateZ(${RADIUS}px)`,
              backfaceVisibility: "hidden",
            })
          })

          gsap.set(".trail-layer", { opacity: 0 })

          const totalLayers = trailColors.length + 1
          const baseStagger = 0.02
          const animDuration = baseStagger * 8

          // ========================================================
          // THE MASTER CONTROLLER
          // ========================================================
          const rollCylinder = (newIndex: number) => {
            if (newIndex === activeIndex.current) return
            activeIndex.current = newIndex

            // 1. KILL-SWITCH: Abort color sweep on rapid scroll
            if (colorTimelineRef.current) {
              colorTimelineRef.current.kill()
            }

            // 2. THE ROLL
            gsap.to(".cylinder", {
              rotateX: newIndex * ANGLE_STEP,
              duration: 1.2,
              ease: "power3.inOut",
              overwrite: "auto",
            })

            // 3. THE EXIT STRATEGY (Delayed Mute)
            paras.forEach((_, i) => {
              if (i !== newIndex) {
                gsap.to(`.para-${i}-layer`, {
                  opacity: 0,
                  duration: 0.4,
                  delay: 0.15, // Wait for movement to start before fading
                  ease: "power2.out",
                  overwrite: "auto",
                })
              }
            })

            // 4. THE ENTER STRATEGY (Color Sweep)
            const sweepTl = gsap.timeline({
              delay: 0.7, // Wait for paragraph to settle center-stage
            })

            colorTimelineRef.current = sweepTl

            for (let i = 0; i < totalLayers; i++) {
              const layerDelay = i * 0.15
              sweepTl.to(
                `.para-${newIndex}-layer-${i}`,
                {
                  opacity: 1,
                  ease: "power1.inOut",
                  stagger: baseStagger,
                  duration: animDuration,
                  force3D: true,
                },
                layerDelay
              )
            }
          }

          // ========================================================
          // SCROLL TRIGGERS
          // ========================================================

          // First Encounter Reward
          ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top 55%",
            onEnter: () => {
              if (!hasRevealedFirst.current && activeIndex.current === 0) {
                hasRevealedFirst.current = true
                const sweepTl = gsap.timeline()
                colorTimelineRef.current = sweepTl
                for (let i = 0; i < totalLayers; i++) {
                  sweepTl.to(
                    `.para-0-layer-${i}`,
                    {
                      opacity: 1,
                      ease: "power1.inOut",
                      stagger: baseStagger,
                      duration: animDuration,
                      force3D: true,
                    },
                    i * 0.15
                  )
                }
              }
            },
          })

          // Teleprompter Scroller
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
        }
      )
    },
    { scope: containerRef, dependencies: [] }
  )

  // ==========================================================
  // DOM LOGIC
  // ==========================================================
  const renderLayeredStack = (content: string, pIdx: number, key: string) => (
    <span
      key={key}
      className="relative inline-grid whitespace-pre-wrap [grid-template-areas:'stack']"
    >
      <span className={cn("[grid-area:stack]", mutedClassName)}>{content}</span>

      {trailColors.map((colorClass, layerIdx) => (
        <span
          key={`trail-${layerIdx}`}
          className={cn(
            `trail-layer para-${pIdx}-layer para-${pIdx}-layer-${layerIdx} opacity-0 [grid-area:stack]`,
            colorClass
          )}
          style={{ willChange: "opacity", transform: "translateZ(0)" }}
        >
          {content}
        </span>
      ))}

      <span
        className={cn(
          `trail-layer para-${pIdx}-layer para-${pIdx}-layer-${trailColors.length} opacity-0 [grid-area:stack]`,
          finalClassName
        )}
        style={{ willChange: "opacity", transform: "translateZ(0)" }}
      >
        {content}
      </span>
    </span>
  )

  const renderContent = (text: string, pIdx: number) => {
    const tokens = text.split(/(\s+)/)
    return tokens.map((token, tokenIdx) => {
      if (/\s+/.test(token)) {
        return (
          <span key={tokenIdx} className="whitespace-pre">
            {token}
          </span>
        )
      }
      return (
        <span key={tokenIdx} className="inline-block whitespace-nowrap">
          {token
            .split("")
            .map((char, charIdx) =>
              renderLayeredStack(char, pIdx, `${tokenIdx}-${charIdx}`)
            )}
        </span>
      )
    })
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-muted"
      // UX FIX: Dynamic track height based on golden ratio of 50vh per slide.
      style={{ height: `calc(100vh + ${paragraphs.length * 50}vh)` }}
    >
      <div
        className="sticky top-0 left-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden"
        style={{
          perspective: "1000px",
          WebkitFontSmoothing: "antialiased",
          backfaceVisibility: "hidden",
        }}
      >
        <div className="cylinder relative flex h-0 w-full items-center justify-center">
          {(paragraphs || []).map((text, i) => (
            <h2
              key={`para-${i}`}
              // DESIGN FIX: Tighter padding, bumped text size to 2xl, tightened leading and tracking for a dense, premium block
              className="para-item absolute m-0 w-full max-w-4xl px-4 text-center font-heading text-2xl leading-[1.3] font-medium tracking-tight sm:text-3xl md:px-12 md:text-4xl md:leading-[1.4] lg:text-5xl"
            >
              {renderContent(text, i)}
            </h2>
          ))}
        </div>
      </div>
    </section>
  )
}
