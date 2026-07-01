import BouquetTrail from "@/registry/ui/bouquet-trail"

const floralElements = [
  <svg
    key="plumeria"
    viewBox="0 0 100 100"
    fill="currentColor"
    className="h-full w-full overflow-visible drop-shadow-xl"
  >
    <g transform="translate(50,50)">
      <path
        d="M0,0 C15,-20 20,-45 0,-50 C-20,-45 -15,-20 0,0"
        transform="rotate(0)"
        opacity="0.9"
      />
      <path
        d="M0,0 C15,-20 20,-45 0,-50 C-20,-45 -15,-20 0,0"
        transform="rotate(72)"
        opacity="0.9"
      />
      <path
        d="M0,0 C15,-20 20,-45 0,-50 C-20,-45 -15,-20 0,0"
        transform="rotate(144)"
        opacity="0.9"
      />
      <path
        d="M0,0 C15,-20 20,-45 0,-50 C-20,-45 -15,-20 0,0"
        transform="rotate(216)"
        opacity="0.9"
      />
      <path
        d="M0,0 C15,-20 20,-45 0,-50 C-20,-45 -15,-20 0,0"
        transform="rotate(288)"
        opacity="0.9"
      />
    </g>
    <circle cx="50" cy="50" r="8" fill="rgba(255,255,255,0.6)" />
    <circle cx="50" cy="50" r="4" fill="rgba(0,0,0,0.15)" />
  </svg>,

  // 2. Layered Peony
  <svg
    key="peony"
    viewBox="0 0 100 100"
    fill="currentColor"
    className="h-full w-full overflow-visible drop-shadow-2xl"
  >
    <g transform="translate(50,50)">
      <circle cx="-15" cy="-15" r="24" opacity="0.6" />
      <circle cx="15" cy="-15" r="24" opacity="0.6" />
      <circle cx="-15" cy="15" r="24" opacity="0.6" />
      <circle cx="15" cy="15" r="24" opacity="0.6" />
      <circle cx="-10" cy="0" r="20" opacity="0.8" />
      <circle cx="10" cy="0" r="20" opacity="0.8" />
      <circle cx="0" cy="-10" r="20" opacity="0.8" />
      <circle cx="0" cy="10" r="20" opacity="0.8" />
      <circle cx="0" cy="0" r="14" opacity="1" />
      <circle cx="0" cy="0" r="6" fill="rgba(255,255,255,0.4)" />
    </g>
  </svg>,

  // 3. The Rose
  <svg
    key="rose"
    viewBox="0 0 100 100"
    fill="currentColor"
    className="h-full w-full overflow-visible drop-shadow-2xl"
  >
    <g transform="translate(50,50)">
      <path
        d="M-30,-10 C-30,-30 -10,-40 10,-30 C30,-20 40,0 30,20 C20,40 0,40 -20,20 C-35,5 -30,-10 -30,-10 Z"
        opacity="0.6"
      />
      <path
        d="M-20,15 C-40,5 -30,-20 -10,-25 C10,-30 30,-10 20,10 C15,25 -5,30 -20,15 Z"
        opacity="0.8"
      />
      <path
        d="M10,10 C25,-5 10,-25 -5,-20 C-20,-15 -20,5 -10,15 C0,25 15,20 10,10 Z"
        opacity="0.95"
      />
      <path d="M-5,-5 C-15,5 -5,15 5,10 C15,5 10,-10 0,-5 Z" opacity="1" />
      <path
        d="M 0 0 C -5 -5 -2 -10 2 -5 C 5 0 0 5 0 0 Z"
        fill="rgba(0,0,0,0.3)"
      />
    </g>
  </svg>,

  // 4. The Sunflower (Dynamic petals, hardcoded dark center)
  <svg
    key="sunflower"
    viewBox="0 0 100 100"
    fill="currentColor"
    className="h-full w-full overflow-visible drop-shadow-xl"
  >
    <g transform="translate(50,50)">
      {[0, 30, 60, 90, 120, 150].map((deg) => (
        <ellipse
          key={`out-${deg}`}
          cx="0"
          cy="0"
          rx="45"
          ry="8"
          transform={`rotate(${deg})`}
          opacity="0.85"
        />
      ))}
      {[15, 45, 75, 105, 135, 165].map((deg) => (
        <ellipse
          key={`in-${deg}`}
          cx="0"
          cy="0"
          rx="38"
          ry="8"
          transform={`rotate(${deg})`}
          opacity="0.95"
        />
      ))}
      <circle cx="0" cy="0" r="22" fill="#3E2723" />
      <circle
        cx="0"
        cy="0"
        r="18"
        fill="#4E342E"
        stroke="#3E2723"
        strokeWidth="2"
        strokeDasharray="2,2"
      />
    </g>
  </svg>,

  // --- HARDCODED FLOWERS & GREENERY (Ignore random colors) ---

  // 5. The Classic White Daisy
  <svg
    key="whitedaisy"
    viewBox="0 0 100 100"
    className="h-full w-full overflow-visible drop-shadow-xl"
  >
    <g transform="translate(50,50)">
      {[0, 45, 90, 135].map((deg) => (
        <ellipse
          key={`d1-${deg}`}
          cx="0"
          cy="0"
          rx="42"
          ry="12"
          fill="#FFFFFF"
          transform={`rotate(${deg})`}
        />
      ))}
      {[22.5, 67.5, 112.5, 157.5].map((deg) => (
        <ellipse
          key={`d2-${deg}`}
          cx="0"
          cy="0"
          rx="40"
          ry="10"
          fill="#F8F9FA"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="14" fill="#FFD700" />
      <circle cx="0" cy="0" r="10" fill="#FFB300" />
    </g>
  </svg>,

  // 6. Top-Down Grass Clump (Sharp, spiky filler)
  <svg
    key="grass"
    viewBox="0 0 100 100"
    fill="none"
    className="h-full w-full overflow-visible drop-shadow-md"
  >
    <g transform="translate(50,50)">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <path
          key={`grass-${deg}`}
          d="M-4,0 L0,-45 L4,0 Z"
          fill={i % 2 === 0 ? "#558B2F" : "#7CB342"}
          transform={`rotate(${deg})`}
          opacity="0.9"
        />
      ))}
      <circle cx="0" cy="0" r="8" fill="#33691E" opacity="0.8" />
    </g>
  </svg>,

  // 7. Double Leaf
  <svg
    key="leaf1"
    viewBox="0 0 100 100"
    fill="none"
    className="h-full w-full overflow-visible drop-shadow-md"
  >
    <g transform="translate(50,80)">
      <path
        d="M0,0 Q-30,-20 0,-60 Q10,-30 0,0"
        fill="#7BAA5E"
        transform="rotate(-25)"
        opacity="0.9"
      />
      <path
        d="M0,0 Q-30,-20 0,-60 Q10,-30 0,0"
        fill="#90C371"
        transform="rotate(25)"
        opacity="0.9"
      />
    </g>
  </svg>,

  // 8. Broad Pointed Leaf
  <svg
    key="leaf2"
    viewBox="0 0 100 100"
    fill="none"
    className="h-full w-full overflow-visible drop-shadow-lg"
  >
    <path
      d="M50 95 Q 20 50 50 5 Q 80 50 50 95 Z"
      fill="#6A994E"
      opacity="0.85"
    />
    <path d="M50 95 L 50 5" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
  </svg>,
]

const warmVibrantColors = [
  "#FF5E7E", // Vibrant Pink-Red
  "#FF9B71", // Warm Orange
  "#FFD166", // Bright Yellow
  "#F36CA3", // Hot Pink
  "#FFB042", // Golden Orange
  "#E05263", // Coral Red
  "#FFA3A5", // Soft Warm Pink
]

export default function BouquetTrailDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none z-10 flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Floral Bouquet.
        </h1>
      </div>

      <BouquetTrail
        elements={floralElements}
        colors={warmVibrantColors}
        itemSize={40}
        distance={10} // Tight spacing ensures heavy overlapping
        scatterRadius={20} // Pushes flowers outward creating a dense brush stroke
        maxItems={50} // High limit allows massively dense gardens before wilting
        duration={3000} // Leaves them holding on screen longer
        scaleRange={[0.6, 1.4]}
        rotationRange={360}
        enableBreathing={true}
      />
    </main>
  )
}
