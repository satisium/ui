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

export interface CoverCarouselProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Array of image URLs to load into the deck */
  images: string[]
  className?: string
  /** Percentage of screen width the card occupies on desktop. @default 0.35 */
  cardWidthRatio?: number
  /** Width-to-height ratio of the cards. @default 1.4 */
  cardAspectRatio?: number
  /** How heavily the scroll wheel affects movement. @default 0.003 */
  scrollSensitivity?: number
  /** How buttery smooth the momentum is (0.01 to 1). @default 0.06 */
  lerpFactor?: number
  /** How much the image slides internally. @default 0.08 */
  parallaxIntensity?: number
  /** The gap between the center card and the adjacent cards. @default 0.55 */
  activeGapMultiplier?: number
  /** The gap between background overlapping cards. @default 0.15 */
  stackGapMultiplier?: number
  /** Pushes the background cards deep into the Z-axis. @default 0.4 */
  maxZOffsetMultiplier?: number
  /** Subtle Z-spacing for background stack to prevent clipping. @default 0.02 */
  stackZOffsetMultiplier?: number
  /** The maximum Y-rotation of the cards as they slide away. @default 0.8 */
  rotationMultiplier?: number
  /** How much background cards scale down. @default 0.15 */
  scaleMultiplier?: number
  /** How much background cards darken (0.0 to 1.0). @default 0.85 */
  dimmingFactor?: number
  /** SDF corner radius (0.0 to 0.5). @default 0.04 */
  cornerRadius?: number
  /** Opacity of the grounded shadow. @default 0.6 */
  shadowOpacity?: number
}

interface ScrollState {
  target: number
  current: number
  isDragging: boolean
  min: number
  max: number
}

// --------------------------------------------------------
// GLSL SHADER (Parallax, Smoothing, Dimming)
// --------------------------------------------------------

const CoverVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const CoverFragmentShader = `
precision mediump float;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uImageAspect;
uniform float uActive; 
uniform float uParallax;
uniform float uParallaxIntensity;
uniform float uCornerRadius;
uniform float uDimmingFactor;

varying vec2 vUv;

void main() {
  float screenAspect = uResolution.x / uResolution.y;
  vec2 scale = vec2(1.0);
  if (screenAspect > uImageAspect) {
    scale.y = uImageAspect / screenAspect;
  } else {
    scale.x = screenAspect / uImageAspect;
  }
  
  // Zoom in by 15% for parallax slide room
  vec2 parallaxUv = (vUv - 0.5) * (scale * 0.85) + 0.5;
  parallaxUv.x += clamp(uParallax, -1.0, 1.0) * uParallaxIntensity;
  
  vec4 texColor = texture2D(uTexture, parallaxUv);

  vec2 pos = vUv - 0.5;
  vec2 pixelPos = pos * uResolution;
  vec2 pixelSize = vec2(0.5) * uResolution;
  float pixelRadius = uCornerRadius * min(uResolution.x, uResolution.y); 
  
  // Anti-aliased SDF rounded corners
  float dist = length(max(abs(pixelPos) - pixelSize + pixelRadius, 0.0)) - pixelRadius;
  float alpha = 1.0 - smoothstep(0.0, 1.5, dist);

  // Custom dimming baseline calculation
  float dimBaseline = 1.0 - uDimmingFactor;
  vec3 color = mix(texColor.rgb * dimBaseline, texColor.rgb, uActive);

  gl_FragColor = vec4(color, alpha);
}
`

// --------------------------------------------------------
// REACT THREE FIBER SCENE
// --------------------------------------------------------

