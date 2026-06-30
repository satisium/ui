"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

export interface HalftoneHorizontalProps {
  /** The URL of the image to display */
  imageUrl: string
  /** Number of horizontal lines (rows). Higher = more vertical detail. @default 90 */
  lines?: number
  /** Resolution points across each line. Higher = smoother horizontal curves. @default 180 */
  pointsPerLine?: number
  /** Max thickness multiplier of the lines relative to their vertical spacing. @default 0.85 */
  maxLineThickness?: number
  /** Contrast curve for the thickness. Higher = darker shadows. @default 1.4 */
  contrast?: number
  /** Radius of the mouse interaction in pixels. @default 180 */
  hoverRadius?: number
  /** Force applied by the mouse Y-velocity to push the strings. @default 0.15 */
  mouseForce?: number
  /** Spring stiffness (tendency to return to horizontal origin). @default 0.015 */
  stiffness?: number
  /** Velocity damping/friction (how quickly it settles). @default 0.92 */
  friction?: number
  /** Tension between horizontal points on the same string. @default 0.25 */
  tension?: number
  /** Optional standard Tailwind classes for the wrapper */
  className?: string
  /** Fallback UI to show while the image is loading */
  fallback?: React.ReactNode
}

const BLEED = 120

export default function HalftoneHorizontal({
  imageUrl,
  lines = 90,
  pointsPerLine = 180,
  maxLineThickness = 0.85,
  contrast = 1.4,
  hoverRadius = 180,
  mouseForce = 0.15,
  stiffness = 0.015,
  friction = 0.92,
  tension = 0.25,
  className,
  fallback,
}: HalftoneHorizontalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const imageElementRef = useRef<HTMLImageElement | null>(null)
  const stateRef = useRef<Float32Array | null>(null)
  const rafId = useRef<number>(0)
  const themeColor = useRef("#111111")

  const displacements = useRef<Float32Array | null>(null)
  const velocities = useRef<Float32Array | null>(null)

  const mouse = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    prevX: -1000,
    prevY: -1000,
    vx: 0,
    vy: 0,
    radius: hoverRadius,
    isActive: false,
  })

  // Sync prop updates to refs so the RAF loop always has the latest physics without resetting
  const config = useRef({
    maxLineThickness,
    contrast,
    mouseForce,
    stiffness,
    friction,
    tension,
  })
  useEffect(() => {
    config.current = {
      maxLineThickness,
      contrast,
      mouseForce,
      stiffness,
      friction,
      tension,
    }
    mouse.current.radius = hoverRadius * (window.devicePixelRatio || 1)
  }, [
    maxLineThickness,
    contrast,
    hoverRadius,
    mouseForce,
    stiffness,
    friction,
    tension,
  ])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    let isComponentMounted = true
    const totalNodes = lines * (pointsPerLine + 1)

    displacements.current = new Float32Array(totalNodes)
    velocities.current = new Float32Array(totalNodes)
    stateRef.current = new Float32Array(totalNodes)

    const loadImage = async () => {
      try {
        setIsLoading(true)
        setHasError(false)

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = imageUrl

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error("Image load failed"))
        })

        if (isComponentMounted) {
          imageElementRef.current = img
          prepareAndDraw()
        }
      } catch (err) {
        console.error("Halftone component image load error:", err)
        if (isComponentMounted) setHasError(true)
      }
    }

    const prepareAndDraw = () => {
      const img = imageElementRef.current
      if (!img || !stateRef.current) return

      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const bleedPx = BLEED * dpr

      const cW = Math.floor(rect.width * dpr)
      const cH = Math.floor(rect.height * dpr)

      if (cW === 0 || cH === 0) return

      // Expand canvas size to account for the bleed area (allows strings to stretch outside bounds)
      canvas.width = cW + bleedPx * 2
      canvas.height = cH + bleedPx * 2
      themeColor.current = getComputedStyle(container).color
      mouse.current.radius = hoverRadius * dpr

      // 1-Time Extraction Micro-Canvas (1 pixel per node)
      const hiddenW = pointsPerLine + 1
      const hiddenH = lines
      const hiddenCanvas = document.createElement("canvas")
      hiddenCanvas.width = hiddenW
      hiddenCanvas.height = hiddenH
      const hiddenCtx = hiddenCanvas.getContext("2d", {
        willReadFrequently: true,
      })
      if (!hiddenCtx) return

      // Scale Image to Cover
      const physicalScale = Math.max(cW / img.width, cH / img.height)
      const physDrawW = img.width * physicalScale
      const physDrawH = img.height * physicalScale
      const physDrawX = (cW - physDrawW) / 2
      const physDrawY = (cH - physDrawH) / 2

      const mapX = hiddenW / cW
      const mapY = hiddenH / cH

      hiddenCtx.clearRect(0, 0, hiddenW, hiddenH)
      hiddenCtx.drawImage(
        img,
        physDrawX * mapX,
        physDrawY * mapY,
        physDrawW * mapX,
        physDrawH * mapY
      )

      const { data } = hiddenCtx.getImageData(0, 0, hiddenW, hiddenH)
      const maxThickness = (cH / lines) * config.current.maxLineThickness
      const state = stateRef.current

      // Map pixels to thickness array once
      for (let i = 0; i < lines; i++) {
        for (let j = 0; j <= pointsPerLine; j++) {
          const idx = (i * hiddenW + j) * 4
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]
          const a = data[idx + 3] / 255

          const effectiveR = r * a + 255 * (1 - a)
          const effectiveG = g * a + 255 * (1 - a)
          const effectiveB = b * a + 255 * (1 - a)

          const luminance =
            (0.299 * effectiveR + 0.587 * effectiveG + 0.114 * effectiveB) / 255
          state[i * (pointsPerLine + 1) + j] =
            maxThickness * (1 - Math.pow(luminance, config.current.contrast))
        }
      }

      setIsLoading(false)
      cancelAnimationFrame(rafId.current)
      renderLoop()
    }

    const renderLoop = () => {
      const dpr = window.devicePixelRatio || 1
      const bleedPx = BLEED * dpr
      const cW = canvas.width - bleedPx * 2
      const cH = canvas.height - bleedPx * 2

      ctx!.clearRect(0, 0, canvas.width, canvas.height)
      ctx!.save()
      ctx!.translate(bleedPx, bleedPx) // Re-center drawing coordinates to ignore bleed area
      ctx!.fillStyle = themeColor.current

      // Smooth mouse tracking
      if (mouse.current.isActive) {
        mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.2
        mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.2
        mouse.current.vx = mouse.current.x - mouse.current.prevX
        mouse.current.vy = mouse.current.y - mouse.current.prevY
        mouse.current.prevX = mouse.current.x
        mouse.current.prevY = mouse.current.y
      } else {
        mouse.current.x += (-1000 - mouse.current.x) * 0.1
        mouse.current.y += (-1000 - mouse.current.y) * 0.1
        mouse.current.vx = 0
        mouse.current.vy = 0
      }

      const stateA = stateRef.current
      const disp = displacements.current
      const vel = velocities.current

      if (!stateA || !disp || !vel) {
        ctx!.restore()
        return
      }

      const segmentWidth = cW / pointsPerLine
      const segmentHeight = cH / lines
      const radiusSq = mouse.current.radius * mouse.current.radius
      const currentConfig = config.current

      // Physics Loop
      for (let i = 0; i < lines; i++) {
        const centerY = i * segmentHeight + segmentHeight / 2
        const offset = i * (pointsPerLine + 1)

        // Forces (Ends are pinned: j=1 to j<pointsPerLine)
        for (let j = 1; j < pointsPerLine; j++) {
          const idx = offset + j
          const x = j * segmentWidth

          if (mouse.current.isActive && Math.abs(mouse.current.vy) > 0.1) {
            const nodeY = centerY + disp[idx]
            const dx = x - mouse.current.x
            const dy = nodeY - mouse.current.y
            const distSq = dx * dx + dy * dy

            if (distSq < radiusSq) {
              const distance = Math.sqrt(distSq)
              const force =
                (mouse.current.radius - distance) / mouse.current.radius
              vel[idx] += mouse.current.vy * force * currentConfig.mouseForce
            }
          }

          vel[idx] -= disp[idx] * currentConfig.stiffness
          vel[idx] *= currentConfig.friction
          if (Math.abs(vel[idx]) < 0.001) vel[idx] = 0
        }

        // Tension Propagation
        for (let j = 1; j < pointsPerLine; j++) {
          const idx = offset + j
          const pullFromLeft = disp[idx - 1] - disp[idx]
          const pullFromRight = disp[idx + 1] - disp[idx]
          vel[idx] += (pullFromLeft + pullFromRight) * currentConfig.tension
        }

        // Apply velocity to displacement
        for (let j = 1; j < pointsPerLine; j++) {
          disp[offset + j] += vel[offset + j]
        }
      }

      // Render Loop
      for (let i = 0; i < lines; i++) {
        const centerY = i * segmentHeight + segmentHeight / 2
        const offset = i * (pointsPerLine + 1)

        ctx!.beginPath()

        // Top Edge (Left to Right)
        for (let j = 0; j <= pointsPerLine; j++) {
          const idx = offset + j
          const thickness = stateA[idx]
          ctx!.lineTo(j * segmentWidth, centerY + disp[idx] - thickness / 2)
        }

        // Bottom Edge (Right to Left)
        for (let j = pointsPerLine; j >= 0; j--) {
          const idx = offset + j
          const thickness = stateA[idx]
          ctx!.lineTo(j * segmentWidth, centerY + disp[idx] + thickness / 2)
        }

        ctx!.closePath()
        ctx!.fill()
      }

      ctx!.restore()
      rafId.current = requestAnimationFrame(renderLoop)
    }

    loadImage()

    // SCROLL-RESET FIX: Only trigger rebuild if the physical WIDTH changes.
    let lastWidth = window.innerWidth
    let timeoutId: NodeJS.Timeout
    const resizeObserver = new ResizeObserver(() => {
      if (Math.abs(window.innerWidth - lastWidth) > 10) {
        lastWidth = window.innerWidth
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          prepareAndDraw()
        }, 150)
      }
    })

    resizeObserver.observe(container)

    return () => {
      isComponentMounted = false
      resizeObserver.disconnect()
      clearTimeout(timeoutId)
      cancelAnimationFrame(rafId.current)
    }
  }, [imageUrl, lines, pointsPerLine]) // Structural changes force rebuild. Physics change via refs.

  const handlePointerEnter = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const dpr = window.devicePixelRatio || 1
    mouse.current.isActive = true
    mouse.current.x = (e.clientX - rect.left) * dpr
    mouse.current.y = (e.clientY - rect.top) * dpr
    mouse.current.targetX = mouse.current.x
    mouse.current.targetY = mouse.current.y
    mouse.current.prevX = mouse.current.x
    mouse.current.prevY = mouse.current.y
  }

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const dpr = window.devicePixelRatio || 1
    mouse.current.targetX = (e.clientX - rect.left) * dpr
    mouse.current.targetY = (e.clientY - rect.top) * dpr
  }, [])

  const handlePointerLeave = () => {
    mouse.current.isActive = false
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative h-full w-full cursor-crosshair overflow-visible bg-background text-foreground",
        className
      )}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {fallback || (
            <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Mapping Data...
            </span>
          )}
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-center text-xs font-medium tracking-widest text-destructive uppercase">
          Failed to load image.
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={cn(
          "pointer-events-none absolute transition-opacity duration-1000",
          isLoading || hasError ? "opacity-0" : "opacity-100"
        )}
        style={{
          top: -BLEED,
          left: -BLEED,
          width: `calc(100% + ${BLEED * 2}px)`,
          height: `calc(100% + ${BLEED * 2}px)`,
        }}
      />
    </div>
  )
}
