"use client"

import * as React from "react"
import { motion, MotionConfig } from "motion/react"
import { cn } from "@/lib/utils"

interface User {
  id: string
  src: string
  name: string
  role: string
  quote: string
}

interface ImageWheelProps {
  radius?: number
  interval?: number
  /** The angle where the active card docks. 0 = Top, 90 = Right, 180 = Bottom, 270 = Left */
  activePositionAngle?: number
  /** How many degrees the immediate neighbors get pushed away to make room */
  spreadAngle?: number
}

const users: User[] = [
  {
    id: "1",
    name: "Alex Rivera",
    role: "Product Designer",
    quote:
      "“This product has completely transformed the way our team collaborates. The attention to detail is absolutely incredible.”",
    src: "https://images.unsplash.com/photo-1772732414979-f2f48b908fbe?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "2",
    name: "Jordan Lee",
    role: "Frontend Engineer",
    quote:
      "“The seamless integration and flawless execution have saved us countless hours. It just works perfectly.”",
    src: "https://images.unsplash.com/photo-1735454164964-e694e930abed?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "3",
    name: "Taylor Smith",
    role: "Backend Engineer",
    quote:
      "“A truly premium experience from top to bottom. The API is robust and the design is remarkably clean.”",
    src: "https://images.unsplash.com/photo-1753454116088-b7f113c65824?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "4",
    name: "Morgan Chen",
    role: "UX Researcher",
    quote:
      "“User feedback has been overwhelmingly positive. The interface is intuitive, fast, and gorgeous.”",
    src: "https://images.unsplash.com/photo-1768036479363-0810baba6613?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "5",
    name: "Casey Jones",
    role: "DevOps",
    quote:
      "“Deployments are a breeze, and the performance metrics are off the charts. Highly recommended.”",
    src: "https://images.unsplash.com/photo-1773236376043-8d798721c402?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "6",
    name: "Sam Wilson",
    role: "Engineering Manager",
    quote:
      "“It brings a level of polish that is hard to find elsewhere. Our development velocity has doubled.”",
    src: "https://images.unsplash.com/photo-1773107674188-5fb5a5a247d0?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "7",
    name: "Jamie Fox",
    role: "Data Scientist",
    quote:
      "“The visualization capabilities are extraordinary. It turns complex data sets into beautiful insights.”",
    src: "https://images.unsplash.com/photo-1772289093510-2c64b03d7fd5?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "8",
    name: "Casey Jones",
    role: "DevOps",
    quote:
      "“Deployments are a breeze, and the performance metrics are off the charts. Highly recommended.”",
    src: "https://images.unsplash.com/photo-1773236376043-8d798721c402?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "9",
    name: "Sam Wilson",
    role: "Engineering Manager",
    quote:
      "“It brings a level of polish that is hard to find elsewhere. Our development velocity has doubled.”",
    src: "https://images.unsplash.com/photo-1773107674188-5fb5a5a247d0?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "10",
    name: "Jamie Fox",
    role: "Data Scientist",
    quote:
      "“The visualization capabilities are extraordinary. It turns complex data sets into beautiful insights.”",
    src: "https://images.unsplash.com/photo-1772289093510-2c64b03d7fd5?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "11",
    name: "Casey Jones",
    role: "DevOps",
    quote:
      "“Deployments are a breeze, and the performance metrics are off the charts. Highly recommended.”",
    src: "https://images.unsplash.com/photo-1773236376043-8d798721c402?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "12",
    name: "Sam Wilson",
    role: "Engineering Manager",
    quote:
      "“It brings a level of polish that is hard to find elsewhere. Our development velocity has doubled.”",
    src: "https://images.unsplash.com/photo-1773107674188-5fb5a5a247d0?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "13",
    name: "Jamie Fox",
    role: "Data Scientist",
    quote:
      "“The visualization capabilities are extraordinary. It turns complex data sets into beautiful insights.”",
    src: "https://images.unsplash.com/photo-1772289093510-2c64b03d7fd5?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
]

function WheelCard({ user }: { user: User }) {
  return (
    <div
      className="flex flex-col items-center justify-center border-2 border-border/50 bg-background shadow-sm"
      style={{ width: 104, height: 104, borderRadius: 24 }}
    >
      <img
        src={user.src}
        alt={user.name}
        className="object-cover"
        style={{ width: 100, height: 100, borderRadius: 18 }}
      />
    </div>
  )
}

function CollapsedCard({
  user,
  activeAngle,
}: {
  user: User
  activeAngle: number
}) {
  return (
    <motion.div
      layoutId={`card-container-${user.id}`}
      animate={{ rotate: activeAngle }} // Inherits the exact sideways angle of the wheel position
      className="flex flex-col items-center justify-center border-2 border-border/50 bg-background"
      style={{ width: 104, height: 104, borderRadius: 24 }}
    >
      <motion.img
        layoutId={`card-image-${user.id}`}
        src={user.src}
        alt={user.name}
        className="object-cover"
        style={{ width: 100, height: 100, borderRadius: 18 }}
      />
    </motion.div>
  )
}

function ExpandedCard({ user }: { user: User }) {
  return (
    <motion.div
      layoutId={`card-container-${user.id}`}
      animate={{ rotate: 0 }} // Gyroscopically morphs back perfectly upright
      className="flex flex-col justify-between bg-muted p-3 ring-1 ring-border"
      style={{ width: 320, height: 240, borderRadius: 28 }}
    >
      <motion.div
        layout="position"
        initial={{ opacity: 0, y: 5, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        style={{ transform: "translateZ(0)", willChange: "transform, opacity" }}
        className="rounded-2xl bg-background p-3 text-[17px] leading-snug font-medium tracking-tight text-foreground shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)]"
      >
        {user.quote}
      </motion.div>

      <div className="flex w-full items-end justify-between p-3">
        <motion.div
          layout="position"
          initial={{ opacity: 0, x: -5, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.15, duration: 0.45, ease: "easeOut" }}
          style={{
            transform: "translateZ(0)",
            willChange: "transform, opacity",
          }}
          className="flex flex-col pb-1"
        >
          <div className="text-base font-semibold tracking-tight text-foreground">
            {user.name}
          </div>
          <div className="text-sm text-muted-foreground">{user.role}</div>
        </motion.div>

        <motion.img
          layoutId={`card-image-${user.id}`}
          src={user.src}
          alt={user.name}
          className="object-cover shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)]"
          style={{ width: 72, height: 72, borderRadius: 16 }}
        />
      </div>
    </motion.div>
  )
}

export default function ImageWheelPage({
  radius = 420,
  interval = 5000,
  activePositionAngle = 0, // Dock at 12 o'clock by default
  spreadAngle = 25, // Fluidly shift neighbors away by 25 degrees when active
}: ImageWheelProps) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [isDocked, setIsDocked] = React.useState(false)
  const [isExpanded, setIsExpanded] = React.useState(false)

  React.useEffect(() => {
    let dockTimer: NodeJS.Timeout
    let expandTimer: NodeJS.Timeout
    let collapseTimer: NodeJS.Timeout
    let undockTimer: NodeJS.Timeout

    const spinDuration = 800
    const dockBuffer = 50
    const collapseBuffer = 800
    const undockBuffer = 100

    const startSequence = () => {
      dockTimer = setTimeout(() => setIsDocked(true), spinDuration)
      expandTimer = setTimeout(
        () => setIsExpanded(true),
        spinDuration + dockBuffer
      )
      collapseTimer = setTimeout(
        () => setIsExpanded(false),
        interval - collapseBuffer
      )
      undockTimer = setTimeout(
        () => setIsDocked(false),
        interval - undockBuffer
      )
    }

    startSequence()

    const cycleTimer = setInterval(() => {
      setActiveIndex((prev) => prev + 1)
      startSequence()
    }, interval)

    return () => {
      clearInterval(cycleTimer)
      clearTimeout(dockTimer)
      clearTimeout(expandTimer)
      clearTimeout(collapseTimer)
      clearTimeout(undockTimer)
    }
  }, [interval])

  const step = 360 / users.length
  const rotation = -(activeIndex * step) + activePositionAngle
  const normalizedActiveIndex =
    ((activeIndex % users.length) + users.length) % users.length

  // Calculate the raw un-rotated cartesian coordinates for the Fixed Apex Dock
  const rad = (activePositionAngle * Math.PI) / 180
  const apexX = radius * Math.sin(rad)
  const apexY = -radius * Math.cos(rad)

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <MotionConfig transition={{ type: "spring", bounce: 0, duration: 0.6 }}>
        <div
          className={cn(
            "relative flex h-[400px] w-[400px] items-center justify-center",
            `translate-y-[500px]`
          )}
        >
          {/* THE ROTATING WHEEL WITH DYNAMIC SPREAD */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: rotation }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {users.map((user, i) => {
              const baseAngle = i * step
              const isActive = i === normalizedActiveIndex
              const isVisibleInWheel = !(isActive && isDocked)

              // Wrap the difference so distance calculation works perfectly across the circle's seams
              const diff = i - normalizedActiveIndex
              let wrappedDiff = diff
              const half = users.length / 2
              if (wrappedDiff > half) wrappedDiff -= users.length
              if (wrappedDiff < -half) wrappedDiff += users.length

              // Decay formula: immediate neighbors get full spreadAngle, opposite item gets 0 spread
              let offset = 0
              if (isExpanded && wrappedDiff !== 0) {
                const sign = Math.sign(wrappedDiff)
                const absDiff = Math.abs(wrappedDiff)
                offset = sign * spreadAngle * (1 - absDiff / half)
              }

              return (
                <motion.div
                  key={user.id}
                  className="absolute flex items-center justify-center"
                  animate={{ rotate: baseAngle + offset }}
                >
                  {/* Translate out strictly after the local rotation wrapper */}
                  <div style={{ transform: `translateY(-${radius}px)` }}>
                    {isVisibleInWheel && <WheelCard user={user} />}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* THE FIXED APEX DOCK: Lock coordinates to exactly match the target angle */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 50 }}
          >
            <div
              className="pointer-events-auto flex items-center justify-center"
              style={{ transform: `translate(${apexX}px, ${apexY}px)` }}
            >
              {isDocked &&
                (isExpanded ? (
                  <ExpandedCard user={users[normalizedActiveIndex]} />
                ) : (
                  <CollapsedCard
                    user={users[normalizedActiveIndex]}
                    activeAngle={activePositionAngle}
                  />
                ))}
            </div>
          </div>
        </div>
      </MotionConfig>
    </div>
  )
}
