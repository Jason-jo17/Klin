# Kiln — Generative UI Template Library + BYOK Bench
## Claude Code Build Prompt (copy-paste as CLAUDE.md at repo root)

---

## 1. Context

**What this is:** An open-source (MIT), local-first monorepo called **Kiln**. It has two parts:

1. **`/templates`** — a curated set of production-grade, independently-runnable reference implementations of Generative UI (GenUI), one per major strategy (Static, Declarative, Open-Ended) plus notable sub-patterns (MCP-UI, A2UI-style schema rendering). Each template is a real, working app — not a snippet — meant to be cloned and adapted into other people's products.
2. **`/apps/bench`** — "**the Bench**": a single consolidated web app where anyone can browse the template gallery, paste in their **own** API key (Anthropic, OpenAI, or Google — BYOK, never stored on any server we run), and interact with every template live, side by side. The Bench also runs a **Jury** — an automated validation harness that scores every generated UI on accessibility, design-token adherence, structural validity, sandbox safety, and latency — so "does this GenUI pattern actually hold up in production" has a measurable answer instead of a vibe.

**Who it's for:** Frontend engineers and AI product builders evaluating which GenUI strategy fits their product, without adopting a single vendor's SDK sight-unseen. Positioning is deliberately architectural, not another AI page-builder: "the reference implementation and interactive lab for Generative UI patterns."

**Architectural precedent to follow:** This mirrors the local-first, BYOK, sandboxed-iframe-artifact architecture used by tools like Open Design (the open-source Claude Design alternative) — no backend database, no vendor lock-in, API keys never leave the browser except to go straight to the provider the user chose.

**What "validate" means in this build:** every template must pass the Jury's fixed prompt-suite regression check in CI before it can be merged or listed in the gallery. Validation is not a one-time manual check — it's a repeatable, scored, automated pass baked into the repo.

---

## 2. Technical Stack (exact versions — do not substitute "latest")

```
Monorepo tooling: Turborepo ^2.3.0 + pnpm ^9.12.0 (workspaces)
Language:         TypeScript ^5.7.0, strict mode everywhere
Framework:        Next.js ^16.0.0 (App Router, Turbopack, Server Actions)
UI runtime:       React ^19.1.0
AI orchestration: Vercel AI SDK ^5.0.0 (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`,
                   `@ai-sdk/openai`, `@ai-sdk/google`)
MCP:              `@modelcontextprotocol/sdk` ^1.14.0 (for the MCP-UI template)
Styling:          Tailwind CSS ^4.1.0 (CSS-first config) + CSS custom properties
                   for the token layer (tokens are NOT Tailwind theme extensions —
                   they are raw CSS vars so non-Tailwind templates can consume them too)
Icons:            lucide-react ^0.469.0
Motion:           CSS-native animations by default; framer-motion ^12.0.0 ONLY
                   inside apps/bench shell (gallery transitions, command palette)
State (client):   zustand ^5.0.0
Schema/validation: zod ^3.24.0
Local storage:    idb-keyval ^6.2.0 (IndexedDB wrapper for BYOK key storage)
A11y testing:     @axe-core/playwright ^4.10.0
E2E/interaction:  @playwright/test ^1.49.0
Sandbox:          native `<iframe sandbox>` + postMessage — no third-party
                   sandboxing library, so the security model stays auditable
Deployment:        Vercel (apps/bench only — everything else runs via `pnpm dev`
                   with zero cloud dependency)
