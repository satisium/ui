import { Metadata } from "next"
import * as React from "react"
import { allChangelogs } from "@/data/changelog-data"
import {
  Changelog,
  ChangelogEntry,
  ChangelogHeader,
  ChangelogContent,
  ChangelogItem,
  ChangelogComponentList,
  ChangelogInstallCommand,
  ChangelogMedia,
} from "@/components/changelog"
import { SITE_URL } from "@/lib/config"

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Latest updates, new components, and improvements in Satisium UI.",
  alternates: {
    canonical: "/changelog",
  },
  openGraph: {
    title: "Changelog | Satisium UI",
    description: "Latest updates, new components, and improvements in Satisium UI.",
    url: "/changelog",
    images: [
      {
        url: "/api/og?title=Changelog",
        width: 1200,
        height: 630,
        alt: "Satisium UI Changelog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Changelog | Satisium UI",
    description: "Latest updates, new components, and improvements in Satisium UI.",
    images: ["/api/og?title=Changelog"],
  },
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState<boolean>(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

export default function ChangelogPage() {
  return (
    <div className="mx-auto ml-0 w-full max-w-4xl px-8 py-24 md:px-16 lg:py-32 xl:px-64">
      <header className="mb-16">
        <h1>Changelog</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          All the latest components, improvements, and fixes in Satisium UI.
        </p>
      </header>

      {allChangelogs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No releases yet. The changelog will populate automatically when the first version is published.
          </p>
        </div>
      ) : (
        <Changelog>
          {allChangelogs.map((release) => (
            <ChangelogEntry key={release.version}>
              <ChangelogHeader date={release.date}>
                <div className="flex items-center gap-3">
                  ## {release.version}
                  {release.prerelease && (
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-500">
                      Beta
                    </span>
                  )}
                </div>
              </ChangelogHeader>
              <ChangelogContent>
                {release.summary && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {release.summary}
                  </p>
                )}

                {release.sections.map((section) => (
                  <div key={section.title} className="space-y-4">
                    <h3>{section.title}</h3>
                    {section.items.map((item) => (
                      <ChangelogItem key={item.component} type={item.type}>
                        <div>
                          <strong>{item.title}</strong>
                          {item.description && <span> — {item.description}</span>}
                          {item.href && (
                            <ChangelogComponentList
                              items={[
                                {
                                  name: item.title,
                                  href: item.href,
                                },
                              ]}
                            />
                          )}
                          {item.installCommand && (
                            <ChangelogInstallCommand
                              command={item.installCommand}
                            />
                          )}
                          {item.media && (
                            <ChangelogMedia src={item.media} />
                          )}
                        </div>
                      </ChangelogItem>
                    ))}
                  </div>
                ))}
              </ChangelogContent>
            </ChangelogEntry>
          ))}
        </Changelog>
      )}
    </div>
  )
}
