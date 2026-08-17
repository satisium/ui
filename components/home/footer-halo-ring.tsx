"use client"

import React, { useRef, useMemo, useEffect } from "react"
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

export interface InfiniteHaloRingProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  images: string[]
  cardWidthRatio?: number
  cardAspectRatio?: number
  gapMultiplier?: number
  columns?: number
  rows?: number
  staggerMultiplier?: number
  floorY?: number
  bowlStrength?: number
  xOffset?: number
  yOffset?: number
  zOffset?: number
  tiltX?: number
  tiltY?: number
  tiltZ?: number
  fov?: number
  scrollSensitivity?: number
  damping?: number
  maxSpeed?: number
  autoRotate?: boolean
  autoRotateSpeedX?: number
  autoRotateSpeedY?: number
  stretchMultiplier?: number
  fovWarp?: number
  chromaticAberration?: number
  grayscaleOnDrag?: number
  shadowIntensity?: number
  parallaxMultiplier?: number
  fadeFar?: number
  cornerRadius?: number
  squirclePower?: number
  borderWidth?: number
  borderColor?: string
}

// --------------------------------------------------------
// SHADERS
// --------------------------------------------------------

const HaloVertexShader = `
precision mediump float;
uniform vec2 uVelocity;
uniform float uStretchMultiplier;
uniform float uRadius;
uniform vec2 uItemOffset;
uniform float uCameraZ;
uniform float uFloorY;
uniform float uBowlStrength;

varying vec2 vUv;
varying vec3 vWorldPos; 

void main() {
  vUv = uv;
  vec3 pos = position;

  pos.y *= 1.0 + (abs(uVelocity.y) * uStretchMultiplier);

  vec2 gridPos = uItemOffset + pos.xy;
  float theta = gridPos.y / uRadius;
  
  vec3 ringPos;
  ringPos.x = gridPos.x;
  ringPos.z = uCameraZ - sin(theta) * uRadius;
  ringPos.y = (uRadius + uFloorY) - cos(theta) * uRadius;

  float xDist = abs(ringPos.x);
  ringPos.y += xDist * xDist * uBowlStrength;

  ringPos.x += position.y * uVelocity.x * 0.05;

  vec4 worldPos = modelMatrix * vec4(ringPos, 1.0);
  vWorldPos = worldPos.xyz;

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`

const HaloFragmentShader = `
precision mediump float;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uImageAspect;
uniform vec2 uVelocity;
uniform vec2 uParallaxOffset;
uniform float uCornerRadius;
uniform float uSquirclePower;
uniform float uBorderWidth;
uniform vec3 uBorderColor;
uniform float uChromaticAberration;
uniform float uGrayscaleOnDrag;
uniform float uShadowIntensity;
uniform float uFadeFar;
uniform float uCameraZ;

varying vec2 vUv;
varying vec3 vWorldPos;

float squircleBox(vec2 p, vec2 b, float r, float n) {
    vec2 q = abs(p) - b + r;
    vec2 maxQ = max(q, 0.0);
    float lN = pow(pow(maxQ.x, n) + pow(maxQ.y, n), 1.0 / n);
    return min(max(q.x, q.y), 0.0) + lN - r;
}

void main() {
  float screenAspect = uResolution.x / uResolution.y;
  vec2 scale = vec2(1.0);
  if (screenAspect > uImageAspect) {
    scale.y = uImageAspect / screenAspect;
  } else {
    scale.x = screenAspect / uImageAspect;
  }
  
  vec2 baseUv = (vUv - 0.5) * scale + 0.5;
  baseUv += uParallaxOffset;

  if (!gl_FrontFacing) {
      baseUv.x = 1.0 - baseUv.x;
  }
  
  float speed = clamp(length(uVelocity), 0.0, 15.0);

  float split = abs(uVelocity.y) * uChromaticAberration;
  vec2 splitOffset = vec2(0.0, split); 
  
  float rColor = texture2D(uTexture, baseUv + splitOffset).r;
  float gColor = texture2D(uTexture, baseUv).g;
  float bColor = texture2D(uTexture, baseUv - splitOffset).b;
  vec3 texColor = vec3(rColor, gColor, bColor);

  vec3 gray = vec3(dot(texColor, vec3(0.299, 0.587, 0.114)));
  float grayMix = min(speed * uGrayscaleOnDrag, 1.0);
  texColor = mix(texColor, gray, grayMix);

  float distToCam = length(vWorldPos - vec3(0.0, 0.0, uCameraZ));
  float normalizedDepth = clamp(distToCam / uFadeFar, 0.0, 1.0);
  texColor *= mix(1.0, 1.0 - uShadowIntensity, normalizedDepth);

  vec2 p = vUv - 0.5;
  float aspect = uResolution.x / uResolution.y;
  vec2 size = vec2(1.0);
  
  if (aspect > 1.0) {
      p.x *= aspect;
      size.x *= aspect;
  } else {
      p.y /= aspect;
      size.y /= aspect;
  }
  
  vec2 b = size * 0.5;
  vec2 q = abs(p) - b + uCornerRadius;
  vec2 maxQ = max(q, 0.0);
  
  float dist = 0.0;
  if (uSquirclePower > 2.0) {
      float lN = pow(pow(maxQ.x, uSquirclePower) + pow(maxQ.y, uSquirclePower), 1.0 / uSquirclePower);
      dist = min(max(q.x, q.y), 0.0) + lN - uCornerRadius;
  } else {
      dist = min(max(q.x, q.y), 0.0) + length(maxQ) - uCornerRadius;
  }
  
  float blur = 0.003; 
  float cornerAlpha = 1.0 - smoothstep(0.0, blur, dist);

  if (uBorderWidth > 0.0) {
      float borderDist = abs(dist) - uBorderWidth;
      float borderAlpha = 1.0 - smoothstep(0.0, blur, borderDist);
      texColor = mix(texColor, uBorderColor, borderAlpha * step(0.0, dist));
  }
  
  float skyFade = 1.0 - smoothstep(uFadeFar * 0.7, uFadeFar, distToCam);
  float behindFade = 1.0 - smoothstep(uCameraZ - 1.0, uCameraZ + 2.0, vWorldPos.z);

  gl_FragColor = vec4(texColor, cornerAlpha * skyFade * behindFade);
}
`

