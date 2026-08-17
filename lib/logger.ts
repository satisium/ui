const isDev = process.env.NODE_ENV === "development"

export const logger = {
  error: (...args: unknown[]) => {
    if (isDev) {
      console.error("[Satisium UI]", ...args)
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn("[Satisium UI]", ...args)
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info("[Satisium UI]", ...args)
    }
  },
}
