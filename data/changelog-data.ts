import type { ChangeType } from "@/components/changelog"

export interface ChangelogItem {
  type: ChangeType
  component: string
  title: string
  description?: string
  href?: string
  installCommand?: string
  media?: string
  category: string
}

export interface ChangelogSection {
  title: string
  items: ChangelogItem[]
}

export interface ChangelogRelease {
  version: string
  date: string
  prerelease: boolean
  summary: string
  sections: ChangelogSection[]
}

export interface ChangelogData {
  releases: ChangelogRelease[]
}

export const allChangelogs: ChangelogRelease[] = []
export const changelogData: ChangelogData = { releases: [] }

try {
  const raw = await import("./changelog-data.json")
  const data = raw.default || raw
  
  const releases: ChangelogRelease[] = (data.releases || []).map((release: any) => ({
    ...release,
    sections: (release.sections || []).map((section: any) => ({
      ...section,
      items: (section.items || []).map((item: any) => ({
        ...item,
        type: item.type as ChangeType,
      })),
    })),
  }))
  
  allChangelogs.push(...releases)
  changelogData.releases = releases
} catch {
  // File does not exist yet; will be created by the changelog generator on first release.
}
