# Velocity Strips Component Context

**Description:** An interactive WebGL component that displays media (image or video) with a fluid, velocity-based slice distortion effect following the cursor.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/velocity-strips.json
```

**Dependencies installed:** `three`, `@react-three/fiber`, `@react-three/drei`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop              | Type                 | Default   | Description                                                   |
| :---------------- | :------------------- | :-------- | :------------------------------------------------------------ |
| `mediaUrl`        | `string`             | —         | The source URL of the media asset.                            |
| `mediaType`       | `"image" \| "video"` | `"image"` | Defines the media type for correct texture processing.        |
| `slices`          | `number`             | `32`      | Number of vertical displacement slices.                       |
| `hoverRadius`     | `number`             | `0.35`    | Proximity spread multiplier (0.0 to 1.0).                     |
| `shiftMultiplier` | `number`             | `1.5`     | Strength of the displacement shift based on mouse velocity.   |
| `trackingSpeed`   | `number`             | `2.0`     | Interpolation speed for the wave following the cursor.        |
| `imageZoom`       | `number`             | `1.15`    | Base texture scale to prevent edge bleeding.                  |
| `enterLeaveSpeed` | `number`             | `1.5`     | Interpolation speed for the enter/leave animation states.     |
| `fallback`        | `ReactNode`          | `null`    | Optional fallback UI rendered via Suspense while media loads. |

## 3. Core Component Source

**File Path:** `components/ui/velocity-strips.tsx`

```tsx
"use client"

import React, { useMemo, useRef, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, useTexture, useVideoTexture } from "@react-three/drei"
import * as THREE from "three"
import { cn } from "@/lib/utils"

export interface VelocityStripsProps {
  mediaUrl: string
  mediaType?: "image" | "video"
  slices?: number
  hoverRadius?: number
  shiftMultiplier?: number
  trackingSpeed?: number
  imageZoom?: number
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
  uniform float u_slices;
  uniform vec2 u_mouse;
  uniform float u_hoverRadius;
  uniform float u_velocity;
  uniform float u_imageZoom;
  uniform vec2 u_resolution;
  uniform vec2 u_imageRes;
  uniform float u_active;

  varying vec2 vUv;

