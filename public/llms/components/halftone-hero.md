# Halftone Hero Component Context

**Description:** An interactive Canvas 2D component that maps an image into highly detailed, physics-based vertical halftone strings that react to the cursor.

## 1. Installation

To add this component to a project, run:

```bash
npx satis-ui add halftone-hero
```

**Dependencies installed:** `clsx`, `tailwind-merge`.

## 2. Props API

| Prop               | Type        | Default | Description                                                         |
| :----------------- | :---------- | :------ | :------------------------------------------------------------------ |
| `imageUrl`         | `string`    | —       | The source URL of the image to display.                             |
| `lines`            | `number`    | `140`   | Number of vertical halftone lines. Higher = more detail.            |
| `pointsPerLine`    | `number`    | `250`   | Vertical resolution points per line. Higher = smoother wave curves. |
| `maxLineThickness` | `number`    | `0.85`  | Max thickness multiplier of the lines relative to their spacing.    |
| `contrast`         | `number`    | `1.4`   | Contrast curve for the thickness. Higher = darker shadows.          |
| `hoverRadius`      | `number`    | `80`    | Radius of the mouse interaction in pixels.                          |
| `mouseForce`       | `number`    | `0.1`   | Force applied by the mouse to push the lines.                       |
| `stiffness`        | `number`    | `0.015` | Spring stiffness (tendency to return to origin).                    |
| `friction`         | `number`    | `0.92`  | Velocity damping/friction (how quickly it settles).                 |
| `tension`          | `number`    | `0.25`  | Tension between vertical points on the same line.                   |
| `fallback`         | `ReactNode` | `null`  | Optional fallback UI rendered via Suspense while media loads.       |
| `className`        | `string`    | `""`    | Optional standard Tailwind classes for the wrapper.                 |

## 3. Core Component Source

**File Path:** `components/ui/halftone-hero.tsx`

