export const velocityGridImageDemoString = `"use client"

import VelocityGrid from "@/components/satisium-ui/velocity-grid"
import { Loading02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function VelocityGridImageDemo() {
  const imageUrl =
    "https://res.cloudinary.com/ddon6aux0/image/upload/f_auto,q_auto/v1782017462/ui-v3/demos/images/2.jpg"

  return (
    <main className="flex h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <div className="relative aspect-[4/3] w-full max-w-5xl overflow-hidden sm:aspect-[16/9]">
        <VelocityGrid
          mediaUrl={imageUrl}
          mediaType="image"
          columns={20} // Dense column array
          rows={15} // Dense row array for a beautiful mosaic scale
          hoverRadius={0.8} // Circular wave covering 40% of the screen height
          shiftMultiplier={1.2} // Force multiplier for the UV shift
          trackingSpeed={2.0} // Heavy fluid tracking speed
          imageZoom={1} // Enough edge-bleed margin to prevent tearing
          fallback={
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <HugeiconsIcon
                icon={Loading02Icon}
                className="h-6 w-6 animate-spin"
              />
              <span className="text-sm font-medium tracking-wide">
                Loading media...
              </span>
            </div>
          }
        />
      </div>
    </main>
  )
}`

export const velocityGridVideoDemoString = `"use client"

import VelocityGrid from "@/components/satisium-ui/velocity-grid"
import { Loading02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function VelocityGridVideoDemo() {
  const videoUrl =
    "https://res.cloudinary.com/ddon6aux0/video/upload/f_auto,q_auto/v1782129926/ui-v3/demos/videos/2.mp4"

  return (
    <main className="flex h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <div className="relative aspect-[4/3] w-full max-w-5xl overflow-hidden sm:aspect-[16/9]">
        <VelocityGrid
          mediaUrl={videoUrl}
          mediaType="video"
          columns={20} // Dense column array
          rows={15} // Dense row array for a beautiful mosaic scale
          hoverRadius={0.8} // Circular wave covering 40% of the screen height
          shiftMultiplier={1.2} // Force multiplier for the UV shift
          trackingSpeed={2.0} // Heavy fluid tracking speed
          imageZoom={1} // Enough edge-bleed margin to prevent tearing
          fallback={
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <HugeiconsIcon
                icon={Loading02Icon}
                className="h-6 w-6 animate-spin"
              />
              <span className="text-sm font-medium tracking-wide">
                Loading media...
              </span>
            </div>
          }
        />
      </div>
    </main>
  )
}`

