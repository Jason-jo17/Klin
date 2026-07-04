# Adding a Template

Every template lives at `templates/<template-id>/` and follows the same
internal shape:

```
templates/<template-id>/
├── kiln.manifest.json
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/generate/route.ts
├── lib/
│   └── generate.ts        # the actual handler; route.ts re-exports it
├── components/
├── README.md
├── package.json
├── next.config.ts
├── tsconfig.json
└── .env.local.example
```

## Checklist

1. **Pick a strategy** (`static`, `declarative`, or `open-ended`) and, if
   applicable, a `subPattern` (e.g. `mcp-ui`, `a2ui`).
2. **Write `lib/generate.ts` first.** Export `SYSTEM_PROMPT` and a
   `handleGenerateRequest(req: Request): Promise<Response>` function. This
   is what both your template's own route and `apps/bench`'s
   `/api/templates/[templateId]` route will call — write the prompt and
   validation logic exactly once, here.
3. **`app/api/generate/route.ts`** becomes a two-line re-export:
   `export { handleGenerateRequest as POST } from "../../../lib/generate";`
4. **Never trust model output structurally beyond your strategy's
   contract:**
   - `static` — only tool calls reach the DOM; no path from model text to
     markup.
   - `declarative` — validate against a Zod schema before rendering;
     one bounded retry on failure, then a visible error (never a silent
     drop, never an unbounded retry loop).
   - `open-ended` — the sandbox boundary (`@kiln/sandbox`'s
     `SandboxedArtifact`) *is* the validation. Never add
     `allow-same-origin`.
5. **Build every component through `@kiln/tokens` and `@kiln/ui`.** No
   hardcoded colors, spacing, or fonts.
6. **Write `kiln.manifest.json`** matching `TemplateManifestSchema`
   (`packages/genui-schema/src/manifest.ts`). The `id` field must exactly
   match your directory name — the registry build fails otherwise. Include
   3–6 real `previewPrompts` (no `"try something"` placeholders) and set
   `juryThresholds` deliberately, not by copy-pasting another template's.
7. **Write `README.md`** with three sections: architecture, "when to reach
   for this pattern," and tradeoffs *in prose* — a reader deciding which
   pattern to adopt needs the reasoning, not just the manifest's numeric
   scores.
8. **Verify it runs standalone:**
   ```bash
   cd templates/<template-id>
   pnpm install
   cp .env.local.example .env.local   # set ONE provider key
   pnpm dev
   ```
9. **Run the Jury against it** before opening a PR:
   ```bash
   pnpm jury run --template <template-id> --prompt "one of your previewPrompts"
   ```
   Every dimension must clear the thresholds in your own manifest, and the
   Safety dimension must score 5 — a single sandbox escape blocks the
   merge regardless of the other four scores.
10. **Wire it into `apps/bench`:**
    - Add it as a workspace dependency in `apps/bench/package.json`.
    - Add it to `transpilePackages` in `apps/bench/next.config.ts`.
    - Add its `handleGenerateRequest` to the `HANDLERS` map in
      `apps/bench/app/api/templates/[templateId]/route.ts`.
    - If it's a `static` template, register its tool-name → component map
      in `TOOL_COMPONENTS_BY_TEMPLATE` (`apps/bench/components/player/TemplatePlayer.tsx`
      and `CompareClient.tsx`).

## Anti-patterns to avoid

See `build.md` §14 — most importantly: don't build "a generic AI chat"
template that doesn't clearly demonstrate one specific GenUI strategy, and
never let one strategy's rendering logic leak into another's.