License:          MIT (LICENSE file at repo root, SPDX headers not required per-file)
Node:             >=20.18.0 (pin in .nvmrc and package.json "engines")
```

Never say "latest" in any generated `package.json` — use the caret ranges above.

---

## 3. Repository Structure (full tree — build exactly this)

```
kiln/
├── apps/
│   └── bench/                                # "the Bench" — the BYOK playground
│       ├── app/
│       │   ├── layout.tsx                    # root shell: font loading, ThemeProvider, CommandPalette portal
│       │   ├── page.tsx                      # template gallery / landing
│       │   ├── globals.css                   # imports @kiln/tokens, base resets
│       │   ├── settings/
│       │   │   └── page.tsx                  # BYOK key manager (IndexedDB, never sent to us)
│       │   ├── play/
│       │   │   └── [templateId]/
│       │   │       └── page.tsx               # live playground for one template
│       │   ├── compare/
│       │   │   └── page.tsx                   # same prompt, 2–3 templates side by side
│       │   ├── jury/
│       │   │   └── [runId]/
│       │   │       └── page.tsx                # validation harness results view
│       │   └── api/
│       │       └── proxy/
│       │           └── [provider]/
│       │               └── route.ts            # BYOK pass-through proxy (stateless, no persistence)
│       ├── components/
│       │   ├── shell/
│       │   │   ├── AppShell.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── TopBar.tsx
│       │   │   └── CommandPalette.tsx
│       │   ├── keys/
│       │   │   ├── ByokKeyForm.tsx
│       │   │   ├── ProviderPicker.tsx
│       │   │   └── KeyStatusBadge.tsx
│       │   ├── gallery/
│       │   │   ├── TemplateCard.tsx
│       │   │   ├── StrategyFilterTabs.tsx
│       │   │   └── TemplateGrid.tsx
│       │   └── player/
│       │       ├── ChatPane.tsx
│       │       ├── GenUICanvas.tsx            # renders whichever strategy is active
│       │       ├── RunTimeline.tsx            # streaming event log (tool calls, schema emits, artifact writes)
│       │       └── JuryScorePanel.tsx
│       ├── lib/
│       │   ├── byok/
│       │   │   ├── keyStore.ts                # idb-keyval wrapper, AES-GCM encrypt at rest in IndexedDB
│       │   │   └── providerConfig.ts           # model lists, base URLs per provider
│       │   ├── registry/
│       │   │   └── templateRegistry.ts         # reads /templates/*/kiln.manifest.json at build time
│       │   └── analytics/
│       │       └── noop.ts                    # explicit no-op — Kiln ships with zero telemetry by default
│       ├── next.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── templates/
│   ├── static-tool-ui-dashboard/               # Strategy 1: Static GenUI (AI SDK tool→component map)
│   ├── static-mcp-tool-cards/                  # Strategy 1 variant: MCP tool results → pre-built cards
│   ├── declarative-json-schema-form/           # Strategy 2: schema-driven forms (Zod → renderer)
│   ├── declarative-a2ui-agent-panel/           # Strategy 2: A2UI-inspired declarative surface contract
│   ├── declarative-mcp-ui-resource/            # Strategy 2: MCP-UI `ui://` resource rendering
│   └── open-ended-sandboxed-artifact/          # Strategy 3: free-form HTML in a sandboxed iframe
│       (every directory follows the identical internal shape defined in §3.1)
│
├── packages/
│   ├── tokens/                                 # @kiln/tokens — the design system, framework-agnostic CSS vars
│   ├── ui-primitives/                          # @kiln/ui — Button, Card, Input, Dialog, Tabs, Tooltip, Skeleton
│   ├── genui-schema/                           # @kiln/schema — declarative UI contract + Zod validators
│   ├── sandbox-runtime/                        # @kiln/sandbox — iframe sandbox + postMessage protocol
│   └── jury/                                   # @kiln/jury — the validation rubric engine (usable standalone)
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DESIGN-SYSTEM.md
│   ├── ADDING-A-TEMPLATE.md                    # contributor guide for new templates
│   ├── SECURITY.md                             # sandbox threat model, written for external audit
│   └── BYOK.md
│
├── .github/
│   ├── workflows/
│   │   └── ci.yml                              # lint, typecheck, build all workspaces, run Jury regression suite
│   ├── ISSUE_TEMPLATE/
│   │   ├── new-template-proposal.md
│   │   └── bug_report.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── turbo.json
├── pnpm-workspace.yaml
├── .nvmrc                                       # "20.18.0"
├── LICENSE                                      # MIT
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── README.md
```

### 3.1 Template Internal Structure (identical for every dir under `/templates/*`)

```
templates/<template-id>/
├── kiln.manifest.json      # machine-readable metadata, schema in §5
├── app/                    # runnable Next.js 16 mini-app, `pnpm dev` works standalone
│   ├── page.tsx
│   └── api/generate/route.ts
├── components/
├── README.md                # architecture explainer + "when to reach for this pattern" + tradeoffs
└── package.json
```

Every template must run **standalone** (`cd templates/<id> && pnpm install && pnpm dev`) with nothing but a `.env.local` API key — it cannot depend on `apps/bench` being present. The Bench imports templates as workspace packages for the live playground, but a visitor who only wants one pattern should be able to clone just that folder's logic and go.

---

## 4. Design System — `@kiln/tokens`

This is the single source of visual truth. No component anywhere in the repo (templates included) may hardcode a hex color, a px spacing value, or a font-family — everything resolves through these CSS custom properties.

### 4.1 Philosophy (non-negotiable, applies to every screen built in this repo)

- **Calm clarity over visual theatrics.** Every element earns its place; hyper-clear hierarchy; motion explains, it doesn't decorate.
- **Motion as communication.** Every transition answers "what just happened" or "what's about to happen." Micro-interaction timing: **120–300ms** for feedback, **300–500ms** for transitions. Always respect `prefers-reduced-motion`.
- **Emotional warmth without gimmicks.** Layered soft shadows (never flat cards), intentional corner radii (not everything is a pill), subtle depth via gradient mesh/noise where it earns its keep.
- **Accessibility as infrastructure, not a checkbox.** Minimum 4.5:1 contrast on all text, visible focus-ring on every interactive element, full keyboard nav, semantic HTML first / ARIA second.

### 4.2 Identity & Naming

Kiln's own visual identity (used only in `apps/bench`'s shell — templates get a neutral variant of the same tokens so they don't fight for brand attention) leans into the "workshop" metaphor without being cute about it: a **kiln** takes raw material and fires it into a finished form — the apt metaphor for "raw model output → a real, working interface." The one signature element: when a template is generating, the **GenUICanvas** border renders a slow **ember-gradient sweep** (a 2200ms looping conic-gradient stroke, respecting `prefers-reduced-motion` by falling back to a static pulse-opacity) instead of a generic spinner. This is the single visual flourish Kiln spends its "boldness budget" on — everything else stays quiet and disciplined.

### 4.3 Font Pairing

**Tech Modernist**: `Space Grotesk` (display/headings) + `DM Sans` (body/UI text). Load both via `next/font/google`. Never use Inter, Roboto, Arial, or system-ui as the primary face. Fluid type scale via `clamp()`, line-height 1.5–1.7 body / 1.1–1.3 headings, slightly tightened letter-spacing on headings only.

### 4.4 Color Tokens (`packages/tokens/src/colors.css`)

Dominant hue: deep graphite-indigo (workshop/technical, not generic SaaS-blue), single hot accent reserved for "live generation" states only — never used for static chrome.

```css
:root {
  /* Primary scale — graphite-indigo, 50→950 */
  --kiln-primary-50:  #f4f5fb;
  --kiln-primary-100: #e6e8f7;
  --kiln-primary-200: #c9cdee;
  --kiln-primary-300: #a3a9e0;
  --kiln-primary-400: #7a7fd0;
  --kiln-primary-500: #5b5ec0;
  --kiln-primary-600: #4745a8;
  --kiln-primary-700: #383689;
  --kiln-primary-800: #2b2a68;
  --kiln-primary-900: #1f1e4a;
  --kiln-primary-950: #131230;

  /* Accent — "ember" — reserved ONLY for active-generation / live states */
  --kiln-ember-400: #ff8a4c;
  --kiln-ember-500: #ff6b1a;
  --kiln-ember-600: #e2540a;

  /* Semantic */
  --kiln-success-500: #1f9d6b;
  --kiln-warning-500: #d99a1b;
  --kiln-error-500:   #d9432f;
  --kiln-info-500:    #2f7fd9;

  /* Surfaces — dark-first (this is a dev-tool audience) */
  --kiln-surface-0: #0c0c14;   /* deepest background */
  --kiln-surface-1: #14141f;   /* card/panel */
  --kiln-surface-2: #1c1c2b;   /* elevated/hover */
  --kiln-surface-3: #262639;   /* overlay/modal */
  --kiln-border:    #2e2e44;

  --kiln-text-primary:   #f3f3f8;
  --kiln-text-secondary: #a8a8bf;
  --kiln-text-tertiary:  #6f6f88;
}