// Escaping the internal shader backticks so the string doesn't break
export const velocityGridString = `"use client"

import React, { useMemo, useRef, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, useTexture, useVideoTexture } from "@react-three/drei"
import * as THREE from "three"
import { cn } from "@/lib/utils"

export interface VelocityGridProps {
  /** The source URL of the media asset. */
  mediaUrl: string
  /** Defines the media type for correct texture processing. @default "image" */
  mediaType?: "image" | "video"
  /** Number of vertical grid columns. Default: 24 */
  columns?: number
  /** Number of horizontal grid rows. Default: 16 */
  rows?: number
  /** How wide the proximity effect spreads (0.0 to 1.0). Default: 0.35 */
  hoverRadius?: number
  /** Multiplier for how far the image shifts based on velocity. Default: 1.5 */
  shiftMultiplier?: number
  /** How heavily the wave follows the cursor. Lower = more viscous/slower. Default: 2.0 */
  trackingSpeed?: number
  /** Internal zoom to prevent revealing the edge of the image. Default: 1.15 */
  imageZoom?: number
  /** Speed at which the effect fades in/out. Default: 1.5 */
  enterLeaveSpeed?: number
  /** Optional standard Tailwind classes */
  className?: string
  /** Fallback UI to show while the texture is loading */
  fallback?: React.ReactNode
}

// --------------------------------------------------------
// SHADERS
// --------------------------------------------------------
const vertexShader = \`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
\`

const fragmentShader = \`
  uniform sampler2D u_image;
  uniform vec2 u_gridSize;
  uniform vec2 u_mouse;
  uniform vec2 u_velocity; 
  uniform float u_hoverRadius;
  uniform float u_imageZoom;
  uniform vec2 u_resolution;
  uniform vec2 u_imageRes;
  uniform float u_active; 

  varying vec2 vUv;

  void main() {
      // 1. 2D Grid Logic
      vec2 cellId = floor(vUv * u_gridSize);
      vec2 cellCenter = (cellId + 0.5) / u_gridSize;

      // 2. Aspect-Corrected Proximity
      vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
      float dist = distance(cellCenter * aspect, u_mouse * aspect);
      
      float rawInfluence = smoothstep(u_hoverRadius, 0.0, dist);
      float influence = pow(rawInfluence, 1.6) * u_active;

      // 3. Zoom Math 
      vec2 zoomedUv = (vUv - 0.5) * (1.0 / u_imageZoom) + 0.5;

      // 4. 2D Velocity Shift
      vec2 shiftedUv = zoomedUv;
      shiftedUv -= influence * u_velocity;

      // 5. Object-Cover Math (Responsive aspect ratio lock)
      vec2 ratio = u_resolution / u_imageRes;
      float coverRatio = max(ratio.x, ratio.y);
      vec2 renderSize = u_imageRes * coverRatio;
      vec2 offset = (u_resolution - renderSize) * 0.5;
      vec2 coverUv = (shiftedUv * u_resolution - offset) / renderSize;

      gl_FragColor = texture2D(u_image, coverUv);
  }
\`

// --------------------------------------------------------
// INNER WEBGL SCENE
// --------------------------------------------------------

interface GridRendererProps extends Omit<
  VelocityGridProps,
  "mediaUrl" | "mediaType" | "className" | "fallback"
> {
  texture: THREE.Texture
}

const GridRenderer = ({
  texture,
  columns = 24,
  rows = 16,
  hoverRadius = 0.35,
  shiftMultiplier = 1.5,
  trackingSpeed = 2.0,
  imageZoom = 1.15,
  enterLeaveSpeed = 1.5,
}: GridRendererProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()

  // 2D Physics Trackers (The Kinematic Double-Lerp System)
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const smoothMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const targetVelocity = useRef(new THREE.Vector2(0, 0))
  const smoothVelocity = useRef(new THREE.Vector2(0, 0))
  const activeState = useRef(0)

  // Initialize uniforms once. Reactive properties removed to prevent scroll-resizing resets.
  const uniforms = useMemo(() => {
    // Correctly handle both Image and Video asset sizes
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
      u_gridSize: { value: new THREE.Vector2(columns, rows) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_velocity: { value: new THREE.Vector2(0.0, 0.0) },
      u_hoverRadius: { value: hoverRadius },
      u_imageZoom: { value: imageZoom },
      u_resolution: { value: new THREE.Vector2(1, 1) }, // Dynamically updated in useFrame
      u_imageRes: { value: new THREE.Vector2(width, height) },
      u_active: { value: 0.0 },
    }
  }, [texture])

  useFrame((state, delta) => {
    if (!materialRef.current) return

    // Clamp delta to 100ms to prevent extreme physics overshooting on lag spikes
    const dt = Math.min(delta, 0.1)

    // 1. Raw Mouse
    targetMouse.current.set(
      state.pointer.x * 0.5 + 0.5,
      state.pointer.y * 0.5 + 0.5
    )

    // 2. Viscous Position (Drags heavily behind the mouse in 2D space)
    smoothMouse.current.lerp(
      targetMouse.current,
      Math.min(dt * trackingSpeed, 1.0)
    )

    // 3. Raw Tension Vector (The 2D difference between raw and smooth mouse)
    targetVelocity.current
      .subVectors(targetMouse.current, smoothMouse.current)
      .multiplyScalar(shiftMultiplier)

    // Clamp both X and Y target velocities to prevent diagonal edge bleeding
    targetVelocity.current.x = THREE.MathUtils.clamp(
      targetVelocity.current.x,
      -0.4,
      0.4
    )
    targetVelocity.current.y = THREE.MathUtils.clamp(
      targetVelocity.current.y,
      -0.4,
      0.4
    )

    // 4. Inertial Velocity (Smooths the XY tension forces for a liquid glide)
    smoothVelocity.current.lerp(
      targetVelocity.current,
      Math.min(dt * 4.0, 1.0) // Secondary friction
    )

    // Apply values to shader
    materialRef.current.uniforms.u_mouse.value.copy(smoothMouse.current)
    materialRef.current.uniforms.u_velocity.value.copy(smoothVelocity.current)

    // Smooth entrance and exit breathing
    materialRef.current.uniforms.u_active.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.u_active.value,
      activeState.current,
      Math.min(dt * enterLeaveSpeed, 1.0)
    )

    // Manually push reactive properties into uniforms to bypass useMemo recreation
    materialRef.current.uniforms.u_resolution.value.set(size.width, size.height)
    materialRef.current.uniforms.u_gridSize.value.set(columns, rows)
    materialRef.current.uniforms.u_hoverRadius.value = hoverRadius
    materialRef.current.uniforms.u_imageZoom.value = imageZoom
  })

  return (
    <mesh
      onPointerEnter={() => (activeState.current = 1)}
      onPointerLeave={() => (activeState.current = 0)}
      // Fallbacks for mobile devices hijacking the touch events
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

// --------------------------------------------------------
// TEXTURE WRAPPERS
// --------------------------------------------------------

const ImageScene = ({
  mediaUrl,
  ...props
}: { mediaUrl: string } & Partial<GridRendererProps>) => {
  const texture = useTexture(mediaUrl)
  return <GridRenderer texture={texture} {...props} />
}

const VideoScene = ({
  mediaUrl,
  ...props
}: { mediaUrl: string } & Partial<GridRendererProps>) => {
  const texture = useVideoTexture(mediaUrl, {
    crossOrigin: "Anonymous",
    muted: true,
    loop: true,
    start: true,
  })
  return <GridRenderer texture={texture} {...props} />
}

// --------------------------------------------------------
// EXPORTED WRAPPER
// --------------------------------------------------------
export default function VelocityGrid({
  mediaUrl,
  mediaType = "image",
  columns = 24,
  rows = 16,
  hoverRadius = 0.35,
  shiftMultiplier = 1.5,
  trackingSpeed = 2.0,
  imageZoom = 1.15,
  enterLeaveSpeed = 1.5,
  className,
  fallback,
}: VelocityGridProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full cursor-move bg-background",
        className
      )}
    >
      <Canvas>
        <Suspense fallback={fallback ? <Html center>{fallback}</Html> : null}>
          {mediaType === "video" ? (
            <VideoScene
              mediaUrl={mediaUrl}
              columns={columns}
              rows={rows}
              hoverRadius={hoverRadius}
              shiftMultiplier={shiftMultiplier}
              trackingSpeed={trackingSpeed}
              imageZoom={imageZoom}
              enterLeaveSpeed={enterLeaveSpeed}
            />
          ) : (
            <ImageScene
              mediaUrl={mediaUrl}
              columns={columns}
              rows={rows}
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
}`

export const velocityGridFile = {
  "velocity-grid.tsx": {
    code: velocityGridString,
    language: "tsx",
  },
}
