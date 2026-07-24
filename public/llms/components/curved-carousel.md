# Curved Carousel Component Context

**Description:** A high-performance WebGL 3D cylindrical carousel for Satis UI. Creates an immersive, spinning gallery of images utilizing custom GLSL shaders for aerodynamic bending, SDF corner rounding, and kinetic chromatic aberration. Integrates a GSAP Observer bound tightly to the container with full reduced-motion accessibility overrides for shader effects.

## 1. Installation

To add this component to a project, run:

```bash
npx satis-ui add curved-carousel
```

**Dependencies installed:** `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop                           | Type       | Default    | Description                                |
| :----------------------------- | :--------- | :--------- | :----------------------------------------- |
| `images`                       | `string[]` | _Required_ | Array of image URLs.                       |
| `cardWidthRatio`               | `number`   | `0.35`     | Screen width ratio.                        |
| `cardAspectRatio`              | `number`   | `1.4`      | Width/Height aspect ratio.                 |
| `scrollSensitivity`            | `number`   | `0.005`    | Scroll input multiplier.                   |
| `lerpFactor`                   | `number`   | `0.08`     | Smooth momentum decay.                     |
| `radiusMultiplier`             | `number`   | `1.2`      | Carousel radius distance.                  |
| `centrifugalMultiplier`        | `number`   | `0.4`      | Fast-spin outward bending amount.          |
| `parallaxIntensity`            | `number`   | `0.1`      | Internal texture sliding distance.         |
| `chromaticAberrationIntensity` | `number`   | `0.004`    | Kinetic color separation.                  |
| `cornerRadius`                 | `number`   | `0.04`     | GLSL-rendered SDF corner rounding.         |
| `fadeMultiplier`               | `number`   | `1.5`      | Alpha fade mapping out to the background.  |
| `dimmingMultiplier`            | `number`   | `0.8`      | Shader-based ambient occlusion fake depth. |

## 3. Core Component Source

**File Path:** `components/ui/curved-carousel.tsx`

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

export interface CurvedCarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  images: string[]
  cardWidthRatio?: number
  cardAspectRatio?: number
  scrollSensitivity?: number
  lerpFactor?: number
  radiusMultiplier?: number
  centrifugalMultiplier?: number
  parallaxIntensity?: number
  chromaticAberrationIntensity?: number
  cornerRadius?: number
  fadeMultiplier?: number
  dimmingMultiplier?: number
}

interface ScrollState {
  targetAngle: number
  currentAngle: number
  velocity: number
  min: number
  max: number
}

const CurvedVertexShader = `
precision mediump float;
uniform float uVelocity;
uniform float uCentrifugalMultiplier;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  float distFromCenter = abs(uv.x - 0.5) * 2.0;
  float flex = pow(distFromCenter, 2.0);
  pos.z += flex * abs(uVelocity) * uCentrifugalMultiplier;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const CurvedFragmentShader = `
precision mediump float;
uniform sampler2D uTexture;
uniform float uVelocity;
uniform float uDepth;
uniform float uAngle;
uniform vec2 uResolution;
uniform float uImageAspect;
uniform float uParallaxIntensity;
uniform float uChromaticAberration;
uniform float uCornerRadius;
uniform float uFadeMultiplier;
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
  parallaxUv.x += clamp(uAngle, -1.0, 1.0) * uParallaxIntensity;

  float split = abs(uVelocity) * uChromaticAberration;
  float r = texture2D(uTexture, parallaxUv + vec2(split, 0.0)).r;
  float g = texture2D(uTexture, parallaxUv).g;
  float b = texture2D(uTexture, parallaxUv - vec2(split, 0.0)).b;
  vec4 texColor = vec4(r, g, b, 1.0);

  vec2 pos = vUv - 0.5;
  vec2 pixelPos = pos * uResolution;
  vec2 pixelSize = vec2(0.5) * uResolution;
  float pixelRadius = uCornerRadius * min(uResolution.x, uResolution.y);
  float dist = length(max(abs(pixelPos) - pixelSize + pixelRadius, 0.0)) - pixelRadius;
  float cornerAlpha = 1.0 - smoothstep(0.0, 1.5, dist);

  float depthFactor = smoothstep(0.0, 1.0, (uDepth + 1.0) / 2.0);

  float fadeAlpha = mix(0.0, 1.0, smoothstep(0.0, 1.0, depthFactor * uFadeMultiplier));

  vec3 darkenedColor = mix(texColor.rgb * (1.0 - uDimmingMultiplier), texColor.rgb, depthFactor);

  gl_FragColor = vec4(darkenedColor, cornerAlpha * fadeAlpha);
}
`

