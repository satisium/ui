"use client"

import React, { useMemo, useRef, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, useTexture, useVideoTexture } from "@react-three/drei"
import * as THREE from "three"
import { cn } from "@/lib/utils"

/**
 * Configuration properties for the VelocityStrips component.
 */
export interface VelocityStripsProps {
  /** The source URL of the media asset. */
  mediaUrl: string
  /** Defines the media type for correct texture processing. @default "image" */
  mediaType?: "image" | "video"
  /** Number of vertical displacement slices. @default 32 */
  slices?: number
  /** Proximity spread multiplier (0.0 to 1.0). @default 0.35 */
  hoverRadius?: number
  /** Strength of the displacement shift based on mouse velocity. @default 1.5 */
  shiftMultiplier?: number
  /** Interpolation speed for the wave following the cursor. @default 2.0 */
  trackingSpeed?: number
  /** Base texture scale to prevent edge bleeding during displacement. @default 1.15 */
  imageZoom?: number
  /** Interpolation speed for the enter/leave animation states. @default 1.5 */
  enterLeaveSpeed?: number
  /** Standard React classNames for the container. */
  className?: string
  /** Optional fallback UI rendered via Suspense while media loads. */
  fallback?: React.ReactNode
}

/** Standard vertex shader for UV mapping. */
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Fragment shader handling the velocity-based horizontal displacement.
 * Computes proximity, applies displacement, and enforces an object-cover aspect ratio.
 */
const fragmentShader = `
  uniform sampler2D u_image;
  uniform float u_slices;
  uniform vec2 u_mouse;
  uniform float u_hoverRadius;
  uniform float u_velocity; 
  uniform float u_imageZoom;
  uniform vec2 u_resolution;
  uniform vec2 u_imageRes;
  uniform float u_active; 

  varying vec2 vUv;

  void main() {
      float sliceId = floor(vUv.x * u_slices);
      float sliceCenter = (sliceId + 0.5) / u_slices;

      float dist = abs(sliceCenter - u_mouse.x);
      float rawInfluence = smoothstep(u_hoverRadius, 0.0, dist);
      float influence = pow(rawInfluence, 1.6) * u_active;

      vec2 zoomedUv = (vUv - 0.5) * (1.0 / u_imageZoom) + 0.5;
      vec2 shiftedUv = zoomedUv;
      shiftedUv.x -= influence * u_velocity;

      vec2 ratio = u_resolution / u_imageRes;
      float coverRatio = max(ratio.x, ratio.y);
      vec2 renderSize = u_imageRes * coverRatio;
      vec2 offset = (u_resolution - renderSize) * 0.5;
      vec2 coverUv = (shiftedUv * u_resolution - offset) / renderSize;

      gl_FragColor = texture2D(u_image, coverUv);
  }
`

/** Props for the internal WebGL renderer component. */
interface StripsRendererProps extends Omit<
  VelocityStripsProps,
  "mediaUrl" | "mediaType" | "className" | "fallback"
> {
  texture: THREE.Texture
}

/**
 * Core WebGL renderer.
 * Manages the shader uniforms, frame-by-frame physics interpolation, and pointer states.
 */
const StripsRenderer = ({
  texture,
  slices,
  hoverRadius,
  shiftMultiplier,
  trackingSpeed,
  imageZoom,
  enterLeaveSpeed,
}: StripsRendererProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()

  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const smoothMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const targetVelocity = useRef(0)
  const smoothVelocity = useRef(0)
  const activeState = useRef(0)

  const uniforms = useMemo(() => {
    const img = texture.image as HTMLImageElement | HTMLVideoElement | null

    let width = 1
    let height = 1

    if (img) {
      if ("videoWidth" in img) {
        width = img.videoWidth
        height = img.videoHeight
      } else {
        width = img.naturalWidth || img.width
        height = img.naturalHeight || img.height
      }
    }

    return {
      u_image: { value: texture },
      u_slices: { value: slices },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_hoverRadius: { value: hoverRadius },
      u_velocity: { value: 0.0 },
      u_imageZoom: { value: imageZoom },
      u_resolution: { value: new THREE.Vector2(size.width, size.height) },
      u_imageRes: { value: new THREE.Vector2(width, height) },
      u_active: { value: 0.0 },
    }
  }, [texture, slices, size, hoverRadius, imageZoom])

  useFrame((state, delta) => {
    if (!materialRef.current) return

    targetMouse.current.set(
      state.pointer.x * 0.5 + 0.5,
      state.pointer.y * 0.5 + 0.5
    )

    smoothMouse.current.lerp(
      targetMouse.current,
      delta * (trackingSpeed || 2.0)
    )
    targetVelocity.current =
      (targetMouse.current.x - smoothMouse.current.x) * (shiftMultiplier || 1.5)
    smoothVelocity.current = THREE.MathUtils.lerp(
      smoothVelocity.current,
      targetVelocity.current,
      delta * 4.0
    )

    materialRef.current.uniforms.u_mouse.value.copy(smoothMouse.current)
    materialRef.current.uniforms.u_velocity.value = smoothVelocity.current

    materialRef.current.uniforms.u_active.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.u_active.value,
      activeState.current,
      delta * (enterLeaveSpeed || 1.5)
    )

    materialRef.current.uniforms.u_resolution.value.set(size.width, size.height)
  })

  return (
    <mesh
      onPointerEnter={() => (activeState.current = 1)}
      onPointerLeave={() => (activeState.current = 0)}
    >
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  )
}

/** Wrapper for loading standard image textures via React Suspense. */
const ImageScene = ({
  mediaUrl,
  ...props
}: { mediaUrl: string } & Partial<StripsRendererProps>) => {
  const texture = useTexture(mediaUrl)
  return <StripsRenderer texture={texture} {...props} />
}

/** Wrapper for loading and auto-playing video textures via React Suspense. */
const VideoScene = ({
  mediaUrl,
  ...props
}: { mediaUrl: string } & Partial<StripsRendererProps>) => {
  const texture = useVideoTexture(mediaUrl, {
    crossOrigin: "Anonymous",
    muted: true,
    loop: true,
    start: true,
  })
  return <StripsRenderer texture={texture} {...props} />
}

/**
 * VelocityStrips
 * Interactive WebGL component that displays media (image/video) with a velocity-based slice distortion effect.
 */
export default function VelocityStrips({
  mediaUrl,
  mediaType = "image",
  slices = 32,
  hoverRadius = 0.35,
  shiftMultiplier = 1.5,
  trackingSpeed = 2.0,
  imageZoom = 1.15,
  enterLeaveSpeed = 1.5,
  className,
  fallback,
}: VelocityStripsProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full cursor-ew-resize bg-background",
        className
      )}
    >
      <Canvas>
        <Suspense fallback={fallback ? <Html center>{fallback}</Html> : null}>
          {mediaType === "video" ? (
            <VideoScene
              mediaUrl={mediaUrl}
              slices={slices}
              hoverRadius={hoverRadius}
              shiftMultiplier={shiftMultiplier}
              trackingSpeed={trackingSpeed}
              imageZoom={imageZoom}
              enterLeaveSpeed={enterLeaveSpeed}
            />
          ) : (
            <ImageScene
              mediaUrl={mediaUrl}
              slices={slices}
              hoverRadius={hoverRadius}
              shiftMultiplier={shiftMultiplier}
              trackingSpeed={trackingSpeed}
              imageZoom={imageZoom}
              enterLeaveSpeed={enterLeaveSpeed}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
