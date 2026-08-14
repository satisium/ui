# Satisium UI

A high-end animated component library for React and Next.js. Built with Tailwind CSS v4, GSAP, Motion, Three.js, and Radix UI. Components are distributed via the shadcn CLI — install exactly what you need with zero runtime lock-in.

Current status: Beta (`3.0.0-beta.61`). APIs may change before stable release.

## Install a component

```bash
npx shadcn@latest add https://ui.satisium.com/r/<component-name>.json
```

The CLI copies the component source into your project, auto-installs missing dependencies, and leaves you in full control of the code.

Browse and preview all components at [ui.satisium.com](https://ui.satisium.com).

## Quick start

```bash
git clone https://github.com/satisium/ui.git
cd ui
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the docs site.

## Tech stack

- Next.js 16 with App Router
- React 19
- Tailwind CSS v4
- GSAP and @gsap/react
- Motion
- Three.js and React Three Fiber
- Radix UI
- shadcn/ui
- Fumadocs
- Changesets
- pnpm

## Prerequisites

To use Satisium UI components in your project:

- Node.js 20 or higher
- Next.js 16 or later with App Router
- Tailwind CSS v4 configured
- shadcn/ui initialized (`npx shadcn@latest init`)

## Contributing

Contributions are welcome. Before opening a PR, please read the following:

- [CONTRIBUTING.md](./CONTRIBUTING.md) — setup instructions, the component pipeline, and PR checklist
- [GITHUB_STRATEGY.md](./GITHUB_STRATEGY.md) — branching model, releases, CI/CD, and open-source workflow

### Contributor setup

```bash
git clone https://github.com/satisium/ui.git
cd ui
pnpm install
pnpm dev
```

## License

MIT — see [LICENSE](./LICENSE) for details.
