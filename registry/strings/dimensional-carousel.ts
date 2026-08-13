export const dimensionalCarouselDemoString = `
"use client"

import { DimensionalCarousel } from "@/components/satisium-ui/dimensional-carousel"

export default function DimensionalCarouselDemo() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      \`https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/\${15 + i}.jpg\`
  )

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <DimensionalCarousel
          images={images}
          cardWidthRatio={0.35}
          gapMultiplier={0.8}
          stackGapMultiplier={0.15} 
          depthMultiplier={1.0} 
          rotationMultiplier={0.1} 
          flexMultiplier={0.15} 
          parallaxIntensity={1.2} 
          chromaticAberrationIntensity={0.008} 
          dimmingMultiplier={0.6} 
          cornerRadius={0.05} 
          scrollSensitivity={0.01}
        />
      </div>

      <div className="pointer-events-none absolute bottom-8 z-10 text-center select-none">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Flick Horizontally
        </p>
      </div>
    </main>
  )
}
`

export const dimensionalCarouselString = `"use client"

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

export interface DimensionalCarouselProps extends Omit<
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
  rotationMultiplier?: number
  flexMultiplier?: number 
  parallaxIntensity?: number
  chromaticAberrationIntensity?: number 
  dimmingMultiplier?: number
  cornerRadius?: number
}

interface ScrollState {
  targetX: number
  currentX: number
  velocity: number
  min: number
  max: number
}

const DimensionalVertexShader = \`
precision mediump float;
uniform float uVelocity;
uniform float uFlexMultiplier; 
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  float curve = sin(uv.x * 3.14159);
  
  pos.z -= curve * uVelocity * uFlexMultiplier;
  pos.x += curve * abs(uVelocity) * (uFlexMultiplier * 0.4);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
\`

const DimensionalFragmentShader = \`
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
  parallaxUv.x += clamp(uStackDepth * 0.1, -1.0, 1.0) * uParallaxIntensity;

  float split = abs(uVelocity) * uChromaticAberrationIntensity;
  float r = texture2D(uTexture, parallaxUv + vec2(split, 0.0)).r;
  float g = texture2D(uTexture, parallaxUv).g;
  float b = texture2D(uTexture, parallaxUv - vec2(split, 0.0)).b;
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
\`

function CarouselScene({
  images,
  scrollState,
  onReady,
  cardWidthRatio,
  cardAspectRatio,
  lerpFactor,
  gapMultiplier,
  stackGapMultiplier,
  depthMultiplier,
  parallaxIntensity,
  chromaticAberrationIntensity,
  flexMultiplier,
  rotationMultiplier,
  dimmingMultiplier,
  cornerRadius,
  isReducedMotion,
}: DimensionalCarouselProps & {
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

  const spacing = viewport.width * gapMultiplier!

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
        vertexShader: DimensionalVertexShader,
        fragmentShader: DimensionalFragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uVelocity: { value: 0 },
          uStackDepth: { value: 0 },
          uResolution: { value: new THREE.Vector2(itemWidth, itemHeight) },
          uImageAspect: { value: imageAspect },
          uFlexMultiplier: { value: isReducedMotion ? 0 : flexMultiplier },
          uChromaticAberrationIntensity: { value: isReducedMotion ? 0 : chromaticAberrationIntensity },
          uParallaxIntensity: { value: isReducedMotion ? 0 : parallaxIntensity },
          uDimmingMultiplier: { value: dimmingMultiplier },
          uCornerRadius: { value: cornerRadius },
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

    state.targetX = THREE.MathUtils.clamp(state.targetX, state.min, state.max)
    const prevX = state.currentX

    state.currentX = THREE.MathUtils.damp(
      state.currentX,
      state.targetX,
      lerpFactor! * 100,
      dt
    )

    const rawVelocity = (state.currentX - prevX) / dt
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

        const relativeX = i * spacing - state.currentX
        let x, z, rotY
        let stackDepth = 0

        if (relativeX > 0) {
          x = relativeX
          z = 0
          rotY = 0
        } else {
          x = relativeX * stackGapMultiplier!
          z = relativeX * depthMultiplier!
          rotY = relativeX * rotationMultiplier!
          stackDepth = Math.abs(relativeX)
        }

        mesh.position.set(x, 0, z)
        mesh.rotation.set(0, rotY, 0)

        mesh.renderOrder = 1000 - Math.abs(relativeX)

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

export const DimensionalCarousel = React.forwardRef<
  HTMLDivElement,
  DimensionalCarouselProps
>(
  (
    {
      images,
      className,
      cardWidthRatio = 0.35,
      cardAspectRatio = 1.4,
      scrollSensitivity = 0.04,
      lerpFactor = 0.08,
      gapMultiplier = 0.8,
      stackGapMultiplier = 0.1,
      depthMultiplier = 0.8,
      parallaxIntensity = 0.1,
      chromaticAberrationIntensity = 0.005,
      flexMultiplier = 0.12,
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
      targetX: 0,
      currentX: 0,
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
            const delta = (e.deltaX || 0) + (e.deltaY || 0)
            const isAtLeft = state.targetX <= state.min && delta < 0
            const isAtRight = state.targetX >= state.max && delta > 0

            if (!isAtLeft && !isAtRight) {
              state.targetX += delta * scrollSensitivity
            }
          },
          onDrag: (e) => {
            const state = scrollState.current
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? -e.deltaX : -e.deltaY
            const isAtLeft = state.targetX <= state.min && delta < 0
            const isAtRight = state.targetX >= state.max && delta > 0

            if (!isAtLeft && !isAtRight) {
              state.targetX += delta * scrollSensitivity
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
          <p>Interactive 3D Image Deck. Scroll to navigate.</p>
          {images.map((img, i) => (
            <img key={i} src={img} alt={\`Slide \${i + 1}\`} />
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
            camera={{ position: [0, 0, 5], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: true }}
          >
            <React.Suspense fallback={null}>
              <CarouselScene
                images={images}
                scrollState={scrollState}
                onReady={() => setIsLoaded(true)}
                cardWidthRatio={cardWidthRatio}
                cardAspectRatio={cardAspectRatio}
                lerpFactor={lerpFactor}
                gapMultiplier={gapMultiplier}
                stackGapMultiplier={stackGapMultiplier}
                depthMultiplier={depthMultiplier}
                parallaxIntensity={parallaxIntensity}
                chromaticAberrationIntensity={chromaticAberrationIntensity}
                flexMultiplier={flexMultiplier}
                rotationMultiplier={rotationMultiplier}
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

DimensionalCarousel.displayName = "DimensionalCarousel"
`

export const dimensionalCarouselFile = {
  "dimensional-carousel.tsx": {
    code: dimensionalCarouselString,
    language: "tsx",
  },
}
