export type SocialPlatform =
  "x" | "github" | "discord" | "instagram" | "youtube" | "linkedin"

export interface SocialLink {
  platform: SocialPlatform
  href: string
  label: string
  ariaLabel: string
}

export const PROJECT = {
  name: "Satisium UI",
  x: "https://x.com/satisium",
  github: "https://github.com/satisium/ui",
  discord: "https://discord.gg/xQ5cPHmT7",
  instagram: "https://www.instagram.com/satisium/",
} as const

export const AUTHOR = {
  name: "Satishkumar",
  x: "https://x.com/iamsatish4564",
  github: "https://github.com/satishkumarsajjan",
  instagram: "https://instagram.com/iamsatish4564",
} as const

export const REPO = "satisium/ui"

export const FOOTER_SOCIALS: SocialLink[] = [
  {
    platform: "x",
    href: PROJECT.x,
    label: "X",
    ariaLabel: "Satisium UI on X",
  },
  {
    platform: "instagram",
    href: PROJECT.instagram,
    label: "Instagram",
    ariaLabel: "Satisium UI on Instagram",
  },
  {
    platform: "github",
    href: PROJECT.github,
    label: "GitHub",
    ariaLabel: "Satisium UI on GitHub",
  },
  {
    platform: "discord",
    href: PROJECT.discord,
    label: "Discord",
    ariaLabel: "Satisium Discord",
  },
]

export const AUTHOR_SOCIALS: SocialLink[] = [
  {
    platform: "x",
    href: AUTHOR.x,
    label: "X",
    ariaLabel: "Author X",
  },
  {
    platform: "github",
    href: AUTHOR.github,
    label: "GitHub",
    ariaLabel: "Author GitHub",
  },
]

export const TWITTER_CREATOR = "@iamsatish4564"

export const ORGANIZATION_SAME_AS = [
  PROJECT.github,
  AUTHOR.x.replace("x.com", "twitter.com"),
] as const
