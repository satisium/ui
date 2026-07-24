export const flexCarouselDemoString = `
"use client"

import { FlexCarousel } from "@/components/ui/flex-carousel"

export default function FlexCarouselDemo() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      \`https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/\${15 + i}.jpg\`
  )

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <FlexCarousel
          images={images}
          cardWidthRatio={0.35}
          gapMultiplier={0.36}
          flexMultiplier={0.25}
          rotationMultiplier={0.02}
          parallaxIntensity={0.6}
          chromaticAberrationIntensity={0.02}
          dimmingMultiplier={0.02}
          scrollSensitivity={0.01}
          cornerRadius={0.04}
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

export const flexCarouselString = `"use client"

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

export interface FlexCarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  images: string[]
  className?: string
  cardWidthRatio?: number
  cardAspectRatio?: number
  gapMultiplier?: number
  scrollSensitivity?: number
  lerpFactor?: number
  flexMultiplier?: number
  rotationMultiplier?: number
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

const FlexVertexShader = \`
precision mediump float;
uniform float uVelocity;
uniform float uFlexMultiplier;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = position;

  float direction = uVelocity >= 0.0 ? 1.0 : -1.0;
  float speed = abs(uVelocity);
  
  float trailing = direction > 0.0 ? (1.0 - uv.x) : uv.x;
  float flex = pow(trailing, 2.0); 
  
  pos.z -= flex * speed * uFlexMultiplier;
  pos.x += flex * uVelocity * 0.3;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
\`

const FlexFragmentShader = \`
precision mediump float;
uniform sampler2D uTexture;
uniform float uVelocity;
uniform float uAngle; 
uniform vec2 uResolution;
uniform float uImageAspect;
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
  
  vec2 parallaxUv = (vUv - 0.5) * (scale * 0.85) + 0.5;
  parallaxUv.x += clamp(uAngle, -1.0, 1.0) * uParallaxIntensity;
  
  float speed = abs(uVelocity);
  
  float split = speed * uChromaticAberrationIntensity;
  float r = texture2D(uTexture, parallaxUv + vec2(split, 0.0)).r;
  float g = texture2D(uTexture, parallaxUv).g;
  float b = texture2D(uTexture, parallaxUv - vec2(split, 0.0)).b;
  vec4 texColor = vec4(r, g, b, 1.0);
  
  float edgeDist = pow(abs(vUv.x - 0.5) * 2.0, 3.0); 
  
  vec3 leakColor = vec3(1.0, 0.85, 0.7);
  float leakIntensity = edgeDist * speed * 0.06;
  vec3 finalColor = texColor.rgb + (leakColor * leakIntensity);
  
  float shadow = edgeDist * speed * uDimmingMultiplier;
  finalColor -= shadow;

  vec2 pos = vUv - 0.5;
  vec2 pixelPos = pos * uResolution;
  vec2 pixelSize = vec2(0.5) * uResolution;
  float pixelRadius = uCornerRadius * min(uResolution.x, uResolution.y); 
  float dist = length(max(abs(pixelPos) - pixelSize + pixelRadius, 0.0)) - pixelRadius;
  float cornerAlpha = 1.0 - smoothstep(0.0, 1.5, dist);

  gl_FragColor = vec4(finalColor, cornerAlpha);
}
\`

function FlexScene({
  images,
  scrollState,
  onReady,
  cardWidthRatio,
  cardAspectRatio,
  lerpFactor,
  gapMultiplier,
  flexMultiplier,
  rotationMultiplier,
  parallaxIntensity,
  chromaticAberrationIntensity,
  dimmingMultiplier,
  cornerRadius,
}: FlexCarouselProps & {
  scrollState: React.MutableRefObject<ScrollState>
  onReady: () => void
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

  const spacing = viewport.width * gapMultiplier!

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(itemWidth, itemHeight, 64, 64),
    [itemWidth, itemHeight]
  )

  const materials = useMemo(() => {
    return textures.map((texture) => {
      const img = texture.image as { width?: number; height?: number } | null | undefined
      const imageAspect = img?.width && img?.height ? img.width / img.height : 1

      return new THREE.ShaderMaterial({
        vertexShader: FlexVertexShader,
        fragmentShader: FlexFragmentShader,
        uniforms: {
          uTexture: { value: texture },
          uVelocity: { value: 0 },
          uAngle: { value: 0 },
          uResolution: { value: new THREE.Vector2(itemWidth, itemHeight) },
          uImageAspect: { value: imageAspect },
          uFlexMultiplier: { value: flexMultiplier },
          uParallaxIntensity: { value: parallaxIntensity },
          uChromaticAberrationIntensity: { value: chromaticAberrationIntensity },
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
    parallaxIntensity,
    chromaticAberrationIntensity,
    dimmingMultiplier,
    cornerRadius,
  ])

  useEffect(() => {
    return () => {
      geometry.dispose()
      materials.forEach((m) => m.dispose())
    }
  }, [geometry, materials])

  useEffect(() => {
    const centerOffset = isMobile ? 1 : 2
    scrollState.current.min = -spacing * centerOffset
    scrollState.current.max = (images.length - 1) * spacing + spacing * centerOffset
    requestAnimationFrame(() => onReady())
  }, [images.length, spacing, scrollState, onReady, isMobile])

  useFrame((_, delta) => {
    const state = scrollState.current
    const dt = Math.min(delta, 0.1)

    state.targetX = THREE.MathUtils.clamp(state.targetX, state.min, state.max)
    const prevX = state.currentX

    state.currentX = THREE.MathUtils.damp(state.currentX, state.targetX, lerpFactor! * 100, dt)

    const rawVelocity = (state.currentX - prevX) / dt
    state.velocity = THREE.MathUtils.damp(state.velocity, rawVelocity * 0.15, 5, dt)

    if (groupRef.current) {
      groupRef.current.children.forEach((mesh: any, i) => {
        const material = materials[i]
        if (!material) return

        const relativeX = i * spacing - state.currentX

        mesh.position.x = relativeX
        mesh.rotation.y = -rotationMultiplier!
        mesh.renderOrder = 1000 - Math.abs(relativeX)

        material.uniforms.uVelocity.value = state.velocity
        material.uniforms.uAngle.value = relativeX * 0.1
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

export const FlexCarousel = React.forwardRef<
  HTMLDivElement,
  FlexCarouselProps
>(
  (
    {
      images,
      className,
      cardWidthRatio = 0.35,
      cardAspectRatio = 1.4,
      gapMultiplier = 0.36,
      scrollSensitivity = 0.04,
      lerpFactor = 0.08,
      flexMultiplier = 0.25,
      rotationMultiplier = 0.02,
      parallaxIntensity = 0.05,
      chromaticAberrationIntensity = 0.005,
      dimmingMultiplier = 0.015,
      cornerRadius = 0.04,
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
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
            scrollState.current.targetX += delta * scrollSensitivity
          },
          onDrag: (e) => {
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? -e.deltaX : -e.deltaY
            scrollState.current.targetX += delta * scrollSensitivity
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
        aria-live="polite"
        className={cn(
          "relative h-full w-full cursor-grab touch-none overflow-hidden bg-background text-foreground active:cursor-grabbing",
          className
        )}
        {...props}
      >
        <div className="sr-only">
          <p>Interactive 3D Image Carousel. Scroll to navigate.</p>
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

        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: true }}
          >
            <React.Suspense fallback={null}>
              <FlexScene
                images={images}
                scrollState={scrollState}
                onReady={() => setIsLoaded(true)}
                cardWidthRatio={cardWidthRatio}
                cardAspectRatio={cardAspectRatio}
                gapMultiplier={gapMultiplier}
                lerpFactor={lerpFactor}
                flexMultiplier={flexMultiplier}
                rotationMultiplier={rotationMultiplier}
                parallaxIntensity={parallaxIntensity}
                chromaticAberrationIntensity={chromaticAberrationIntensity}
                dimmingMultiplier={dimmingMultiplier}
                cornerRadius={cornerRadius}
              />
            </React.Suspense>
          </Canvas>
        </div>
      </div>
    )
  }
)

FlexCarousel.displayName = "FlexCarousel"
`

export const flexCarouselFile = {
  "flex-carousel.tsx": {
    code: flexCarouselString,
    language: "tsx",
  },
}