function CoverScene({
  images,
  scrollState,
  onReady,
  cardWidthRatio = 0.35,
  cardAspectRatio = 1.4,
  lerpFactor = 0.06,
  parallaxIntensity,
  activeGapMultiplier = 0.55,
  stackGapMultiplier = 0.15,
  maxZOffsetMultiplier = 0.4,
  stackZOffsetMultiplier = 0.02,
  rotationMultiplier = 0.8,
  scaleMultiplier = 0.15,
  dimmingFactor = 0.85,
  cornerRadius = 0.04,
  shadowOpacity = 0.6,
}: CoverCarouselProps & {
  scrollState: React.MutableRefObject<ScrollState>
  onReady: () => void
}) {
  const textures = useTexture(images)
  const { viewport } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  const isMobile = viewport.width < 5
  let itemWidth = isMobile
    ? viewport.width * 0.65
    : viewport.width * cardWidthRatio
  let itemHeight = itemWidth * cardAspectRatio

  const maxHeight = viewport.height * (isMobile ? 0.6 : 0.65)
  if (itemHeight > maxHeight) {
    itemHeight = maxHeight
    itemWidth = itemHeight / cardAspectRatio
  }

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(itemWidth, itemHeight, 1, 1),
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
        vertexShader: CoverVertexShader,
        fragmentShader: CoverFragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uResolution: { value: new THREE.Vector2(itemWidth, itemHeight) },
          uImageAspect: { value: imageAspect },
          uActive: { value: 1.0 },
          uParallax: { value: 0.0 },
          uParallaxIntensity: { value: parallaxIntensity },
          uCornerRadius: { value: cornerRadius },
          uDimmingFactor: { value: dimmingFactor },
        },
        transparent: true,
        depthWrite: false,
      })
    })
  }, [
    textures,
    itemWidth,
    itemHeight,
    parallaxIntensity,
    cornerRadius,
    dimmingFactor,
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

    const diff = Math.abs(state.target - state.current)
    const nearest = Math.round(state.target)

    if (!state.isDragging && diff < 0.25) {
      state.target = THREE.MathUtils.damp(state.target, nearest, 2, dt)
    }

    state.target = THREE.MathUtils.clamp(state.target, state.min, state.max)
    state.current = THREE.MathUtils.damp(
      state.current,
      state.target,
      lerpFactor * 100,
      dt
    )

    if (groupRef.current) {
      groupRef.current.children.forEach((mesh: THREE.Object3D, i) => {
        const material = materials[i]
        if (!material) return

        const dfc = i - state.current
        const absDfc = Math.abs(dfc)

        // CUBIC EASE-OUT "ANTI-POP" ALGORITHM
        const t = Math.min(absDfc, 1.0)
        const easeOut = 1.0 - Math.pow(1.0 - t, 3.0)

        // DYNAMIC POSITIONING USING MULTIPLIERS
        const activeGap = itemWidth * activeGapMultiplier
        const stackSpacing = itemWidth * stackGapMultiplier

        const xOffset =
          Math.sign(dfc) * (absDfc * stackSpacing + easeOut * activeGap)
        const zOffset =
          -easeOut * (itemWidth * maxZOffsetMultiplier) -
          absDfc * (itemWidth * stackZOffsetMultiplier)

        const yRot = Math.sign(dfc) * easeOut * -rotationMultiplier
        const scale = 1.0 - easeOut * scaleMultiplier

        mesh.position.set(xOffset, 0, zOffset)
        mesh.rotation.set(0, yRot, 0)
        mesh.scale.set(scale, scale, scale)

        // GUARANTEED LAYER SORTING (No Z-fighting)
        mesh.renderOrder = 1000 - absDfc * 10

        // UNIFORM UPDATES
        material.uniforms.uParallax.value = dfc
        // 0.5 scaling dictates how quickly cards darken as they leave the center
        material.uniforms.uActive.value = Math.max(1.0 - absDfc * 0.5, 0.0)
      })
    }
  })

  return (
    <group ref={groupRef}>
      {textures.map((_, i) => (
        <mesh key={i} geometry={geometry} material={materials[i]} />
      ))}

      {shadowOpacity > 0 && (
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
// MAIN WRAPPER COMPONENT
// --------------------------------------------------------

/**
 * CoverCarousel
 *
 * A highly sophisticated Cover Flow 3D carousel for Satisium UI.
 * Renders an immersive, hardware-accelerated stack of images using custom GLSL shaders
 * for dynamic ambient occlusion, internal parallax, and SDF rounded corners.
 */
export const CoverCarousel = React.forwardRef<
  HTMLDivElement,
  CoverCarouselProps
>(
  (
    {
      images,
      className,
      cardWidthRatio = 0.35,
      cardAspectRatio = 1.4,
      scrollSensitivity = 0.003,
      lerpFactor = 0.06,
      parallaxIntensity = 0.08,
      activeGapMultiplier = 0.55,
      stackGapMultiplier = 0.15,
      maxZOffsetMultiplier = 0.4,
      stackZOffsetMultiplier = 0.02,
      rotationMultiplier = 0.8,
      scaleMultiplier = 0.15,
      dimmingFactor = 0.85,
      cornerRadius = 0.04,
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
        role="region"
        aria-roledescription="carousel"
        className={cn(
          "relative h-full w-full cursor-grab touch-none overflow-hidden bg-background text-foreground active:cursor-grabbing",
          className
        )}
        {...props}
      >
        <div className="sr-only" aria-live="polite">
          <p>Interactive 3D Image Deck. Scroll to navigate.</p>
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
            camera={{ position: [0, 0, 4.5], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: true }}
          >
            <React.Suspense fallback={null}>
              <CoverScene
                images={images}
                scrollState={scrollState}
                onReady={() => setIsLoaded(true)}
                cardWidthRatio={cardWidthRatio}
                cardAspectRatio={cardAspectRatio}
                lerpFactor={lerpFactor}
                parallaxIntensity={parallaxIntensity}
                activeGapMultiplier={activeGapMultiplier}
                stackGapMultiplier={stackGapMultiplier}
                maxZOffsetMultiplier={maxZOffsetMultiplier}
                stackZOffsetMultiplier={stackZOffsetMultiplier}
                rotationMultiplier={rotationMultiplier}
                scaleMultiplier={scaleMultiplier}
                dimmingFactor={dimmingFactor}
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

CoverCarousel.displayName = "CoverCarousel"
