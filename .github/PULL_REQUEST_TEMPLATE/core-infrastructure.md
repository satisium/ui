## ⚙️ Core Infrastructure / Tooling

<!-- Explain the architecture change. Did you update Tailwind? Did you rewrite the registry build script? -->

## 🛑 Safety Checklist

<!-- Core changes can bring down the entire site. Verify carefully. -->

- [ ] I updated `package.json` (if new dependencies were added).
- [ ] I verified the local build succeeds (`pnpm build`).
- [ ] The iframe previewer (`app/preview/`) and embed routes (`app/embed/`) still function correctly.
- [ ] Vercel preview deployment built successfully without out-of-memory (OOM) errors.
- [ ] If this script changes how the registry works, I verified `public/r/registry.json` is still formatted correctly.
