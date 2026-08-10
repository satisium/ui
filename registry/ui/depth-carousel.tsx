"use client"

import React, { useRef, useState, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useTexture, ContactShadows } from "@react-three/drei"
import * as THREE from "three"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Observer } from "gsap/Observer"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer)
}

export interface DepthCarouselProps extends Omit<
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
  /** Base multiplier for the curved background spread. @default 0.7 */
  gapMultiplier?: number
  /** The exact buffer pushed around the active center card. @default 0.25 */
  activeGapMultiplier?: number

  // --- Unified Physics ---
  /** How heavily the scroll wheel affects movement. @default 0.003 */
  scrollSensitivity?: number
  /** How buttery smooth the momentum is. @default 0.06 */
  lerpFactor?: number

  // --- Unified Geometry ---
  /** How deeply background cards push into the Z-axis. @default 0.25 */
  depthMultiplier?: number
  /** How much background cards scale down. @default 0.15 */
  scaleMultiplier?: number
  /** The subtle inward tilt of background cards. @default 0.1 */
  rotationMultiplier?: number

  // --- Unified Shaders ---
  /** Internal image sliding effect. @default 0.08 */
  parallaxIntensity?: number
  /** Kinetic RGB split on scroll. @default 0.01 */
  chromaticAberrationIntensity?: number
  /** How much background cards darken. @default 0.85 */
  dimmingMultiplier?: number
  /** SDF corner radius. @default 0.03 */
  cornerRadius?: number
  /** Contact shadow intensity. @default 0.6 */
  shadowOpacity?: number
}

interface ScrollState {
  target: number
  current: number
  velocity: number
  isDragging: boolean
  min: number
  max: number
}

// --------------------------------------------------------
// GLSL SHADERS (Unified Variables, Parallax & RGB Split)
// --------------------------------------------------------

const DepthVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const DepthFragmentShader = `
precision mediump float;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uImageAspect;
uniform float uActive; 
uniform float uVelocity;
uniform float uParallax;
uniform float uParallaxIntensity; 
uniform float uChromaticAberrationIntensity;
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
  
  // Parallax Slide (Zoomed in by 15% to allow room to pan)
  vec2 parallaxUv = (vUv - 0.5) * (scale * 0.85) + 0.5;
  parallaxUv.x += clamp(uParallax, -1.0, 1.0) * uParallaxIntensity;
  
  // Kinetic RGB Split based on velocity
  float split = abs(uVelocity) * uChromaticAberrationIntensity;
  float r = texture2D(uTexture, parallaxUv + vec2(split, 0.0)).r;
  float g = texture2D(uTexture, parallaxUv).g;
  float b = texture2D(uTexture, parallaxUv - vec2(split, 0.0)).b;
  vec3 texColor = vec3(r, g, b);

  // Smooth SDF Corners
  vec2 pos = vUv - 0.5;
  vec2 pixelPos = pos * uResolution;
  vec2 pixelSize = vec2(0.5) * uResolution;
  float pixelRadius = uCornerRadius * min(uResolution.x, uResolution.y); 
  
  float dist = length(max(abs(pixelPos) - pixelSize + pixelRadius, 0.0)) - pixelRadius;
  float alpha = 1.0 - smoothstep(0.0, 1.5, dist);

  // Structural Dimming (Deeper items get darker based on multiplier)
  float dimBaseline = 1.0 - uDimmingMultiplier;
  vec3 color = mix(texColor * dimBaseline, texColor, uActive);

  gl_FragColor = vec4(color, alpha);
}
`

// --------------------------------------------------------
// REACT THREE FIBER SCENE
// --------------------------------------------------------

