# Panoramic Carousel Component Context

**Description:** A high-performance WebGL spatial carousel for Satis UI. Creates an immersive, 3D panoramic wrap of images that responds fluidly to scroll and touch momentum anywhere on the screen. Features custom GLSL shaders for kinetic RGB splitting, aerodynamic flexing, SDF rounding, and motion blur. Includes a real-time OS reduced-motion check inside the render loop to disable nausea-inducing effects.

## 1. Installation

To add this component to a project, run:

```bash
npx satis-ui add panoramic-carousel
```

**Dependencies installed:** `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop                           | Type       | Default    | Description                 |
| :----------------------------- | :--------- | :--------- | :-------------------------- |
| `images`                       | `string[]` | _Required_ | Array of image URLs.        |
| `cardWidthRatio`               | `number`   | `0.4`      | Screen width ratio.         |
| `cardAspectRatio`              | `number`   | `1.4`      | Width/Height aspect ratio.  |
| `scrollSensitivity`            | `number`   | `0.005`    | Scroll input multiplier.    |
| `lerpFactor`                   | `number`   | `0.08`     | Smooth momentum decay.      |
| `radiusMultiplier`             | `number`   | `1.4`      | Camera distance.            |
| `gapMultiplier`                | `number`   | `1.1`      | Card spacing.               |
| `depthMultiplier`              | `number`   | `1.0`      | Z-axis curve depth.         |
| `baseFov`                      | `number`   | `45`       | Base field of view.         |
| `maxFovZoom`                   | `number`   | `35`       | Max FOV zoom on scroll.     |
| `fovMultiplier`                | `number`   | `1.2`      | Camera zoom aggressiveness. |
| `motionBlurIntensity`          | `number`   | `0.003`    | 7-tap motion blur strength. |
| `chromaticAberrationIntensity` | `number`   | `0.005`    | Kinetic RGB separation.     |
| `flexMultiplier`               | `number`   | `0.15`     | Aerodynamic bending.        |
| `cornerRadius`                 | `number`   | `0.04`     | SDF edge rounding.          |
| `parallaxIntensity`            | `number`   | `0.08`     | Internal image parallax.    |

## 3. Core Component Source

**File Path:** `components/ui/panoramic-carousel.tsx`

```tsx
"use client"

import React, { useRef, useState, useMemo, useEffect, useLayoutEffect } from "react"
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

export interface PanoramicCarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  images: string[]
  cardWidthRatio?: number
  cardAspectRatio?: number
  scrollSensitivity?: number
  lerpFactor?: number
  radiusMultiplier?: number
  gapMultiplier?: number
  depthMultiplier?: number
  baseFov?: number
  maxFovZoom?: number
  fovMultiplier?: number
  motionBlurIntensity?: number
  chromaticAberrationIntensity?: number
  flexMultiplier?: number
  cornerRadius?: number
  fadeEdge1?: number
  fadeEdge2?: number
  parallaxIntensity?: number
}

interface ScrollState {
  targetAngle: number
  currentAngle: number
  velocity: number
  min: number
  max: number
}

const PanoramicVertexShader = `
precision mediump float;
uniform float uVelocity;
uniform float uFlexMultiplier;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  float distFromCenter = abs(uv.x - 0.5) * 2.0;
  pos.z += pow(distFromCenter, 2.0) * abs(uVelocity) * uFlexMultiplier;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const PanoramicFragmentShader = `
