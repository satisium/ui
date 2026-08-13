import { getGithubLastEdit } from "fumadocs-core/content/github"

const LAST_EDIT_CACHE = new Map<string, { timestamp: number; value: string | null }>()
const CACHE_TTL = 5 * 60 * 1000

export async function getLastModifiedTime(
  pagePath: string,
  owner = "satisium",
  repo = "ui"
): Promise<string | null> {
  const cacheKey = `${owner}/${repo}/${pagePath}`
  const cached = LAST_EDIT_CACHE.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value
  }

  if (process.env.NODE_ENV === "development") {
    return null
  }

  try {
    const time = await getGithubLastEdit({
      owner,
      repo,
      path: `content/docs/${pagePath}`,
      token: process.env.GIT_TOKEN ? `Bearer ${process.env.GIT_TOKEN}` : undefined,
    })

    const formatted = time
      ? new Date(time).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null

    LAST_EDIT_CACHE.set(cacheKey, { timestamp: Date.now(), value: formatted })
    return formatted
  } catch {
    return null
  }
}
