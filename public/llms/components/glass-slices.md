# Glass Slices Component Context

**Description:** An interactive WebGL component splitting media into vertical glass slices that dynamically tilt, compress, and refract based on cursor proximity.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/glass-slices.json
```

**Dependencies installed:** `three`, `@react-three/fiber`, `@react-three/drei`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop              | Type                 | Default   | Description                                                                |
| :---------------- | :------------------- | :-------- | :------------------------------------------------------------------------- |
| `mediaUrl`        | `string`             | —         | The source URL of the media asset.                                         |
| `mediaType`       | `"image" \| "video"` | `"image"` | Defines the media type for correct texture processing.                     |
| `slices`          | `number`             | `24`      | Number of vertical glass slices.                                           |
| `hoverRadius`     | `number`             | `0.25`    | Radius of the hover wave (normalized 0.0 to 1.0).                          |
| `minSliceWidth`   | `number`             | `0.55`    | How compressed/tilted the slice gets at the peak of the wave (0.0 to 1.0). |
| `shiftY`          | `number`             | `0.1`     | How far the slice shifts down on the Y-axis when hovered.                  |
| `imageZoom`       | `number`             | `1.15`    | How much the image internally zooms in when the slice tilts.               |
| `mouseLerpSpeed`  | `number`             | `3.0`     | Fluidity of the mouse tracking. Lower = heavier/slower drag.               |
| `enterLeaveSpeed` | `number`             | `2.0`     | Speed at which the effect fades in/out when entering/leaving.              |
| `fallback`        | `ReactNode`          | `null`    | Optional fallback UI rendered via Suspense while media loads.              |

## 3. Core Component Source

**File Path:** `registry/ui/glass-slices.tsx`

```tsx
"use client"

import React, { useMemo, useRef, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, useTexture, useVideoTexture } from "@react-three/drei"
import * as THREE from "three"
import { cn } from "@/lib/utils"

export interface GlassSlicesProps {
  mediaUrl: string
  mediaType?: "image" | "video"
  slices?: number
  hoverRadius?: number
  minSliceWidth?: number
  shiftY?: number
  imageZoom?: number
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
  uniform float u_slices;
  uniform vec2 u_mouse;
  uniform float u_hoverRadius;
  uniform float u_minSliceWidth;
  uniform float u_shiftY;
  uniform float u_imageZoom;
  uniform vec2 u_resolution;
  uniform vec2 u_imageRes;
  uniform float u_active;

  varying vec2 vUv;

