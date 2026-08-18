// scripts/create-doc.mjs
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, "..")

// 1. Get the CLI arguments
const args = process.argv.slice(2)
if (args.length === 0) {
  console.error("❌ Error: Please provide a relative file path.")
  console.info("💡 Example: npm run make:doc carousels/my-carousel")
  process.exit(1)
}

const inputPath = args[0]

// 2. Parse paths and names
// e.g., "carousels/my-carousel" -> dir: "carousels", name: "my-carousel"
const isMdx = inputPath.endsWith(".mdx")
const cleanPath = isMdx ? inputPath : `${inputPath}.mdx`
const fullPath = path.join(rootDir, "content/docs", cleanPath)

const filename = path.basename(cleanPath, ".mdx") // "my-carousel"
const folderName = path.dirname(cleanPath) // "carousels"

// Convert "my-carousel" to "My Carousel"
const title = filename
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ")

// Map folder to category
const validCategories = [
  "text-reveals",
  "image-effects",
  "carousels",
  "mouse-trails",
]
const category = validCategories.includes(folderName)
  ? folderName
  : "text-reveals"

// 3. The MDX Template
const mdxTemplate = `---
title: ${title}
description: A tasteful and carefully crafted ${title.toLowerCase()} component.
component: true
badge: new
category:
  - ${category}
author: Satisium UI
links:
  github: https://github.com/satisium/ui/blob/main/registry/ui/${filename}
  preview: https://satisiumui.com/preview/${filename}
registryKeys:
  - ${filename}-demo
media:
  image: "https://res.cloudinary.com/ddon6aux0/image/upload/v.../image.jpg"
  video: "https://res.cloudinary.com/ddon6aux0/video/upload/v.../video.mp4"
---

## Install

### CLI

<div className="mt-6">
    <CommandBlock cli="satisium-ui add ${filename}" title="${filename}" />
</div>

### Manual

**1. Install Dependencies**

<div className="mt-6">
    <CommandBlock pkg="motion lucide-react clsx tailwind-merge" />
</div>

**2. Add Source Code**

import { ${filename}File } from "@/registry/strings/${filename}"

<div className="mt-6">
  <CodeBlock files={${filename}File} height="600px" />
</div>

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **\`propName\`** | \`type\` | \`default\` | Describe the prop intent here. |

## Inspiration and Credits

Tastefully crafted with inspiration from [Creator Name](https://twitter.com/creator).
`

// 3b. Append registry entry to registry.json
const registryPath = path.join(rootDir, "registry.json")
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"))

const newRegistryEntry = {
  name: filename,
  type: "registry:ui",
  title: title,
  description: `A tasteful and carefully crafted ${title.toLowerCase()} component.`,
  dependencies: [],
  files: [
    {
      path: `registry/ui/${filename}.tsx`,
      type: "registry:ui",
      target: `components/satisium-ui/${filename}.tsx`
    }
  ]
}

registry.items.push(newRegistryEntry)
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n", "utf8")
console.log(`✅ Appended registry entry for "${filename}" with target property`)

// 4. Create directories if they don't exist
const targetDir = path.dirname(fullPath)
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

// 5. Write the file
if (fs.existsSync(fullPath)) {
  console.error(`⚠️  Warning: File already exists at ${fullPath}`)
  process.exit(1)
}

fs.writeFileSync(fullPath, mdxTemplate, "utf8")

console.log(`✅ Success! Created new documentation file:`)
console.log(`📄 ${fullPath}`)
console.log(`\nHappy coding! 🎨`)
