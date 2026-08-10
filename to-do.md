# 🚀 Pre-Launch Checklist

> **Goal:** Ensure a flawless, buttery-smooth, and secure experience before pushing to production.

## 🎨 0. Important

- [x] **Landing page links and buttons:** Check all the links.
- [x] **Make the app desktop only:** Add a condition to make the app apart from landing page desktop only.
- [ ] **ui.satisium.com:** VERY IMPORTANT.
- [ ] **Important index pages:** Index pages for `doc/components` etc .
- [ ] **Proper categories:** Add proper categories to the components.
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
- [ ] **SEO and logo:** Update logos everywhere. SEO and all.
- [ ] **Github satisium:** Github satis UI to satisium.
- [ ] **Analytics:** Analytics.

## 🎨 1. UI, UX & Premium Polish

- [ ] **Cross-Browser Check:** Tested on Chrome, Safari, Firefox, and Edge.
- [ ] **Mobile Responsiveness:** Layout holds up on small screens (iPhone SE) and ultra-wide displays.
- [ ] **Theme Switching:** Dark mode and Light mode toggle smoothly without flickering.
- [ ] **Interactive States:** All buttons/links have `hover`, `focus`, and `active` (scale down) states.
- [ ] **Touch Targets:** Minimum 44x44px clickable areas on mobile devices.
- [ ] **Tap Highlights:** Disabled default blue tap highlights on mobile Safari (`-webkit-tap-highlight-color: transparent`).
- [ ] **Scroll Lock:** Modals, sheets, and mobile menus properly lock the body scroll when open.
- [ ] **Smooth Scrolling:** Smooth scroll enabled for anchor links.

## ⚡️ 2. Performance & Animations

- [ ] **Lighthouse Check:** Score of 90+ on Desktop and Mobile.
- [ ] **Image Optimization:** All images use `next/image` (or WebP/AVIF formats) with proper `width`, `height`, and `alt` tags.
- [ ] **Web Fonts:** Fonts are preloaded and use `font-display: swap` to prevent FOUT/FOIT.
- [ ] **Animation Performance:** GPU-accelerated CSS (`transform`, `opacity`, `clip-path`) used instead of layout-triggering properties (`padding`, `margin`).
- [ ] **Memory Leaks:** All GSAP timelines, WebGL contexts (Three.js), and event listeners are properly killed/disposed on component unmount.
- [ ] **Mobile GPU:** Heavy WebGL or complex GSAP animations are disabled or simplified on mobile to save battery and prevent lag.

## 🔍 3. SEO & Meta (Social Sharing)

- [ ] **Dynamic Titles:** Every page has a unique `<title>` (e.g., `Page Name | Satisium UI`).
- [ ] **Meta Descriptions:** Every page has a descriptive `<meta name="description">` (150-160 chars).
- [ ] **Open Graph (OG) Images:** High-quality `og:image` (1200x630px) added for Twitter/X, LinkedIn, and Discord previews.
- [ ] **Favicon:** Added proper favicon suite (`favicon.ico`, `icon.svg`, `apple-touch-icon.png`).
- [ ] **Manifest & Theme Color:** `theme-color` meta tag is set for mobile browser headers.
- [ ] **Sitemap & Robots:** `sitemap.xml` and `robots.txt` are generated and correctly configured.

## ♿️ 4. Accessibility (a11y)

- [ ] **Keyboard Navigation:** Site is fully navigable using only the `Tab` key.
- [ ] **Focus Rings:** Custom `focus-visible` outlines are styled and clear (not completely hidden).
- [ ] **ARIA Labels:** Icon-only buttons (like GitHub or Theme toggles) have `aria-label` or `.sr-only` text.
- [ ] **Contrast Ratio:** Text meets WCAG AA contrast standards against its background.
- [ ] **Semantic HTML:** Correct use of `<header>`, `<main>`, `<section>`, `<nav>`, and heading hierarchy (`h1` -> `h2` -> `h3`).

## 🛡 5. Code Quality & Security

- [ ] **No Console Logs:** Removed all `console.log`, `console.warn`, and `debugger` statements.
- [ ] **TypeScript / Linting:** `npm run build` and `npm run lint` pass with zero warnings/errors.
- [ ] **Environment Variables:** Production `.env` variables are correctly added to the hosting provider (Vercel/Netlify).
- [ ] **API Security:** Private API keys are strictly accessed server-side, never exposed in `NEXT_PUBLIC_` variables.
- [ ] **CORS / Rate Limiting:** API routes have basic rate limiting and proper CORS headers if accessed externally.
- [ ] **404 / 500 Pages:** Custom Not Found (`404`) and Error (`500`) pages are designed and functional.

## 🚢 6. Final Deployment

- [ ] **Analytics Setup:** Plausible, Vercel Analytics, or Google Analytics installed and firing correctly.
- [ ] **Domain & SSL:** Custom domain is connected, and SSL certificate is active.
- [ ] **Cold Start Test:** Opened the production URL in an Incognito window to verify the first-load experience.
- [ ] **Forms / Webhooks:** Tested live contact forms, newsletter signups, or database writes.