  void main() {
      // 1. Slice Grid Logic
      float sliceId = floor(vUv.x * u_slices);
      float localX = fract(vUv.x * u_slices); // 0.0 to 1.0 inside the current slice
      float sliceCenter = (sliceId + 0.5) / u_slices;

      // 2. Kinematic Proximity (X-axis wave)
      float distX = abs(sliceCenter - u_mouse.x);
      float rawInfluence = smoothstep(u_hoverRadius, 0.0, distX);
      float influence = pow(rawInfluence, 1.5) * u_active;

      // 3. Compression / Tilt Math
      float currentWidth = mix(1.0, u_minSliceWidth, influence);

      float nx = abs(localX * 2.0 - 1.0);
      float mask = 1.0 - smoothstep(currentWidth, currentWidth + 0.02, nx);

      // 4. Parallax UV Shifting
      vec2 sampleUv = vUv;
      sampleUv.y += influence * u_shiftY;

      vec2 scaleCenter = vec2(sliceCenter, 0.5);
      sampleUv = (sampleUv - scaleCenter) * mix(1.0, 1.0 / u_imageZoom, influence) + scaleCenter;

      // 5. Object-Cover Math
      vec2 ratio = u_resolution / u_imageRes;
      float coverRatio = max(ratio.x, ratio.y);
      vec2 renderSize = u_imageRes * coverRatio;
      vec2 offset = (u_resolution - renderSize) * 0.5;
      vec2 coverUv = (sampleUv * u_resolution - offset) / renderSize;

      vec4 texColor = texture2D(u_image, coverUv);

      // 6. Volumetric Lighting & Shadows
      float visibleX = (localX - (0.5 - currentWidth * 0.5)) / currentWidth;

      float highlight = smoothstep(0.0, 0.1, visibleX) * smoothstep(0.3, 0.1, visibleX);
      texColor.rgb += highlight * influence * 0.65;

      float shadow = smoothstep(0.6, 1.0, visibleX);
      texColor.rgb -= shadow * influence * 0.7;

      gl_FragColor = vec4(texColor.rgb, texColor.a * mask);
  }
`

interface SlicesRendererProps extends Omit<GlassSlicesProps, "mediaUrl" | "mediaType" | "className" | "fallback"> {
  texture: THREE.Texture
}

const SlicesRenderer = ({
  texture,
  slices = 24,
  hoverRadius = 0.25,
  minSliceWidth = 0.55,
  shiftY = 0.1,
  imageZoom = 1.15,
  mouseLerpSpeed = 3.0,
  enterLeaveSpeed = 2.0,
}: SlicesRendererProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()

  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const activeState = useRef(0)

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
      u_slices: { value: slices },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_hoverRadius: { value: hoverRadius },
      u_minSliceWidth: { value: minSliceWidth },
      u_shiftY: { value: shiftY },
      u_imageZoom: { value: imageZoom },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_imageRes: { value: new THREE.Vector2(width, height) },
      u_active: { value: 0.0 },
    }
  }, [texture])

  useFrame((state, delta) => {
    if (!materialRef.current) return

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

    materialRef.current.uniforms.u_resolution.value.set(size.width, size.height)
    materialRef.current.uniforms.u_slices.value = slices
    materialRef.current.uniforms.u_hoverRadius.value = hoverRadius
    materialRef.current.uniforms.u_minSliceWidth.value = minSliceWidth
    materialRef.current.uniforms.u_shiftY.value = shiftY
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

const ImageScene = ({ mediaUrl, ...props }: { mediaUrl: string } & Partial<SlicesRendererProps>) => {
  const texture = useTexture(mediaUrl)
  return <SlicesRenderer texture={texture} {...props} />
}

const VideoScene = ({ mediaUrl, ...props }: { mediaUrl: string } & Partial<SlicesRendererProps>) => {
  const texture = useVideoTexture(mediaUrl, {
    crossOrigin: "Anonymous",
    muted: true,
    loop: true,
    start: true,
  })
  return <SlicesRenderer texture={texture} {...props} />
}

export default function GlassSlices({
  mediaUrl,
  mediaType = "image",
  slices = 24,
  hoverRadius = 0.25,
  minSliceWidth = 0.55,
  shiftY = 0.1,
  imageZoom = 1.15,
  mouseLerpSpeed = 3.0,
  enterLeaveSpeed = 2.0,
  className,
  fallback,
}: GlassSlicesProps) {
  return (
    <div className={cn("relative h-full w-full cursor-ew-resize bg-background", className)}>
      <Canvas>
        <Suspense fallback={fallback ? <Html center>{fallback}</Html> : null}>
          {mediaType === "video" ? (
            <VideoScene mediaUrl={mediaUrl} slices={slices} hoverRadius={hoverRadius} minSliceWidth={minSliceWidth} shiftY={shiftY} imageZoom={imageZoom} mouseLerpSpeed={mouseLerpSpeed} enterLeaveSpeed={enterLeaveSpeed} />
          ) : (
            <ImageScene mediaUrl={mediaUrl} slices={slices} hoverRadius={hoverRadius} minSliceWidth={minSliceWidth} shiftY={shiftY} imageZoom={imageZoom} mouseLerpSpeed={mouseLerpSpeed} enterLeaveSpeed={enterLeaveSpeed} />
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

import GlassSlices from "@/registry/ui/glass-slices"

export default function ExamplePage() {
  return (
    <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl border">
      <GlassSlices
        mediaUrl="https://res.cloudinary.com/ddon6aux0/image/upload/f_auto,q_auto/v1782017462/ui-v3/demos/images/2.jpg"
        mediaType="image"
        slices={24}
        hoverRadius={0.25}
        minSliceWidth={0.55}
        shiftY={0.1}
        imageZoom={1.15}
        fallback={<div className="text-sm text-muted-foreground">Loading image...</div>}
      />
    </div>
  )
}
```
