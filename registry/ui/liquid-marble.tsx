"use client"

import React, { useMemo, useRef, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Html, useTexture, useVideoTexture } from "@react-three/drei"
import * as THREE from "three"
import { cn } from "@/lib/utils"

export interface LiquidMarbleProps {
  /** The source URL of the media asset. */
  mediaUrl: string
  /** Defines the media type for correct texture processing. @default "image" */
  mediaType?: "image" | "video"
  /** How wide the clarity lens spreads (0.0 to 1.0). Default: 0.35 */
  hoverRadius?: number
  /** How violently the liquid swirls outside the cursor. Default: 0.1 */
  distortionStrength?: number
  /** Scale of the noise. Lower = larger, sweeping waves. Higher = tighter ripples. Default: 3.0 */
  noiseScale?: number
  /** How fast the liquid continuously flows over time. Default: 0.2 */
  speed?: number
  /** Internal zoom to prevent revealing image edges during heavy distortion. Default: 1.2 */
  imageZoom?: number
  /** Fluidity of the mouse tracking. Lower = heavier drag. Default: 3.0 */
  mouseLerpSpeed?: number
  /** Speed at which the clarity lens fades in/out. Default: 1.5 */
  enterLeaveSpeed?: number
  /** Optional standard Tailwind classes for the wrapper */
  className?: string
  /** Fallback UI to show while the texture is loading */
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
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform vec2 u_imageRes;
  uniform float u_hoverRadius;
  uniform float u_distortionStrength;
  uniform float u_noiseScale;
  uniform float u_time;
  uniform float u_imageZoom;
  uniform float u_active;

  varying vec2 vUv;

  // --------------------------------------------------------
  // 3D Simplex Noise (The Fluid Physics Engine)
  // --------------------------------------------------------
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
      // 1. Aspect-Ratio Locked Cover Math
      vec2 ratio = u_resolution / u_imageRes;
      float coverRatio = max(ratio.x, ratio.y);
      vec2 renderSize = u_imageRes * coverRatio;
      vec2 offset = (u_resolution - renderSize) * 0.5;
      vec2 coverUv = (vUv * u_resolution - offset) / renderSize;

      // Zoom slightly to hide border bleeding from the distortion
      vec2 zoomedUv = (coverUv - 0.5) * (1.0 / u_imageZoom) + 0.5;

      // 2. Proximity Masking (The Clarity Lens)
      vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
      float dist = distance(vUv * aspect, u_mouse * aspect);
      
      // 0.0 at the cursor, 1.0 outside the radius
      float rawMask = smoothstep(0.0, u_hoverRadius, dist);
      
      // When inactive, the mask is 1.0 everywhere (fully distorted). 
      // When active, the cursor reveals the clear image.
      float mask = mix(1.0, pow(rawMask, 1.2), u_active);

      // 3. Fluid Distortion Math
      // We sample the noise twice with an offset to get independent X and Y swiping
      vec2 noiseUv = zoomedUv * u_noiseScale;
      float nx = snoise(vec3(noiseUv, u_time));
      float ny = snoise(vec3(noiseUv + vec2(100.0), u_time)); // Offset for Y
      
      vec2 distortion = vec2(nx, ny) * u_distortionStrength * mask;

      // 4. Chromatic Refraction (Simulating thick, heavy liquid glass)
      // We offset the RGB channels slightly based on the distortion vector
      float r = texture2D(u_image, zoomedUv + distortion * 1.04).r;
      float g = texture2D(u_image, zoomedUv + distortion * 1.00).g;
      float b = texture2D(u_image, zoomedUv + distortion * 0.96).b;

      gl_FragColor = vec4(r, g, b, 1.0);
  }
