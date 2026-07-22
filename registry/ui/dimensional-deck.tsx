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
  /** Percentage of screen width the card occupies on desktop. @default 0.35 */
  cardWidthRatio?: number
  /** Width-to-height ratio of the cards. @default 1.4 */
  cardAspectRatio?: number
  /** How heavily the scroll wheel affects movement. @default 0.04 */
  scrollSensitivity?: number
  /** How buttery smooth the momentum is (0.01 to 1). @default 0.08 */
  lerpFactor?: number
  /** How much the cards bow/bend physically when moving fast. @default 0.12 */
  bendMultiplier?: number
  /** The intensity of the kinetic RGB color splitting. @default 0.005 */
  rgbSplitStrength?: number
  /** Space between cards in relation to viewport height. @default 1.2 */
  stackSpacing?: number
  /** How much cards tilt backwards as they stack. @default 0.08 */
  tiltMultiplier?: number
}

interface ScrollState {
  targetY: number
  currentY: number
  velocity: number
  min: number
  max: number
}

// --------------------------------------------------------
// GLSL SHADERS (The Physics Engine)
// --------------------------------------------------------

const VertexShader = `
precision mediump float;

uniform float uVelocity;
uniform float uBendMultiplier;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Aerodynamic Paper Flex: Bends the card based on scroll velocity and bendMultiplier
  float curve = sin(uv.y * 3.14159);
  
  // Z-axis bowing (pulls the center of the card backward/forward)
  pos.z -= curve * uVelocity * uBendMultiplier;
  
  // Slight Y-axis compression to simulate physical strain
  pos.y += curve * abs(uVelocity) * (uBendMultiplier * 0.4);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

const FragmentShader = `
precision mediump float;

uniform sampler2D uTexture;
uniform float uVelocity;
uniform float uStackDepth;
uniform vec2 uResolution;
uniform float uImageAspect;
uniform float uRgbSplitStrength;

varying vec2 vUv;

