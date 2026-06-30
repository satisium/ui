"use client"

import React, { useMemo, useRef, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, useTexture, useVideoTexture } from "@react-three/drei"
import * as THREE from "three"
import { cn } from "@/lib/utils"

export interface GlassSlicesProps {
  /** The source URL of the media asset. */
  mediaUrl: string
  /** Defines the media type for correct texture processing. @default "image" */
  mediaType?: "image" | "video"
  /** Number of vertical glass slices. Default: 24 */
  slices?: number
  /** Radius of the hover wave (normalized 0.0 to 1.0). Default: 0.25 */
  hoverRadius?: number
  /** How compressed/tilted the slice gets at the peak of the wave (0.0 to 1.0). Default: 0.55 */
  minSliceWidth?: number
  /** How far the slice shifts down on the Y-axis. Default: 0.1 */
  shiftY?: number
  /** How much the image zooms in when the slice tilts. Default: 1.15 */
  imageZoom?: number
  /** Fluidity of the mouse tracking. Lower = heavier/slower drag. Default: 3.0 */
  mouseLerpSpeed?: number
  /** Speed at which the effect fades in/out when entering/leaving. Default: 2.0 */
  enterLeaveSpeed?: number
  /** Optional standard Tailwind classes for the outer wrapper */
  className?: string
  /** Fallback UI to show while the texture is loading over the network */
  fallback?: React.ReactNode
}

// --------------------------------------------------------
// SHADERS
// --------------------------------------------------------
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D u_image;
  uniform float u_slices;
  uniform vec2 u_mouse;
  uniform float u_hoverRadius;
  uniform float u_minSliceWidth;
  uniform float u_shiftY;
  uniform float u_imageZoom;
  uniform vec2 u_resolution;
  uniform vec2 u_imageRes;
  uniform float u_active; 

  varying vec2 vUv;

  void main() {
      // 1. Slice Grid Logic
      float sliceId = floor(vUv.x * u_slices);
      float localX = fract(vUv.x * u_slices); // 0.0 to 1.0 inside the current slice
      float sliceCenter = (sliceId + 0.5) / u_slices;

      // 2. Kinematic Proximity (X-axis wave)
      // Using X-axis only so the entire vertical strip moves uniformly like a physical blind
      float distX = abs(sliceCenter - u_mouse.x);
      float rawInfluence = smoothstep(u_hoverRadius, 0.0, distX);
      // Exponential curve for a liquid, heavy feel
      float influence = pow(rawInfluence, 1.5) * u_active;

      // 3. Compression / Tilt Math
      // Visual width of the slice shrinks, revealing the background
      float currentWidth = mix(1.0, u_minSliceWidth, influence);
      
      // Masking logic: smoothstep creates an anti-aliased edge
      float nx = abs(localX * 2.0 - 1.0); // 0 at center, 1 at edges
      float mask = 1.0 - smoothstep(currentWidth, currentWidth + 0.02, nx);

      // 4. Parallax UV Shifting
      vec2 sampleUv = vUv;
      
      // Shift Y (Physically dropping the slice)
      sampleUv.y += influence * u_shiftY; 
      
      // Internal Zoom (Glass Refraction)
      vec2 scaleCenter = vec2(sliceCenter, 0.5);
      sampleUv = (sampleUv - scaleCenter) * mix(1.0, 1.0 / u_imageZoom, influence) + scaleCenter;

      // 5. Object-Cover Math (Image remains flawless on resize)
      vec2 ratio = u_resolution / u_imageRes;
      float coverRatio = max(ratio.x, ratio.y);
      vec2 renderSize = u_imageRes * coverRatio;
      vec2 offset = (u_resolution - renderSize) * 0.5;
      vec2 coverUv = (sampleUv * u_resolution - offset) / renderSize;

      vec4 texColor = texture2D(u_image, coverUv);

      // 6. Volumetric Lighting & Shadows (The 3D Illusion)
      // Map the localX to the NEW visible compressed bounds
      float visibleX = (localX - (0.5 - currentWidth * 0.5)) / currentWidth;
      
      // Specular Glare on the left edge
      float highlight = smoothstep(0.0, 0.1, visibleX) * smoothstep(0.3, 0.1, visibleX);
      texColor.rgb += highlight * influence * 0.65; // Bright white flash

      // Ambient Shadow on the right edge (simulates turning away from light)
      float shadow = smoothstep(0.6, 1.0, visibleX);
      texColor.rgb -= shadow * influence * 0.7; // Deep darkening

      // Final output with the masking applied
      gl_FragColor = vec4(texColor.rgb, texColor.a * mask);
  }