function DepthScene({
  images,
  scrollState,
  onReady,
  cardWidthRatio,
  cardAspectRatio,
  lerpFactor,
  gapMultiplier,
  activeGapMultiplier,
  depthMultiplier,
  scaleMultiplier,
  rotationMultiplier,
  parallaxIntensity,
  chromaticAberrationIntensity,
  dimmingMultiplier,
  cornerRadius,
  shadowOpacity,
}: DepthCarouselProps & {
  scrollState: React.MutableRefObject<ScrollState>
  onReady: () => void
}) {
  const textures = useTexture(images)
  const { viewport } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  // Dynamically clamp size so it remains beautifully constrained in the middle of the screen
  const isMobile = viewport.width < 5
  let itemWidth = isMobile
    ? viewport.width * 0.65
    : viewport.width * cardWidthRatio!
  let itemHeight = itemWidth * cardAspectRatio!

  const maxHeight = viewport.height * (isMobile ? 0.6 : 0.65)
  if (itemHeight > maxHeight) {
    itemHeight = maxHeight
    itemWidth = itemHeight / cardAspectRatio!
  }

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(itemWidth, itemHeight, 1, 1),
    [itemWidth, itemHeight]
  )

  const materials = useMemo(() => {
    return textures.map((texture) => {
      // TS FIX: Strictly typed image object
      const img = texture.image as
        | { width?: number; height?: number }
        | null
        | undefined
      const imageAspect = img?.width && img?.height ? img.width / img.height : 1

      return new THREE.ShaderMaterial({
        vertexShader: DepthVertexShader,
        fragmentShader: DepthFragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uVelocity: { value: 0 },
          uResolution: { value: new THREE.Vector2(itemWidth, itemHeight) },
          uImageAspect: { value: imageAspect },
          uParallax: { value: 0 },
          uActive: { value: 1.0 },
          uParallaxIntensity: { value: parallaxIntensity },
          uChromaticAberrationIntensity: {
            value: chromaticAberrationIntensity,
          },
          uCornerRadius: { value: cornerRadius },
          uDimmingMultiplier: { value: dimmingMultiplier },
        },
        transparent: true,
        depthWrite: false, // Prevents z-fighting on overlapping translucent edges
      })
    })
  }, [
    textures,
    itemWidth,
    itemHeight,
    parallaxIntensity,
    chromaticAberrationIntensity,
    cornerRadius,
    dimmingMultiplier,
  ])

  useEffect(() => {
    return () => {
      geometry.dispose()
      materials.forEach((m) => m.dispose())
    }
  }, [geometry, materials])

  useEffect(() => {
    scrollState.current.min = 0
    scrollState.current.max = images.length - 1
    requestAnimationFrame(() => onReady())
  }, [images.length, scrollState, onReady])

  useFrame((_, delta) => {
    const state = scrollState.current
    const dt = Math.min(delta, 0.1)

    // Velocity Tracking for Shader FX
    const prev = state.current

    // Magnetic Snapping logic
    const diff = Math.abs(state.target - state.current)
    const nearest = Math.round(state.target)

    if (!state.isDragging && diff < 0.25) {
      state.target = THREE.MathUtils.damp(state.target, nearest, 2, dt)
    }

    state.target = THREE.MathUtils.clamp(state.target, state.min, state.max)
    state.current = THREE.MathUtils.damp(
      state.current,
      state.target,
      lerpFactor! * 100,
      dt
    )

    const rawVelocity = (state.current - prev) / dt
    state.velocity = THREE.MathUtils.damp(state.velocity, rawVelocity, 5, dt)

    if (groupRef.current) {
      groupRef.current.children.forEach((mesh: any, i) => {
        const material = materials[i]
        if (!material) return

        const dfc = i - state.current
        const absDfc = Math.abs(dfc)

        // 1. Base Curved Spread
        let xOffset =
          Math.sign(dfc) * itemWidth * gapMultiplier! * Math.pow(absDfc, 0.8)

        // 2. Active Buffer (Anti-Overlap Fix)
        const activeBuffer =
          Math.sign(dfc) *
          Math.min(absDfc, 1.0) *
          (itemWidth * activeGapMultiplier!)
        xOffset += activeBuffer

        const zOffset = -absDfc * (itemWidth * depthMultiplier!)
        const scale = Math.max(1.0 - absDfc * scaleMultiplier!, 0.5)
        const yRot = -dfc * rotationMultiplier!

        mesh.position.set(xOffset, 0, zOffset)
        mesh.rotation.set(0, yRot, 0)
        mesh.scale.set(scale, scale, scale)

        // Perfect Center-Focused Rendering Order
        mesh.renderOrder = 1000 - absDfc * 10

        // Push values to the GLSL Shaders
        material.uniforms.uVelocity.value = state.velocity
        material.uniforms.uParallax.value = dfc
        material.uniforms.uActive.value = Math.max(1.0 - absDfc * 0.6, 0.0)
      })
    }
  })

  return (
    <group ref={groupRef}>
      {textures.map((_, i) => (
        <mesh key={i} geometry={geometry} material={materials[i]} />
      ))}

      {shadowOpacity! > 0 && (
        <ContactShadows
          position={[0, -itemHeight / 2 - 0.2, 0]}
          opacity={shadowOpacity}
          scale={20}
          blur={2.5}
          far={4}
          color="#000000"
        />
      )}
    </group>
  )
}

