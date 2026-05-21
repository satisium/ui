export type ThemeTransitionVariant =
  /* 🟢 Geometric / Radial */
  | "cursor"
  | "iris"
  | "spotlight"
  | "diagonal"
  | "sweep-up"
  | "sweep-down"
  | "sweep-left"
  | "sweep-right"
  | "split-horizontal"
  | "split-vertical"
  /* 🟠 Spatial & Fades */
  | "fade"
  | "fade-blur"
  | "fade-up"
  | "fade-down"
  | "scale-up"
  | "scale-down"
  | "perspective"
  | "exposure"
  /* 🧊 3D Spatial (Flips & Tumble) */
  | "flip-x"
  | "flip-y"
  | "tumble"
  /* 📺 Digital & Tech */
  | "crt"
  | "glitch"
  /* ☄️ Motion Blur / Velocity */
  | "warp-speed"
  | "swipe-blur"

/**
 * Executes a GPU-accelerated View Transition for theme switching.
 * @param setTheme - The next-themes setter function
 * @param newTheme - The target theme ("light" | "dark")
 * @param event - The Mouse or Keyboard event (required for "cursor" variant)
 * @param variant - The animation style to use
 */
export function switchThemeWithTransition(
  setTheme: (theme: string) => void,
  newTheme: string,
  event: React.MouseEvent | KeyboardEvent | null,
  variant: ThemeTransitionVariant = "cursor"
) {
  if (!document.startViewTransition) {
    setTheme(newTheme)
    return
  }

  document.documentElement.classList.add("satis-theme-transition")

  const transition = document.startViewTransition(() => {
    setTheme(newTheme)
  })

  transition.ready.then(() => {
    let keyframes: Keyframe[] = []

    // Default snappy easing for clip-paths
    let easing = "cubic-bezier(0.76, 0, 0.24, 1)"
    let duration = 500

    const w = window.innerWidth
    const h = window.innerHeight

    switch (variant) {
      /* 🟢 RADIAL & GEOMETRIC */
      case "cursor": {
        let x = w / 2
        let y = h / 2
        if (event && "clientX" in event) {
          x = (event as React.MouseEvent).clientX
          y = (event as React.MouseEvent).clientY
        }
        const endRadius = Math.hypot(Math.max(x, w - x), Math.max(y, h - y))
        keyframes = [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` },
        ]
        break
      }
      case "iris": {
        const x = w / 2
        const y = h / 2
        const endRadius = Math.hypot(x, y)
        keyframes = [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` },
        ]
        break
      }
      case "spotlight": {
        const endRadius = Math.hypot(w / 2, h)
        keyframes = [
          { clipPath: `circle(0px at 50% 0%)` },
          { clipPath: `circle(${endRadius}px at 50% 0%)` },
        ]
        break
      }
      case "diagonal": {
        const endRadius = Math.hypot(w, h)
        keyframes = [
          { clipPath: `circle(0px at 100% 0%)` },
          { clipPath: `circle(${endRadius}px at 100% 0%)` },
        ]
        break
      }

      /* 🔵 DIRECTIONAL WIPES */
      case "sweep-up":
        keyframes = [
          { clipPath: "inset(100% 0 0 0)" },
          { clipPath: "inset(0 0 0 0)" },
        ]
        break
      case "sweep-down":
        keyframes = [
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0 0)" },
        ]
        break
      case "sweep-left":
        keyframes = [
          { clipPath: "inset(0 0 0 100%)" },
          { clipPath: "inset(0 0 0 0)" },
        ]
        break
      case "sweep-right":
        keyframes = [
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0 0 0)" },
        ]
        break
      case "split-horizontal":
        keyframes = [
          { clipPath: "inset(0 50% 0 50%)" },
          { clipPath: "inset(0 0% 0 0%)" },
        ]
        break
      case "split-vertical":
        keyframes = [
          { clipPath: "inset(50% 0 50% 0)" },
          { clipPath: "inset(0% 0 0% 0)" },
        ]
        break

      /* 🟠 SPATIAL & FADES */
      case "fade":
        keyframes = [{ opacity: 0 }, { opacity: 1 }]
        easing = "ease-in-out"
        duration = 400
        break
      case "fade-blur":
        keyframes = [
          { opacity: 0, filter: "blur(12px)" },
          { opacity: 1, filter: "blur(0px)" },
        ]
        easing = "cubic-bezier(0.22, 1, 0.36, 1)"
        duration = 600
        break
      case "fade-up":
        keyframes = [
          { opacity: 0, transform: "translateY(16px)" },
          { opacity: 1, transform: "translateY(0)" },
        ]
        easing = "cubic-bezier(0.22, 1, 0.36, 1)"
        duration = 500
        break
      case "fade-down":
        keyframes = [
          { opacity: 0, transform: "translateY(-16px)" },
          { opacity: 1, transform: "translateY(0)" },
        ]
        easing = "cubic-bezier(0.22, 1, 0.36, 1)"
        duration = 500
        break
      case "scale-up":
        keyframes = [
          { opacity: 0, transform: "scale(0.96)" },
          { opacity: 1, transform: "scale(1)" },
        ]
        easing = "cubic-bezier(0.22, 1, 0.36, 1)"
        duration = 500
        break
      case "scale-down":
        keyframes = [
          { opacity: 0, transform: "scale(1.04)" },
          { opacity: 1, transform: "scale(1)" },
        ]
        easing = "cubic-bezier(0.22, 1, 0.36, 1)"
        duration = 500
        break
      case "perspective":
        keyframes = [
          {
            opacity: 0,
            transform: "perspective(1000px) rotateX(-3deg) scale(0.98)",
          },
          {
            opacity: 1,
            transform: "perspective(1000px) rotateX(0deg) scale(1)",
          },
        ]
        easing = "cubic-bezier(0.22, 1, 0.36, 1)"
        duration = 600
        break
      case "exposure":
        keyframes = [
          { opacity: 0, filter: "brightness(1.5) blur(6px)" },
          { opacity: 1, filter: "brightness(1) blur(0px)" },
        ]
        easing = "cubic-bezier(0.22, 1, 0.36, 1)"
        duration = 600
        break

      /* 🧊 3D SPATIAL (Card Flips) */
      case "flip-x":
        keyframes = [
          { opacity: 0, transform: "perspective(1500px) rotateY(-90deg)" },
          { opacity: 1, transform: "perspective(1500px) rotateY(0deg)" },
        ]
        easing = "cubic-bezier(0.22, 1, 0.36, 1)"
        duration = 600
        break
      case "flip-y":
        keyframes = [
          { opacity: 0, transform: "perspective(1500px) rotateX(-90deg)" },
          { opacity: 1, transform: "perspective(1500px) rotateX(0deg)" },
        ]
        easing = "cubic-bezier(0.22, 1, 0.36, 1)"
        duration = 600
        break
      case "tumble":
        keyframes = [
          {
            opacity: 0,
            transform:
              "perspective(1000px) rotate3d(1, 1, 0, -45deg) scale(0.6)",
          },
          {
            opacity: 1,
            transform: "perspective(1000px) rotate3d(0, 0, 0, 0deg) scale(1)",
          },
        ]
        easing = "cubic-bezier(0.22, 1, 0.36, 1)"
        duration = 650
        break

      /* 📺 DIGITAL & TECH */
      case "crt":
        keyframes = [
          {
            transform: "scaleY(0.01) scaleX(0.1)",
            filter: "brightness(3) blur(4px)",
            opacity: 0,
          },
          {
            transform: "scaleY(0.01) scaleX(1)",
            filter: "brightness(2) blur(2px)",
            opacity: 1,
            offset: 0.4,
          },
          {
            transform: "scaleY(1) scaleX(1)",
            filter: "brightness(1) blur(0px)",
            opacity: 1,
          },
        ]
        easing = "cubic-bezier(0.85, 0, 0.15, 1)"
        duration = 500
        break
      case "glitch":
        keyframes = [
          {
            opacity: 0,
            transform: "translate(10px, -10px) skewX(20deg)",
            filter: "blur(10px) hue-rotate(90deg)",
          },
          {
            opacity: 1,
            transform: "translate(-5px, 5px) skewX(-10deg)",
            filter: "blur(5px) hue-rotate(-90deg)",
            offset: 0.2,
          },
          {
            opacity: 1,
            transform: "translate(0, 0) skewX(0deg)",
            filter: "blur(0px) hue-rotate(0deg)",
          },
        ]
        easing = "cubic-bezier(0.22, 1, 0.36, 1)"
        duration = 450
        break

      /* ☄️ MOTION BLUR & VELOCITY */
      case "warp-speed":
        keyframes = [
          { opacity: 0, transform: "scale(0.2)", filter: "blur(20px)" },
          { opacity: 1, transform: "scale(1)", filter: "blur(0px)" },
        ]
        easing = "cubic-bezier(0.22, 1, 0.36, 1)"
        duration = 550
        break
      case "swipe-blur":
        keyframes = [
          {
            clipPath: "inset(0 100% 0 0)",
            filter: "blur(10px)",
            transform: "skewX(15deg)",
          },
          {
            clipPath: "inset(0 0 0 0)",
            filter: "blur(0px)",
            transform: "skewX(0deg)",
          },
        ]
        easing = "cubic-bezier(0.76, 0, 0.24, 1)"
        duration = 500
        break
    }

    document.documentElement.animate(keyframes, {
      duration,
      easing,
      pseudoElement: "::view-transition-new(root)",
    })
  })

  transition.finished.finally(() => {
    document.documentElement.classList.remove("satis-theme-transition")
  })
}
