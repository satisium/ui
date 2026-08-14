import { Redis } from "@upstash/redis"

export function getRedis() {
  return Redis.fromEnv()
}
