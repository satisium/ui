# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 3.x     | ✅ Yes             |
| 2.x     | ❌ No              |
| 1.x     | ❌ No              |

## Reporting a Vulnerability

If you discover a security vulnerability in Satisium UI, please **do not** open a public issue.

Instead, email us at **security@satisium.com** with:

1. **Component name** and version affected
2. **Steps to reproduce** the vulnerability
3. **Expected vs actual behavior**
4. **Screenshots or proof-of-concept** if applicable
5. **Potential impact** assessment (e.g., XSS, prototype pollution)

We will:

- Acknowledge receipt within **48 hours**
- Provide a detailed response within **7 days** outlining next steps
- Credit you in the security advisory (unless you prefer anonymity)

## Security Best Practices for Consumers

- Always install components from the official registry: `https://ui.satisium.com/r/<name>.json`
- Keep `satisium-ui` dependencies up to date
- Audit your `package-lock.json` / `pnpm-lock.yaml` regularly
- Review component source code before installing in production

## Third-Party Dependencies

Satisium UI depends on several third-party libraries. We regularly update dependencies and use Dependabot for automated security patches. See our [dependabot configuration](.github/dependabot.yml) for details.