`

// --------------------------------------------------------
// INNER WEBGL SCENE
// --------------------------------------------------------
interface SlicesRendererProps extends Omit<
  GlassSlicesProps,
  "mediaUrl" | "mediaType" | "className" | "fallback"
> {
  texture: THREE.Texture
}

const SlicesRenderer = ({
  texture,
  slices = 24,
  hoverRadius = 0.25,
  minSliceWidth = 0.55,
  shiftY = 0.1,
  imageZoom = 1.15,
  mouseLerpSpeed = 3.0,
  enterLeaveSpeed = 2.0,
}: SlicesRendererProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()

  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const activeState = useRef(0)

  // FIX 1: Remove reactive dependencies to prevent scroll-reset bugs
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
      u_minSliceWidth: { value: minSliceWidth },
      u_shiftY: { value: shiftY },
      u_imageZoom: { value: imageZoom },
      u_resolution: { value: new THREE.Vector2(1, 1) }, // Updated dynamically
      u_imageRes: { value: new THREE.Vector2(width, height) },
      u_active: { value: 0.0 },
    }
  }, [texture])

  useFrame((state, delta) => {
    if (!materialRef.current) return

    // FIX 2: Clamp delta to prevent mathematical overshoots on lag spikes
    const dt = Math.min(delta, 0.1)

    // Track mouse coordinates
    const mx = state.pointer.x * 0.5 + 0.5
    const my = state.pointer.y * 0.5 + 0.5
    targetMouse.current.set(mx, my)

    // Apply fluid drag
    materialRef.current.uniforms.u_mouse.value.lerp(
      targetMouse.current,
      Math.min(dt * mouseLerpSpeed, 1.0)
    )

    // Smoothly transition the effect in and out
    materialRef.current.uniforms.u_active.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.u_active.value,
      activeState.current,
      Math.min(dt * enterLeaveSpeed, 1.0)
    )

    // FIX 3: Push reactive props manually every frame
    materialRef.current.uniforms.u_resolution.value.set(size.width, size.height)
    materialRef.current.uniforms.u_slices.value = slices
    materialRef.current.uniforms.u_hoverRadius.value = hoverRadius
    materialRef.current.uniforms.u_minSliceWidth.value = minSliceWidth
    materialRef.current.uniforms.u_shiftY.value = shiftY
    materialRef.current.uniforms.u_imageZoom.value = imageZoom
  })

  return (
    <mesh
      onPointerEnter={() => (activeState.current = 1)}
      onPointerLeave={() => (activeState.current = 0)}
      // FIX 4: Handle mobile browser touch cancellations
      onPointerCancel={() => (activeState.current = 0)}
      onPointerOut={() => (activeState.current = 0)}
    >
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true} // Essential for revealing Shadcn background through the gaps
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
}: { mediaUrl: string } & Partial<SlicesRendererProps>) => {
  const texture = useTexture(mediaUrl)
  return <SlicesRenderer texture={texture} {...props} />
}

const VideoScene = ({
  mediaUrl,
  ...props
}: { mediaUrl: string } & Partial<SlicesRendererProps>) => {
  const texture = useVideoTexture(mediaUrl, {
    crossOrigin: "Anonymous",
    muted: true,
    loop: true,
    start: true,
  })
  return <SlicesRenderer texture={texture} {...props} />
}

// --------------------------------------------------------
// EXPORTED WRAPPER
// --------------------------------------------------------
export default function GlassSlices({
  mediaUrl,
  mediaType = "image",
  slices = 24,
  hoverRadius = 0.25,
  minSliceWidth = 0.55,
  shiftY = 0.1,
  imageZoom = 1.15,
  mouseLerpSpeed = 3.0,
  enterLeaveSpeed = 2.0,
  className,
  fallback,
}: GlassSlicesProps) {
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
              minSliceWidth={minSliceWidth}
              shiftY={shiftY}
              imageZoom={imageZoom}
              mouseLerpSpeed={mouseLerpSpeed}
              enterLeaveSpeed={enterLeaveSpeed}
            />
          ) : (
            <ImageScene
              mediaUrl={mediaUrl}
              slices={slices}
              hoverRadius={hoverRadius}
              minSliceWidth={minSliceWidth}
              shiftY={shiftY}
              imageZoom={imageZoom}
              mouseLerpSpeed={mouseLerpSpeed}
              enterLeaveSpeed={enterLeaveSpeed}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
