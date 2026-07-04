# Kiln

The reference implementation and interactive lab for Generative UI
patterns.

Kiln is an open-source (MIT), local-first monorepo with two parts:

1. **[`/templates`](./templates)** — curated, production-grade, independently-runnable
   reference implementations of Generative UI (GenUI), one per major
   strategy (Static, Declarative, Open-Ended) plus notable sub-patterns
   (MCP-UI, A2UI-style schema rendering). Each is a real, working app —
   clone the folder and adapt it into your own product.
2. **[`/apps/bench`](./apps/bench)** — "the Bench," a single web app where you can browse
   the template gallery, paste in your **own** API key (Anthropic, OpenAI,
   or Google — BYOK, never stored on any server we run), and interact with
   every template live, side by side. The Bench also runs the **Jury** —
   an automated validation harness that scores every generated UI on
   accessibility, design-token adherence, structural validity, sandbox
   safety, and latency.

## Quick start

Try one template standalone, no monorepo setup required:

```bash
cd templates/static-tool-ui-dashboard
pnpm install
cp .env.local.example .env.local   # set ONE provider key
pnpm dev
```

Or run the whole Bench:

```bash
pnpm install
pnpm dev --filter @kiln/bench
```

## Self-Hosting with Docker

You can easily run and self-host the Bench application using Docker and Docker Compose. This packages the Kiln application in a container.

To build and start the container, run:

```bash
docker-compose up --build -d
```

The application will be available at `http://localhost:3000`. 

Kiln never asks for or stores your API key on any server we control. In the
Bench, keys live only in your browser's IndexedDB. When running a template
standalone, keys live only in your local `.env.local`. See
[`docs/BYOK.md`](./docs/BYOK.md).

## The three strategies

| Strategy | Idea | Safety | Flexibility |
|---|---|---|---|
| **Static** | AI selects from a pre-built component catalog via tool calls | Highest | Lowest |
| **Declarative** | AI emits structured JSON; the client renders it with its own design system | Balanced | Balanced |
| **Open-Ended** | AI generates free-form HTML/code, rendered in a sandbox | Lowest | Highest |

## Docs

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md)
- [`docs/ADDING-A-TEMPLATE.md`](./docs/ADDING-A-TEMPLATE.md)
- [`docs/SECURITY.md`](./docs/SECURITY.md)
- [`docs/BYOK.md`](./docs/BYOK.md)

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). Every template must pass the
Jury's fixed prompt-suite regression check in CI before it can be merged or
listed in the gallery.

## License

MIT — see [`LICENSE`](./LICENSE).
