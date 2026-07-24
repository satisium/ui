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

export interface CurvedCarouselProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Array of image URLs to load into the deck */
  images: string[]
  /** Percentage of screen width the card occupies on desktop. @default 0.35 */
  cardWidthRatio?: number
  /** Width-to-height ratio of the cards. @default 1.4 */
  cardAspectRatio?: number
  /** How heavily the scroll wheel affects movement. @default 0.005 */
  scrollSensitivity?: number
  /** How buttery smooth the momentum is (0.01 to 1). @default 0.08 */
  lerpFactor?: number
  /** The radius of the carousel cylinder. @default 1.2 */
  radiusMultiplier?: number
  /** How much the cards bow outward when spinning fast. @default 0.4 */
  centrifugalMultiplier?: number
  /** Intensity of the internal texture slide. @default 0.1 */
  parallaxIntensity?: number
  /** Intensity of the color split on scroll. @default 0.004 */
  chromaticAberrationIntensity?: number
  /** SDF corner radius (0.0 to 0.5). @default 0.04 */
  cornerRadius?: number
  /** How aggressively the cards fade as they move to the back. @default 1.5 */
  fadeMultiplier?: number
  /** How much the cards darken as they move to the back. @default 0.8 */
  dimmingMultiplier?: number
}

interface ScrollState {
  targetAngle: number
  currentAngle: number
  velocity: number
  min: number
  max: number
}

// --------------------------------------------------------
// GLSL SHADERS (Parallax, SDF Corners, Theme-Agnostic Fading)
// --------------------------------------------------------

const CurvedVertexShader = `
precision mediump float;
uniform float uVelocity;
uniform float uCentrifugalMultiplier;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // Centrifugal Flex: The faster the spin, the more the edges pull outward
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
uniform float uDepth; // 1.0 is front, -1.0 is back
uniform float uAngle; // Positional angle for parallax sliding
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
  
  // 1. Zoom in for Parallax Slide room
  vec2 parallaxUv = (vUv - 0.5) * (scale * 0.85) + 0.5;
  parallaxUv.x += clamp(uAngle, -1.0, 1.0) * uParallaxIntensity;

  // 2. Kinetic Chromatic Aberration
  float split = abs(uVelocity) * uChromaticAberration;
  float r = texture2D(uTexture, parallaxUv + vec2(split, 0.0)).r;
  float g = texture2D(uTexture, parallaxUv).g;
  float b = texture2D(uTexture, parallaxUv - vec2(split, 0.0)).b;
  vec4 texColor = vec4(r, g, b, 1.0);

  // 3. Smooth Corners (SDF)
  vec2 pos = vUv - 0.5;
  vec2 pixelPos = pos * uResolution;
  vec2 pixelSize = vec2(0.5) * uResolution;
  float pixelRadius = uCornerRadius * min(uResolution.x, uResolution.y);
  float dist = length(max(abs(pixelPos) - pixelSize + pixelRadius, 0.0)) - pixelRadius;
  float cornerAlpha = 1.0 - smoothstep(0.0, 1.5, dist);

  // 4. Atmospheric Perspective (Theme-Agnostic Alpha Fading)
  // Depth mapped from 0.0 (back) to 1.0 (front)
  float depthFactor = smoothstep(0.0, 1.0, (uDepth + 1.0) / 2.0);
  
  // Fade alpha elegantly so Shadcn bg-background acts as the fog
  float fadeAlpha = mix(0.0, 1.0, smoothstep(0.0, 1.0, depthFactor * uFadeMultiplier));
  
  // Add subtle dimming to simulate physical depth
  vec3 darkenedColor = mix(texColor.rgb * (1.0 - uDimmingMultiplier), texColor.rgb, depthFactor);

  gl_FragColor = vec4(darkenedColor, cornerAlpha * fadeAlpha);
}
`

// --------------------------------------------------------
// REACT THREE FIBER SCENE
// --------------------------------------------------------

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
  let itemWidth = isMobile
    ? viewport.width * 0.6
    : viewport.width * cardWidthRatio!
  let itemHeight = itemWidth * cardAspectRatio!

  // Clamp height to ensure cards never clip out of the camera frustum vertically
  const maxHeight = viewport.height * (isMobile ? 0.6 : 0.5)
  if (itemHeight > maxHeight) {
    itemHeight = maxHeight
    itemWidth = itemHeight / cardAspectRatio!
  }

  const radius = viewport.width * radiusMultiplier!
  // Determine arc distance between cards based on their width
  const angleSpacing = (itemWidth / radius) * 1.2

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(itemWidth, itemHeight, 32, 32),
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
        vertexShader: CurvedVertexShader,
        fragmentShader: CurvedFragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uVelocity: { value: 0 },
          uDepth: { value: 1.0 },
          uAngle: { value: 0.0 },
          uResolution: { value: new THREE.Vector2(itemWidth, itemHeight) },
          uImageAspect: { value: imageAspect },
          // WCAG Failsafes: Neutralize dizzying shader effects if requested
          uCentrifugalMultiplier: {
            value: isReducedMotion ? 0 : centrifugalMultiplier,
          },
          uParallaxIntensity: {
            value: isReducedMotion ? 0 : parallaxIntensity,
          },
          uChromaticAberration: {
            value: isReducedMotion ? 0 : chromaticAberrationIntensity,
          },
          uCornerRadius: { value: cornerRadius },
          uFadeMultiplier: { value: fadeMultiplier },
          uDimmingMultiplier: { value: dimmingMultiplier },
        },
        transparent: true,
        depthWrite: false, // Ensures alpha blending works perfectly without Z-glitches
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

  // Explicitly dispose of geometry and materials to prevent memory leaks in R3F
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
    const trueVelocity = angleDelta / dt

    state.velocity = THREE.MathUtils.damp(
      state.velocity,
      trueVelocity * 0.3,
      5,
      dt
    )

    if (groupRef.current) {
      groupRef.current.children.forEach(
        (mesh: THREE.Mesh | any, reversedIndex) => {
          const originalIndex = textures.length - 1 - reversedIndex
          const material = materials[originalIndex]

          if (!material) return

          const angle = originalIndex * angleSpacing - state.currentAngle

          // Cylindrical projection math
          mesh.position.x = Math.sin(angle) * radius
          mesh.position.z = Math.cos(angle) * radius - radius
          mesh.rotation.y = angle

          material.uniforms.uVelocity.value = state.velocity
          material.uniforms.uAngle.value = angle
          material.uniforms.uDepth.value = Math.cos(angle)
        }
      )
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

// --------------------------------------------------------
// WRAPPER COMPONENT
// --------------------------------------------------------

/**
 * CurvedCarousel
 *
 * A high-performance WebGL 3D cylindrical carousel for Satis UI.
 * Creates an immersive, spinning gallery of images utilizing custom GLSL shaders
 * for aerodynamic bending, SDF corner rounding, and kinetic chromatic aberration.
 */
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

    // Initialization and Event Setup
    useGSAP(
      () => {
        if (!containerRef.current) return

        // Set reduced motion state securely on the client
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