// --------------------------------------------------------
// WRAPPER COMPONENT
// --------------------------------------------------------

/**
 * DepthCarousel
 *
 * A premium WebGL coverflow carousel for Satisium UI.
 * Unites physics-based GSAP scroll tracking with custom GLSL shaders
 * to provide SDF corner rounding, internal parallax windowing, and kinetic RGB splitting.
 */
export const DepthCarousel = React.forwardRef<
  HTMLDivElement,
  DepthCarouselProps
>(
  (
    {
      images,
      className,
      cardWidthRatio = 0.35,
      cardAspectRatio = 1.4,
      gapMultiplier = 0.7,
      activeGapMultiplier = 0.25,
      depthMultiplier = 0.25,
      scaleMultiplier = 0.15,
      rotationMultiplier = 0.1,
      scrollSensitivity = 0.003,
      lerpFactor = 0.06,
      parallaxIntensity = 0.08,
      chromaticAberrationIntensity = 0.01,
      dimmingMultiplier = 0.85,
      cornerRadius = 0.03,
      shadowOpacity = 0.6,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

    const scrollState = useRef<ScrollState>({
      target: 0,
      current: 0,
      velocity: 0,
      isDragging: false,
      min: 0,
      max: 0,
    })

    useGSAP(
      () => {
        if (!containerRef.current) return

        const observer = Observer.create({
          target: containerRef.current,
          type: "wheel,touch,pointer",
          onPress: () => {
            scrollState.current.isDragging = true
          },
          onRelease: () => {
            scrollState.current.isDragging = false
          },
          onWheel: (e) => {
            const delta = (e.deltaX || 0) + (e.deltaY || 0)
            scrollState.current.target += delta * scrollSensitivity
          },
          onDrag: (e) => {
            scrollState.current.target -= e.deltaX * scrollSensitivity
          },
          onStop: () => {
            scrollState.current.isDragging = false
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
          <p>
            Interactive Premium Depth Carousel. Scroll or swipe to navigate.
          </p>
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
            camera={{ position: [0, 0, 4.5], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: true }}
          >
            <React.Suspense fallback={null}>
              <DepthScene
                images={images}
                scrollState={scrollState}
                onReady={() => setIsLoaded(true)}
                cardWidthRatio={cardWidthRatio}
                cardAspectRatio={cardAspectRatio}
                gapMultiplier={gapMultiplier}
                activeGapMultiplier={activeGapMultiplier}
                depthMultiplier={depthMultiplier}
                scaleMultiplier={scaleMultiplier}
                rotationMultiplier={rotationMultiplier}
                lerpFactor={lerpFactor}
                parallaxIntensity={parallaxIntensity}
                chromaticAberrationIntensity={chromaticAberrationIntensity}
                dimmingMultiplier={dimmingMultiplier}
                cornerRadius={cornerRadius}
                shadowOpacity={shadowOpacity}
              />
            </React.Suspense>
          </Canvas>
        </div>
      </div>
    )
  }
)

DepthCarousel.displayName = "DepthCarousel"
