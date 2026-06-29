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

/**
 * Standard vertex shader for UV mapping.
 * Passes the UV coordinates to the fragment shader.
 */
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
      // Divide the screen into discrete vertical slices
      float sliceId = floor(vUv.x * u_slices);
      float sliceCenter = (sliceId + 0.5) / u_slices;

      // Calculate distance from mouse to the center of the current slice
      float dist = abs(sliceCenter - u_mouse.x);
      
      // Determine influence based on distance and hover radius
      float rawInfluence = smoothstep(u_hoverRadius, 0.0, dist);
      float influence = pow(rawInfluence, 1.6) * u_active;

      // Zoom in slightly to hide texture wrapping/bleeding on the edges
      vec2 zoomedUv = (vUv - 0.5) * (1.0 / u_imageZoom) + 0.5;
      vec2 shiftedUv = zoomedUv;
      
      // Apply the velocity-based horizontal shift
      shiftedUv.x -= influence * u_velocity;

      // Mathematical setup to emulate CSS "object-fit: cover"
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
  slices = 32,
  hoverRadius = 0.35,
  shiftMultiplier = 1.5,
  trackingSpeed = 2.0,
  imageZoom = 1.15,
  enterLeaveSpeed = 1.5,
}: StripsRendererProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()

  // Mutable refs to track physics states without triggering React re-renders
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const smoothMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const targetVelocity = useRef(0)
  const smoothVelocity = useRef(0)
  const activeState = useRef(0)

  // Initialize uniforms ONCE.
  // We explicitly omit reactive props (like size, slices) from the dependency array
  // to prevent the "reset on scroll" bug. We only rebuild if the physical texture swaps.
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
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_imageRes: { value: new THREE.Vector2(width, height) },
      u_active: { value: 0.0 },
    }
  }, [texture])

  useFrame((state, delta) => {
    if (!materialRef.current) return

    // Limit delta to 100ms (0.1s) to prevent physics overshooting
    // if the user switches tabs or experiences a lag spike.
    const dt = Math.min(delta, 0.1)

    // Normalize pointer coordinates (from -1 to 1) to UV space (0 to 1)
    targetMouse.current.set(
      state.pointer.x * 0.5 + 0.5,
      state.pointer.y * 0.5 + 0.5
    )

    // Smoothly interpolate the mouse position.
    // Math.min cap ensures the lerp factor never exceeds 1.0.
    smoothMouse.current.lerp(
      targetMouse.current,
      Math.min(dt * trackingSpeed, 1.0)
    )

    // Calculate raw velocity based on the distance between target and smooth mouse
    const rawVelocity =
      (targetMouse.current.x - smoothMouse.current.x) * shiftMultiplier

    // Clamp the target velocity to prevent aggressive mouse swipes from
    // pushing the UV coordinates out of bounds (causing texture edge bleeding).
    targetVelocity.current = THREE.MathUtils.clamp(rawVelocity, -0.4, 0.4)

    // Smoothly interpolate the velocity
    smoothVelocity.current = THREE.MathUtils.lerp(
      smoothVelocity.current,
      targetVelocity.current,
      Math.min(dt * 4.0, 1.0)
    )

    // Sync interpolated values to shader uniforms
    materialRef.current.uniforms.u_mouse.value.copy(smoothMouse.current)
    materialRef.current.uniforms.u_velocity.value = smoothVelocity.current

    // Smoothly interpolate the active state (hover enter/leave animation)
    materialRef.current.uniforms.u_active.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.u_active.value,
      activeState.current,
      Math.min(dt * enterLeaveSpeed, 1.0)
    )

    // Manually push reactive React props to uniforms every frame.
    // This allows props to be updated dynamically without tearing down the shader material.
    materialRef.current.uniforms.u_resolution.value.set(size.width, size.height)
    materialRef.current.uniforms.u_slices.value = slices
    materialRef.current.uniforms.u_hoverRadius.value = hoverRadius
    materialRef.current.uniforms.u_imageZoom.value = imageZoom
  })

  return (
    <mesh
      onPointerEnter={() => (activeState.current = 1)}
      onPointerLeave={() => (activeState.current = 0)}
      // Added cancellation events to prevent the effect from getting "stuck"
      // if a touch/drag event is hijacked by the mobile browser's scroll behavior.
      onPointerCancel={() => (activeState.current = 0)}
      onPointerOut={() => (activeState.current = 0)}
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
