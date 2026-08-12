# Proximity Grid Component Context

**Description:** An interactive WebGL grid that zooms and rounds media cells dynamically based on cursor proximity.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/proximity-grid.json
```

**Dependencies installed:** `three`, `@react-three/fiber`, `@react-three/drei`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop              | Type                 | Default   | Description                                                                  |
| :---------------- | :------------------- | :-------- | :--------------------------------------------------------------------------- |
| `mediaUrl`        | `string`             | —         | The source URL of the media asset.                                           |
| `mediaType`       | `"image" \| "video"` | `"image"` | Defines the media type for correct texture processing.                       |
| `columns`         | `number`             | `18`      | Number of vertical grid columns.                                             |
| `rows`            | `number`             | `12`      | Number of horizontal grid rows.                                              |
| `hoverRadius`     | `number`             | `4.0`     | How many cells outward the ripple effect reaches.                            |
| `imageZoom`       | `number`             | `1.25`    | How much the image zooms in when the cell is hovered.                        |
| `cellRadius`      | `number`             | `0.45`    | Max border radius of a cell when hovered (0.0 to 0.5 relative to cell size). |
| `mouseLerpSpeed`  | `number`             | `2.5`     | Fluidity of the mouse tracking. Lower = heavier/slower drag.                 |
| `enterLeaveSpeed` | `number`             | `1.5`     | Speed at which the effect fades in/out when entering/leaving the canvas.     |
| `fallback`        | `ReactNode`          | `null`    | Optional fallback UI rendered via Suspense while media loads.                |

## 3. Core Component Source

**File Path:** `components/ui/proximity-grid.tsx`

```tsx
"use client"

import React, { useMemo, useRef, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, useTexture, useVideoTexture } from "@react-three/drei"
import * as THREE from "three"
import { cn } from "@/lib/utils"

export interface ProximityGridProps {
  mediaUrl: string
  mediaType?: "image" | "video"
  columns?: number
  rows?: number
  hoverRadius?: number
  imageZoom?: number
  cellRadius?: number
  mouseLerpSpeed?: number
  enterLeaveSpeed?: number
  className?: string
  fallback?: React.ReactNode
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D u_image;
  uniform vec2 u_gridSize;
  uniform vec2 u_mouse;
  uniform float u_hoverRadius;
  uniform vec2 u_resolution;
  uniform vec2 u_imageRes;
  uniform float u_active;
  uniform float u_imageZoom;
  uniform float u_cellRadius;

  varying vec2 vUv;

  float roundedBoxSDF(vec2 CenterPosition, vec2 Size, float Radius) {
      return length(max(abs(CenterPosition) - Size + Radius, 0.0)) - Radius;
  }

