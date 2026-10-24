# VXC Luau Obfuscator — Web Edition

Static web starter for GitHub Pages or Vercel. Processing happens in the browser; source code is not uploaded.

## Included
- Responsive dark UI
- Ordered pipeline stages with pass/fail status
- Conservative lexical minifier that preserves quoted and long-bracket strings
- SHA-256 output integrity check
- Basic delimiter check, output copy, and `.lua` download

## Important limitations
This is a starter minifier, not a Luau compiler or a production-grade AST transformer. The delimiter checker is intentionally basic and can report false positives/negatives for advanced Luau syntax. Always validate output using the official Luau compiler and your own runtime tests before shipping.

It does not implement custom VM generation, double-VM virtualization, executor-specific anti-dump, FFI/debug-library tricks, or a guarantee against reverse engineering. Client-side code can be inspected by a sufficiently capable user. Keep secrets and privileged logic server-side.

## Deploy to Vercel
1. Create a GitHub repository and upload `index.html`, `vercel.json`, and this README.
2. In Vercel, choose **Add New → Project**, import the repository, and deploy.
3. No environment variables or backend are required.

Vercel serves `index.html` as a static page. Pushes to the connected Git branch trigger deployments.
