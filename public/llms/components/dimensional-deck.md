# Dimensional Deck Component Context

**Description:** A high-performance WebGL scroll component for Satis UI. Creates an immersive, 3D stacked deck of images that respond fluidly to vertical scroll momentum anywhere on the container. Utilizes custom GLSL shaders for kinetic RGB splitting and aerodynamic bending. Implements GSAP Observer, strict container binding, responsive clamping, and proper ARIA visual masking.

## 1. Installation

To add this component to a project, run:

```bash
npx satis-ui add dimensional-deck
```

**Dependencies installed:** `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop                           | Type       | Default    | Description                                  |
| :----------------------------- | :--------- | :--------- | :------------------------------------------- |
| `images`                       | `string[]` | _Required_ | Array of image URLs.                         |
| `cardWidthRatio`               | `number`   | `0.35`     | Screen width ratio.                          |
| `cardAspectRatio`              | `number`   | `1.4`      | Width/Height aspect ratio.                   |
| `gapMultiplier`                | `number`   | `1.2`      | Y-axis spacing multiplier.                   |
| `stackGapMultiplier`           | `number`   | `0.1`      | Friction zone Y-axis overlap.                |
| `depthMultiplier`              | `number`   | `0.8`      | Friction zone Z-axis depth mapping.          |
| `flexMultiplier`               | `number`   | `0.15`     | Aerodynamic paper bending vertex distortion. |
| `rotationMultiplier`           | `number`   | `0.08`     | Friction zone X-axis resting tilt.           |
| `scrollSensitivity`            | `number`   | `0.04`     | Scroll input multiplier.                     |
| `lerpFactor`                   | `number`   | `0.08`     | Smooth momentum decay.                       |
| `parallaxIntensity`            | `number`   | `0.1`      | Internal texture sliding distance.           |
| `chromaticAberrationIntensity` | `number`   | `0.005`    | Kinetic color separation.                    |
| `dimmingMultiplier`            | `number`   | `0.6`      | Shader-based ambient occlusion fake depth.   |
| `cornerRadius`                 | `number`   | `0.04`     | GLSL-rendered SDF corner rounding.           |

## 3. Core Component Source

**File Path:** `components/ui/dimensional-deck.tsx`

```tsx
"use client"

import React, { useRef, useState, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Observer } from "gsap/Observer"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer)
}

export interface DimensionalDeckProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  images: string[]
  cardWidthRatio?: number
  cardAspectRatio?: number
  gapMultiplier?: number
  scrollSensitivity?: number
  lerpFactor?: number
  stackGapMultiplier?: number
  depthMultiplier?: number
  flexMultiplier?: number
  rotationMultiplier?: number
  parallaxIntensity?: number
  chromaticAberrationIntensity?: number
  dimmingMultiplier?: number
  cornerRadius?: number
}

interface ScrollState {
  targetY: number
  currentY: number
  velocity: number
  min: number
  max: number
}

const DeckVertexShader = `
precision mediump float;
uniform float uVelocity;
uniform float uFlexMultiplier;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  float curve = sin(uv.y * 3.14159);
  pos.z -= curve * uVelocity * uFlexMultiplier;
  pos.y += curve * abs(uVelocity) * (uFlexMultiplier * 0.4);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const DeckFragmentShader = `
precision mediump float;
uniform sampler2D uTexture;
uniform float uVelocity;
uniform float uStackDepth;
uniform vec2 uResolution;
uniform float uImageAspect;
uniform float uChromaticAberrationIntensity;
uniform float uParallaxIntensity;
uniform float uCornerRadius;
uniform float uDimmingMultiplier;

varying vec2 vUv;

