# Security Model

This document describes Kiln's security model as of v0.1. It is written to
be externally auditable: every claim below is either a testable invariant
enforced in code, or is explicitly flagged as a known limitation.

## 1. BYOK keys never touch our servers persistently

**Claim:** the proxy route (`apps/bench/app/api/proxy/[provider]/route.ts`)
and the per-template generation routes (`templates/*/lib/generate.ts`) are
stateless. An API key arriving in a request body is read once into memory,
used to construct a provider client, and forwarded to the real provider. It
is never written to a log line, a database row, a file, or an analytics
event.

**How this is enforced:**
- Kiln ships zero telemetry by default (`apps/bench/lib/analytics/noop.ts`
  is a literal no-op — there is no analytics SDK anywhere in the
  dependency tree to accidentally wire a key into).
- The proxy route's handler has an explicit code comment marking the
  invariant, placed directly above the code that touches `apiKey`, so any
  future edit that adds logging there is a visible, deliberate change to
  read during review.
- Keys are stored client-side only, in the browser's IndexedDB (see §3 and
  `docs/BYOK.md`).

**Testable via:** a Playwright test asserting no `apiKey` substring appears
in server log output during a proxy call (add this to `apps/bench`'s test
suite before the hosted demo goes live).

## 2. Sandbox isolation

Every open-ended template renders model output inside:

```html
<iframe sandbox="allow-scripts allow-forms" srcdoc={html} />
```

`allow-same-origin` is **deliberately never present** on this attribute.
This is the single most load-bearing security decision in the repository.

**What omitting `allow-same-origin` protects against:**
- The generated document reading or writing the parent page's cookies.
- The generated document reading or writing the parent page's
  `localStorage`/`sessionStorage`.
- The generated document making same-origin `fetch()` calls that would
  carry the parent's session credentials.
- The generated document navigating `window.top` or otherwise reaching
  outside its own frame (the iframe's origin is the opaque string `"null"`,
  so none of the browser's same-origin privileges apply to it).

**What it does NOT protect against:**
- The sandboxed document making its own outbound `fetch()` calls to public,
  unauthenticated APIs — `sandbox` attributes don't block network access,
  only same-origin access. This is why the Jury's Safety battery
  independently monitors outbound requests during every adversarial run
  (`packages/jury/src/rubric/safety.ts`, `withNetworkWatch`) and flags any
  request to a non-allowlisted host.
- Resource-exhaustion / DoS from a generated document (e.g. an infinite
  loop) — the iframe can still consume CPU/memory in the tab. Kiln does not
  currently sandbox against this; it's a known limitation for v1.

Never add `allow-same-origin` to this attribute for any reason. If a future
use case seems to require it, that use case needs a different security
model entirely (e.g. a server-side rendering step with its own
sanitization), not a weakened iframe sandbox.

## 3. postMessage origin checks

`@kiln/sandbox`'s `postMessageBridge.ts` is the only code in the repo that
listens for `message` events from a sandboxed iframe. Every listener:

1. Checks `event.origin === "null"` (the origin a sandboxed `srcdoc` iframe
   reports) — messages from any other origin are dropped without being
   read.
2. Checks a per-session nonce embedded in the message payload against the
   nonce handed to that specific iframe instance at mount time — messages
   without a matching nonce are dropped.

No exception to this pattern exists anywhere in the codebase. Any new
`window.addEventListener("message", ...)` added to `@kiln/sandbox` in the
future must go through `attachSandboxListener` rather than being
hand-rolled.

## 4. No `eval`, `new Function`, or `dangerouslySetInnerHTML` outside the sandbox

Every renderer in the repo that is not `@kiln/sandbox`'s
`SandboxedArtifact` — `ToolResultRenderer`, `SchemaRenderer`,
`SurfaceRenderer`, `McpResultCard` — builds its output exclusively through
React elements and known-safe DOM APIs. None of them ever call `eval`,
`new Function`, or use `dangerouslySetInnerHTML`. This should be enforced
with an ESLint rule at the workspace root (`no-restricted-syntax` targeting
`eval`, `Function` constructor calls, and the `dangerouslySetInnerHTML`
prop, scoped to exclude `packages/sandbox-runtime`).

## 5. Content-Security-Policy

`apps/bench` ships a strict CSP header (`packages/sandbox-runtime/src/cspHelper.ts`,
applied in `apps/bench/next.config.ts`'s `headers()`):

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com;
font-src 'self' fonts.gstatic.com; img-src 'self' data: blob:;
connect-src 'self' *.anthropic.com *.openai.com *.googleapis.com;
frame-src 'self'; object-src 'none'; base-uri 'self';
```

No `unsafe-inline` for scripts at the top level. Inline scripts are fine
*inside* a sandboxed iframe's `srcdoc` — that document is a separate
security context governed by the `sandbox` attribute (§2), not by this CSP.

## Reporting a vulnerability

If you find a security issue in Kiln, please open a GitHub security
advisory on the repository rather than a public issue.
