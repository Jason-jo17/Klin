# Contributing to Kiln

## Adding a new template

Read [`docs/ADDING-A-TEMPLATE.md`](./docs/ADDING-A-TEMPLATE.md) first — it
walks through the required directory shape, the validate-never-trust rule
for whichever strategy you're implementing, and how to wire your template
into the Bench. Open an issue using the "New template proposal" template
before starting significant work, so we can agree the pattern is distinct
from what's already here.

## Development

```bash
pnpm install
pnpm dev             # runs every workspace's dev script via Turborepo
pnpm lint            # eslint, including the no-eval/no-dangerouslySetInnerHTML rule
pnpm typecheck       # zero errors across all workspaces
pnpm build           # every template + the Bench build standalone
pnpm test            # unit tests: schema validation, Jury rubric scoring, sandbox postMessage checks
pnpm --filter @kiln/bench test:integration   # BYOK statelessness check — build apps/bench first
pnpm jury run --all --suite fixed-prompts.json
```

## Pull requests

- Every PR that touches `templates/*` runs the Jury's fixed prompt-suite
  regression check in CI (`.github/workflows/ci.yml`) — a PR fails if any
  dimension scores below that template's own `juryThresholds`, or if any
  Safety-dimension sandbox escape is detected. This is a hard gate, not
  advisory.
- PRs touching BYOK key-handling code (`apps/bench/lib/byok/keyStore.ts`,
  any `/api/proxy/*` or `/api/templates/*` route) require two reviewer
  approvals, enforced via `CODEOWNERS`.
- No hardcoded colors, spacing values, or fonts — everything through
  `@kiln/tokens`.
- No `eval`, `new Function`, or `dangerouslySetInnerHTML` outside
  `@kiln/sandbox`'s iframe boundary.

## Code of conduct

See [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).
