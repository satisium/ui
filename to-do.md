# 🚀 Pre-Launch Checklist

> **Goal:** Ensure a flawless, buttery-smooth, and secure experience before pushing to production.

## 🎨 0. Important

- [x] **Landing page links and buttons:** Check all the links.
- [x] **Make the app desktop only:** Add a condition to make the app apart from landing page desktop only.
- [x] **ui.satisium.com:** VERY IMPORTANT.
- [ ] **Important index pages:** Index pages for `doc/components` etc .
- [x] **Proper categories:** Add proper categories to the components.
- [ ] **Demo videos:** Proper demo videos and hook them properly to the all place they are needed.
- [x] **Beta** Make the app beta.
- [x] **Delete some components:** Remove the suckers.
- [ ] **Proper documentation:** Write doc pages, intro and all of these.
- [ ] **Read me:** Proper read me file.
- [x] **The search:** Improve the search component by removing noise and adding some about shortcut info.
- [x] **Sidebar:** The side bar in docs needs proper badging etc.
- [ ] **Changelog:** Design proper changelog page.
- [ ] **CLI:** VERY IMPORTANT Make CLI work flawlessly. CLI has errors and inconsistent.
- [ ] **LLM Text:** Check LLM thingy.
- [x] **SEO and logo:** Update logos everywhere. SEO and all.
- [x] **Github satisium:** Github satis UI to satisium.
- [ ] **Analytics:** Analytics.
- [ ] **Og Images:** Og Images.

---

## 🔒 1. Security & Secrets (P0 — Launch Blockers)

- [ ] **Rotate exposed GitHub Personal Access Token:** A live `GIT_TOKEN` is present in `.env.local`. Rotate it immediately on GitHub and remove any trace from git history using `git filter-repo` or `BFG Repo-Cleaner` if it was ever committed. A leaked PAT grants repository access and must be treated as a critical incident.
- [ ] **Add security headers to `next.config.mjs`:** Implement `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`, and a restrictive `Content-Security-Policy`. Without these, the app is exposed to clickjacking, MIME-type sniffing, and code injection attacks.
- [ ] **Set `private: true` in `package.json`:** Prevent accidental public publication to npm. A component library in development should never be publishable by a stray `npm publish` command.
- [ ] **Add rate limiting and input validation to `/api/telemetry`:** The telemetry endpoint is unauthenticated and accepts arbitrary POST bodies. Add a lightweight rate limiter (e.g., `@upstash/ratelimit` or simple IP-based throttle) and validate `action` / `component` fields to prevent Redis spam and abuse.
- [ ] **Add rate limiting to `/api/search`:** The search API exposes the full page index without authentication or throttling. Implement rate limiting to prevent scraping and denial-of-service.

## 🛠️ 2. Code Quality & Stability (P0–P1)

- [ ] **Fix missing `React` import in `registry/index.ts`:** The file uses `React.ComponentType` on line 19 without importing the `React` namespace. This will fail at runtime or type-checking. Add `import React from "react"` at the top of the file.
- [ ] **Extract duplicate GitHub metadata fetch in `app/docs/[[...slug]]/page.tsx`:** `getGithubLastEdit` is called independently in both `generateMetadata` and the `Page` component, doubling external API requests per docs page. Extract the fetch into a shared server utility and cache the result within the request lifecycle.
- [ ] **Replace `(page.data as any)` with typed frontmatter:** Multiple `as any` casts in `page.tsx` bypass TypeScript strict mode. Extend the Fumadocs page schema with a proper frontmatter interface so that `badge`, `category`, `comingSoon`, `gumroad`, `price`, and `media` are type-safe.
- [ ] **Replace hardcoded stale dates:** The fallback `"May 2, 2026"` in `page.tsx` will become misleading. Replace it with a build-time constant (e.g., from `git log -1 --format=%ci`) or remove the fallback entirely.
- [ ] **Remove `unoptimized={true}` from `next/image` in `component-card.tsx`:** This flag bypasses Next.js Image Optimization, disabling automatic AVIF/WebP conversion, CDN caching, and responsive `srcset` generation. Remove it to restore optimization.

## ⚡ 3. Performance (P1)

- [ ] **Install and configure `@next/bundle-analyzer`:** The app uses heavy libraries (Three.js, GSAP, Motion, 60+ animated components). Without bundle analysis, it is impossible to track bloat or identify optimization opportunities. Add the analyzer to `next.config.mjs` and review the report before launch.
- [ ] **Audit lazy loading strategy:** Only one instance of `loading="lazy"` was found. Audit all below-the-fold images and add lazy loading where appropriate to reduce initial payload.
- [ ] **Add preload hints for critical assets:** Add `<link rel="preload">` for critical fonts (Antonio, Plus Jakarta Sans, Inter) and hero images in `app/layout.tsx` to improve Largest Contentful Paint (LCP).

## 🧪 4. Testing & CI/CD (P1–P2)

- [ ] **Add a CI/CD pipeline:** No automated build, lint, or deployment pipeline exists. Set up GitHub Actions (or Vercel preview deployments) to run `pnpm lint`, `pnpm build`, and type checks on every PR. This prevents broken code from reaching production.
- [ ] **Write smoke tests for the registry and API routes:** As a component library, the registry entries and API routes (`/api/telemetry`, `/api/search`) are core functionality. Add at minimum smoke tests to verify that registry items resolve correctly and API routes return expected status codes.
- [ ] **Add visual regression tests for animated components:** GSAP and Three.js demos are prone to silent breakage. Integrate Playwright or Chromatic to catch visual regressions in the previewer and landing page animations.

## 🏗️ 5. Architecture & Maintainability (P2)

- [ ] **Refactor `app/docs/[[...slug]]/page.tsx` (God Component):** The 462-line file handles routing, filesystem I/O, GitHub API calls, SEO schema generation, and JSX rendering. Extract data fetching into a dedicated server utility (`lib/docs-page.ts`), split SEO metadata into a helper, and keep the page component focused on rendering.
- [ ] **Refactor `registry/index.ts` into a factory or JSON-driven loader:** The 1571+ line file is a copy-paste monolith with 40+ identical entries. Replace it with a `createRegistryItem()` factory or load from a JSON manifest. This reduces maintenance burden and eliminates copy-paste bugs.
- [ ] **Sanitize HTML in the command menu search results:** `components/layout/command-menu.tsx` uses manual string replacement for `<mark>` tags instead of a proper sanitizer. Integrate `DOMPurify` to prevent XSS if the search index ever contains user-generated content.
- [ ] **Replace `console.error` with a structured logger:** 23+ `console.error` statements remain in the codebase. Replace them with a lightweight structured logger (or remove them) before launch to avoid leaking internal error details to the browser console in production.