// --------------------------------------------------------
// UTILS & STATE
// --------------------------------------------------------

const wrap = (val: number, min: number, max: number) => {
  const range = max - min
  return ((((val - min) % range) + range) % range) + min
}

interface ScrollState {
  targetX: number
  targetY: number
  currentX: number
  currentY: number
  velocityX: number
  velocityY: number
}

// --------------------------------------------------------
// R3F SCENE
// --------------------------------------------------------

function HaloRingScene({
  images,
  scrollState,
  cardWidthRatio,
  cardAspectRatio,
  gapMultiplier,
  columns,
  rows,
  staggerMultiplier,
  floorY,
  bowlStrength,
  damping,
  maxSpeed,
  stretchMultiplier,
  fovWarp,
  chromaticAberration,
  grayscaleOnDrag,
  shadowIntensity,
  parallaxMultiplier,
  fadeFar,
  cornerRadius,
  squirclePower,
  borderWidth,
  borderColor,
  autoRotate,
  autoRotateSpeedX,
  autoRotateSpeedY,
  tiltX,
  tiltY,
  tiltZ,
  xOffset,
  yOffset,
  zOffset,
}: any) {
  const textureArray = useTexture(images) as THREE.Texture[]

  const { viewport, camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  // CRITICAL FIX: VIEWPORT CACHING
  // By capturing the viewport dimensions precisely ONCE on mount, we prevent
  // the entire massive grid from rebuilding, recompiling shaders, and mathematically
  // snapping boundaries when the user scrolls the page (which natively changes viewport height).
  const stableViewport = useRef({
    width: viewport.width,
    height: viewport.height,
  }).current

  const isMobile = stableViewport.width < 5
  const itemWidth = stableViewport.width * (isMobile ? 0.35 : cardWidthRatio)
  const gap = stableViewport.width * gapMultiplier

  const itemHeight = itemWidth * cardAspectRatio
  const cellWidth = itemWidth + gap
  const cellHeight = itemHeight + gap

  const totalWidth = columns * cellWidth
  const totalDepth = rows * cellHeight

  const radius = totalDepth / (Math.PI * 2)

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(itemWidth, itemHeight, 32, 32),
    [itemWidth, itemHeight]
  )

  const borderColorVec = useMemo(
    () => new THREE.Color(borderColor),
    [borderColor]
  )

  const items = useMemo(() => {
    const ring = []
    let idx = 0
    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < rows; row++) {
        const stagger = col % 2 !== 0 ? cellHeight * staggerMultiplier : 0
        ring.push({
          index: idx,
          texture: textureArray[idx % textureArray.length],
          baseX: (col - columns / 2 + 0.5) * cellWidth,
          baseY: (row - rows / 2 + 0.5) * cellHeight + stagger,
        })
        idx++
      }
    }
    return ring
  }, [columns, rows, cellWidth, cellHeight, staggerMultiplier, textureArray])

  const materials = useMemo(() => {
    return items.map((item) => {
      const img = item.texture.image as {
        width?: number
        height?: number
      } | null
      const imgAspect = img?.width && img?.height ? img.width / img.height : 1.0

      return new THREE.ShaderMaterial({
        vertexShader: HaloVertexShader,
        fragmentShader: HaloFragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTexture: { value: item.texture },
          uResolution: { value: new THREE.Vector2(itemWidth, itemHeight) },
          uImageAspect: { value: imgAspect },
          uItemOffset: { value: new THREE.Vector2(0, 0) },
          uVelocity: { value: new THREE.Vector2(0, 0) },
          uParallaxOffset: { value: new THREE.Vector2(0, 0) },
          uRadius: { value: radius },
          uCameraZ: { value: 5.0 },
          uFloorY: { value: floorY },
          uBowlStrength: { value: bowlStrength },
          uStretchMultiplier: { value: stretchMultiplier },
          uChromaticAberration: { value: chromaticAberration },
          uGrayscaleOnDrag: { value: grayscaleOnDrag },
          uShadowIntensity: { value: shadowIntensity },
          uCornerRadius: { value: cornerRadius },
          uSquirclePower: { value: squirclePower },
          uBorderWidth: { value: borderWidth },
          uBorderColor: { value: borderColorVec },
          uFadeFar: { value: fadeFar },
        },
      })
    })
  }, [
    items,
    itemWidth,
    itemHeight,
    radius,
    floorY,
    bowlStrength,
    stretchMultiplier,
    chromaticAberration,
    grayscaleOnDrag,
    shadowIntensity,
    cornerRadius,
    squirclePower,
    borderWidth,
    borderColorVec,
    fadeFar,
  ])

  useEffect(() => {
    return () => {
      geometry.dispose()
      materials.forEach((m) => m.dispose())
    }
  }, [geometry, materials])

  const baseFov = useMemo(
    () => (camera as THREE.PerspectiveCamera).fov,
    [camera]
  )

  useFrame((_, dt) => {
    const state = scrollState.current
    const delta = Math.min(dt, 0.1)

    if (autoRotate) {
      state.targetX += autoRotateSpeedX * delta
      state.targetY += autoRotateSpeedY * delta
    }

    const prevX = state.currentX
    const prevY = state.currentY

    state.currentX = THREE.MathUtils.damp(
      state.currentX,
      state.targetX,
      damping * 100,
      delta
    )
    state.currentY = THREE.MathUtils.damp(
      state.currentY,
      state.targetY,
      damping * 100,
      delta
    )

    const rawVelX = (state.currentX - prevX) / delta
    const rawVelY = (state.currentY - prevY) / delta

    state.velocityX = THREE.MathUtils.damp(
      state.velocityX,
      rawVelX * 0.05,
      5,
      delta
    )
    state.velocityY = THREE.MathUtils.damp(
      state.velocityY,
      rawVelY * 0.05,
      5,
      delta
    )

    const speedY = Math.min(Math.abs(state.velocityY), maxSpeed)

    const targetFov = baseFov + speedY * fovWarp
    const pCam = camera as THREE.PerspectiveCamera
    pCam.fov = THREE.MathUtils.damp(pCam.fov, targetFov, 5, delta)
    pCam.updateProjectionMatrix()

    if (groupRef.current) {
      groupRef.current.children.forEach((mesh: any, i) => {
        const item = items[i]
        const material = materials[i]

        const x = wrap(
          item.baseX + state.currentX,
          -totalWidth / 2,
          totalWidth / 2
        )
        const y = wrap(
          item.baseY + state.currentY,
          -totalDepth / 2,
          totalDepth / 2
        )

        mesh.position.set(0, 0, 0)
        mesh.frustumCulled = false

        const theta = y / radius
        const zPos = 5.0 - Math.sin(theta) * radius
        const yPos = radius + floorY - Math.cos(theta) * radius
        const distToCam = Math.sqrt(
          x * x + yPos * yPos + (zPos - 5.0) * (zPos - 5.0)
        )
        mesh.renderOrder = -distToCam * 100

        material.uniforms.uItemOffset.value.set(x, y)
        material.uniforms.uVelocity.value.set(state.velocityX, state.velocityY)
        material.uniforms.uParallaxOffset.value.set(
          -(x - item.baseX) * parallaxMultiplier,
          -(y - item.baseY) * parallaxMultiplier
        )
      })
    }
  })

  return (
    <group
      ref={groupRef}
      rotation={[tiltX, tiltY, tiltZ]}
      position={[xOffset, yOffset, zOffset]}
    >
      {items.map((_, i) => (
        <mesh key={i} geometry={geometry} material={materials[i]} />
      ))}
    </group>
  )
}

