# Kiln — Generative UI Template Library + BYOK Bench
## Claude Code Build Prompt

See `build.md` at the repository root for the full build specification this
repository was generated from (context, stack, structure, design system,
schemas, API routes, component specs, AI prompts, validation harness,
security model, env vars, execution order, and quality rules).

This file exists at the repo root per the build prompt's own instructions so
that any future Claude Code session in this repository has the full spec as
persistent context. Do not duplicate its content here — read `build.md`.

Key invariants to preserve on every change (see `build.md` §10, §13, §14):
- No hardcoded colors/spacing/fonts — everything through `@kiln/tokens`.
- Never combine `allow-same-origin` with `allow-scripts` on the sandboxed
  iframe in `@kiln/sandbox`.
- BYOK keys never persist server-side; the proxy route is stateless.
- The Jury's Safety dimension is a hard CI gate, not advisory.
