import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const CHANGESET_DIR = path.join(ROOT, ".changeset")

function buildMarkdown(changesets, version) {
  const lines = []
  lines.push(`## ${version}`)
  lines.push("")

  const seen = new Set()
  for (const cs of changesets) {
    const filePath = path.join(CHANGESET_DIR, `${cs.name}.md`)
    if (!fs.existsSync(filePath)) continue

    const text = fs.readFileSync(filePath, "utf-8").trim()
    const firstLine = text.split("\n")[0].trim()
    if (!firstLine || seen.has(firstLine)) continue
    seen.add(firstLine)

    lines.push(`- ${firstLine}`)
  }

  if (lines.length <= 2) {
    lines.push("- No user-facing changes in this release.")
  }

  lines.push("")
  return lines.join("\n")
}

export async function getReleaseLine(changesets, version) {
  return buildMarkdown(changesets, version)
}

export async function getDependencyReleaseLine(changesets) {
  return ""
}
