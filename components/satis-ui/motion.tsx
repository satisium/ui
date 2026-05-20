"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"

export function AppStoreCard() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Mock data
  const card = {
    id: "game-1",
    title: "Cyberpunk Ninja",
    subtitle: "Action Game",
  }

  return (
    <div className="relative">
      {/* 1. The Thumbnail (Component A) */}
      <motion.div
        // Link it with a unique ID
        layoutId={`card-${card.id}`}
        onClick={() => setSelectedId(card.id)}
        className="h-64 w-64 cursor-pointer rounded-2xl bg-zinc-900 p-6"
      >
        <motion.h2
          layoutId={`title-${card.id}`}
          className="text-xl font-bold text-white"
        >
          {card.title}
        </motion.h2>
        <motion.p layoutId={`subtitle-${card.id}`} className="text-zinc-400">
          {card.subtitle}
        </motion.p>
      </motion.div>

      {/* 2. The Expanded Modal (Component B) */}
      <AnimatePresence>
        {selectedId && (
          <>
            {/* The Backdrop (standard AnimatePresence fade) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10 bg-black/60"
            />

            {/* The Expanded Card linking back to the Thumbnail */}
            <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center">
              <motion.div
                // The exact same layoutId!
                layoutId={`card-${card.id}`}
                className="pointer-events-auto h-[500px] w-full max-w-2xl rounded-3xl bg-zinc-900 p-8"
              >
                <motion.h2
                  layoutId={`title-${card.id}`}
                  className="mb-2 text-4xl font-bold text-white"
                >
                  {card.title}
                </motion.h2>
                <motion.p
                  layoutId={`subtitle-${card.id}`}
                  className="text-lg text-zinc-400"
                >
                  {card.subtitle}
                </motion.p>

                {/* Content that only exists in the modal fades in */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 text-zinc-300"
                >
                  <p>In-depth game description goes here...</p>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="mt-6 rounded-full bg-white px-6 py-2 text-black"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