void main() {
  float screenAspect = uResolution.x / uResolution.y;
  vec2 scale = vec2(1.0);
  if (screenAspect > uImageAspect) {
    scale.y = uImageAspect / screenAspect;
  } else {
    scale.x = screenAspect / uImageAspect;
  }

  vec2 parallaxUv = (vUv - 0.5) * (scale * 0.85) + 0.5;
  parallaxUv.y += clamp(uStackDepth * 0.1, -1.0, 1.0) * uParallaxIntensity;

  float split = abs(uVelocity) * uChromaticAberrationIntensity;
  float r = texture2D(uTexture, parallaxUv + vec2(0.0, split)).r;
  float g = texture2D(uTexture, parallaxUv).g;
  float b = texture2D(uTexture, parallaxUv - vec2(0.0, split)).b;
  vec3 texColor = vec3(r, g, b);

  vec2 pos = vUv - 0.5;
  vec2 pixelPos = pos * uResolution;
  vec2 pixelSize = vec2(0.5) * uResolution;
  float pixelRadius = uCornerRadius * min(uResolution.x, uResolution.y);
  float dist = length(max(abs(pixelPos) - pixelSize + pixelRadius, 0.0)) - pixelRadius;
  float cornerAlpha = 1.0 - smoothstep(0.0, 1.5, dist);

  float shadow = smoothstep(0.0, 4.0, uStackDepth) * uDimmingMultiplier;
  vec3 darkenedColor = mix(texColor, vec3(0.0), shadow);

  float fadeAlpha = 1.0 - smoothstep(3.0, 7.0, uStackDepth);

  gl_FragColor = vec4(darkenedColor, cornerAlpha * fadeAlpha);
}
`

function DeckScene({
  images,
  scrollState,
  onReady,
  cardWidthRatio,
  cardAspectRatio,
  lerpFactor,
  gapMultiplier,
  stackGapMultiplier,
  depthMultiplier,
  flexMultiplier,
  rotationMultiplier,
  parallaxIntensity,
  chromaticAberrationIntensity,
  dimmingMultiplier,
  cornerRadius,
  isReducedMotion,
}: DimensionalDeckProps & {
  scrollState: React.MutableRefObject<ScrollState>
  onReady: () => void
  isReducedMotion: boolean
}) {
  const textures = useTexture(images)
  const { viewport } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  const isMobile = viewport.width < 5
  let itemWidth = isMobile
    ? viewport.width * 0.6
    : viewport.width * cardWidthRatio!
  let itemHeight = itemWidth * cardAspectRatio!

  const maxHeight = viewport.height * (isMobile ? 0.6 : 0.5)
  if (itemHeight > maxHeight) {
    itemHeight = maxHeight
    itemWidth = itemHeight / cardAspectRatio!
  }

  const spacing = viewport.height * gapMultiplier!

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(itemWidth, itemHeight, 32, 32),
    [itemWidth, itemHeight]
  )

  const materials = useMemo(() => {
    return textures.map((texture) => {
      const img = texture.image as { width?: number; height?: number } | null | undefined
      const imageAspect = img?.width && img?.height ? img.width / img.height : 1

      return new THREE.ShaderMaterial({
        vertexShader: DeckVertexShader,
        fragmentShader: DeckFragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uVelocity: { value: 0 },
          uStackDepth: { value: 0 },
          uResolution: { value: new THREE.Vector2(itemWidth, itemHeight) },
          uImageAspect: { value: imageAspect },
          uCornerRadius: { value: cornerRadius },
          uDimmingMultiplier: { value: dimmingMultiplier },
          uFlexMultiplier: { value: isReducedMotion ? 0 : flexMultiplier },
          uParallaxIntensity: { value: isReducedMotion ? 0 : parallaxIntensity },
          uChromaticAberrationIntensity: { value: isReducedMotion ? 0 : chromaticAberrationIntensity },
        },
        transparent: true,
        depthWrite: false,
      })
    })
  }, [
    textures,
    itemWidth,
    itemHeight,
    flexMultiplier,
    chromaticAberrationIntensity,
    parallaxIntensity,
    dimmingMultiplier,
    cornerRadius,
    isReducedMotion,
  ])

  useEffect(() => {
    return () => {
      geometry.dispose()
      materials.forEach((m) => m.dispose())
    }
  }, [geometry, materials])

  useEffect(() => {
    scrollState.current.min = 0
    scrollState.current.max = (images.length - 1) * spacing
    requestAnimationFrame(() => onReady())
  }, [images.length, spacing, scrollState, onReady])

  useFrame((_, delta) => {
    const state = scrollState.current
    const dt = Math.min(delta, 0.1)

    state.targetY = THREE.MathUtils.clamp(state.targetY, state.min, state.max)
    const prevY = state.currentY

    state.currentY = THREE.MathUtils.damp(
      state.currentY,
      state.targetY,
      lerpFactor! * 100,
      dt
    )

    const rawVelocity = (state.currentY - prevY) / dt
    state.velocity = THREE.MathUtils.damp(
      state.velocity,
      rawVelocity * 0.15,
      5,
      dt
    )

    if (groupRef.current) {
      groupRef.current.children.forEach((mesh: THREE.Mesh | any, i) => {
        const material = materials[i]
        if (!material) return

        const relativeY = i * spacing - state.currentY
        let y, z, rotX
        let stackDepth = 0

        if (relativeY > 0) {
          y = -relativeY
          z = 0
          rotX = 0
        } else {
          y = relativeY * stackGapMultiplier!
          z = relativeY * depthMultiplier!
          rotX = relativeY * rotationMultiplier!
          stackDepth = Math.abs(relativeY)
        }

        mesh.position.set(0, y, z)
        mesh.rotation.set(rotX, 0, 0)

        mesh.renderOrder = 1000 - Math.abs(relativeY)

        material.uniforms.uVelocity.value = state.velocity
        material.uniforms.uStackDepth.value = stackDepth
      })
    }
  })

  return (
    <group ref={groupRef}>
      {textures.map((_, i) => (
        <mesh key={i} geometry={geometry} material={materials[i]} />
      ))}
    </group>
  )
}

export const DimensionalDeck = React.forwardRef<
  HTMLDivElement,
  DimensionalDeckProps
>(
  (
    {
      images,
      className,
      cardWidthRatio = 0.35,
      cardAspectRatio = 1.4,
      scrollSensitivity = 0.04,
      lerpFactor = 0.08,
      gapMultiplier = 1.2,
      stackGapMultiplier = 0.1,
      depthMultiplier = 0.8,
      parallaxIntensity = 0.1,
      chromaticAberrationIntensity = 0.005,
      flexMultiplier = 0.15,
      rotationMultiplier = 0.08,
      dimmingMultiplier = 0.6,
      cornerRadius = 0.04,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isReducedMotion, setIsReducedMotion] = useState(false)

    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

    const scrollState = useRef<ScrollState>({
      targetY: 0,
      currentY: 0,
      velocity: 0,
      min: 0,
      max: 0,
    })

    useGSAP(
      () => {
        if (!containerRef.current) return

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        setIsReducedMotion(mediaQuery.matches)

        const observer = Observer.create({
          target: containerRef.current,
          type: "wheel,touch,pointer",
          onWheel: (e) => {
            const state = scrollState.current
            const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX

            const isAtTop = state.targetY <= state.min && delta < 0
            const isAtBottom = state.targetY >= state.max && delta > 0

            if (!isAtTop && !isAtBottom) {
              state.targetY += delta * scrollSensitivity
            }
          },
          onDrag: (e) => {
            const state = scrollState.current
            const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? -e.deltaY : -e.deltaX

            const isAtTop = state.targetY <= state.min && delta < 0
            const isAtBottom = state.targetY >= state.max && delta > 0

            if (!isAtTop && !isAtBottom) {
              state.targetY += delta * scrollSensitivity
            }
          },
        })

        return () => observer.kill()
      },
      { scope: containerRef, dependencies: [scrollSensitivity] }
    )

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative h-full w-full cursor-grab touch-none overflow-hidden bg-background text-foreground active:cursor-grabbing",
          className
        )}
        {...props}
      >
        <div className="sr-only" aria-live="polite">
          <p>Interactive 3D Dimensional Deck.</p>
        </div>

        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background transition-opacity duration-1000",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
        />

        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
        >
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: true }}
          >
            <React.Suspense fallback={null}>
              <DeckScene
                images={images}
                scrollState={scrollState}
                onReady={() => setIsLoaded(true)}
                cardWidthRatio={cardWidthRatio}
                cardAspectRatio={cardAspectRatio}
                lerpFactor={lerpFactor}
                gapMultiplier={gapMultiplier}
                stackGapMultiplier={stackGapMultiplier}
                depthMultiplier={depthMultiplier}
                flexMultiplier={flexMultiplier}
                rotationMultiplier={rotationMultiplier}
                parallaxIntensity={parallaxIntensity}
                chromaticAberrationIntensity={chromaticAberrationIntensity}
                dimmingMultiplier={dimmingMultiplier}
                cornerRadius={cornerRadius}
                isReducedMotion={isReducedMotion}
              />
            </React.Suspense>
          </Canvas>
        </div>
      </div>
    )
  }
)

DimensionalDeck.displayName = "DimensionalDeck"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { DimensionalDeck } from "@/components/ui/dimensional-deck"

export default function ExamplePage() {
  const images = [
    "/image1.jpg",
    "/image2.jpg",
    "/image3.jpg"
  ]

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <DimensionalDeck
          images={images}
          cardWidthRatio={0.5}
          gapMultiplier={1.2}
          stackGapMultiplier={0.15}
          depthMultiplier={1.0}
          rotationMultiplier={0.1}
          flexMultiplier={0.15}
          parallaxIntensity={1.2}
          chromaticAberrationIntensity={0.008}
        />
      </div>
    </main>
  )
}
```