[data-theme="light"] {
  --kiln-surface-0: #fafafc;
  --kiln-surface-1: #ffffff;
  --kiln-surface-2: #f1f1f7;
  --kiln-surface-3: #e6e6f0;
  --kiln-border:    #dcdce8;
  --kiln-text-primary:   #14141f;
  --kiln-text-secondary: #4a4a5c;
  --kiln-text-tertiary:  #7c7c8f;
}
```

### 4.5 Spacing, Radius, Shadow, Z-Index Tokens

```css
:root {
  --kiln-space-1: 0.25rem; --kiln-space-2: 0.5rem;  --kiln-space-3: 0.75rem;
  --kiln-space-4: 1rem;    --kiln-space-6: 1.5rem;  --kiln-space-8: 2rem;
  --kiln-space-12: 3rem;   --kiln-space-16: 4rem;

  --kiln-radius-sm: 0.375rem; --kiln-radius-md: 0.625rem;
  --kiln-radius-lg: 1rem;     --kiln-radius-xl: 1.5rem;

  --kiln-shadow-sm: 0 1px 2px rgba(0,0,0,0.24);
  --kiln-shadow-md: 0 4px 12px rgba(0,0,0,0.28), 0 1px 2px rgba(0,0,0,0.2);
  --kiln-shadow-lg: 0 12px 32px rgba(0,0,0,0.36), 0 2px 6px rgba(0,0,0,0.24);

  --kiln-z-dropdown: 1000; --kiln-z-sticky: 1100; --kiln-z-overlay: 1200;
  --kiln-z-modal: 1300;    --kiln-z-toast: 1400;   --kiln-z-tooltip: 1500;

  --kiln-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --kiln-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --kiln-duration-fast: 160ms;   /* feedback */
  --kiln-duration-base: 280ms;   /* transitions */
  --kiln-duration-slow: 2200ms;  /* the ember sweep only */
}
```

### 4.6 Component & Interaction Rules

- Hover: transform (translateY(-1px)) + shadow shift — never color-change alone.
- Focus: 2px solid ring in `--kiln-primary-400`, 2px offset, always visible (never `outline: none` without a replacement).
- Active/press: `scale(0.97)`.
- Disabled: `opacity: 0.5`, `cursor: not-allowed`.
- Loading: buttons show an inline spinner + disabled state; the GenUICanvas shows the ember sweep (§4.2), never a generic spinner for AI generation specifically.
- Every animation gets a `@media (prefers-reduced-motion: reduce)` override that drops to opacity-only or removes the animation entirely.
- Responsive floor: build and verify at 380px, 768px, 1200px+.

`packages/tokens` ships as a plain CSS package (`@kiln/tokens/tokens.css`) importable by any framework — Tailwind config in `apps/bench` maps Tailwind's theme onto these vars rather than defining its own palette, so a contributor who doesn't use Tailwind in their own template still gets full visual consistency by importing the CSS file directly.

---

## 5. Template Manifest Schema (this is the "schema-first" data layer — no database needed for v1)

```typescript
// packages/genui-schema/src/manifest.ts
import { z } from "zod";

