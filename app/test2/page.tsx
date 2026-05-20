"use client"

import * as React from "react"
import { motion, MotionConfig } from "motion/react"

// 1. Added a `quote` field to accommodate the new testimonial design
interface User {
  id: string
  src: string
  name: string
  role: string
  quote: string
}

const user: User = {
  id: "test-user-1",
  name: "Alex Rivera",
  role: "Product Designer",
  quote:
    "“This product has completely transformed the way our team collaborates. The attention to detail is absolutely incredible.”",
  src: "https://images.unsplash.com/photo-1772732414979-f2f48b908fbe?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0",
}

function CollapsedCard({ user }: { user: User }) {
  return (
    <motion.div
      layoutId={`card-container-${user.id}`}
      className="flex flex-col items-center justify-center border-2"
      style={{
        width: 104,
        height: 104,
        borderRadius: 24, // Explicit border radius for perfect morphing calculation
      }}
    >
      <motion.img
        layoutId={`card-image-${user.id}`}
        src={user.src}
        alt={user.name}
        className="object-cover"
        style={{
          width: 104,
          height: 104,
          borderRadius: 18,
        }}
      />
    </motion.div>
  )
}

function ExpandedCard({ user }: { user: User }) {
  return (
    <motion.div
      layoutId={`card-container-${user.id}`}
      className="flex flex-col justify-between bg-muted p-2 shadow-[inset_0px_0px_64px_13px_rgba(0,0,0,0.35)]"
      style={{
        width: 320,
        height: 240,
        borderRadius: 28,
      }}
    >
      <motion.div
        layout="position"
        initial={{ opacity: 0, y: 5, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }} // 0.1 + 0.5 = 0.6s (Matches parent)
        style={{ transform: "translateZ(0)", willChange: "transform, opacity" }}
        className="rounded-3xl bg-background p-3 text-[17px] leading-snug font-medium tracking-tight text-foreground"
      >
        {user.quote}
      </motion.div>

      <div className="flex w-full items-end justify-between p-4">
        <motion.div
          layout="position" // Prevents inverse-scale jitter
          initial={{ opacity: 0, x: -5, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.15, duration: 0.45, ease: "easeOut" }} // 0.15 + 0.45 = 0.6s
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
          className="object-cover shadow-sm ring-1 ring-black/5"
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
          }}
        />
      </div>
    </motion.div>
  )
}

export default function MorphTestPage() {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-12">
      <MotionConfig transition={{ type: "spring", bounce: 0, duration: 0.6 }}>
        <div className="flex h-[400px] w-[400px] items-center justify-center">
          {isExpanded ? (
            <ExpandedCard user={user} />
          ) : (
            <CollapsedCard user={user} />
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform active:scale-95"
        >
          Toggle Morph State
        </button>
      </MotionConfig>
    </div>
  )
}
