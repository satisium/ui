# Satisium UI Agent Skills

Satisium UI Agent Skills provide task-scoped guidance for working with this repository and its shadcn-distributed animated components. They complement, rather than replace, the existing human documentation in `CONTRIBUTING.md`, component MDX files, and `public/llms/` reference artifacts. Each skill is designed around one contributor or consumer job so that agents load only the relevant workflow.

## Canonical location and portability

The canonical skills live in `.agents/skills/`, the shared workspace location documented by Codex, Cursor, GitHub Copilot and Google Antigravity. Claude Code and Copilot also support compatible skill directories; teams that prefer their native locations can copy or symlink the same skill directories without changing `SKILL.md`. The skill bodies use only Agent Skills standard frontmatter so a host-specific loader is not required. [1] [2] [3] [4] [5]

> The repository is the source of truth. A skill must inspect the relevant local source, manifest, MDX, generated metadata and package scripts instead of trusting an example that can drift.

## Distribution and installation

After the repository's Skills bundle is published and discoverable through Skills CLI, the public installation path is:

```bash
npx skills add satisium/ui
```

This is the preferred path for consumers. The Skills CLI can list the bundle before installation, install one focused workflow, or install the entire published bundle without requiring Satisium UI to ship its own npm binary. [9]

```bash
# List published workflows
npx skills add satisium/ui --list

# Install one workflow
npx skills add satisium/ui --skill satisium-component-discovery

# Install the complete published bundle
npx skills add satisium/ui --all
```

### Local contributor source fallback

Before the bundle is discoverable through Skills CLI, or when validating an unmerged contribution, install from a checked-out Satisium UI source tree:

```bash
node /absolute/path/to/satisium-ui/scripts/install-skills.mjs --target /absolute/path/to/your-project --agent project
```

The installer copies the canonical `satisium-*` folders plus `_shared` into `.agents/skills/`. This project-wide mode is native for Codex and Antigravity and is discovered by Cursor and GitHub Copilot. [2] [3] [4] [5] Use a native adapter only when it is preferred by the project:

| Target agent       | `--agent` value | Destination under `--target` |
| ------------------ | --------------- | ---------------------------- |
| Claude Code        | `claude`        | `.claude/skills/`            |
| Codex              | `codex`         | `.agents/skills/`            |
| Cursor             | `cursor`        | `.cursor/skills/`            |
| GitHub Copilot     | `copilot`       | `.github/skills/`            |
| Google Antigravity | `antigravity`   | `.agents/skills/`            |

Use `--dry-run` to preview changes and `--status` to inspect the installed set. The installer is collision-safe: it stops if a target Satisium folder already exists and only replaces those Satisium folders when `--force` is explicit. It never publishes, pushes, or writes outside the chosen project target. Claude Code project skills live in `.claude/skills/`; no native adapter is required for a host that already discovers `.agents/skills/`. [8]

| Skill                            | Responsibility                                                                                  | Use when                                                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `satisium-component-discovery`   | Locate, install and compose an existing Satisium registry item.                                 | A task asks to find, select, install, import, configure or combine a Satisium component.                                   |
| `satisium-component-authoring`   | Implement or modify a component source safely.                                                  | A task asks to add or change a Satisium component, GSAP/Motion behavior, WebGL effect or public props.                     |
| `satisium-registry-docs`         | Wire registry, demos, code strings, MDX and AI context.                                         | A task asks to add/update a variant, preview, shadcn registry item, component docs or Copy-for-AI artifact.                |
| `satisium-quality-review`        | Review animation, SSR, accessibility and performance risks.                                     | A task asks to audit or repair hydration, FOUC, reduced-motion, keyboard, focus, contrast, touch or WebGL fallback issues. |
| `satisium-contribution-validate` | Run structural audits and declared repository checks, then prepare non-destructive PR evidence. | A task asks to validate a contribution, prepare a changeset, review registry parity or assess PR readiness.                |

## Design rules

The first four skills are deliberately separated because the repository's component pipeline spans independent source, distribution, documentation and quality concerns. A discovery request should not load authoring details; a visual-quality review should not initiate registry generation. `satisium-contribution-validate` is the only skill that orchestrates the final evidence pass, and it must report baseline repository blockers rather than hide them.

The skills use progressive disclosure. Core decision trees and required outputs stay in `SKILL.md`; repo-specific contracts and detailed checklists sit in `references/`; deterministic structural checks are bundled under `scripts/`. Agents should read linked references only when the active task needs them. This follows the Agent Skills directory model and keeps the activation payload short. [1]

## Skills freshness check

`satisium-contribution-validate` includes a read-only freshness checker that treats the repository as the live catalog. It verifies source components against their code strings, manifest base items, MDX docs, LLM context and generated registry output; it also verifies MDX `registryKeys` against the manifest, preview runtime and generated metadata. A new component following the existing contract therefore becomes available to the skills without hard-coding a component list into `SKILL.md`.

The repository includes `.github/workflows/skills-freshness.yml`, triggered on relevant pull-request paths and by manual dispatch. It has only `contents: read`, does not use secrets, does not push/create pull requests, and deliberately does not use `pull_request_target`. Changes to taxonomy or pipeline anchors produce a review hint rather than an automated rewrite of skills. A maintainer may later choose to add a separate scheduled draft-PR workflow, but that is intentionally outside this contributor bundle. [6] [7]

## Non-goals and safety boundary

The skills do not push branches, create releases, publish registry artifacts, alter maintainer configuration, or bypass failed CI checks. They can prepare a changeset and a PR-ready summary, but the contributor remains in control of commits, forks, pushes and PR submission. They do not make unverified claims about generated files or visual behavior; any claim must be tied to a local check, a preview, or a source file.

## Evaluation contract

Each skill must have a descriptive trigger, an explicit input-to-output workflow, and at least one negative guardrail. The contributed package must pass Agent Skills metadata validation, static audit of its own `SKILL.md` references, and targeted scenario prompts. The final repository validation report distinguishes package-structure results from existing repository-level failures such as toolchain or CI discrepancies.

## References

[1]: https://agentskills.io/specification "Agent Skills Specification"
[2]: https://learn.chatgpt.com/docs/build-skills "OpenAI — Build Skills"
[3]: https://cursor.com/docs/skills "Cursor — Agent Skills"
[4]: https://code.visualstudio.com/docs/agent-customization/agent-skills "VS Code — Use Agent Skills"
[5]: https://antigravity.google/docs/skills/ "Google Antigravity — Agent Skills"
[6]: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows "GitHub Docs — Events that trigger workflows"
[7]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository "GitHub Docs — Managing GitHub Actions settings"
[8]: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview "Claude — Agent Skills"
[9]: https://vercel.com/kb/guide/using-skills-sh "Vercel — Using skills.sh"