```tsx
"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

export interface HalftoneHeroProps {
  imageUrl: string
  lines?: number
  pointsPerLine?: number
  maxLineThickness?: number
  contrast?: number
  hoverRadius?: number
  mouseForce?: number
  stiffness?: number
  friction?: number
  tension?: number
  className?: string
  fallback?: React.ReactNode
}

export default function HalftoneHero({
  imageUrl,
  lines = 140,
  pointsPerLine = 250,
  maxLineThickness = 0.85,
  contrast = 1.4,
  hoverRadius = 80,
  mouseForce = 0.1,
  stiffness = 0.015,
  friction = 0.92,
  tension = 0.25,
  className,
  fallback,
}: HalftoneHeroProps) {
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
    prevX: -1000,
    prevY: -1000,
    vx: 0,
    vy: 0,
    radius: hoverRadius,
    isActive: false,
  })

  const config = useRef({ maxLineThickness, contrast, mouseForce, stiffness, friction, tension })
  useEffect(() => {
    config.current = { maxLineThickness, contrast, mouseForce, stiffness, friction, tension }
    mouse.current.radius = hoverRadius * (window.devicePixelRatio || 1)
  }, [maxLineThickness, contrast, hoverRadius, mouseForce, stiffness, friction, tension])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext("2d")
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
        if (isComponentMounted) setHasError(true)
      }
    }

    const prepareAndDraw = () => {
      const img = imageElementRef.current
      if (!img || !stateRef.current) return

      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      const width = Math.floor(rect.width * dpr)
      const height = Math.floor(rect.height * dpr)

      if (width === 0 || height === 0) return

      canvas.width = width
      canvas.height = height

      themeColor.current = getComputedStyle(container).color
      mouse.current.radius = hoverRadius * dpr

      const hiddenCanvas = document.createElement("canvas")
      hiddenCanvas.width = width
      hiddenCanvas.height = height
      const hiddenCtx = hiddenCanvas.getContext("2d", { willReadFrequently: true })
      if (!hiddenCtx) return

      const scale = Math.max(width / img.width, height / img.height)
      const scaledW = img.width * scale
      const scaledH = img.height * scale
      const dx = (width - scaledW) / 2
      const dy = (height - scaledH) / 2

      hiddenCtx.clearRect(0, 0, width, height)
      hiddenCtx.drawImage(img, dx, dy, scaledW, scaledH)
      const { data } = hiddenCtx.getImageData(0, 0, width, height)

      const segmentWidth = width / lines
      const segmentHeight = height / pointsPerLine
      const maxThick = segmentWidth * config.current.maxLineThickness
      const state = stateRef.current

      for (let i = 0; i < lines; i++) {
        const centerX = i * segmentWidth + segmentWidth / 2
        for (let j = 0; j <= pointsPerLine; j++) {
          const px = Math.floor(Math.min(Math.max(centerX, 0), width - 1))
          const py = Math.floor(Math.min(Math.max(j * segmentHeight, 0), height - 1))

          const idx = (py * width + px) * 4
          const r = data[idx]
          const g = data[idx + 1]
          const b = data[idx + 2]
          const a = data[idx + 3] / 255

          const effectiveR = r * a + 255 * (1 - a)
          const effectiveG = g * a + 255 * (1 - a)
          const effectiveB = b * a + 255 * (1 - a)

          const luminance = (0.299 * effectiveR + 0.587 * effectiveG + 0.114 * effectiveB) / 255
          state[i * (pointsPerLine + 1) + j] = maxThick * (1 - Math.pow(luminance, config.current.contrast))
        }
      }

      setIsLoading(false)
      cancelAnimationFrame(rafId.current)
      renderLoop()
    }

    const renderLoop = () => {
      const width = canvas.width
      const height = canvas.height

      ctx!.clearRect(0, 0, width, height)
      ctx!.fillStyle = themeColor.current

      if (mouse.current.isActive) {
        mouse.current.vx = mouse.current.x - mouse.current.prevX
        mouse.current.vy = mouse.current.y - mouse.current.prevY
        mouse.current.prevX = mouse.current.x
        mouse.current.prevY = mouse.current.y
      } else {
        mouse.current.vx = 0
        mouse.current.vy = 0
      }

      const stateA = stateRef.current
      const disp = displacements.current
      const vel = velocities.current

      if (!stateA || !disp || !vel) return

      const segmentWidth = width / lines
      const segmentHeight = height / pointsPerLine
      const currentConfig = config.current

      for (let i = 0; i < lines; i++) {
        const centerX = i * segmentWidth + segmentWidth / 2
        const offset = i * (pointsPerLine + 1)

        for (let j = 1; j <= pointsPerLine; j++) {
          const idx = offset + j
          const y = j * segmentHeight

          if (mouse.current.isActive && Math.abs(mouse.current.vx) > 0.5) {
            const nodeX = centerX + disp[idx]
            const dx = nodeX - mouse.current.x
            const dy = y - mouse.current.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < mouse.current.radius) {
              const force = (mouse.current.radius - distance) / mouse.current.radius
              vel[idx] += mouse.current.vx * force * currentConfig.mouseForce
            }
          }

          vel[idx] -= disp[idx] * currentConfig.stiffness
          vel[idx] *= currentConfig.friction
        }

        for (let j = 1; j < pointsPerLine; j++) {
          const idx = offset + j
          const pullFromAbove = disp[idx - 1] - disp[idx]
          const pullFromBelow = disp[idx + 1] - disp[idx]
          vel[idx] += (pullFromAbove + pullFromBelow) * currentConfig.tension
        }

        for (let j = 1; j <= pointsPerLine; j++) {
          disp[offset + j] += vel[offset + j]
        }
      }

      for (let i = 0; i < lines; i++) {
        const centerX = i * segmentWidth + segmentWidth / 2
        const offset = i * (pointsPerLine + 1)

        ctx!.beginPath()

        for (let j = 0; j <= pointsPerLine; j++) {
          const idx = offset + j
          const x = centerX + disp[idx] - stateA[idx] / 2
          ctx!.lineTo(x, j * segmentHeight)
        }

        for (let j = pointsPerLine; j >= 0; j--) {
          const idx = offset + j
          const x = centerX + disp[idx] + stateA[idx] / 2
          ctx!.lineTo(x, j * segmentHeight)
        }

        ctx!.closePath()
        ctx!.fill()
      }

      rafId.current = requestAnimationFrame(renderLoop)
    }

    loadImage()

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
  }, [imageUrl, lines, pointsPerLine])

  const handlePointerEnter = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const dpr = window.devicePixelRatio || 1
    mouse.current.isActive = true
    mouse.current.x = (e.clientX - rect.left) * dpr
    mouse.current.y = (e.clientY - rect.top) * dpr
    mouse.current.prevX = mouse.current.x
    mouse.current.prevY = mouse.current.y
  }

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const dpr = window.devicePixelRatio || 1
    mouse.current.x = (e.clientX - rect.left) * dpr
    mouse.current.y = (e.clientY - rect.top) * dpr
  }, [])

  const handlePointerLeave = () => {
    mouse.current.isActive = false
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative h-full w-full cursor-crosshair overflow-hidden bg-background text-foreground",
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
          "absolute inset-0 h-full w-full transition-opacity duration-1000",
          isLoading || hasError ? "opacity-0" : "opacity-100"
        )}
      />
    </div>
  )
}
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import HalftoneHero from "@/components/ui/halftone-hero"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function ExamplePage() {
  return (
    <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl border">
      <HalftoneHero
        imageUrl="https://res.cloudinary.com/ddon6aux0/image/upload/f_auto,q_auto/v1782017462/ui-v3/demos/images/2.jpg"
        lines={160}
        pointsPerLine={300}
        maxLineThickness={0.9}
        contrast={1.6}
        hoverRadius={200}
        stiffness={0.012}
        className="dark:bg-foreground dark:text-background"
        fallback={
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <HugeiconsIcon icon={Loading03Icon} className="h-6 w-6 animate-spin" />
            <span className="text-sm font-medium tracking-wide">
              Rendering Halftone...
            </span>
          </div>
        }
      />
    </div>
  )
}
```
