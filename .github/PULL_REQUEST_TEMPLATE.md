## What this changes

## Checklist

- [ ] `pnpm turbo typecheck` passes across all workspaces
- [ ] `pnpm turbo build` passes (every touched template + the Bench build standalone)
- [ ] `pnpm turbo test` passes
- [ ] If this touches `templates/*`: `pnpm jury run --template <id> --suite fixed-prompts.json` clears every threshold in that template's own manifest
- [ ] No hardcoded colors, spacing, or fonts — everything through `@kiln/tokens`
- [ ] No `eval`, `new Function`, or `dangerouslySetInnerHTML` outside `@kiln/sandbox`
- [ ] If this touches BYOK key handling (`apps/bench/lib/byok/`, `/api/proxy/*`, `/api/templates/*`) or `@kiln/sandbox`: flagging for the required second reviewer

## Related issue
