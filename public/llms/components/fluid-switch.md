# Fluid Switch

The Fluid Switch is a highly animated toggle component using Framer Motion's `layoutId`.

## Dependencies

```bash
npm install motion clsx tailwind-merge
```

## Source Code

```tsx
"use client"
import { motion } from "motion/react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function FluidSwitch() {
  const [isOn, setIsOn] = useState(false)
  return (
    <button onClick={() => setIsOn(!isOn)} className={cn("relative flex h-8 w-14 rounded-full p-1", isOn ? "bg-primary" : "bg-muted")}>
      <motion.div layout className="h-6 w-6 rounded-full bg-background shadow-md" animate={{ x: isOn ? 24 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
    </button>
  )
}

```
