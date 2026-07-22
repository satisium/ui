export const dimensionalCarouselDemoString = `
"use client"

import { DimensionalCarousel } from "@/components/ui/dimensional-carousel"

export default function DimensionalCarouselDemo() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      \`https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/\${15 + i}.jpg\`
  )

  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <DimensionalCarousel
          images={images}
          bendMultiplier={0.05}
          scrollSensitivity={0.02}
          rgbSplitStrength={0.003}
        />
      </div>

      <div className="pointer-events-none absolute bottom-12 left-1/2 z-10 -translate-x-1/2 text-xs font-semibold tracking-[0.2em] text-muted-foreground/40 uppercase select-none">
        Scroll / Swipe
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

export interface DimensionalCarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  images: string[]
  cardWidthRatio?: number
  cardAspectRatio?: number
  scrollSensitivity?: number
  lerpFactor?: number
  bendMultiplier?: number
  rgbSplitStrength?: number
  stackSpacing?: number
  tiltMultiplier?: number
}

interface ScrollState {
  targetX: number
  currentX: number
  velocity: number
  min: number
  max: number
}

const VertexShader = \`
precision mediump float;

uniform float uVelocity;
uniform float uBendMultiplier;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  float curve = sin(uv.x * 3.14159);
  
  pos.z -= curve * uVelocity * uBendMultiplier;
  pos.x += curve * abs(uVelocity) * (uBendMultiplier * 0.4);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
\`

const FragmentShader = \`
precision mediump float;

uniform sampler2D uTexture;
uniform float uVelocity;
uniform float uStackDepth;
uniform vec2 uResolution;
uniform float uImageAspect;
uniform float uRgbSplitStrength;

varying vec2 vUv;

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
  
  float split = abs(uVelocity) * uRgbSplitStrength;
  float r = texture2D(uTexture, coverUv + vec2(split, 0.0)).r;
  float g = texture2D(uTexture, coverUv).g;
  float b = texture2D(uTexture, coverUv - vec2(split, 0.0)).b;
  
  vec3 texColor = vec3(r, g, b);

  float shadow = smoothstep(0.0, 4.0, uStackDepth) * 0.6; 
  vec3 darkenedColor = mix(texColor, vec3(0.0), shadow);

  float alpha = 1.0 - smoothstep(3.0, 7.0, uStackDepth);

  gl_FragColor = vec4(darkenedColor, alpha);
}
\`

function CarouselItem({
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
    const relativeX = index * spacing - state.currentX

    if (relativeX > 0) {
      meshRef.current.position.x = relativeX
      meshRef.current.position.z = 0
      meshRef.current.rotation.y = 0
      materialRef.current.uniforms.uStackDepth.value = 0
    } else {
      meshRef.current.position.x = relativeX * 0.1
      meshRef.current.position.z = relativeX * 0.8
      meshRef.current.rotation.y = relativeX * tiltMultiplier
      materialRef.current.uniforms.uStackDepth.value = -relativeX
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

function CarouselScene({
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

  const isMobile = viewport.width < 5
  let itemWidth = isMobile ? viewport.width * 0.6 : viewport.width * cardWidthRatio
  let itemHeight = itemWidth * cardAspectRatio

  const maxHeight = viewport.height * (isMobile ? 0.6 : 0.5)
  if (itemHeight > maxHeight) {
    itemHeight = maxHeight
    itemWidth = itemHeight / cardAspectRatio
  }

  const spacing = viewport.width * stackSpacing

  useEffect(() => {
    scrollState.current.min = 0
    scrollState.current.max = (images.length - 1) * spacing
    requestAnimationFrame(() => onReady())
  }, [images.length, spacing, scrollState, onReady])

  useFrame(() => {
    const state = scrollState.current

    state.targetX = THREE.MathUtils.clamp(state.targetX, state.min, state.max)
    const prevX = state.currentX

    state.currentX = THREE.MathUtils.lerp(
      state.currentX,
      state.targetX,
      lerpFactor
    )

    const rawVelocity = (state.currentX - prevX) * 15.0
    state.velocity = THREE.MathUtils.lerp(state.velocity, rawVelocity, 0.15)
  })

  return (
    <group>
      {[...textures].reverse().map((texture, reversedIndex) => {
        const originalIndex = textures.length - 1 - reversedIndex
        return (
          <CarouselItem
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
      bendMultiplier = 0.12,
      rgbSplitStrength = 0.005,
      stackSpacing = 0.8,
      tiltMultiplier = 0.08,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)

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

        const observer = Observer.create({
          target: containerRef.current,
          type: "wheel,touch,pointer",
          onWheel: (e) => {
            const state = scrollState.current
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
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
          "relative h-full w-full cursor-grab overflow-hidden touch-none active:cursor-grabbing",
          className
        )}
        {...props}
      >
        <div className="sr-only" aria-live="polite">
          <p>Interactive 3D Image Carousel. Scroll or swipe to navigate.</p>
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
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
            <React.Suspense fallback={null}>
              <CarouselScene
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

DimensionalCarousel.displayName = "DimensionalCarousel"
`

export const dimensionalCarouselFile = {
  "dimensional-carousel.tsx": {
    code: dimensionalCarouselString,
    language: "tsx",
  },
}
