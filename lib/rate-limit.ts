import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

const RATE_LIMIT_WINDOW = 60
const RATE_LIMIT_MAX = 30

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW * 1000

  const pipeline = redis.pipeline()
  pipeline.zremrangebyscore(key, 0, windowStart)
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })
  pipeline.zcard(key)
  pipeline.expire(key, RATE_LIMIT_WINDOW)

  const results = await pipeline.exec()
  const count = results[2] as number

  return count <= RATE_LIMIT_MAX
}

export function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown"

  return ip.replace(/[^a-zA-Z0-9:.]/g, "")
}