  void main() {
      float sliceId = floor(vUv.x * u_slices);
      float sliceCenter = (sliceId + 0.5) / u_slices;

      float dist = abs(sliceCenter - u_mouse.x);
      float rawInfluence = smoothstep(u_hoverRadius, 0.0, dist);
      float influence = pow(rawInfluence, 1.6) * u_active;

      vec2 zoomedUv = (vUv - 0.5) * (1.0 / u_imageZoom) + 0.5;
      vec2 shiftedUv = zoomedUv;
      shiftedUv.x -= influence * u_velocity;

      vec2 ratio = u_resolution / u_imageRes;
      float coverRatio = max(ratio.x, ratio.y);
      vec2 renderSize = u_imageRes * coverRatio;
      vec2 offset = (u_resolution - renderSize) * 0.5;
      vec2 coverUv = (shiftedUv * u_resolution - offset) / renderSize;

      gl_FragColor = texture2D(u_image, coverUv);
  }
`

interface StripsRendererProps extends Omit<VelocityStripsProps, "mediaUrl" | "mediaType" | "className" | "fallback"> {
  texture: THREE.Texture
}

const StripsRenderer = ({
  texture,
  slices = 32,
  hoverRadius = 0.35,
  shiftMultiplier = 1.5,
  trackingSpeed = 2.0,
  imageZoom = 1.15,
  enterLeaveSpeed = 1.5
}: StripsRendererProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()

  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const smoothMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const targetVelocity = useRef(0)
  const smoothVelocity = useRef(0)
  const activeState = useRef(0)

  // Initialize uniforms once. Reactive dependencies removed to prevent scroll-resizing resets.
  const uniforms = useMemo(() => {
    const img = texture.image as HTMLImageElement | HTMLVideoElement | null
    let width = 1, height = 1
    if (img) {
      if ("videoWidth" in img) { width = img.videoWidth; height = img.videoHeight }
      else { width = img.naturalWidth || img.width; height = img.naturalHeight || img.height }
    }
    return {
      u_image: { value: texture },
      u_slices: { value: slices },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_hoverRadius: { value: hoverRadius },
      u_velocity: { value: 0.0 },
      u_imageZoom: { value: imageZoom },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_imageRes: { value: new THREE.Vector2(width, height) },
      u_active: { value: 0.0 },
    }
  }, [texture])

  useFrame((state, delta) => {
    if (!materialRef.current) return

    // Cap delta to prevent lag spikes from causing mathematical overshoots
    const dt = Math.min(delta, 0.1)

    targetMouse.current.set(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5)
    smoothMouse.current.lerp(targetMouse.current, Math.min(dt * trackingSpeed, 1.0))

    // Calculate and clamp velocity to prevent texture edge bleeding
    const rawVelocity = (targetMouse.current.x - smoothMouse.current.x) * shiftMultiplier
    targetVelocity.current = THREE.MathUtils.clamp(rawVelocity, -0.4, 0.4)

    smoothVelocity.current = THREE.MathUtils.lerp(smoothVelocity.current, targetVelocity.current, Math.min(dt * 4.0, 1.0))

    materialRef.current.uniforms.u_mouse.value.copy(smoothMouse.current)
    materialRef.current.uniforms.u_velocity.value = smoothVelocity.current

    materialRef.current.uniforms.u_active.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.u_active.value, activeState.current, Math.min(dt * enterLeaveSpeed, 1.0)
    )

    // Manually push reactive props to uniforms every frame
    materialRef.current.uniforms.u_resolution.value.set(size.width, size.height)
    materialRef.current.uniforms.u_slices.value = slices
    materialRef.current.uniforms.u_hoverRadius.value = hoverRadius
    materialRef.current.uniforms.u_imageZoom.value = imageZoom
  })

  return (
    <mesh
      onPointerEnter={() => (activeState.current = 1)}
      onPointerLeave={() => (activeState.current = 0)}
      onPointerCancel={() => (activeState.current = 0)}
      onPointerOut={() => (activeState.current = 0)}
    >
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent={true} />
    </mesh>
  )
}

const ImageScene = ({ mediaUrl, ...props }: { mediaUrl: string } & Partial<StripsRendererProps>) => {
  const texture = useTexture(mediaUrl)
  return <StripsRenderer texture={texture} {...props} />
}

const VideoScene = ({ mediaUrl, ...props }: { mediaUrl: string } & Partial<StripsRendererProps>) => {
  const texture = useVideoTexture(mediaUrl, { crossOrigin: "Anonymous", muted: true, loop: true, start: true })
  return <StripsRenderer texture={texture} {...props} />
}

export default function VelocityStrips({
  mediaUrl,
  mediaType = "image",
  slices = 32,
  hoverRadius = 0.35,
  shiftMultiplier = 1.5,
  trackingSpeed = 2.0,
  imageZoom = 1.15,
  enterLeaveSpeed = 1.5,
  className,
  fallback
}: VelocityStripsProps) {
  return (
    <div className={cn("relative h-full w-full cursor-ew-resize bg-background", className)}>
      <Canvas>
        <Suspense fallback={fallback ? <Html center>{fallback}</Html> : null}>
          {mediaType === "video" ? (
            <VideoScene mediaUrl={mediaUrl} slices={slices} hoverRadius={hoverRadius} shiftMultiplier={shiftMultiplier} trackingSpeed={trackingSpeed} imageZoom={imageZoom} enterLeaveSpeed={enterLeaveSpeed} />
          ) : (
            <ImageScene mediaUrl={mediaUrl} slices={slices} hoverRadius={hoverRadius} shiftMultiplier={shiftMultiplier} trackingSpeed={trackingSpeed} imageZoom={imageZoom} enterLeaveSpeed={enterLeaveSpeed} />
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

import VelocityStrips from "@/components/ui/velocity-strips"

export default function ExamplePage() {
  return (
    <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl border">
      <VelocityStrips
        mediaUrl="https://res.cloudinary.com/ddon6aux0/image/upload/f_auto,q_auto/v1782017462/ui-v3/demos/images/2.jpg"
        mediaType="image"
        slices={20}
        hoverRadius={0.4}
        shiftMultiplier={0.8}
        trackingSpeed={1.0}
        imageZoom={1.15}
        fallback={<div className="text-sm text-muted-foreground">Loading image...</div>}
      />
    </div>
  )
}
```