export const StrategySchema = z.enum(["static", "declarative", "open-ended"]);

export const TemplateManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),           // must match directory name
  name: z.string().min(3).max(60),
  strategy: StrategySchema,
  subPattern: z.string().optional(),               // e.g. "mcp-ui", "a2ui", "ai-sdk-tools"
  description: z.string().min(20).max(280),
  whenToUse: z.string().min(20),                    // one paragraph, shown in gallery detail
  tradeoffs: z.object({
    safety: z.number().min(1).max(5),               // 5 = safest (declarative/static score higher)
    flexibility: z.number().min(1).max(5),           // 5 = most flexible (open-ended scores higher)
    latency: z.number().min(1).max(5),                // 5 = fastest
    setupComplexity: z.number().min(1).max(5),
  }),
  providerRequirements: z.array(z.enum(["anthropic", "openai", "google"])).min(1),
  entryRoute: z.string(),                            // relative path Bench iframes/imports
  previewPrompts: z.array(z.string()).min(3).max(6), // seed prompts shown as quick-starts
  juryThresholds: z.object({
    accessibility: z.number().min(0).max(5).default(4),
    tokenAdherence: z.number().min(0).max(5).default(4),
    structuralValidity: z.number().min(0).max(5).default(5),
    safety: z.number().min(0).max(5).default(5),
    maxLatencyMs: z.number().default(4000),
  }),
});

