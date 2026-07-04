# Sandboxed Artifact

Reference implementation of **Open-Ended GenUI**: the model writes a
complete, self-contained HTML document, and that document is rendered
inside a locked-down `<iframe>`. The sandbox implementation itself lives in
[`@kiln/sandbox`](../../packages/sandbox-runtime) — see
[`components/SandboxedArtifact.tsx`](./components/SandboxedArtifact.tsx),
which just re-exports it so every future open-ended template shares the
exact same security-critical code path.

## Architecture

- `app/api/generate/route.ts` asks the model for a single HTML document
  (system prompt below) and returns it as-is — there is no structural
  validation step for open-ended output; the sandbox boundary **is** the
  validation.
- `<iframe sandbox="allow-scripts allow-forms" srcdoc={html} />` —
  **`allow-same-origin` is deliberately never added.** Combined with
  `allow-scripts`, it would let generated code read the parent's cookies,
  localStorage, and same-origin fetch credentials. See the comment at the
  top of `@kiln/sandbox`'s `SandboxedArtifact.tsx` for the full reasoning.
- Communication back to the parent, if a generated artifact needs it, goes
  through `postMessage` with a per-session nonce validated on the parent
  side — see `@kiln/sandbox`'s `postMessageBridge.ts`.

**System prompt:**
```
You generate a single, complete, self-contained HTML document in response to the
user's request. Output ONLY the HTML, starting with <!DOCTYPE html> and nothing
before or after it. All CSS must be inline in a <style> tag; all JavaScript must
be inline in a <script> tag. Do not reference external stylesheets, fonts, or
scripts other than fonts.googleapis.com. Do not include any explanation before
or after the HTML.
```

## When to reach for this pattern

Use Open-Ended GenUI when the shape of what users need genuinely can't be
predicted ahead of time — one-off calculators, mini-games, bespoke
visualizations — and you're willing to pay for the strongest sandboxing to
make arbitrary generated code safe to run.

## Tradeoffs

- **Safety: 3/5.** Sandboxed, but the widest attack surface of the three
  strategies — the Jury's Safety battery (build.md §9.1) exists specifically
  because this strategy needs continuous adversarial testing, not a
  one-time review.
- **Flexibility: 5/5.** No catalog, no schema — anything renderable as a
  single HTML document is in scope.
- **Latency: 2/5.** A full HTML document is a lot more tokens than a tool
  call or a small JSON tree.
- **Setup complexity: 4/5.** The sandbox boundary has to be gotten exactly
  right (see `docs/SECURITY.md`) — this is not a "ship it and see" surface.

## Run standalone

```bash
cd templates/open-ended-sandboxed-artifact
pnpm install
cp .env.local.example .env.local
pnpm dev
```
