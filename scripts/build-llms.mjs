import fs from "fs"
import path from "path"

const PUBLIC_LLMS_DIR = path.join(process.cwd(), "public/llms")
const OUTPUT_FILE = path.join(process.cwd(), "public/llms-full.txt")

function getAllMarkdownFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles
  const files = fs.readdirSync(dirPath)
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file)
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllMarkdownFiles(fullPath, arrayOfFiles)
    } else if (file.endsWith(".md")) {
      arrayOfFiles.push(fullPath)
    }
  })
  return arrayOfFiles
}

function buildFull() {
  let fullContent = `# Satisium UI - Complete AI Knowledge Base\n\n`
  const files = getAllMarkdownFiles(PUBLIC_LLMS_DIR)

  for (const file of files) {
    fullContent += `${fs.readFileSync(file, "utf-8")}\n\n---\n\n`
  }

  fs.writeFileSync(OUTPUT_FILE, fullContent)
  console.log(`✅ Concatenated ${files.length} AI docs into llms-full.txt`)
}

buildFull()