  void main() {
      vec2 cellId = floor(vUv * u_gridSize);
      vec2 localUv = fract(vUv * u_gridSize);
      vec2 cellCenter = cellId + 0.5;
      vec2 mouseGrid = u_mouse * u_gridSize;

      float dist = distance(cellCenter, mouseGrid);
      float rawInfluence = smoothstep(u_hoverRadius, 0.0, dist);
      float influence = pow(rawInfluence, 1.5) * u_active;

      float uvScale = 1.0 / u_imageZoom;
      float scale = mix(1.0, uvScale, influence);
      vec2 centeredLocalUv = localUv - 0.5;
      vec2 scaledLocalUv = centeredLocalUv * scale + 0.5;

      vec2 globalUv = (cellId + scaledLocalUv) / u_gridSize;

      vec2 ratio = u_resolution / u_imageRes;
      float coverRatio = max(ratio.x, ratio.y);
      vec2 renderSize = u_imageRes * coverRatio;
      vec2 offset = (u_resolution - renderSize) * 0.5;
      vec2 coverUv = (globalUv * u_resolution - offset) / renderSize;

      vec4 texColor = texture2D(u_image, coverUv);

      vec2 cellSize = u_resolution / u_gridSize;
      vec2 pos = centeredLocalUv * cellSize;
      vec2 boxSize = cellSize * 0.5;

      float maxRadius = min(boxSize.x, boxSize.y) * u_cellRadius;
      float radius = mix(0.0, maxRadius, influence);

      float d = roundedBoxSDF(pos, boxSize + vec2(0.5), radius);
      float mask = 1.0 - smoothstep(0.0, 1.0, d);

      gl_FragColor = vec4(texColor.rgb, texColor.a * mask);
  }
`

interface GridRendererProps extends Omit<ProximityGridProps, "mediaUrl" | "mediaType" | "className" | "fallback"> {
  texture: THREE.Texture
}

const GridRenderer = ({
  texture,
  columns = 18,
  rows = 12,
  hoverRadius = 4.0,
  imageZoom = 1.25,
  cellRadius = 0.45,
  mouseLerpSpeed = 2.5,
  enterLeaveSpeed = 1.5,
}: GridRendererProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()

  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const activeState = useRef(0)

  // Initialize uniforms once. Reactive properties removed to prevent scroll-resizing resets.
  const uniforms = useMemo(() => {
    const img = texture.image as HTMLImageElement | HTMLVideoElement | null
    let width = 1
    let height = 1

    if (img) {
      if ("videoWidth" in img) {
        width = img.videoWidth
        height = img.videoHeight
      } else {
        width = img.naturalWidth || img.width
        height = img.naturalHeight || img.height
      }
    }

    return {
      u_image: { value: texture },
      u_gridSize: { value: new THREE.Vector2(columns, rows) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_hoverRadius: { value: hoverRadius },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_imageRes: { value: new THREE.Vector2(width, height) },
      u_active: { value: 0.0 },
      u_imageZoom: { value: imageZoom },
      u_cellRadius: { value: cellRadius },
    }
  }, [texture])

  useFrame((state, delta) => {
    if (!materialRef.current) return

    // Clamp delta to prevent extreme physics overshooting on lag spikes
    const dt = Math.min(delta, 0.1)

    const mx = state.pointer.x * 0.5 + 0.5
    const my = state.pointer.y * 0.5 + 0.5
    targetMouse.current.set(mx, my)

    materialRef.current.uniforms.u_mouse.value.lerp(
      targetMouse.current,
      Math.min(dt * mouseLerpSpeed, 1.0)
    )

    materialRef.current.uniforms.u_active.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.u_active.value,
      activeState.current,
      Math.min(dt * enterLeaveSpeed, 1.0)
    )

    // Manually push reactive properties into uniforms
    materialRef.current.uniforms.u_resolution.value.set(size.width, size.height)
    materialRef.current.uniforms.u_gridSize.value.set(columns, rows)
    materialRef.current.uniforms.u_hoverRadius.value = hoverRadius
    materialRef.current.uniforms.u_imageZoom.value = imageZoom
    materialRef.current.uniforms.u_cellRadius.value = cellRadius
  })

  return (
    <mesh
      onPointerEnter={() => (activeState.current = 1)}
      onPointerLeave={() => (activeState.current = 0)}
      onPointerCancel={() => (activeState.current = 0)}
      onPointerOut={() => (activeState.current = 0)}
    >
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  )
}

const ImageScene = ({ mediaUrl, ...props }: { mediaUrl: string } & Partial<GridRendererProps>) => {
  const texture = useTexture(mediaUrl)
  return <GridRenderer texture={texture} {...props} />
}

const VideoScene = ({ mediaUrl, ...props }: { mediaUrl: string } & Partial<GridRendererProps>) => {
  const texture = useVideoTexture(mediaUrl, {
    crossOrigin: "Anonymous",
    muted: true,
    loop: true,
    start: true,
  })
  return <GridRenderer texture={texture} {...props} />
}

export default function ProximityGrid({
  mediaUrl,
  mediaType = "image",
  columns = 18,
  rows = 12,
  hoverRadius = 4.0,
  imageZoom = 1.25,
  cellRadius = 0.45,
  mouseLerpSpeed = 2.5,
  enterLeaveSpeed = 1.5,
  className,
  fallback,
}: ProximityGridProps) {
  return (
    <div className={cn("relative h-full w-full cursor-crosshair bg-background", className)}>
      <Canvas>
        <Suspense fallback={fallback ? <Html center>{fallback}</Html> : null}>
          {mediaType === "video" ? (
            <VideoScene mediaUrl={mediaUrl} columns={columns} rows={rows} hoverRadius={hoverRadius} imageZoom={imageZoom} cellRadius={cellRadius} mouseLerpSpeed={mouseLerpSpeed} enterLeaveSpeed={enterLeaveSpeed} />
          ) : (
            <ImageScene mediaUrl={mediaUrl} columns={columns} rows={rows} hoverRadius={hoverRadius} imageZoom={imageZoom} cellRadius={cellRadius} mouseLerpSpeed={mouseLerpSpeed} enterLeaveSpeed={enterLeaveSpeed} />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import ProximityGrid from "@/components/ui/proximity-grid"

export default function ExamplePage() {
  return (
    <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl border">
      <ProximityGrid
        mediaUrl="https://res.cloudinary.com/ddon6aux0/image/upload/f_auto,q_auto/v1782017462/ui-v3/demos/images/2.jpg"
        mediaType="image"
        columns={10}
        rows={5}
        hoverRadius={4.5}
        imageZoom={2}
        cellRadius={0.2}
        fallback={<div className="text-sm text-muted-foreground">Loading image...</div>}
      />
    </div>
  )
}
```
