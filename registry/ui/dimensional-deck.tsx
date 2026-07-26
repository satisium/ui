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
  /** Array of image URLs to load into the deck */
  images: string[]

  // --- Unified Base Layout ---
  /** Percentage of screen width the card occupies on desktop. @default 0.35 */
  cardWidthRatio?: number
  /** Width-to-height ratio of the cards. @default 1.4 */
  cardAspectRatio?: number
  /** Spacing distance between cards in the 3D space. @default 1.2 */
  gapMultiplier?: number

  // --- Unified Physics ---
  /** How heavily the scroll wheel/drag affects movement. @default 0.04 */
  scrollSensitivity?: number
  /** How buttery smooth the momentum is (0.01 to 1). @default 0.08 */
  lerpFactor?: number

  // --- Unified Geometry ---
  /** How tightly the cards stack on top of each other at the friction point. @default 0.1 */
  stackGapMultiplier?: number
  /** How deeply the cards push into the background Z-axis. @default 0.8 */
  depthMultiplier?: number
  /** Aerodynamic paper bend physics when scrolling fast. @default 0.15 */
  flexMultiplier?: number
  /** The tilt angle when resting in the stack. @default 0.08 */
  rotationMultiplier?: number

  // --- Unified Shaders ---
  /** Intensity of the internal texture slide. @default 0.1 */
  parallaxIntensity?: number
  /** Intensity of the kinetic color split on scroll. @default 0.005 */
  chromaticAberrationIntensity?: number
  /** How much the cards darken as they move to the back. @default 0.6 */
  dimmingMultiplier?: number
  /** SDF corner radius (0.0 to 0.5). @default 0.04 */
  cornerRadius?: number
}

interface ScrollState {
  targetY: number
  currentY: number
  velocity: number
  min: number
  max: number
}

// --------------------------------------------------------
// GLSL SHADERS (Unified Variables, SDF Corners, Parallax)
// --------------------------------------------------------

const DeckVertexShader = `
precision mediump float;
uniform float uVelocity;
uniform float uFlexMultiplier;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Aerodynamic Paper Flex: Bends the card based on scroll velocity
  float curve = sin(uv.y * 3.14159);
  
  // Z-axis bowing (pulls the center of the card backward/forward)
  pos.z -= curve * uVelocity * uFlexMultiplier;
  
  // Slight Y-axis compression to simulate physical strain
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
  
  // 1. Zoom in for Parallax
  vec2 parallaxUv = (vUv - 0.5) * (scale * 0.85) + 0.5;
  // Use Stack Depth to drive the parallax slide seamlessly on the Y-axis
  parallaxUv.y += clamp(uStackDepth * 0.1, -1.0, 1.0) * uParallaxIntensity;

  // 2. Kinetic RGB Split
  float split = abs(uVelocity) * uChromaticAberrationIntensity;
  float r = texture2D(uTexture, parallaxUv + vec2(0.0, split)).r;
  float g = texture2D(uTexture, parallaxUv).g;
  float b = texture2D(uTexture, parallaxUv - vec2(0.0, split)).b;
  vec3 texColor = vec3(r, g, b);

  // 3. Smooth SDF Corners
  vec2 pos = vUv - 0.5;
  vec2 pixelPos = pos * uResolution;
  vec2 pixelSize = vec2(0.5) * uResolution;
  float pixelRadius = uCornerRadius * min(uResolution.x, uResolution.y); 
  float dist = length(max(abs(pixelPos) - pixelSize + pixelRadius, 0.0)) - pixelRadius;
  float cornerAlpha = 1.0 - smoothstep(0.0, 1.5, dist);

  // 4. Dynamic Ambient Occlusion & Alpha Fading
  float shadow = smoothstep(0.0, 4.0, uStackDepth) * uDimmingMultiplier; 
  vec3 darkenedColor = mix(texColor, vec3(0.0), shadow);

  // Fade out completely when pushed too far back to the top
  float fadeAlpha = 1.0 - smoothstep(3.0, 7.0, uStackDepth);

  gl_FragColor = vec4(darkenedColor, cornerAlpha * fadeAlpha);
}
`

// --------------------------------------------------------
// REACT THREE FIBER SCENE
// --------------------------------------------------------

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

  // --- THE SIZE CLAMPING FIX ---
  // Guarantees cards never clip vertically out of the camera bounds
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
      // Strictly typed image object to permanently fix TS compilation errors
      const img = texture.image as
        | { width?: number; height?: number }
        | null
        | undefined
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
          // WCAG Failsafes: Disable dizzying physics for motion sensitive users
          uFlexMultiplier: { value: isReducedMotion ? 0 : flexMultiplier },
          uParallaxIntensity: {
            value: isReducedMotion ? 0 : parallaxIntensity,
          },
          uChromaticAberrationIntensity: {
            value: isReducedMotion ? 0 : chromaticAberrationIntensity,
          },
        },
        transparent: true,
        depthWrite: false, // Prevents alpha blending Z-fighting glitches
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

  // Explicitly dispose of R3F resources to prevent memory leaks
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
          // PHASE 1: Arriving from the bottom
          y = -relativeY
          z = 0
          rotX = 0
        } else {
          // PHASE 2: Friction Zone - Stacking tightly at the top
          y = relativeY * stackGapMultiplier!
          z = relativeY * depthMultiplier!
          rotX = relativeY * rotationMultiplier!
          stackDepth = Math.abs(relativeY)
        }

        mesh.position.set(0, y, z)
        mesh.rotation.set(rotX, 0, 0)

        // Z-SORTING: Active card is always drawn last (on top)
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

// --------------------------------------------------------
// WRAPPER COMPONENT
// --------------------------------------------------------

/**
 * DimensionalDeck
 *
 * A high-performance WebGL scroll component for Satis UI.
 * Creates an immersive, 3D stacked deck of images that respond fluidly to scroll
 * and touch momentum anywhere on the screen, utilizing custom GLSL shaders for
 * kinetic RGB splitting and aerodynamic bending.
 */
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

        // Set reduced motion state securely on the client
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        setIsReducedMotion(mediaQuery.matches)

        const observer = Observer.create({
          target: containerRef.current,
          type: "wheel,touch,pointer",
          onWheel: (e) => {
            const state = scrollState.current
            // Use highest magnitude delta to allow both vertical and horizontal scrollwheels
            const delta =
              Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX

            const isAtTop = state.targetY <= state.min && delta < 0
            const isAtBottom = state.targetY >= state.max && delta > 0

            if (!isAtTop && !isAtBottom) {
              state.targetY += delta * scrollSensitivity
            }
          },
          onDrag: (e) => {
            const state = scrollState.current
            // Inverted for natural drag
            const delta =
              Math.abs(e.deltaY) > Math.abs(e.deltaX) ? -e.deltaY : -e.deltaX

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
        {/* Screen Reader Access: Visually hidden list of the loaded images */}
        <div className="sr-only" aria-live="polite">
          <p>Interactive 3D Image Deck. Scroll to navigate.</p>
          {images.map((img, i) => (
            <img key={i} src={img} alt={`Slide ${i + 1}`} />
          ))}
        </div>

        {/* Loading Cover */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background transition-opacity duration-1000",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
        />

        {/* 3D Canvas */}
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