export type TemplateManifest = z.infer<typeof TemplateManifestSchema>;
```

`lib/registry/templateRegistry.ts` in the Bench glob-reads every `templates/*/kiln.manifest.json`, validates each against this schema at build time, and **fails the build** if any manifest is invalid or a required field is missing — this is the mechanism that keeps the gallery honest as contributors add templates.

### 5.1 Strategy Comparison Constant (rendered as a table in the gallery)

```typescript
// packages/genui-schema/src/strategyMeta.ts
export const STRATEGY_META = {
  static: {
    label: "Static GenUI",
    summary: "AI selects from a pre-built component catalog via tool calls. Safest, most on-brand, least flexible.",
    exampleFrameworks: ["Vercel AI SDK (tool calling + generative UI)", "CopilotKit", "assistant-ui"],
  },
  declarative: {
    label: "Declarative GenUI",
    summary: "AI emits structured JSON/schema; the client renders it with its own design system. Balanced safety and flexibility.",
    exampleFrameworks: ["Google A2UI", "MCP-UI (ui:// resources)", "Thesys C1", "JSON-Schema-driven forms"],
  },
  "open-ended": {
    label: "Open-Ended GenUI",
    summary: "AI generates free-form HTML/code rendered in a sandbox. Most flexible, requires the strongest sandboxing.",
    exampleFrameworks: ["Claude Artifacts", "v0.dev", "Bolt.new", "Lovable"],
  },
} as const;
```

---

## 6. API Routes

### `POST /apps/bench/app/api/proxy/[provider]/route.ts`

- **Purpose:** stateless pass-through so the Bench can call Anthropic/OpenAI/Google from the browser without CORS issues, **without ever persisting the key server-side.**
- **Input (request body):** `{ apiKey: string, model: string, messages: Message[], tools?: ToolDefinition[], stream: boolean }`
- **Auth:** the `apiKey` travels in the request body over HTTPS, is read once into memory, forwarded immediately to the real provider endpoint, and is never written to a log, a database, a file, or an analytics event. Add an explicit code comment stating this at the top of the handler — this is a security-critical invariant, not a style choice.
- **Output:** streamed response (SSE) proxied 1:1 from the provider, using the AI SDK's stream adapters so `useChat`/`useObject` on the client work unmodified.
- **Error handling:** `400` if `apiKey` or `model` missing; `401` passthrough if provider rejects the key (do not swallow this — surface the real provider error to the UI so users know their key is bad, not that Kiln is broken); `429` passthrough with `Retry-After` header preserved; `500` only for our own serialization failures, never for provider errors (those pass through with their real status code).
- **Rate limiting:** none required for local dev. If `apps/bench` is deployed publicly (the hosted demo on Vercel), add a lightweight IP-based rate limit (Vercel KV or Upstash, optional dependency, documented in `docs/BYOK.md`, gracefully absent in local dev).

---

## 7. Component Specifications (the load-bearing ones)

### `components/keys/ByokKeyForm.tsx`
- Props: `{ provider: "anthropic" | "openai" | "google", onSaved: () => void }`
- Behavior: on submit, key is AES-GCM encrypted client-side (`lib/byok/keyStore.ts`, using the Web Crypto API with a passphrase-derived or session-random key — never plaintext in IndexedDB) and written to IndexedDB via `idb-keyval`. A "Test connection" button fires one cheap, non-billable call pattern (e.g., a `models.list`-style call where the provider supports it, otherwise a 1-token completion) before saving, so users get immediate feedback on a bad key.
- UI: uses `@kiln/ui` `Input` (masked, show/hide toggle), inline validation, `KeyStatusBadge` showing `unverified | valid | invalid`.

### `components/gallery/TemplateGrid.tsx` + `TemplateCard.tsx`
- Reads `templateRegistry.getAll()`, groups by `strategy`, renders `StrategyFilterTabs` (All / Static / Declarative / Open-Ended) above the grid.
- `TemplateCard` shows: name, one-line description, the 4 tradeoff scores as small horizontal bar indicators (not radar chart — radar charts are illegible at card size), and a "Try it" CTA that routes to `/play/[templateId]`.

### `components/player/GenUICanvas.tsx`
- Props: `{ strategy: Strategy, streamState: StreamState }`
- This is the polymorphic renderer: for `static`, it renders the tool-call-mapped React component tree; for `declarative`, it hands the incoming JSON to `@kiln/schema`'s `<SchemaRenderer />`; for `open-ended`, it hands raw HTML to `@kiln/sandbox`'s `<SandboxedArtifact />`. The strategy switch happens once at the top — no strategy-specific logic leaks into sibling components.
- Shows the ember-sweep border (§4.2) while `streamState.status === "generating"`.

### `components/player/JuryScorePanel.tsx`
- Props: `{ runId: string }`
- Fetches the stored Jury run result (client-side, from the same-session run — v1 has no server persistence, results live in Zustand for the session and can be exported as JSON) and renders 5 labeled score bars (Accessibility, Token Adherence, Structural Validity, Safety, Latency) plus a pass/fail badge against that template's `juryThresholds`.

### Representative per-strategy core components (one each, build these fully — they are the reference implementations everything else in the ecosystem gets copied from):

**`templates/static-tool-ui-dashboard/components/ToolResultRenderer.tsx`**
- A `Record<string, React.ComponentType<any>>` map from tool name → pre-built component (e.g., `render_metric_card`, `render_bar_chart`, `render_data_table`). The AI SDK's `tool()` calls are the only way a component gets on screen — there is no code path where model output becomes markup directly. This is the concrete demonstration of "Static GenUI."

**`templates/declarative-json-schema-form/components/SchemaRenderer.tsx`** (also the core of `@kiln/schema`)
- Input: a Zod-validated JSON document describing a tree of `{ type: "stack"|"card"|"field"|"button"|..., props, children }`.
- The renderer walks the tree and maps each `type` to a `@kiln/ui` primitive — it never does `dangerouslySetInnerHTML`, never evals, never accepts a `type` outside a fixed enum. Unknown `type` values render a visible `UnknownBlockFallback` rather than being dropped silently — a validation failure should always be loud in the demo, not swallowed.

**`templates/open-ended-sandboxed-artifact/components/SandboxedArtifact.tsx`** (also the core of `@kiln/sandbox`)
- Renders an `<iframe sandbox="allow-scripts allow-forms" srcdoc={html} />`. **Deliberately omit `allow-same-origin`** — combining it with `allow-scripts` lets sandboxed content escape the sandbox and access the parent's storage/cookies; this is the single most important line in the whole security model and must ship with a code comment explaining why it's omitted.
- Communication with the parent happens only via `postMessage`, and the parent's message handler validates `event.origin === "null"` (the origin of a sandboxed srcdoc iframe) and a shared nonce before accepting any message — see `@kiln/sandbox`'s `postMessageBridge.ts`.

---

## 8. AI Integration — System Prompts Per Strategy

### Static (`templates/static-tool-ui-dashboard`)
**System prompt:**
```
You are a dashboard assistant. You do not write UI code or markup. When the user
asks for a visualization or data view, you MUST call one of the provided tools
(render_metric_card, render_bar_chart, render_data_table, render_comparison_grid).
Never respond with a text description of a chart in place of a tool call. If no
tool fits the request, ask one clarifying question instead of inventing a new
visual.
```
**Validation:** none needed beyond the SDK's own tool-call schema validation — this is the point of Static GenUI, the component catalog IS the safety boundary.

### Declarative (`templates/declarative-json-schema-form`)
**System prompt:**
```
You generate UI descriptions, never UI code. Respond ONLY with JSON matching
this schema: { "type": "stack"|"card"|"field"|"button"|"text", "props": object,
"children": array }. Do not include any HTML, JavaScript, markdown, or prose
outside the JSON object. Every "field" node must include a "fieldType" from
["text","number","select","checkbox","date"] and a "label".
```
**Validation:** server-side, parse with `TemplateManifestSchema`-sibling Zod schema (`UiNodeSchema` in `@kiln/schema`); reject and re-prompt once on failure ("Your last response was not valid JSON matching the schema. Return only valid JSON."); after one retry, surface a visible error in `RunTimeline` rather than looping — this bounded-retry rule prevents runaway loops in the demo and is exactly the behavior a real integration should copy.

### Open-Ended (`templates/open-ended-sandboxed-artifact`)
**System prompt:**
```
You generate a single, complete, self-contained HTML document in response to the
user's request. Output ONLY the HTML, starting with <!DOCTYPE html> and nothing
before or after it. All CSS must be inline in a <style> tag; all JavaScript must
be inline in a <script> tag. Do not reference external stylesheets, fonts, or
scripts other than fonts.googleapis.com. Do not include any explanation before
or after the HTML.
```
**Validation:** the output is never trusted structurally — it goes straight into the sandboxed iframe per §7's `SandboxedArtifact`. The "validation" for open-ended is entirely the sandbox boundary plus the Jury's post-hoc safety score (§9), not pre-parsing the HTML.

Provider abstraction for all three: use the AI SDK's unified `generateText`/`streamText`/`streamObject` calls with a provider instance swapped per the user's BYOK selection (`createAnthropic({ apiKey })`, `createOpenAI({ apiKey })`, `createGoogleGenerativeAI({ apiKey })`) — templates must not hardcode a single provider; every template's `app/api/generate/route.ts` accepts a `provider` field and switches at runtime.

---

## 9. Validation Harness — `@kiln/jury`

This package is the direct answer to "validate generative UI builds," and it is designed to be usable **outside** Kiln too (documented as a standalone npm package, not bolted to the Bench).

### 9.1 Rubric (5 dimensions, 0–5 each)

| Dimension | How it's scored |
|---|---|
| **Accessibility** | Run `@axe-core/playwright` against the rendered output; score = `5 - min(violationCount, 5)`, weighted so any "critical" impact violation caps the score at 2 regardless of count. |
| **Token Adherence** | Static-analyze computed styles of generated nodes; score = `5 * (properties resolving to a `--kiln-*` custom property / total color+spacing properties checked)`. Only meaningful for static/declarative strategies where output is real DOM under our control; open-ended templates are scored against their *own* declared design intent instead (documented as an inherent limitation in `docs/ARCHITECTURE.md`, not hidden). |
| **Structural Validity** | Static: did the expected tool get called at least once? Declarative: does the JSON parse and pass the Zod schema on first try (no retry needed)? Open-ended: is the HTML well-formed (no unclosed tags via a DOM-parse check)? |
| **Safety** | Fire a small fixed battery of adversarial prompts (prompt-injection attempts, `<script>parent.` escape attempts, requests to fetch external resources) at each template and confirm none of them: (a) escape the iframe sandbox, (b) make a network call to a non-allowlisted host, (c) access `window.parent` state. Score 5 = zero successful escapes across the battery; each successful escape is an automatic score of 0 and a CI-failing event, not just a low score. |
| **Latency** | Time from request sent to first visible paint of the generated UI (Playwright `page.waitForSelector` on a canary element). Score bands: `<800ms`=5, `<1500ms`=4, `<2500ms`=3, `<4000ms`=2, else 1. |

### 9.2 CLI

```bash
pnpm jury run --template static-tool-ui-dashboard --prompt "show quarterly revenue by region"
pnpm jury run --all --suite fixed-prompts.json     # CI regression mode
pnpm jury report --runId <id> --format json         # for JuryScorePanel / external tooling
```

### 9.3 CI Gate (`.github/workflows/ci.yml`)

Every PR that touches `templates/*` triggers: install → typecheck → build the touched template(s) → run `pnpm jury run --template <touched> --suite fixed-prompts.json` → **fail the PR** if any dimension scores below that template's `juryThresholds` from its manifest, or if any Safety-dimension escape is detected. This is the literal "validate generative UI builds" mechanism the whole repo exists to provide — treat it as the most important CI job, not an afterthought.

---

## 10. Security Model (`docs/SECURITY.md` — write this as if it will be externally audited, because it will be)

- **BYOK keys never touch our servers persistently.** The proxy route (§6) is stateless; state this as an explicit, testable claim, and add a Playwright test that asserts no `apiKey` substring appears in any server log output during a proxy call.
- **Sandbox isolation.** `allow-scripts` without `allow-same-origin` on every open-ended iframe (§7) — this is the load-bearing security decision in the whole repo. Document explicitly what this does and does not protect against (protects: parent DOM/cookie/localStorage access, same-origin fetch credentials; does not protect against: the sandboxed content making its own outbound `fetch` calls to public APIs, which is why the Jury's Safety battery also checks for unexpected network calls).
- **postMessage origin checks.** Every `window.addEventListener("message", ...)` in `@kiln/sandbox` must validate `event.origin` and a per-session nonce before trusting `event.data` — no exceptions, this is checked in code review via a lint rule if feasible (`eslint-plugin-no-unsanitized` or a custom rule).
- **No `eval`, `new Function`, or `dangerouslySetInnerHTML`** anywhere outside `@kiln/sandbox`'s iframe boundary. Enforce with an ESLint rule at the workspace root, not just a convention.
- **CSP.** The Bench ships a strict `Content-Security-Policy` header (`script-src 'self'`, no `unsafe-inline` at the top-level app — inline scripts are fine *inside* the sandboxed iframe's `srcdoc`, which is a separate security context).

---

## 11. Environment Variables

```
# apps/bench/.env.local — none required for local dev; BYOK keys are entered in-app
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional, only if deploying the public hosted demo on Vercel:
KV_REST_API_URL=              # Vercel KV or Upstash, for IP rate-limiting the proxy route only
KV_REST_API_TOKEN=

# templates/*/.env.local — each template's own standalone dev mode needs ONE key
ANTHROPIC_API_KEY=            # or OPENAI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY
```

State explicitly in `README.md`: "Kiln never asks for or stores your API key on any server we control. In the Bench, keys live only in your browser's IndexedDB. When running a template standalone, keys live only in your local `.env.local`."

---

## 12. Execution Order

1. Bootstrap monorepo: `pnpm init`, `turbo.json`, `pnpm-workspace.yaml`, root `tsconfig.json` with path aliases for every `@kiln/*` package.
2. Build `packages/tokens` first — nothing else can be styled correctly until this exists.
3. Build `packages/ui-primitives` on top of tokens (Button, Card, Input, Dialog, Tabs, Tooltip, Skeleton — with hover/focus/active/disabled states per §4.6).
4. Build `packages/genui-schema` (manifest schema §5, UI-node schema for declarative rendering, strategy metadata).
5. Build `packages/sandbox-runtime` (iframe wrapper, postMessage bridge, CSP helper).
6. Build `packages/jury` (rubric engine, CLI, Playwright + axe-core wiring) — build this **before** the templates so every template can be validated as it's built, not bolted on at the end.
7. Build templates in this order, running `pnpm jury run` against each immediately after: `static-tool-ui-dashboard` → `static-mcp-tool-cards` → `declarative-json-schema-form` → `declarative-a2ui-agent-panel` → `declarative-mcp-ui-resource` → `open-ended-sandboxed-artifact`.
8. Build `apps/bench` shell (AppShell, Sidebar, TopBar, CommandPalette) using `@kiln/ui`.
9. Build the BYOK flow (`ByokKeyForm`, `keyStore.ts`, `/api/proxy/[provider]`) and verify against a real key for each of the 3 providers.
10. Build the gallery (`TemplateGrid`, `TemplateCard`, `StrategyFilterTabs`) reading the live registry.
11. Build the player (`GenUICanvas`, `ChatPane`, `RunTimeline`, `JuryScorePanel`) and wire each template's `entryRoute`.
12. Build `/compare` (multi-template side-by-side) and `/jury/[runId]`.
13. Write `docs/*` (ARCHITECTURE, DESIGN-SYSTEM, ADDING-A-TEMPLATE, SECURITY, BYOK) and OSS scaffolding (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, issue/PR templates).
14. Wire `.github/workflows/ci.yml` (lint → typecheck → build → Jury regression suite, §9.3).
15. **Verify, in order:** `pnpm turbo typecheck` (zero errors across all workspaces) → `pnpm turbo build` (every template + the Bench builds standalone) → `pnpm jury run --all --suite fixed-prompts.json` (every template clears its own `juryThresholds`) → manual smoke test: enter a real Anthropic key in the Bench, run all 6 templates, confirm the ember-sweep animation, confirm `/compare` and `/jury/[runId]` render real data, confirm `prefers-reduced-motion` is respected (toggle OS setting and re-check).

---

## 13. Quality Rules (non-negotiable)

1. No template may hardcode a color, spacing value, or font — everything through `@kiln/tokens`.
2. No strategy may leak into another — `static-*` templates never parse free-form JSON into UI, `open-ended-*` never claims to be "safe by construction."
3. Every template's `README.md` must state its tradeoffs in prose, not just the manifest's numeric scores — a reader deciding which pattern to adopt needs the reasoning, not just a bar chart.
4. Every AI-facing system prompt is written out in full in this document and in the template's own source (§8) — never "write a reasonable prompt for X."
5. The Safety dimension of the Jury is the only one where a single failure blocks a merge outright, regardless of the other four scores — sandbox escapes are not a "nice to have," they're a hard gate.
6. BYOK key handling code (`keyStore.ts`, the proxy route) requires two reviewer approvals on any PR that touches it, enforced via `CODEOWNERS`.
7. Real seed prompts in every manifest's `previewPrompts` — no `"try something"` placeholders.

## 14. Anti-Patterns — Never Do These

- ❌ A "generic AI chat" template that doesn't clearly demonstrate one specific GenUI strategy.
- ❌ `allow-same-origin` alongside `allow-scripts` on any sandboxed iframe, ever, for any reason.
- ❌ Storing a BYOK key anywhere other than the browser's encrypted IndexedDB (no cookies, no server session, no analytics payload).
- ❌ A template that only works inside the Bench and can't `pnpm dev` on its own.
- ❌ Treating the Jury as advisory — it is a CI gate, not a dashboard nobody looks at.
- ❌ Silent fallback when declarative JSON fails schema validation — always render a visible `UnknownBlockFallback`, never drop the node.
- ❌ Generic gray flat cards, Inter/system-ui fonts, instant show/hide without transition, or any other item on the elite-ui-ux anti-pattern list.

---

*End of build prompt. Paste this entire file as `CLAUDE.md` at the root of a new empty repo and run Claude Code against it — the Execution Order in §12 is the intended build sequence.*