`

// --------------------------------------------------------
// INNER WEBGL SCENE
// --------------------------------------------------------

interface MarbleRendererProps extends Omit<
  LiquidMarbleProps,
  "mediaUrl" | "mediaType" | "className" | "fallback"
> {
  texture: THREE.Texture
}

const MarbleRenderer = ({
  texture,
  hoverRadius = 0.35,
  distortionStrength = 0.1,
  noiseScale = 3.0,
  speed = 0.2,
  imageZoom = 1.2,
  mouseLerpSpeed = 3.0,
  enterLeaveSpeed = 1.5,
}: MarbleRendererProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()

  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5))
  const smoothMouse = useRef(new THREE.Vector2(0.5, 0.5))
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
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_resolution: { value: new THREE.Vector2(1, 1) }, // Updated dynamically
      u_imageRes: { value: new THREE.Vector2(width, height) },
      u_hoverRadius: { value: hoverRadius },
      u_distortionStrength: { value: distortionStrength },
      u_noiseScale: { value: noiseScale },
      u_time: { value: 0.0 },
      u_imageZoom: { value: imageZoom },
      u_active: { value: 0.0 },
    }
  }, [texture])

  useFrame((state, delta) => {
    if (!materialRef.current) return

    // FIX 2: Clamp delta to prevent simulation glitching on lag spikes
    const dt = Math.min(delta, 0.1)

    // Tick the fluid simulation forward safely
    materialRef.current.uniforms.u_time.value += dt * speed

    // Track mouse
    targetMouse.current.set(
      state.pointer.x * 0.5 + 0.5,
      state.pointer.y * 0.5 + 0.5
    )

    // Liquid Viscosity on the mouse drag
    smoothMouse.current.lerp(
      targetMouse.current,
      Math.min(dt * mouseLerpSpeed, 1.0)
    )
    materialRef.current.uniforms.u_mouse.value.copy(smoothMouse.current)

    // Smooth transition between fully-liquid (unhovered) and lens-active (hovered)
    materialRef.current.uniforms.u_active.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.u_active.value,
      activeState.current,
      Math.min(dt * enterLeaveSpeed, 1.0)
    )

    // FIX 3: Push reactive props manually every frame
    materialRef.current.uniforms.u_resolution.value.set(size.width, size.height)
    materialRef.current.uniforms.u_hoverRadius.value = hoverRadius
    materialRef.current.uniforms.u_distortionStrength.value = distortionStrength
    materialRef.current.uniforms.u_noiseScale.value = noiseScale
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
}: { mediaUrl: string } & Partial<MarbleRendererProps>) => {
  const texture = useTexture(mediaUrl)
  return <MarbleRenderer texture={texture} {...props} />
}

const VideoScene = ({
  mediaUrl,
  ...props
}: { mediaUrl: string } & Partial<MarbleRendererProps>) => {
  const texture = useVideoTexture(mediaUrl, {
    crossOrigin: "Anonymous",
    muted: true,
    loop: true,
    start: true,
  })
  return <MarbleRenderer texture={texture} {...props} />
}

// --------------------------------------------------------
// EXPORTED WRAPPER (Publishable)
// --------------------------------------------------------
export default function LiquidMarble({
  mediaUrl,
  mediaType = "image",
  hoverRadius = 0.35,
  distortionStrength = 0.1,
  noiseScale = 3.0,
  speed = 0.2,
  imageZoom = 1.2,
  mouseLerpSpeed = 3.0,
  enterLeaveSpeed = 1.5,
  className,
  fallback,
}: LiquidMarbleProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full cursor-crosshair bg-background",
        className
      )}
    >
      <Canvas>
        <Suspense fallback={fallback ? <Html center>{fallback}</Html> : null}>
          {mediaType === "video" ? (
            <VideoScene
              mediaUrl={mediaUrl}
              hoverRadius={hoverRadius}
              distortionStrength={distortionStrength}
              noiseScale={noiseScale}
              speed={speed}
              imageZoom={imageZoom}
              mouseLerpSpeed={mouseLerpSpeed}
              enterLeaveSpeed={enterLeaveSpeed}
            />
          ) : (
            <ImageScene
              mediaUrl={mediaUrl}
              hoverRadius={hoverRadius}
              distortionStrength={distortionStrength}
              noiseScale={noiseScale}
              speed={speed}
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