// --------------------------------------------------------
// WRAPPER COMPONENT
// --------------------------------------------------------

export const InfiniteHaloRing = React.forwardRef<
  HTMLDivElement,
  InfiniteHaloRingProps
>(
  (
    {
      images,
      className,
      cardWidthRatio = 0.16,
      cardAspectRatio = 1.2,
      gapMultiplier = 0.015,
      columns = 12,
      rows = 40,
      staggerMultiplier = 0.5,

      floorY = -2.0,
      bowlStrength = 0.0,

      xOffset = 0,
      yOffset = 0,
      zOffset = 0,
      tiltX = 0,
      tiltY = 0,
      tiltZ = 0,
      fov = 60,

      scrollSensitivity = 0.025,
      damping = 0.04,
      maxSpeed = 25.0,
      autoRotate = false,
      autoRotateSpeedX = 0.0,
      autoRotateSpeedY = 2.0,

      stretchMultiplier = 0.6,
      fovWarp = 1.5,
      chromaticAberration = 0.015,
      grayscaleOnDrag = 0.8,
      shadowIntensity = 0.7,
      parallaxMultiplier = 0.02,

      fadeFar = 40.0,

      cornerRadius = 0.05,
      squirclePower = 4.0,
      borderWidth = 0.0,
      borderColor = "#ffffff",
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)

    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

    const scrollState = useRef<ScrollState>({
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      velocityX: 0,
      velocityY: 0,
    })

    useGSAP(
      () => {
        if (!containerRef.current) return

        const observer = Observer.create({
          target: containerRef.current,
          type: "pointer", // STRICTLY captures drags, letting browser handle native vertical page scroll
          onDrag: (e) => {
            scrollState.current.targetX -= e.deltaX * scrollSensitivity
            scrollState.current.targetY -= e.deltaY * scrollSensitivity
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
          "relative h-full w-full cursor-grab touch-pan-y overflow-hidden bg-background active:cursor-grabbing",
          className
        )}
        {...props}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: fov }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true }}
        >
          <React.Suspense fallback={null}>
            <HaloRingScene
              images={images}
              scrollState={scrollState}
              cardWidthRatio={cardWidthRatio}
              cardAspectRatio={cardAspectRatio}
              gapMultiplier={gapMultiplier}
              columns={columns}
              rows={rows}
              staggerMultiplier={staggerMultiplier}
              floorY={floorY}
              bowlStrength={bowlStrength}
              xOffset={xOffset}
              yOffset={yOffset}
              zOffset={zOffset}
              tiltX={tiltX}
              tiltY={tiltY}
              tiltZ={tiltZ}
              damping={damping}
              maxSpeed={maxSpeed}
              autoRotate={autoRotate}
              autoRotateSpeedX={autoRotateSpeedX}
              autoRotateSpeedY={autoRotateSpeedY}
              stretchMultiplier={stretchMultiplier}
              fovWarp={fovWarp}
              parallaxMultiplier={parallaxMultiplier}
              chromaticAberration={chromaticAberration}
              grayscaleOnDrag={grayscaleOnDrag}
              shadowIntensity={shadowIntensity}
              fadeFar={fadeFar}
              cornerRadius={cornerRadius}
              squirclePower={squirclePower}
              borderWidth={borderWidth}
              borderColor={borderColor}
            />
          </React.Suspense>
        </Canvas>
      </div>
    )
  }
)

InfiniteHaloRing.displayName = "InfiniteHaloRing"
