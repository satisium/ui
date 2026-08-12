# Satisium UI — GitHub Strategy

> **Production URL:** [https://ui.satisium.com](https://ui.satisium.com)  
> **Dev URL:** [http://localhost:3000](http://localhost:3000)  
> **Repository:** [https://github.com/satisium/ui.git](https://github.com/satisium/ui.git)  
> **Audience:** Core maintainers + open-source contributors  
> **Status:** Living document — update as the project evolves  
> **Scope:** Commits, branches, PRs, issues, releases, CI/CD, security, and community health for the open-source launch of Satisium UI.

---

## 1. Project Snapshot & Open-Source Readiness

### 1.1 What Satisium UI is

Satisium UI is a **high-end animated component library** built on:

- **Next.js 16** (App Router, RSC-aware)
- **Tailwind CSS v4** (CSS-first configuration)
- **Radix UI** (unstyled, accessible primitives)
- **GSAP + Framer Motion** (animation engines)
- **Three.js / React Three Fiber** (WebGL components)
- **shadcn/ui registry architecture** (CLI-based component distribution)
- **Fumadocs** (MDX-powered documentation)
- **Changesets** (semantic versioning & changelog automation)
- **pnpm** (package manager)

### 1.2 Open-source blockers (must fix before launch)

| Item                     | Current State       | Action Required                      |
| ------------------------ | ------------------- | ------------------------------------ |
| `package.json` `private` | `"private": true`   | Set to `false`                       |
| License file             | Missing             | Add `LICENSE` (MIT or similar)       |
| Security policy          | Missing             | Add `SECURITY.md`                    |
| Code of Conduct          | Missing             | Add `CODE_OF_CONDUCT.md`             |
| CI/CD pipelines          | None                | Add GitHub Actions                   |
| Branch protection        | Unknown             | Enable on `main`                     |
| Dependabot               | Not configured      | Add `.github/dependabot.yml`         |
| `.env.local`             | Present & committed | Remove from git, add to `.gitignore` |
| `pnpm-lock.yaml`         | Tracked             | Keep tracked (correct for pnpm)      |

---

## 2. Repository Structure (for contributors)

```text
ui/
├── .changeset/              # Changeset files & config
├── .github/
│   ├── ISSUE_TEMPLATE/      # Bug report, feature request
│   ├── PULL_REQUEST_TEMPLATE/
│   │   ├── bug-fix.md
│   │   ├── component-addition.md
│   │   ├── core-infrastructure.md
│   │   └── docs-and-llm.md
│   ├── CODE_OF_CONDUCT.md
│   ├── SECURITY.md
│   ├── dependabot.yml
│   └── workflows/
│       ├── ci.yml           # Lint, typecheck, build
│       └── release.yml      # Changeset version & publish
├── app/                     # Next.js App Router
├── components/              # Site components (previewer, layout, UI primitives)
├── content/docs/            # Fumadocs MDX content
├── public/
│   ├── llms/                # Pure markdown context for AI copy feature
│   └── r/                   # Built shadcn registry JSON (generated)
├── registry/                # ← THE CORE
│   ├── ui/                  # Component source files
│   ├── demos/               # Demo implementations
│   ├── strings/             # Code-string exports for docs copy-paste
│   └── index.ts             # Registry index (maps keys → dynamic imports)
├── CONTRIBUTING.md
├── GITHUB_STRATEGY.md
├── package.json
├── tsconfig.json
└── pnpm-lock.yaml
```

---

## 3. How a Component Becomes Accessible to Users

Adding a component is **not** a single-file change. It touches 7+ locations. Every contributor must complete the **7-Step Component Pipeline** before opening a Pull Request.

### 3.1 The 7-Step Component Pipeline

```text
Step 1: Write source     → registry/ui/<slug>.tsx
Step 2: Write demo(s)    → registry/demos/<slug>-demo.tsx
Step 3: Export strings   → registry/strings/<slug>.ts
Step 4: Register         → registry.json + registry/index.ts
Step 5: Document (Human) → content/docs/<category>/<slug>.mdx
Step 6: Document (AI)    → public/llms/<category>/<slug>.md
Step 7: Build & Changeset→ pnpm registry:public && pnpm changeset
```

### 3.2 Step-by-step walkthrough

#### Step 1 — Component source (`registry/ui/`)

- Must be `"use client"` if it uses hooks, event handlers, or browser APIs.
- Must use **forwardRef** for DOM-forwarding components.
- **CRITICAL:** Do NOT add hardcoded padding (e.g., `p-8`, `md:p-12`) inside the component wrapper. The Satisium UI previewer dynamically adds padding based on whether the registry layout is `fullscreen` or `centered`.
- Must include **ARIA attributes** (`role`, `aria-checked`, `aria-label`, etc.).
- Dependencies: only `clsx`, `tailwind-merge`, and animation libs already in `package.json`.

```tsx
// registry/ui/my-component.tsx
"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(...)
MyComponent.displayName = "MyComponent"
```

#### Step 2 — Demo(s) (`registry/demos/`)

- Each demo must be a **named export** matching the registry key.
- Demos import from `@/registry/ui/<slug>` — never from `@/components/ui/`.

```tsx
// registry/demos/my-component-demo.tsx
"use client"
import { MyComponent } from "@/registry/ui/my-component"

export function MyComponentDemo() {
  return <MyComponent />
}
```

#### Step 3 — Code strings (`registry/strings/`)

- Raw source code as template literals, exported for the "Copy Code" feature.

```ts
// registry/strings/my-component.ts
export const myComponentString = `...raw source code...`
export const myComponentDemoString = `...demo source code...`
export const myComponentFile = {
  "my-component.tsx": { code: myComponentString, language: "tsx" },
  "my-component-demo.tsx": { code: myComponentDemoString, language: "tsx" },
}
```

#### Step 4 — Registry entries (`registry.json` + `registry/index.ts`)

**`registry.json`** (the shadcn manifest for CLI installation):

```json
{
  "name": "my-component",
  "type": "registry:ui",
  "dependencies": ["motion", "clsx", "tailwind-merge"],
  "files": [
    { "path": "registry/ui/my-component.tsx", "type": "registry:component" }
  ]
}
```

**`registry/index.ts`** (the runtime registry used by the docs previewer):

```ts
"my-component-demo": {
  name: "My Component Demo",
  type: "react",
  renderMode: "direct",   // use "iframe" for responsive/isolated padding
  component: dynamic(() => import("@/registry/demos/my-component-demo").then(m => m.MyComponentDemo)),
  installCommand: "npx satisium-ui add my-component",
  getFiles: async () => { ... }
},
```

#### Step 5 — Human Documentation (`content/docs/<category>/<slug>.mdx`)

Frontmatter is validated by `source.config.ts`. Embed your component using `<ComponentPreviewer />`.

```mdx
---
title: My Component
description: A tasteful and carefully crafted component.
badge: new
category:
  - text
registryKeys:
  - my-component-demo
---

<div className="mt-6">
  <CommandBlock cli="my-component" title="my-component" />
</div>
```

#### Step 6 — LLM Context Markdown (`public/llms/`)

Satisium UI features a "Copy for AI" button that feeds pure, un-styled markdown directly to LLMs. You **must** create a `.md` file that matches the path of your `.mdx` docs page.

_If your docs are at `content/docs/text/my-component.mdx`, create `public/llms/text/my-component.md`._

```markdown
# My Component

An animated component using Framer Motion.

## Installation

\`\`\`bash
npx shadcn@latest add https://ui.satisium.com/r/my-component.json
\`\`\`

## Source Code

\`\`\`tsx
// Paste the raw component code here so the AI can read it perfectly
\`\`\`
```

#### Step 7 — Build, Changeset, and Verify

Once all files are created, prepare the code for your Pull Request.

**1. Generate the Registry**

```bash
pnpm registry:public
```

_This parses `registry.json` and builds the static files inside `public/r/` so the CLI can install them._

**2. Create a Changeset**
Record your addition so it appears in the next release changelog.

```bash
pnpm changeset
```

_- Select `minor` for new components, `patch` for bug fixes._
_- Write a conventional commit message._

**3. Build and Verify**

```bash
pnpm build
```

Verify locally:

- Does the component render at `localhost:3000/docs/<category>/<slug>`?
- Does the "Copy for AI" button output clean text from your `public/llms/` file?
- Are there hydration errors in the console?

---

## 4. Commit Convention

We use **[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)**.

```text
<type>(<scope>): <description>
```

### Types

| Type       | Use For                                                 | Changelog  |
| ---------- | ------------------------------------------------------- | ---------- |
| `feat`     | New component, demo, or feature                         | Minor bump |
| `fix`      | Bug fix in existing component/tooling                   | Patch bump |
| `docs`     | Documentation-only changes                              | Patch bump |
| `refactor` | Code change that neither fixes a bug nor adds a feature | Patch bump |
| `perf`     | Performance improvement                                 | Patch bump |
| `chore`    | Tooling, deps, CI, config                               | Patch bump |

### Scopes

| Scope        | Examples                           |
| ------------ | ---------------------------------- |
| `components` | New component PRs                  |
| `registry`   | Registry JSON, index, strings      |
| `docs`       | MDX documentation and AI md files  |
| `demos`      | Demo files                         |
| `core`       | Next.js config, layout, site infra |

### Examples

```text
feat(components): add liquid marble WebGL component
fix(registry): resolve padding issue in iframe wrapper, closes #12
docs(components): add prop table for ascent-carousel
chore(deps): upgrade motion to v12.38.0
```

### Breaking changes

Append `!` after the type/scope and add a `BREAKING CHANGE:` footer:

```
feat(components)!: change Button to use variant prop

BREAKING CHANGE: primary is renamed to default.
```

---

## 5. Branching & PR Strategy

### 5.1 Branch naming

```text
<type>/<short-description>
```

Examples: `feat/add-magnetic-snap`, `fix/registry-build-error`

### 5.2 Protected branches

| `main` | **Fully protected** — no direct pushes, PRs only, required CI |
| `beta` | Semi-protected — PRs only, required CI |
| `canary` | Semi-protected — PRs only, required CI |

### 5.3 PR lifecycle (For Contributors)

1. Fork → clone → create branch from `main`.
2. Complete the **7-Step Component Pipeline** (Code, Demos, Docs, LLMs).
3. Run `pnpm registry:public` to generate shadcn manifests.
4. Run `pnpm changeset` to document your change for the release notes.
5. Run `pnpm lint && pnpm typecheck && pnpm build` locally.
6. Push to your fork and Open a PR against `satisium/ui main`.
7. CI runs automatically (lint → typecheck → build).
8. Maintainer reviews, requests changes, or approves.
9. Squash-merge to `main`.
10. Maintainer runs the final release cycle to publish the changes.

### 5.4 PR templates

We have 4 PR templates. Contributors **must** use the one that matches their work:

| Template | When to Use |
|----------|------------|
| `component-addition.md` | New UI component + demo + docs |
| `bug-fix.md` | Fixing an existing component or site bug |
| `core-infrastructure.md` | Next.js, Tailwind, registry engine, CI |
| `docs-and-llm.md` | Documentation, MDX, LLM context updates |

---

## 6. Issue Management

### 6.1 Issue templates

We use `.yml` issue forms to mandate structured bug reports and feature requests.

| Template              | Labels Applied                 | When to Use                                |
| --------------------- | ------------------------------ | ------------------------------------------ |
| `bug-report.yml`      | `bug`                          | Component rendering issues, animation bugs |
| `feature-request.yml` | `type: feature`, `enhancement` | New components, animations                 |

Additional labels (`scope:`, `status:`, `area:`, `good first issue`, `help wanted`) are applied during triage or review, not by the template itself.

### 6.2 Custom Label taxonomy

We keep GitHub's default labels and mix them with specific Conventional labels.

```text
type: feature       # HEX: #0E8A16
type: docs          # HEX: #1D76DB
type: chore         # HEX: #502A19
type: refactor      # code cleanup

scope: components   # HEX: #006B75
scope: core         # HEX: #343A40
scope: website      # HEX: #FBCA04

status: needs repro # HEX: #D93F0B
status: in-progress # HEX: #F9D0C4

good first issue    # Beginner-friendly
help wanted         # Needs community input
```

### 6.3 Triage process

1. **Bug reports** without reproduction links get labeled `status: needs repro` and a comment asking for a CodeSandbox.
2. **Support Questions** ("How do I use this animation?") are converted directly into GitHub Discussions to keep the Issue tracker clean.

---

## 7. CI/CD Pipelines

### 7.1 `ci.yml` — continuous integration

Runs on every PR and push to `main`, `beta`, `canary`.

- `paths-ignore` skips CI for docs-only changes (`.md`, `.mdx`, `docs/`).
- `concurrency` cancels in-progress runs when a new push arrives.

```yaml
name: CI
on:
  pull_request:
    branches: [main, beta, canary]
    paths-ignore:
      - "**.md"
      - "**.mdx"
      - "docs/**"
  push:
    branches: [main, beta, canary]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: Verify registry output exists
        run: test -d public/r && echo "Registry built successfully" || (echo "Registry missing!" && exit 1)
      - name: Verify LLM output exists
        run: test -f public/llms-full.txt && echo "LLM docs built" || (echo "LLM docs missing!" && exit 1)
```

### 7.2 `release.yml` — automated releases (main branch only)

```yaml
name: Release
on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - name: Version packages with Changesets
        run: pnpm changeset version
      - name: Build (verify)
        run: pnpm build
      - name: Commit version bump
        run: |
          git config user.name "changeset-bot"
          git config user.email "changeset@satisium.com"
          git add .
          git diff --cached --quiet || git commit -m "chore(release): version packages"
          git push
```

> **Note:** Actual npm publish is deferred until the project is ready for public package distribution. Until then, changesets only manage `CHANGELOG.md` and version bumps.

---

## 8. Release Management

There is a strict separation between what a **Contributor** does and what a **Maintainer** does regarding releases.

### 8.1 The Contributor's Role

Before submitting a PR, a contributor runs:

```bash
pnpm changeset
```

This generates a markdown file in `.changeset/` describing what was built. **The contributor commits this file.**

### 8.2 Pre-release channels

| Channel | Branch | Version | Audience |
|---------|--------|---------|----------|
| Stable | `main` | `3.x.x` | Production users |
| Beta | `beta` | `3.x.x-beta.x` | Early adopters |
| Canary | `canary` | `3.x.x-canary.x` | Contributors testing WIP |

Enter/exit beta mode:

```bash
pnpm beta:enter   # next changeset becomes a beta prerelease
pnpm beta:exit    # returns to normal versioning
```

### 8.3 The Maintainer's Role

When the maintainer is ready to push a new version of the library to production, they run this locally on the `main` branch:

```bash
pnpm changeset version    # Consumes changesets, bumps versions, updates CHANGELOG.md
pnpm build                # Verify build still passes
git add .
git commit -m "chore(release): version packages"
git push
```

---

## 9. Security

### 9.1 `SECURITY.md` (To be created)

```markdown
## Security Policy

If you discover a security vulnerability, please email security@satisium.com instead of opening a public issue. We will acknowledge within 48 hours and provide a detailed response within 7 days.
```

### 9.2 Automated security

- **Dependabot** enabled for npm and GitHub Actions.
- No secrets in repo (`.env.local` is gitignored).

---

## 10. Accessibility (A11y) Standards

All components must pass these checks before merge:

| Check                | Requirement                                            |
| -------------------- | ------------------------------------------------------ |
| **Semantic HTML**    | Use native elements (`<button>`, `<nav>`) over `<div>` |
| **ARIA roles**       | `role="switch"`, `role="tab"`, `aria-checked`, etc.    |
| **Keyboard nav**     | Interactive elements must be accessible via Tab/Enter  |
| **Focus management** | `focus-visible` rings, focus trapping in modals        |
| **Reduced motion**   | Respect `prefers-reduced-motion`                       |

---

## 11. Open-Source Community

### 11.1 PR review SLA

| PR Size       | Target Review Time |
| ------------- | ------------------ |
| Docs-only     | 2 business days    |
| Bug fix       | 3 business days    |
| New component | 5 business days    |

### 11.2 Communication channels

- **GitHub Issues** — strictly for bug reports, component requests.
- **GitHub Discussions** — Q&A, show-and-tell, help using components.

---

## 12. Package Distribution

### 12.1 Current: shadcn CLI registry

Satisium UI is currently distributed purely through the shadcn CLI. There is no npm package yet.

Users install components directly from the production registry:

```bash
npx shadcn@latest add https://ui.satisium.com/r/<component-name>.json
```

This is why **Step 7** (`pnpm registry:public`) in the Component Pipeline is non-negotiable. Without it, the component is not available for users to install.

### 12.2 Future: npm package

An npm package (`@satisium-ui/react` or similar) may be introduced in a future major version to enable:

```bash
npm install @satisium-ui/react
```

This requires decoupling the registry from the docs site, publishing to npm, and maintaining semver guarantees at the package level. No timeline is set for this transition.

---

## 13. Checklist: Pre-Open-Source Launch

```text
[x] Set package.json "private" to false
[ ] Add LICENSE file (MIT)
[x] Add SECURITY.md
[x] Add CODE_OF_CONDUCT.md
[x] Verify .env.local is not in git history
[x] Create .github/workflows/ci.yml
[ ] Enable branch protection on main
[x] Enable Dependabot (.github/dependabot.yml)
[x] Update README.md with production URL
[ ] Verify all public/llms/ files are created and populated
```

---

## 14. Maintenance Cadence

| Activity                                 | Frequency                           |
| ---------------------------------------- | ----------------------------------- |
| Triage new issues                        | Daily                               |
| Review PRs                               | Every 48 hours                      |
| Maintainer Release (`changeset version`) | Weekly (or per batch of components) |
| Dependency updates (Dependabot)          | Auto, reviewed weekly               |

---

## 15. Document Ownership

| Document             | Owner           | Review Cycle          |
| -------------------- | --------------- | --------------------- |
| `CONTRIBUTING.md`    | Core maintainer | Per release           |
| `GITHUB_STRATEGY.md` | Core maintainer | Quarterly             |
| `SECURITY.md`        | Core maintainer | Per security incident |
| PR templates         | Core maintainer | Per release           |
