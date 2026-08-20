"use client"

import { cn } from "@/lib/utils"
import { useGSAP } from "@gsap/react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import gsap from "gsap"
import { Observer } from "gsap/Observer"
import React, { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

// Safely register GSAP plugin for SSR environments (Next.js)
if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer)
}

// ============================================================================
// 1. UTILITIES & CUSTOM HOOKS
// ============================================================================

function useThemeColor(cssVar: string, fallbackColor: string) {
  const [color, setColor] = useState<string>(fallbackColor)
  useEffect(() => {
    if (typeof window === "undefined") return
    const getComputedColor = () => {
      const rawValue = cssVar.trim()
      const styleColor = rawValue.startsWith("--")
        ? `hsl(var(${rawValue}))`
        : rawValue
      const div = document.createElement("div")
      div.style.color = styleColor
      div.style.display = "none"
      document.body.appendChild(div)
      const computedColor = window.getComputedStyle(div).color
      document.body.removeChild(div)
      if (computedColor && computedColor !== "rgba(0, 0, 0, 0)")
        setColor(computedColor)
      else setColor(fallbackColor)
    }
    getComputedColor()

    const observer = new MutationObserver((m) => {
      m.forEach((mut) => {
        if (mut.attributeName === "class") getComputedColor()
      })
    })
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [cssVar, fallbackColor])
  return color
}

const wrap = (val: number, min: number, max: number) => {
  const range = max - min
  if (range === 0) return min
  return ((((val - min) % range) + range) % range) + min
}

// ============================================================================
// 2. SHADERS (WEBGL)
// ============================================================================

const HaloVertexShader = `
precision mediump float;
uniform vec2 uVelocity;
uniform float uStretchMultiplier;
uniform float uRadius;
uniform vec2 uItemOffset;
uniform float uCameraZ;
uniform float uFloorY;
uniform float uBowlStrength;
uniform float uZBump; 

varying vec2 vUv;
varying vec3 vWorldPos; 

void main() {
  vUv = uv;
  vec3 pos = position;

  pos.y *= 1.0 + (abs(uVelocity.y) * uStretchMultiplier);
  pos.x *= 1.0 + (abs(uVelocity.x) * uStretchMultiplier);

  vec2 gridPos = uItemOffset + pos.xy;
  
  float theta = gridPos.y / uRadius;
  
  vec3 ringPos;
  ringPos.x = gridPos.x;
  
  float effectiveRadius = uRadius - uZBump;
  
  ringPos.z = uCameraZ - sin(theta) * effectiveRadius;
  ringPos.y = (uRadius + uFloorY) - cos(theta) * effectiveRadius;

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
uniform vec2 uVelocity;
uniform vec3 uColor;
uniform vec3 uFlashColor;       
uniform float uFlashIntensity;  
uniform float uChromaticAberration;
uniform float uWaveAberration; 
uniform float uGrayscaleOnDrag;
uniform float uShadowIntensity;
uniform float uFadeFar;
uniform float uCameraZ;

varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
  float speed = clamp(length(uVelocity), 0.0, 15.0);

  vec2 velSplit = uVelocity * uChromaticAberration; 
  vec2 waveSplit = vec2(uFlashIntensity * uWaveAberration, uFlashIntensity * uWaveAberration);
  vec2 splitOffset = velSplit + waveSplit;
  
  float rAlpha = texture2D(uTexture, vUv + splitOffset).a;
  float gAlpha = texture2D(uTexture, vUv).a;
  float bAlpha = texture2D(uTexture, vUv - splitOffset).a;
  
  float maxAlpha = max(max(rAlpha, gAlpha), bAlpha);
  if (maxAlpha < 0.01) discard; 

  vec3 mixedBaseColor = mix(uColor, uFlashColor, uFlashIntensity);
  vec3 splitColor = vec3(mixedBaseColor.r * rAlpha, mixedBaseColor.g * gAlpha, mixedBaseColor.b * bAlpha);

  vec3 gray = vec3(dot(splitColor, vec3(0.299, 0.587, 0.114)));
  float grayMix = min(speed * uGrayscaleOnDrag, 1.0);
  vec3 texColor = mix(splitColor, gray, grayMix);

  float distToCam = length(vWorldPos - vec3(0.0, 0.0, uCameraZ));
  float normalizedDepth = clamp(distToCam / uFadeFar, 0.0, 1.0);
  texColor *= mix(1.0, 1.0 - uShadowIntensity, normalizedDepth);
  
  float skyFade = 1.0 - smoothstep(uFadeFar * 0.7, uFadeFar, distToCam);
  float behindFade = 1.0 - smoothstep(uCameraZ - 1.0, uCameraZ + 2.0, vWorldPos.z);

  gl_FragColor = vec4(texColor, maxAlpha * skyFade * behindFade);
}
`

// ============================================================================
// 3. TYPES & INTERFACES
// ============================================================================

export interface ScrollState {
  targetX: number
  targetY: number
  currentX: number
  currentY: number
  velocityX: number
  velocityY: number
}

export interface Ripple {
  gridX: number
  gridY: number
  birthTime: number
  lifespan: number
}

interface HaloRingSceneProps {
  character: string
  fontFamily: string
  fontWeight: string | number
  size: number
  spacing: number
  canvasResolution: number
  resolvedColor: string
  resolvedAccent: string
  scrollState: React.MutableRefObject<ScrollState>
  columns: number
  rows: number
  staggerMultiplier: number
  floorY: number
  bowlStrength: number
  scrollSensitivity: number
  damping: number
  maxSpeed: number
  stretchMultiplier: number
  fovProp: number
  fovWarp: number
  chromaticAberration: number
  grayscaleOnDrag: number
  shadowIntensity: number
  fadeFar: number
  autoRotate: boolean
  autoRotateSpeedX: number
  autoRotateSpeedY: number
  tiltX: number
  tiltY: number
  tiltZ: number
  xOffset: number
  yOffset: number
  zOffset: number
  enableRipple: boolean
  rippleSpeed: number
  rippleThickness: number
  rippleZBump: number
  autoRipple: boolean
  autoRippleDelay: number
  waveAberration: number
}

// ============================================================================
// 4. R3F SCENE COMPONENT
// ============================================================================

function HaloRingScene({
  character,
  fontFamily,
  fontWeight,
  size,
  spacing,
  canvasResolution,
  resolvedColor,
  resolvedAccent,
  scrollState,
  columns,
  rows,
  staggerMultiplier,
  floorY,
  bowlStrength,
  scrollSensitivity,
  damping,
  maxSpeed,
  stretchMultiplier,
  fovProp,
  fovWarp,
  chromaticAberration,
  grayscaleOnDrag,
  shadowIntensity,
  fadeFar,
  autoRotate,
  autoRotateSpeedX,
  autoRotateSpeedY,
  tiltX,
  tiltY,
  tiltZ,
  xOffset,
  yOffset,
  zOffset,
  enableRipple,
  rippleSpeed,
  rippleThickness,
  rippleZBump,
  autoRipple,
  autoRippleDelay,
  waveAberration,
}: HaloRingSceneProps) {
  const { gl, camera, viewport, clock } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  const ripplesRef = useRef<Ripple[]>([])
  const autoRippleTimer = useRef<number>(0)

  // Track all physics variables so they can be accessed inside the interaction listener
  const latestDeps = useRef({
    enableRipple,
    scrollSensitivity,
    viewport,
    rows,
    spacing,
    floorY,
    bowlStrength,
  })

  useEffect(() => {
    latestDeps.current = {
      enableRipple,
      scrollSensitivity,
      viewport,
      rows,
      spacing,
      floorY,
      bowlStrength,
    }
  }, [
    enableRipple,
    scrollSensitivity,
    viewport,
    rows,
    spacing,
    floorY,
    bowlStrength,
  ])

  useGSAP(() => {
    const observer = Observer.create({
      target: gl.domElement,
      type: "pointer,touch",
      onDrag: (e) => {
        const { scrollSensitivity } = latestDeps.current
        scrollState.current.targetX -= e.deltaX * scrollSensitivity
        scrollState.current.targetY -= e.deltaY * scrollSensitivity
      },
      onPress: (e) => {
        const { enableRipple, viewport, rows, spacing, floorY, bowlStrength } =
          latestDeps.current
        if (!enableRipple) return

        const eventX = e.x ?? 0
        const eventY = e.y ?? 0
        const rect = gl.domElement.getBoundingClientRect()

        // 1. Get Normalized Device Coordinates (-1 to +1)
        const px = ((eventX - rect.left) / rect.width) * 2 - 1
        const py = -((eventY - rect.top) / rect.height) * 2 + 1

        // 2. Convert to world units at the focal plane (Z=0)
        const vx = px * (viewport.width / 2)
        const vy = py * (viewport.height / 2)

        // 3. 3D RAYCAST MATH
        // Because the grid is warped into a cylinder, we can't map Y linearly.
        // We cast a ray from the camera at (0,0,5) to find where it intersects the cylinder formula.
        const radius = (rows * spacing) / (Math.PI * 2)
        const cyCenter = radius + floorY

        // Quadratic equation for ray-cylinder intersection
        const A_quad = vy * vy + 25
        const B_quad = -2 * vy * cyCenter
        const C_quad = cyCenter * cyCenter - radius * radius

        const disc = B_quad * B_quad - 4 * A_quad * C_quad

        if (disc >= 0) {
          const t1 = (-B_quad - Math.sqrt(disc)) / (2 * A_quad)
          const t2 = (-B_quad + Math.sqrt(disc)) / (2 * A_quad)
          const t = t1 > 0 ? t1 : t2 // Ensure intersection is in front of camera

          if (t > 0) {
            const rawX = t * vx
            const y_int = t * vy
            const z_int = 5 - 5 * t

            // Compensate for the Shader's "bowlStrength" which pushes edges up
            const effectiveY = y_int - rawX * rawX * bowlStrength

            // Convert the 3D intersection back into cylinder angle (theta)
            const sin_theta = (5 - z_int) / radius
            const cos_theta = (cyCenter - effectiveY) / radius
            const theta = Math.atan2(sin_theta, cos_theta)

            // Perfect Unrolled Coordinates!
            const clickWrapY = theta * radius
            const clickWrapX = rawX

            ripplesRef.current.push({
              gridX: clickWrapX - scrollState.current.currentX,
              gridY: clickWrapY - scrollState.current.currentY,
              birthTime: clock.elapsedTime,
              lifespan: 2.5,
            })
          }
        }
      },
    })
    return () => observer.kill()
  }, []) // Empty dependency array ensures one-time binding!

  const charTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = canvasResolution
    canvas.height = canvasResolution
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.clearRect(0, 0, canvasResolution, canvasResolution)
      ctx.fillStyle = "#ffffff"
      ctx.font = `${fontWeight} ${canvasResolution * 0.75}px ${fontFamily}`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(character, canvasResolution / 2, canvasResolution / 2)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    return tex
  }, [character, fontFamily, fontWeight, canvasResolution])

  const colorVec = useMemo(
    () => new THREE.Color(resolvedColor),
    [resolvedColor]
  )
  const flashColorVec = useMemo(
    () => new THREE.Color(resolvedAccent),
    [resolvedAccent]
  )

  const cellWidth = spacing
  const cellHeight = spacing
  const totalWidth = columns * cellWidth
  const totalDepth = rows * cellHeight
  const radius = totalDepth / (Math.PI * 2)

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(size, size, 8, 8),
    [size]
  )

  const items = useMemo(() => {
    const ring = []
    let idx = 0
    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < rows; row++) {
        const stagger = col % 2 !== 0 ? cellHeight * staggerMultiplier : 0
        ring.push({
          index: idx,
          baseX: (col - columns / 2 + 0.5) * cellWidth,
          baseY: (row - rows / 2 + 0.5) * cellHeight + stagger,
        })
        idx++
      }
    }
    return ring
  }, [columns, rows, cellWidth, cellHeight, staggerMultiplier])

  const materials = useMemo(() => {
    return items.map(
      () =>
        new THREE.ShaderMaterial({
          vertexShader: HaloVertexShader,
          fragmentShader: HaloFragmentShader,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          uniforms: {
            uTexture: { value: charTexture },
            uColor: { value: colorVec },
            uFlashColor: { value: flashColorVec },
            uFlashIntensity: { value: 0.0 },
            uZBump: { value: 0.0 },
            uVelocity: { value: new THREE.Vector2(0, 0) },
            uItemOffset: { value: new THREE.Vector2(0, 0) },
            uRadius: { value: radius },
            uCameraZ: { value: 5.0 },
            uFloorY: { value: floorY },
            uBowlStrength: { value: bowlStrength },
            uStretchMultiplier: { value: stretchMultiplier },
            uChromaticAberration: { value: chromaticAberration },
            uWaveAberration: { value: waveAberration },
            uGrayscaleOnDrag: { value: grayscaleOnDrag },
            uShadowIntensity: { value: shadowIntensity },
            uFadeFar: { value: fadeFar },
          },
        })
    )
  }, [
    items,
    charTexture,
    colorVec,
    flashColorVec,
    radius,
    floorY,
    bowlStrength,
    stretchMultiplier,
    chromaticAberration,
    waveAberration,
    grayscaleOnDrag,
    shadowIntensity,
    fadeFar,
  ])

  useEffect(() => {
    return () => {
      geometry.dispose()
      materials.forEach((m) => m.dispose())
    }
  }, [geometry, materials])

  useFrame((_, dt) => {
    const state = scrollState.current
    const delta = Math.max(0.001, Math.min(dt, 0.1))
    const currentTime = clock.elapsedTime

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

    let rawVelX = (state.currentX - prevX) / delta
    let rawVelY = (state.currentY - prevY) / delta
    rawVelX = Math.max(-maxSpeed, Math.min(rawVelX, maxSpeed))
    rawVelY = Math.max(-maxSpeed, Math.min(rawVelY, maxSpeed))

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
    const targetFov = fovProp + speedY * fovWarp
    const pCam = camera as THREE.PerspectiveCamera
    pCam.fov = THREE.MathUtils.damp(pCam.fov, targetFov, 5, delta)
    pCam.updateProjectionMatrix()

    if (enableRipple && autoRipple) {
      if (currentTime > autoRippleTimer.current) {
        const vWidth = latestDeps.current.viewport?.width || 10
        const vHeight = latestDeps.current.viewport?.height || 10

        const randomX = (Math.random() * 2 - 1) * (vWidth / 1.5)
        const randomY = (Math.random() * 2 - 1) * (vHeight / 1.5)

        ripplesRef.current.push({
          gridX: randomX - state.currentX,
          gridY: randomY - state.currentY,
          birthTime: currentTime,
          lifespan: 2.5,
        })

        const nextDelay = autoRippleDelay * (0.75 + Math.random() * 0.5)
        autoRippleTimer.current = currentTime + nextDelay
      }
    }

    ripplesRef.current = ripplesRef.current.filter(
      (r) => currentTime - r.birthTime < r.lifespan
    )

    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        const item = items[i]
        const material = materials[i]

        const wrapX = wrap(
          item.baseX + state.currentX,
          -totalWidth / 2,
          totalWidth / 2
        )
        const wrapY = wrap(
          item.baseY + state.currentY,
          -totalDepth / 2,
          totalDepth / 2
        )

        mesh.position.set(0, 0, 0)
        mesh.frustumCulled = false

        const theta = wrapY / radius
        const zPos = 5.0 - Math.sin(theta) * radius
        const yPos = radius + floorY - Math.cos(theta) * radius
        const distToCam = Math.sqrt(
          wrapX * wrapX + yPos * yPos + (zPos - 5.0) * (zPos - 5.0)
        )
        mesh.renderOrder = -distToCam * 100

        material.uniforms.uItemOffset.value.set(wrapX, wrapY)
        material.uniforms.uVelocity.value.set(state.velocityX, state.velocityY)

        let totalZBump = 0
        let totalFlash = 0

        if (enableRipple) {
          for (const ripple of ripplesRef.current) {
            const age = currentTime - ripple.birthTime

            const attackDuration = 0.25
            const attackProgress = Math.min(age / attackDuration, 1.0)
            const attackEase =
              attackProgress * attackProgress * (3.0 - 2.0 * attackProgress)
            const decayPhase = Math.pow(1.0 - age / ripple.lifespan, 2.0)
            const envelope = attackEase * decayPhase

            const rippleScreenX = ripple.gridX + state.currentX
            const rippleScreenY = ripple.gridY + state.currentY
            const rippleWrapX = wrap(
              rippleScreenX,
              -totalWidth / 2,
              totalWidth / 2
            )
            const rippleWrapY = wrap(
              rippleScreenY,
              -totalDepth / 2,
              totalDepth / 2
            )

            let dx = Math.abs(wrapX - rippleWrapX)
            if (dx > totalWidth / 2) dx = totalWidth - dx

            let dy = Math.abs(wrapY - rippleWrapY)
            if (dy > totalDepth / 2) dy = totalDepth - dy

            const currentRippleRadius = age * rippleSpeed
            const distToClick = Math.sqrt(dx * dx + dy * dy)
            const distToRing = distToClick - currentRippleRadius

            let intensity =
              Math.exp(-(distToRing * distToRing) / rippleThickness) * envelope

            if (intensity > 0.005) {
              totalZBump += intensity * rippleZBump
              totalFlash += intensity
            }
          }
        }

        material.uniforms.uZBump.value = totalZBump
        material.uniforms.uFlashIntensity.value = Math.min(totalFlash, 1.0)
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

// ============================================================================
// 5. PUBLIC EXPORT (WRAPPER COMPONENT)
// ============================================================================

export interface KineticHaloRingProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "color"
> {
  character?: string
  fontFamily?: string
  fontWeight?: string | number
  canvasResolution?: number
  size?: number
  spacing?: number
  color?: string
  accentColor?: string
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
  fadeFar?: number
  enableRipple?: boolean
  rippleSpeed?: number
  rippleThickness?: number
  rippleZBump?: number
  autoRipple?: boolean
  autoRippleDelay?: number
  waveAberration?: number
}

export const KineticHaloRing = React.forwardRef<
  HTMLDivElement,
  KineticHaloRingProps
>(
  (
    {
      className,
      character = "+",
      fontFamily = "monospace",
      fontWeight = "bold",
      canvasResolution = 128,
      size = 0.15,
      spacing = 0.35,
      color = "--muted-foreground",
      accentColor = "--primary",
      columns = 20,
      rows = 30,
      staggerMultiplier = 0.5,
      floorY = -2.0,
      bowlStrength = 0.02,
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
      autoRotate = true,
      autoRotateSpeedX = 0.0,
      autoRotateSpeedY = 2.0,
      stretchMultiplier = 0.6,
      fovWarp = 1.5,
      chromaticAberration = 0.03,
      grayscaleOnDrag = 0.8,
      shadowIntensity = 0.8,
      fadeFar = 10.0,
      enableRipple = true,
      rippleSpeed = 3.0,
      rippleThickness = 0.5,
      rippleZBump = 0.75,
      autoRipple = false,
      autoRippleDelay = 2.0,
      waveAberration = 0.05,
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

    const resolvedColor = useThemeColor(color, "#0F0F0F")
    const resolvedAccent = useThemeColor(accentColor, "#00e5ff")

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative h-full w-full cursor-grab touch-pan-y overflow-hidden bg-transparent active:cursor-grabbing",
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
              key={`${columns}-${rows}`}
              character={character}
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              size={size}
              spacing={spacing}
              canvasResolution={canvasResolution}
              resolvedColor={resolvedColor}
              resolvedAccent={resolvedAccent}
              scrollState={scrollState}
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
              fovProp={fov}
              scrollSensitivity={scrollSensitivity}
              damping={damping}
              maxSpeed={maxSpeed}
              autoRotate={autoRotate}
              autoRotateSpeedX={autoRotateSpeedX}
              autoRotateSpeedY={autoRotateSpeedY}
              stretchMultiplier={stretchMultiplier}
              fovWarp={fovWarp}
              chromaticAberration={chromaticAberration}
              grayscaleOnDrag={grayscaleOnDrag}
              shadowIntensity={shadowIntensity}
              fadeFar={fadeFar}
              enableRipple={enableRipple}
              rippleSpeed={rippleSpeed}
              rippleThickness={rippleThickness}
              rippleZBump={rippleZBump}
              autoRipple={autoRipple}
              autoRippleDelay={autoRippleDelay}
              waveAberration={waveAberration}
            />
          </React.Suspense>
        </Canvas>
      </div>
    )
  }
)

KineticHaloRing.displayName = "KineticHaloRing"
