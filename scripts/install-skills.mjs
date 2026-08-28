#!/usr/bin/env node

/**
 * Install the Satisium UI Agent Skills from a checked-out Satisium UI source tree.
 *
 * This deliberately ships as a source-first installer until a released package or
 * plugin distribution exists. Default behavior never overwrites a destination.
 */
import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, "..")
const sourceRoot = path.join(repositoryRoot, ".agents", "skills")

const agentDirectories = {
  project: ".agents/skills",
  codex: ".agents/skills",
  antigravity: ".agents/skills",
  cursor: ".cursor/skills",
  copilot: ".github/skills",
  claude: ".claude/skills",
}

function usage(exitCode = 0) {
  const message = `
Install Satisium UI Agent Skills from this source checkout.

Usage:
  node scripts/install-skills.mjs --target <project-directory> [options]

Options:
  --target <directory>  Target project. Defaults to the current working directory.
  --agent <name>        project (default), codex, antigravity, cursor, copilot, or claude.
  --dry-run             Print destination paths without writing files.
  --status              Print JSON describing the destination and installed skills.
  --force               Replace only existing Satisium skills at the selected destination.
  --help                Show this help text.

Modes:
  project      Install into .agents/skills (Codex, Cursor, Copilot, and Antigravity compatible).
  claude       Install into .claude/skills for Claude Code.
  cursor       Install into .cursor/skills for Cursor-native organization.
  copilot      Install into .github/skills for GitHub Copilot-native organization.
  codex        Alias for the project-level .agents/skills path.
  antigravity  Alias for the project-level .agents/skills path.

Safety:
  The installer copies five satisium-* skill folders plus _shared. It never removes
  or overwrites an existing destination unless --force is passed.
`
  console.log(message.trim())
  process.exit(exitCode)
}

function fail(message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}

function parseArgs(argv) {
  const parsed = {
    agent: "project",
    dryRun: false,
    force: false,
    status: false,
    target: process.cwd(),
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (argument === "--help" || argument === "-h") usage()
    if (argument === "--dry-run") {
      parsed.dryRun = true
      continue
    }
    if (argument === "--force") {
      parsed.force = true
      continue
    }
    if (argument === "--status") {
      parsed.status = true
      continue
    }
    if (argument === "--target" || argument === "--agent") {
      const value = argv[index + 1]
      if (!value || value.startsWith("--")) {
        fail(`${argument} requires a value.`)
      }
      parsed[argument.slice(2)] = value
      index += 1
      continue
    }

    fail(`Unknown argument: ${argument}`)
  }

  if (!agentDirectories[parsed.agent]) {
    fail(
      `Unsupported agent "${parsed.agent}". Use --help to see supported values.`
    )
  }

  return parsed
}

function skillNames() {
  if (!fs.existsSync(sourceRoot)) {
    fail(`Source directory not found: ${sourceRoot}`)
  }

  return fs
    .readdirSync(sourceRoot, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        (entry.name === "_shared" || entry.name.startsWith("satisium-"))
    )
    .map((entry) => entry.name)
    .sort()
}

function destinationFor(target, agent) {
  return path.resolve(target, agentDirectories[agent])
}

function isSamePath(first, second) {
  return path.resolve(first) === path.resolve(second)
}

function status(target, agent, entries) {
  const destination = destinationFor(target, agent)
  const installed = entries.filter((entry) =>
    fs.existsSync(path.join(destination, entry))
  )

  console.log(
    JSON.stringify(
      {
        agent,
        destination,
        source: sourceRoot,
        installed,
        missing: entries.filter((entry) => !installed.includes(entry)),
      },
      null,
      2
    )
  )
}

function install(target, agent, entries, { dryRun, force }) {
  const destination = destinationFor(target, agent)

  if (isSamePath(destination, sourceRoot)) {
    fail(
      "Target resolves to this repository's canonical source. Use --status here, or pass --target for the project receiving the skills."
    )
  }

  const collisions = entries.filter((entry) =>
    fs.existsSync(path.join(destination, entry))
  )

  if (collisions.length > 0 && !force) {
    fail(
      `Refusing to overwrite existing Satisium artifacts in ${destination}: ${collisions.join(
        ", "
      )}. Re-run with --force only after reviewing them.`
    )
  }

  const operations = entries.map((entry) => ({
    source: path.join(sourceRoot, entry),
    destination: path.join(destination, entry),
    action: fs.existsSync(path.join(destination, entry)) ? "replace" : "copy",
  }))

  if (dryRun) {
    console.log(
      JSON.stringify({ agent, destination, dryRun: true, operations }, null, 2)
    )
    return
  }

  fs.mkdirSync(destination, { recursive: true })
  for (const operation of operations) {
    if (operation.action === "replace") {
      fs.rmSync(operation.destination, { recursive: true, force: true })
    }
    fs.cpSync(operation.source, operation.destination, { recursive: true })
  }

  console.log(
    `Installed ${entries.length - 1} Satisium skills and shared contracts into ${destination} for ${agent}.`
  )
}

const options = parseArgs(process.argv.slice(2))
const entries = skillNames()

if (options.status) {
  status(options.target, options.agent, entries)
} else {
  install(options.target, options.agent, entries, options)
}