precision mediump float;
uniform sampler2D uTexture;
uniform float uVelocity;
uniform float uAngle;
uniform vec2 uResolution;
uniform float uImageAspect;
uniform float uMotionBlurIntensity;
uniform float uChromaticAberration;
uniform float uCornerRadius;
uniform float uFadeEdge1;
uniform float uFadeEdge2;
uniform float uParallaxIntensity;

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

  vec4 color = vec4(0.0);
  float blurAmount = uVelocity * uMotionBlurIntensity;
  float caAmount = uVelocity * uChromaticAberration;

  for(float i = -3.0; i <= 3.0; i++) {
    vec2 offsetUv = parallaxUv + vec2(i * blurAmount, 0.0);

    float r = texture2D(uTexture, offsetUv + vec2(caAmount, 0.0)).r;
    float g = texture2D(uTexture, offsetUv).g;
    float b = texture2D(uTexture, offsetUv - vec2(caAmount, 0.0)).b;

    color += vec4(r, g, b, 1.0);
  }
  color /= 7.0;

  vec2 pos = vUv - 0.5;
  vec2 pixelPos = pos * uResolution;
  vec2 pixelSize = vec2(0.5) * uResolution;
  float pixelRadius = uCornerRadius * min(uResolution.x, uResolution.y);
  float dist = length(max(abs(pixelPos) - pixelSize + pixelRadius, 0.0)) - pixelRadius;
  float cornerAlpha = 1.0 - smoothstep(0.0, 1.5, dist);

  float fadeAlpha = 1.0 - smoothstep(uFadeEdge1, uFadeEdge2, abs(uAngle));

  gl_FragColor = vec4(color.rgb, cornerAlpha * fadeAlpha);
}
`

function PanoramicScene({
  images,
  scrollState,
  onReady,
  cardWidthRatio,
  cardAspectRatio,
  lerpFactor,
  radiusMultiplier,
  gapMultiplier,
  depthMultiplier,
  baseFov,
  maxFovZoom,
  fovMultiplier,
  motionBlurIntensity,
  chromaticAberrationIntensity,
  flexMultiplier,
  cornerRadius,
  fadeEdge1,
  fadeEdge2,
  parallaxIntensity,
}: PanoramicCarouselProps & {
  scrollState: React.MutableRefObject<ScrollState>
  onReady: () => void
}) {
  const textures = useTexture(images)
  const { viewport, camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  const isMobile = viewport.width < 5
  let itemWidth = isMobile
    ? viewport.width * 0.7
    : viewport.width * cardWidthRatio!
  let itemHeight = itemWidth * cardAspectRatio!

  const maxHeight = viewport.height * (isMobile ? 0.6 : 0.65)
  if (itemHeight > maxHeight) {
    itemHeight = maxHeight
    itemWidth = itemHeight / cardAspectRatio!
  }

  const radius = viewport.width * radiusMultiplier!
  const angleSpacing = (itemWidth / radius) * gapMultiplier!

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(itemWidth, itemHeight, 32, 1),
    [itemWidth, itemHeight]
  )

  const materials = useMemo(() => {
    return textures.map((texture) => {
      const img = texture.image as
        | { width?: number; height?: number }
        | null
        | undefined
      const imageAspect = img?.width && img?.height ? img.width / img.height : 1

      return new THREE.ShaderMaterial({
        vertexShader: PanoramicVertexShader,
        fragmentShader: PanoramicFragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uVelocity: { value: 0 },
          uAngle: { value: 0 },
          uResolution: { value: new THREE.Vector2(itemWidth, itemHeight) },
          uImageAspect: { value: imageAspect },
          uMotionBlurIntensity: { value: motionBlurIntensity },
          uChromaticAberration: { value: chromaticAberrationIntensity },
          uFlexMultiplier: { value: flexMultiplier },
          uCornerRadius: { value: cornerRadius },
          uFadeEdge1: { value: fadeEdge1 },
          uFadeEdge2: { value: fadeEdge2 },
          uParallaxIntensity: { value: parallaxIntensity },
        },
        transparent: true,
        depthWrite: false,
      })
    })
  }, [
    textures,
    itemWidth,
    itemHeight,
    motionBlurIntensity,
    chromaticAberrationIntensity,
    flexMultiplier,
    cornerRadius,
    fadeEdge1,
    fadeEdge2,
    parallaxIntensity,
  ])

  useLayoutEffect(() => {
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

    const isReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    state.targetAngle = THREE.MathUtils.clamp(
      state.targetAngle,
      state.min,
      state.max
    )
    const prevAngle = state.currentAngle
    state.currentAngle = THREE.MathUtils.damp(
      state.currentAngle,
      state.targetAngle,
      lerpFactor! * 100,
      dt
    )

    const angleDelta = state.currentAngle - prevAngle
    const trueVelocity = isReducedMotion ? 0 : angleDelta / dt

    state.velocity = THREE.MathUtils.damp(state.velocity, trueVelocity, 5, dt)

    const targetFov = isReducedMotion
      ? baseFov!
      : baseFov! + Math.min(Math.abs(state.velocity) * fovMultiplier!, maxFovZoom!)

    const perspectiveCamera = camera as THREE.PerspectiveCamera
    perspectiveCamera.fov = THREE.MathUtils.damp(
      perspectiveCamera.fov,
      targetFov,
      4,
      dt
    )
    perspectiveCamera.updateProjectionMatrix()

    if (groupRef.current) {
      groupRef.current.children.forEach((mesh: any, i) => {
        const material = materials[i]
        if (!material) return

        const angle = i * angleSpacing - state.currentAngle

        mesh.position.x = Math.sin(angle) * radius
        mesh.position.z = (1.0 - Math.cos(angle)) * radius * depthMultiplier!
        mesh.rotation.y = -angle

        mesh.renderOrder = 1000 + Math.abs(angle) * 100

        material.uniforms.uVelocity.value = state.velocity
        material.uniforms.uAngle.value = angle
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

export const PanoramicCarousel = React.forwardRef<
  HTMLDivElement,
  PanoramicCarouselProps
>(
  (
    {
      images,
      className,
      cardWidthRatio = 0.4,
      cardAspectRatio = 1.4,
      scrollSensitivity = 0.005,
      lerpFactor = 0.08,
      radiusMultiplier = 1.4,
      gapMultiplier = 1.1,
      depthMultiplier = 1.0,
      baseFov = 45,
      maxFovZoom = 35,
      fovMultiplier = 1.2,
      motionBlurIntensity = 0.003,
      chromaticAberrationIntensity = 0.005,
      flexMultiplier = 0.15,
      cornerRadius = 0.04,
      fadeEdge1 = 0.5,
      fadeEdge2 = 1.5,
      parallaxIntensity = 0.08,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)

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

        const observer = Observer.create({
          target: containerRef.current,
          type: "wheel,touch,pointer",
          onWheel: (e) => {
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
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
          <p>Interactive 3D Image Carousel. Scroll to navigate.</p>
          {images.map((img, i) => (
            <img key={i} src={img} alt={`Slide ${i + 1}`} />
          ))}
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
            camera={{ position: [0, 0, 4.5], fov: baseFov }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: true }}
          >
            <React.Suspense fallback={null}>
              <PanoramicScene
                images={images}
                scrollState={scrollState}
                onReady={() => setIsLoaded(true)}
                cardWidthRatio={cardWidthRatio}
                cardAspectRatio={cardAspectRatio}
                lerpFactor={lerpFactor}
                radiusMultiplier={radiusMultiplier}
                gapMultiplier={gapMultiplier}
                depthMultiplier={depthMultiplier}
                baseFov={baseFov}
                maxFovZoom={maxFovZoom}
                fovMultiplier={fovMultiplier}
                motionBlurIntensity={motionBlurIntensity}
                chromaticAberrationIntensity={chromaticAberrationIntensity}
                flexMultiplier={flexMultiplier}
                cornerRadius={cornerRadius}
                fadeEdge1={fadeEdge1}
                fadeEdge2={fadeEdge2}
                parallaxIntensity={parallaxIntensity}
              />
            </React.Suspense>
          </Canvas>
        </div>
      </div>
    )
  }
)

PanoramicCarousel.displayName = "PanoramicCarousel"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { PanoramicCarousel } from "@/components/ui/panoramic-carousel"

export default function ExamplePage() {
  const images = [
    "/image1.jpg",
    "/image2.jpg",
    "/image3.jpg"
  ]

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <PanoramicCarousel
          images={images}
          motionBlurIntensity={0.005}
          flexMultiplier={0.1}
        />
      </div>
    </main>
  )
}
```
