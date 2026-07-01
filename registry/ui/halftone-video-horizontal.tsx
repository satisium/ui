"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

export interface HalftoneVideoHorizontalProps {
  /** The URL of the video to display */
  videoUrl: string
  /** Number of horizontal rows. Higher = more vertical detail. @default 80 */
  lines?: number
  /** Resolution points across each line. Higher = smoother curves. @default 160 */
  pointsPerLine?: number
  /** Max thickness multiplier of the lines relative to their vertical spacing. @default 0.85 */
  maxLineThickness?: number
  /** Contrast curve for the thickness. Higher = darker shadows. @default 1.4 */
  contrast?: number
  /** Radius of the mouse interaction in pixels. @default 120 */
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
  /** Fallback UI to show while the video buffers */
  fallback?: React.ReactNode
}

const BLEED = 120

export default function HalftoneVideoHorizontal({
  videoUrl,
  lines = 80,
  pointsPerLine = 160,
  maxLineThickness = 0.85,
  contrast = 1.4,
  hoverRadius = 120,
  mouseForce = 0.15,
  stiffness = 0.015,
  friction = 0.92,
  tension = 0.25,
  className,
  fallback,
}: HalftoneVideoHorizontalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const thicknesses = useRef<Float32Array | null>(null)
  const displacements = useRef<Float32Array | null>(null)
  const velocities = useRef<Float32Array | null>(null)

  const themeColor = useRef("#111111")
  const rafId = useRef<number>(0)
  const videoRafId = useRef<number>(0)
  const enginesStarted = useRef(false)

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

  const luminanceMap = useRef(new Float32Array(256))
  const config = useRef({
    maxLineThickness,
    mouseForce,
    stiffness,
    friction,
    tension,
  })

  // Instantly sync physics and contrast changes to the render loops without rebuilding the canvas
  useEffect(() => {
    config.current = {
      maxLineThickness,
      mouseForce,
      stiffness,
      friction,
      tension,
    }
    for (let i = 0; i < 256; i++) {
      luminanceMap.current[i] = 1 - Math.pow(i / 255, contrast)
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

    let isDestroyed = false
    const totalNodes = lines * (pointsPerLine + 1)

    thicknesses.current = new Float32Array(totalNodes)
    displacements.current = new Float32Array(totalNodes)
    velocities.current = new Float32Array(totalNodes)

    // 1. SETUP MICRO-CANVAS
    const hiddenW = pointsPerLine + 1
    const hiddenH = lines
    const hiddenCanvas = document.createElement("canvas")
    hiddenCanvas.width = hiddenW
    hiddenCanvas.height = hiddenH
    const hiddenCtx = hiddenCanvas.getContext("2d", {
      willReadFrequently: true,
    })
    if (!hiddenCtx) return

    // 2. SETUP HARDWARE VIDEO
    const video = document.createElement("video")
    video.crossOrigin = "anonymous"
    video.muted = true
    video.playsInline = true
    video.loop = true
    video.autoplay = true

    video.onerror = () => {
      setHasError(true)
      setIsLoading(false)
    }

    video.oncanplay = () => {
      if (!enginesStarted.current && !isDestroyed) {
        enginesStarted.current = true
        setIsLoading(false)
        video.play().catch(() => console.log("Autoplay blocked."))
        startEngines()
      }
    }

    video.src = videoUrl

    // 3. VIDEO FRAME EXTRACTION LOOP
    const processVideoFrame = () => {
      if (
        isDestroyed ||
        video.paused ||
        video.ended ||
        !video.videoWidth ||
        !thicknesses.current
      )
        return

      const dpr = window.devicePixelRatio || 1
      const bleedPx = BLEED * dpr

      const cW = canvas.width - bleedPx * 2
      const cH = canvas.height - bleedPx * 2

      if (cW <= 0 || cH <= 0) return

      const vW = video.videoWidth
      const vH = video.videoHeight

      const physicalScale = Math.max(cW / vW, cH / vH)
      const physDrawW = vW * physicalScale
      const physDrawH = vH * physicalScale
      const physDrawX = (cW - physDrawW) / 2
      const physDrawY = (cH - physDrawH) / 2

      const mapX = hiddenW / cW
      const mapY = hiddenH / cH

      hiddenCtx.clearRect(0, 0, hiddenW, hiddenH)
      hiddenCtx.drawImage(
        video,
        physDrawX * mapX,
        physDrawY * mapY,
        physDrawW * mapX,
        physDrawH * mapY
      )

      const { data } = hiddenCtx.getImageData(0, 0, hiddenW, hiddenH)
      const maxThick = (cH / lines) * config.current.maxLineThickness
      const map = luminanceMap.current
      const thick = thicknesses.current

      // Map perfectly to i (row) and j (col)
      for (let i = 0; i < hiddenH; i++) {
        for (let j = 0; j < hiddenW; j++) {
          const idx = (i * hiddenW + j) * 4
          const r = data[idx],
            g = data[idx + 1],
            b = data[idx + 2],
            a = data[idx + 3] / 255

          const effectiveR = r * a + 255 * (1 - a)
          const effectiveG = g * a + 255 * (1 - a)
          const effectiveB = b * a + 255 * (1 - a)

          const luminanceInt = Math.floor(
            0.299 * effectiveR + 0.587 * effectiveG + 0.114 * effectiveB
          )

          thick[i * hiddenW + j] = maxThick * map[luminanceInt]
        }
      }

      if ("requestVideoFrameCallback" in video) {
        videoRafId.current = (video as any).requestVideoFrameCallback(
          processVideoFrame
        )
      } else {
        videoRafId.current = requestAnimationFrame(processVideoFrame)
      }
    }

    // 4. THE PHYSICS & RENDER LOOP
    const renderLoop = () => {
      if (isDestroyed) return

      const dpr = window.devicePixelRatio || 1
      const bleedPx = BLEED * dpr
      const cW = canvas.width - bleedPx * 2
      const cH = canvas.height - bleedPx * 2

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.translate(bleedPx, bleedPx)
      ctx.fillStyle = themeColor.current

      // Smooth Mouse Lerping
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

      const segmentWidth = cW / pointsPerLine
      const segmentHeight = cH / lines
      const disp = displacements.current
      const vel = velocities.current
      const thick = thicknesses.current
      const radiusSq = mouse.current.radius * mouse.current.radius
      const currentConfig = config.current

      if (!disp || !vel || !thick) {
        ctx.restore()
        return
      }

      // PHYSICS
      for (let i = 0; i < lines; i++) {
        const centerY = i * segmentHeight + segmentHeight / 2
        const offset = i * (pointsPerLine + 1)

        for (let j = 1; j < pointsPerLine; j++) {
          const idx = offset + j
          const x = j * segmentWidth

          // FAST MOUSE STRIKE
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

        // TENSION
        for (let j = 1; j < pointsPerLine; j++) {
          const idx = offset + j
          const pullFromLeft = disp[idx - 1] - disp[idx]
          const pullFromRight = disp[idx + 1] - disp[idx]
          vel[idx] += (pullFromLeft + pullFromRight) * currentConfig.tension
        }

        // APPLY VELOCITY
        for (let j = 1; j < pointsPerLine; j++) {
          disp[offset + j] += vel[offset + j]
        }
      }

      // RENDER
      for (let i = 0; i < lines; i++) {
        const centerY = i * segmentHeight + segmentHeight / 2
        const offset = i * (pointsPerLine + 1)

        ctx.beginPath()
        for (let j = 0; j <= pointsPerLine; j++) {
          const idx = offset + j
          ctx.lineTo(j * segmentWidth, centerY + disp[idx] - thick[idx] / 2)
        }

        for (let j = pointsPerLine; j >= 0; j--) {
          const idx = offset + j
          ctx.lineTo(j * segmentWidth, centerY + disp[idx] + thick[idx] / 2)
        }

        ctx.closePath()
        ctx.fill()
      }

      ctx.restore()
      rafId.current = requestAnimationFrame(renderLoop)
    }

    const startEngines = () => {
      handleResize()
      if ("requestVideoFrameCallback" in video) {
        videoRafId.current = (video as any).requestVideoFrameCallback(
          processVideoFrame
        )
      } else {
        processVideoFrame()
      }
      renderLoop()
    }

    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.width = Math.floor(rect.width * dpr) + BLEED * 2 * dpr
      canvas.height = Math.floor(rect.height * dpr) + BLEED * 2 * dpr
      themeColor.current = getComputedStyle(container).color
      mouse.current.radius = hoverRadius * dpr
    }

    // SCROLL-RESET FIX: Only trigger rebuild if the physical WIDTH changes
    let lastWidth = window.innerWidth
    const resizeObserver = new ResizeObserver(() => {
      if (Math.abs(window.innerWidth - lastWidth) > 10) {
        lastWidth = window.innerWidth
        handleResize()
      }
    })

    resizeObserver.observe(container)

    return () => {
      isDestroyed = true
      enginesStarted.current = false
      video.pause()
      video.removeAttribute("src")
      video.load()
      resizeObserver.disconnect()
      cancelAnimationFrame(rafId.current)
      if ("cancelVideoFrameCallback" in video) {
        ;(video as any).cancelVideoFrameCallback(videoRafId.current)
      } else {
        cancelAnimationFrame(videoRafId.current)
      }
    }
  }, [videoUrl, lines, pointsPerLine]) // Structural changes force a rebuild

  // UNIFIED POINTER EVENTS
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
        <div className="absolute inset-0 z-10 flex items-center justify-center text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {fallback || "Buffering Stream..."}
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-center text-xs font-medium tracking-widest text-destructive uppercase">
          Failed to load video stream.
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