function CurvedScene({
  images,
  scrollState,
  onReady,
  cardWidthRatio,
  cardAspectRatio,
  lerpFactor,
  radiusMultiplier,
  centrifugalMultiplier,
  parallaxIntensity,
  chromaticAberrationIntensity,
  cornerRadius,
  fadeMultiplier,
  dimmingMultiplier,
  isReducedMotion,
}: CurvedCarouselProps & {
  scrollState: React.MutableRefObject<ScrollState>
  onReady: () => void
  isReducedMotion: boolean
}) {
  const textures = useTexture(images)
  const { viewport } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  const isMobile = viewport.width < 5
  let itemWidth = isMobile ? viewport.width * 0.6 : viewport.width * cardWidthRatio!
  let itemHeight = itemWidth * cardAspectRatio!

  const maxHeight = viewport.height * (isMobile ? 0.6 : 0.5)
  if (itemHeight > maxHeight) {
    itemHeight = maxHeight
    itemWidth = itemHeight / cardAspectRatio!
  }

  const radius = viewport.width * radiusMultiplier!
  const angleSpacing = (itemWidth / radius) * 1.2

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(itemWidth, itemHeight, 32, 32),
    [itemWidth, itemHeight]
  )

  const materials = useMemo(() => {
    return textures.map((texture) => {
      const img = texture.image as { width?: number; height?: number } | null | undefined
      const imageAspect = img?.width && img?.height ? img.width / img.height : 1

      return new THREE.ShaderMaterial({
        vertexShader: CurvedVertexShader,
        fragmentShader: CurvedFragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uVelocity: { value: 0 },
          uDepth: { value: 1.0 },
          uAngle: { value: 0.0 },
          uResolution: { value: new THREE.Vector2(itemWidth, itemHeight) },
          uImageAspect: { value: imageAspect },
          uCentrifugalMultiplier: { value: isReducedMotion ? 0 : centrifugalMultiplier },
          uParallaxIntensity: { value: isReducedMotion ? 0 : parallaxIntensity },
          uChromaticAberration: { value: isReducedMotion ? 0 : chromaticAberrationIntensity },
          uCornerRadius: { value: cornerRadius },
          uFadeMultiplier: { value: fadeMultiplier },
          uDimmingMultiplier: { value: dimmingMultiplier },
        },
        transparent: true,
        depthWrite: false,
      })
    })
  }, [
    textures,
    itemWidth,
    itemHeight,
    centrifugalMultiplier,
    parallaxIntensity,
    chromaticAberrationIntensity,
    cornerRadius,
    fadeMultiplier,
    dimmingMultiplier,
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
    scrollState.current.max = (images.length - 1) * angleSpacing
    requestAnimationFrame(() => onReady())
  }, [images.length, angleSpacing, scrollState, onReady])

  useFrame((_, delta) => {
    const state = scrollState.current
    const dt = Math.min(delta, 0.1)

    state.targetAngle = THREE.MathUtils.clamp(state.targetAngle, state.min, state.max)
    const prevAngle = state.currentAngle

    state.currentAngle = THREE.MathUtils.damp(
      state.currentAngle,
      state.targetAngle,
      lerpFactor! * 100,
      dt
    )

    const angleDelta = state.currentAngle - prevAngle
    const trueVelocity = angleDelta / dt

    state.velocity = THREE.MathUtils.damp(state.velocity, trueVelocity * 0.3, 5, dt)

    if (groupRef.current) {
      groupRef.current.children.forEach((mesh: THREE.Mesh | any, reversedIndex) => {
        const originalIndex = textures.length - 1 - reversedIndex
        const material = materials[originalIndex]

        if (!material) return

        const angle = originalIndex * angleSpacing - state.currentAngle

        mesh.position.x = Math.sin(angle) * radius
        mesh.position.z = Math.cos(angle) * radius - radius
        mesh.rotation.y = angle

        material.uniforms.uVelocity.value = state.velocity
        material.uniforms.uAngle.value = angle
        material.uniforms.uDepth.value = Math.cos(angle)
      })
    }
  })

  return (
    <group ref={groupRef}>
      {[...textures].reverse().map((_, reversedIndex) => {
        const originalIndex = textures.length - 1 - reversedIndex
        return (
          <mesh
            key={originalIndex}
            geometry={geometry}
            material={materials[originalIndex]}
          />
        )
      })}
    </group>
  )
}