// Object-fit: cover equivalent for WebGL
vec2 getCoverUv(vec2 uv, vec2 resolution, float imageAspect) {
  float screenAspect = resolution.x / resolution.y;
  vec2 scale = vec2(1.0);
  if (screenAspect > imageAspect) {
    scale.y = imageAspect / screenAspect;
  } else {
    scale.x = screenAspect / imageAspect;
  }
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 coverUv = getCoverUv(vUv, uResolution, uImageAspect);
  
  // Kinetic RGB Split based on movement speed and custom strength
  float split = abs(uVelocity) * uRgbSplitStrength;
  float r = texture2D(uTexture, coverUv + vec2(0.0, split)).r;
  float g = texture2D(uTexture, coverUv).g;
  float b = texture2D(uTexture, coverUv - vec2(0.0, split)).b;
  
  vec3 texColor = vec3(r, g, b);

  // Dynamic Ambient Occlusion: Darken as it gets pushed deeper into the Z-stack
  float shadow = smoothstep(0.0, 4.0, uStackDepth) * 0.6; 
  vec3 darkenedColor = mix(texColor, vec3(0.0), shadow);

  // Fade out completely when pushed too far back to save rendering performance
  float alpha = 1.0 - smoothstep(3.0, 7.0, uStackDepth);

  gl_FragColor = vec4(darkenedColor, alpha);
}
`

// --------------------------------------------------------
// REACT THREE FIBER SCENE
// --------------------------------------------------------

function DeckItem({
  texture,
  index,
  scrollState,
  itemWidth,
  itemHeight,
  spacing,
  bendMultiplier,
  rgbSplitStrength,
  tiltMultiplier,
}: {
  texture: THREE.Texture
  index: number
  scrollState: React.MutableRefObject<ScrollState>
  itemWidth: number
  itemHeight: number
  spacing: number
  bendMultiplier: number
  rgbSplitStrength: number
  tiltMultiplier: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const img = texture.image as { width: number; height: number } | undefined
  const imageAspect = img?.width && img?.height ? img.width / img.height : 1

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uVelocity: { value: 0 },
      uStackDepth: { value: 0 },
      uResolution: { value: new THREE.Vector2(itemWidth, itemHeight) },
      uImageAspect: { value: imageAspect },
      uBendMultiplier: { value: bendMultiplier },
      uRgbSplitStrength: { value: rgbSplitStrength },
    }),
    [
      texture,
      itemWidth,
      itemHeight,
      imageAspect,
      bendMultiplier,
      rgbSplitStrength,
    ]
  )

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return

    const state = scrollState.current
    const relativeY = index * spacing - state.currentY

    // If the card is the active one or has passed the camera
    if (relativeY > 0) {
      meshRef.current.position.y = -relativeY
      meshRef.current.position.z = 0
      meshRef.current.rotation.x = 0
      materialRef.current.uniforms.uStackDepth.value = 0
    } else {
      // Pushed back into the stack
      meshRef.current.position.y = relativeY * 0.1
      meshRef.current.position.z = relativeY * 0.8
      meshRef.current.rotation.x = relativeY * tiltMultiplier
      materialRef.current.uniforms.uStackDepth.value = -relativeY
    }

    materialRef.current.uniforms.uVelocity.value = state.velocity
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[itemWidth, itemHeight, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VertexShader}
        fragmentShader={FragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  )
}

function DeckScene({
  images,
  scrollState,
  onReady,
  cardWidthRatio,
  cardAspectRatio,
  lerpFactor,
  stackSpacing,
  bendMultiplier,
  rgbSplitStrength,
  tiltMultiplier,
}: {
  images: string[]
  scrollState: React.MutableRefObject<ScrollState>
  onReady: () => void
  cardWidthRatio: number
  cardAspectRatio: number
  lerpFactor: number
  stackSpacing: number
  bendMultiplier: number
  rgbSplitStrength: number
  tiltMultiplier: number
}) {
  const textures = useTexture(images)
  const { viewport } = useThree()

  // --- THE SIZE CLAMPING FIX ---
  // Calculates base width relative to the screen
  const isMobile = viewport.width < 5
  let itemWidth = isMobile
    ? viewport.width * 0.6
    : viewport.width * cardWidthRatio
  let itemHeight = itemWidth * cardAspectRatio

  // Clamps the height so it never exceeds 60% of the screen height (50% on desktop)
  // This guarantees the cards stay perfectly "small and in the middle"
  const maxHeight = viewport.height * (isMobile ? 0.6 : 0.5)
  if (itemHeight > maxHeight) {
    itemHeight = maxHeight
    itemWidth = itemHeight / cardAspectRatio
  }

  const spacing = viewport.height * stackSpacing

  useEffect(() => {
    scrollState.current.min = 0
    scrollState.current.max = (images.length - 1) * spacing
    requestAnimationFrame(() => onReady())
  }, [images.length, spacing, scrollState, onReady])

  useFrame(() => {
    const state = scrollState.current

    state.targetY = THREE.MathUtils.clamp(state.targetY, state.min, state.max)
    const prevY = state.currentY

    // Custom lerp factor for butter-smooth momentum
    state.currentY = THREE.MathUtils.lerp(
      state.currentY,
      state.targetY,
      lerpFactor
    )

    // Calculate normalized velocity to feed into the WebGL shaders
    const rawVelocity = (state.currentY - prevY) * 15.0
    state.velocity = THREE.MathUtils.lerp(state.velocity, rawVelocity, 0.15)
  })

  return (
    <group>
      {/* Reverse the array mapping so the first item renders on top of the Z-stack */}
      {[...textures].reverse().map((texture, reversedIndex) => {
        const originalIndex = textures.length - 1 - reversedIndex
        return (
          <DeckItem
            key={originalIndex}
            texture={texture}
            index={originalIndex}
            scrollState={scrollState}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
            spacing={spacing}
            bendMultiplier={bendMultiplier}
            rgbSplitStrength={rgbSplitStrength}
            tiltMultiplier={tiltMultiplier}
          />
        )
      })}
    </group>
  )
}

// --------------------------------------------------------
// MAIN WRAPPER COMPONENT
// --------------------------------------------------------

/**
 * DimensionalDeck
 *
 * A high-performance WebGL scroll component for Satis UI.
 * Creates an immersive, 3D stacked deck of images that respond fluidly to scroll
 * and touch momentum anywhere on the container, utilizing custom GLSL shaders for
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
      bendMultiplier = 0.15,
      rgbSplitStrength = 0.003,
      stackSpacing = 1.2,
      tiltMultiplier = 0.08,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

    const scrollState = useRef<ScrollState>({
      targetY: 0,
      currentY: 0,
      velocity: 0,
      min: 0,
      max: 0,
    })

    // Local Scroll & Touch Observer
    // Captures input precisely within the container so it doesn't hijack the whole page uncontrollably
    useGSAP(
      () => {
        if (!containerRef.current) return

        const observer = Observer.create({
          target: containerRef.current,
          type: "wheel,touch,pointer",
          onChangeY: (e) => {
            const state = scrollState.current
            // Prevent standard scroll if we aren't at the very edges of the deck
            const isAtTop = state.targetY <= state.min && e.deltaY < 0
            const isAtBottom = state.targetY >= state.max && e.deltaY > 0

            if (!isAtTop && !isAtBottom) {
              state.targetY += e.deltaY * scrollSensitivity
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
          "relative h-full w-full cursor-grab touch-none overflow-hidden active:cursor-grabbing",
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
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
            <React.Suspense fallback={null}>
              <DeckScene
                images={images}
                scrollState={scrollState}
                onReady={() => setIsLoaded(true)}
                cardWidthRatio={cardWidthRatio}
                cardAspectRatio={cardAspectRatio}
                lerpFactor={lerpFactor}
                stackSpacing={stackSpacing}
                bendMultiplier={bendMultiplier}
                rgbSplitStrength={rgbSplitStrength}
                tiltMultiplier={tiltMultiplier}
              />
            </React.Suspense>
          </Canvas>
        </div>
      </div>
    )
  }
)

DimensionalDeck.displayName = "DimensionalDeck"
