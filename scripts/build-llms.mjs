import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")

const PUBLIC_LLMS_DIR = path.join(ROOT, "public/llms")
const CONTENT_DOCS_DIR = path.join(ROOT, "content/docs")
const OUTPUT_FULL = path.join(ROOT, "public/llms-full.txt")
const OUTPUT_INDEX = path.join(ROOT, "public/llms.txt")

const SITE_URL = "https://ui.satisium.com"

const CATEGORY_ORDER = ["carousels", "image-effects", "text-reveals", "mouse-trails"]
const CATEGORY_LABELS = {
  carousels: "Carousels",
  "image-effects": "Image Effects",
  "text-reveals": "Text Reveals",
  "mouse-trails": "Mouse Trails",
}

function getAllFiles(dirPath, ext, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles
  const files = fs.readdirSync(dirPath)
  for (const file of files) {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, ext, arrayOfFiles)
    } else if (file.endsWith(ext)) {
      arrayOfFiles.push(fullPath)
    }
  }
  return arrayOfFiles
}

function parseFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8")
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const yaml = match[1]
  const data = {}
  const lines = yaml.split("\n")
  let currentKey = null
  for (const line of lines) {
    const m = line.match(/^([\w-]+):\s*(.*)$/)
    const isItem = /^(\s*)-\s+(.*)$/.test(line)
    if (m) {
      const key = m[1]
      let val = m[2].trim()
      if (val === "") {
        // Could be a block-style array (value on following "- " lines)
        currentKey = key
        data[key] = []
      } else if (val.startsWith("[") && val.endsWith("]")) {
        data[key] = val
          .slice(1, -1)
          .split(",")
          .map((v) => v.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean)
        currentKey = null
      } else {
        data[key] = val.replace(/^["']|["']$/g, "")
        currentKey = null
      }
    } else if (isItem && currentKey && Array.isArray(data[currentKey])) {
      const item = line
        .trim()
        .replace(/^-\s+/, "")
        .trim()
        .replace(/^["']|["']$/g, "")
      data[currentKey].push(item)
    }
  }
  return data
}

// slug -> { title, description, category, badge } from the MDX source of truth
function loadComponentMeta() {
  const meta = {}
  const mdxFiles = getAllFiles(
    path.join(CONTENT_DOCS_DIR, "components"),
    ".mdx"
  )
  for (const file of mdxFiles) {
    const slug = path.basename(file, ".mdx")
    if (slug === "index") continue
    const fm = parseFrontmatter(file)
    meta[slug] = {
      title: fm.title || slug.replace(/-/g, " "),
      description: fm.description || "",
      category: Array.isArray(fm.category) ? fm.category[0] : fm.category,
      badge: fm.badge,
    }
  }
  return meta
}

function parseMdMeta(fullPath) {
  const raw = fs.readFileSync(fullPath, "utf-8")
  const contextMatch = raw.match(/^# (.+?) Component Context/m)
  const titleMatch = raw.match(/^# (.+)$/m)
  const title = contextMatch
    ? contextMatch[1]
    : titleMatch
      ? titleMatch[1].replace(/\s*\(.*\)\s*$/, "").trim()
      : null
  const descLine = raw.match(/\*\*Description:\*\*\s*(.+)/)
  const description = descLine ? cleanName(descLine[1].trim()) : null
  return { title, description, raw }
}

function cleanName(name) {
  return name.replace(/^Satis\s+UI\b/, "Satisium UI")
}

function buildFull() {
  const files = getAllFiles(PUBLIC_LLMS_DIR, ".md")

  let fullContent = `# Satisium UI - Complete AI Knowledge Base\n\n`
  fullContent += `> Free, open-source animated React component library for Design Engineers.\n`
  fullContent += `> Built with Next.js, Tailwind CSS v4, Framer Motion, and GSAP.\n\n`

  fullContent += `## How to install components\n\n`
  fullContent += `Add any component to a Shadcn-compatible project:\n\n`
  fullContent += `\`\`\`bash\nnpx shadcn@latest add ${SITE_URL}/r/<component-name>.json\n\`\`\`\n\n`

  fullContent += `## System instructions (CRITICAL)\n\n`
  fullContent += `- Always use \`motion/react\` (Framer Motion v12+) for animations.\n`
  fullContent += `- Use Tailwind CSS v4 utility classes.\n`
  fullContent += `- Use \`@hugeicons/react\` for iconography.\n`
  fullContent += `- Components must use the \`"use client"\` directive where client-side hooks are required.\n`
  fullContent += `- All components are SSR-safe and include \`prefers-reduced-motion\` fallbacks.\n\n`

  fullContent += `---\n\n`

  for (const file of files) {
    const { raw } = parseMdMeta(file)
    fullContent += `${cleanName(raw)}\n\n---\n\n`
  }

  fs.writeFileSync(OUTPUT_FULL, fullContent)
  console.log(`✅ Concatenated ${files.length} AI docs into llms-full.txt`)
}

function buildIndex() {
  const componentMeta = loadComponentMeta()
  const componentFiles = getAllFiles(
    path.join(PUBLIC_LLMS_DIR, "components"),
    ".md"
  )
  const blockFiles = getAllFiles(path.join(PUBLIC_LLMS_DIR, "blocks"), ".md")

  // Group components by category
  const byCategory = {}
  CATEGORY_ORDER.forEach((c) => (byCategory[c] = []))
  const uncategorized = []

  for (const file of componentFiles) {
    const slug = path.basename(file, ".md")
    const { title, description } = parseMdMeta(file)
    const meta = componentMeta[slug]
    const cat = (meta && meta.category) || "uncategorized"
    const name = title || meta?.title || slug.replace(/-/g, " ")
    const desc =
      description ||
      (meta && meta.description) ||
      "Free animated component for Satisium UI."
    const entry = { slug, name, desc, badge: meta?.badge }
    if (cat === "uncategorized" || !CATEGORY_ORDER.includes(cat)) {
      uncategorized.push(entry)
    } else {
      byCategory[cat].push(entry)
    }
  }

  let out = `# Satisium UI — AI Agent Knowledge Base\n\n`
  out += `> Free, open-source animated React component library for Design Engineers.\n`
  out += `> Built with Next.js, Tailwind CSS v4, Framer Motion, and GSAP.\n\n`

  out += `## How to install components\n\n`
  out += `Add any component to a Shadcn-compatible project:\n\n`
  out += `\`\`\`bash\nnpx shadcn@latest add ${SITE_URL}/r/<component-name>.json\n\`\`\`\n\n`

  out += `## System instructions (CRITICAL)\n\n`
  out += `- Always use \`motion/react\` (Framer Motion v12+) for animations.\n`
  out += `- Use Tailwind CSS v4 utility classes.\n`
  out += `- Use \`@hugeicons/react\` for iconography.\n`
  out += `- Components must use the \`"use client"\` directive where client-side hooks are required.\n`
  out += `- All components are SSR-safe and include \`prefers-reduced-motion\` fallbacks.\n\n`

  out += `## Free Components\n\n`
  for (const cat of CATEGORY_ORDER) {
    const items = byCategory[cat]
    if (!items.length) continue
    out += `### ${CATEGORY_LABELS[cat]}\n\n`
    for (const item of items) {
      out += `- [${item.name}](/llms/components/${item.slug}.md)${item.badge ? ` [${item.badge}]` : ''} — ${item.desc}\n`
    }
    out += `\n`
  }

  if (uncategorized.length) {
    out += `### Other\n\n`
    for (const item of uncategorized) {
      out += `- [${item.name}](/llms/components/${item.slug}.md) — ${item.desc}\n`
    }
    out += `\n`
  }

  // Blocks
  if (blockFiles.length > 0) {
    out += `## Blocks\n\n`
    for (const file of blockFiles) {
      const slug = path.basename(file, ".md")
      const { title, description } = parseMdMeta(file)
      const name = title || slug.replace(/-/g, " ")
      const desc = description || "Free block layout for Satisium UI."
      out += `- [${name}](/llms/blocks/${slug}.md) — ${desc}\n`
    }
    out += `\n`
  }

  // Templates
  const templateFiles = getAllFiles(path.join(PUBLIC_LLMS_DIR, "templates"), ".md")
  out += `## Templates\n\n`
  if (templateFiles.length === 0) {
    out += `Templates are coming soon. They will be listed here once available.\n\n`
  } else {
    for (const file of templateFiles) {
      const slug = path.basename(file, ".md")
      const { title, description } = parseMdMeta(file)
      const name = title || slug.replace(/-/g, " ")
      const desc = description || "Free template for Satisium UI."
      out += `- [${name}](/llms/templates/${slug}.md) — ${desc}\n`
    }
    out += `\n`
  }

  out += `## Full reference\n\n`
  out += `For complete source code, props tables, and example implementations for every component, see the concatenated knowledge base:\n\n`
  out += `- [Satisium UI — Complete AI Knowledge Base (llms-full.txt)](/llms-full.txt)\n`

  fs.writeFileSync(OUTPUT_INDEX, out)
  console.log(`✅ Generated llms.txt index (${componentFiles.length} components, ${blockFiles.length} blocks)`)
}

buildFull()
buildIndex()