export const CurvedCarousel = React.forwardRef<
  HTMLDivElement,
  CurvedCarouselProps
>(
  (
    {
      images,
      className,
      cardWidthRatio = 0.35,
      cardAspectRatio = 1.4,
      scrollSensitivity = 0.005,
      lerpFactor = 0.08,
      radiusMultiplier = 1.2,
      centrifugalMultiplier = 0.4,
      parallaxIntensity = 0.1,
      chromaticAberrationIntensity = 0.004,
      cornerRadius = 0.04,
      fadeMultiplier = 1.5,
      dimmingMultiplier = 0.8,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isReducedMotion, setIsReducedMotion] = useState(false)

    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

    const scrollState = useRef<ScrollState>({
      targetAngle: 0,
      currentAngle: 0,
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
            const delta = (e.deltaX || 0) + (e.deltaY || 0)
            scrollState.current.targetAngle += delta * scrollSensitivity
          },
          onDrag: (e) => {
            scrollState.current.targetAngle -= e.deltaX * scrollSensitivity
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
          <p>Interactive 3D Curved Carousel. Scroll or swipe to navigate.</p>
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
            camera={{ position: [0, 0, 4.5], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: true }}
          >
            <React.Suspense fallback={null}>
              <CurvedScene
                images={images}
                scrollState={scrollState}
                onReady={() => setIsLoaded(true)}
                cardWidthRatio={cardWidthRatio}
                cardAspectRatio={cardAspectRatio}
                lerpFactor={lerpFactor}
                radiusMultiplier={radiusMultiplier}
                centrifugalMultiplier={centrifugalMultiplier}
                parallaxIntensity={parallaxIntensity}
                chromaticAberrationIntensity={chromaticAberrationIntensity}
                cornerRadius={cornerRadius}
                fadeMultiplier={fadeMultiplier}
                dimmingMultiplier={dimmingMultiplier}
                isReducedMotion={isReducedMotion}
              />
            </React.Suspense>
          </Canvas>
        </div>
      </div>
    )
  }
)

CurvedCarousel.displayName = "CurvedCarousel"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { CurvedCarousel } from "@/components/ui/curved-carousel"

export default function ExamplePage() {
  const images = [
    "/image1.jpg",
    "/image2.jpg",
    "/image3.jpg"
  ]

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <CurvedCarousel
          images={images}
          radiusMultiplier={1.4}
          centrifugalMultiplier={0.3}
          parallaxIntensity={1.2}
          chromaticAberrationIntensity={0.05}
          scrollSensitivity={0.001}
        />
      </div>
    </main>
  )
}
```
