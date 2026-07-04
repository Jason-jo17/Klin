import type { NextConfig } from "next";

// Mirrors packages/sandbox-runtime/src/cspHelper.ts. Duplicated (rather than
// imported) because next.config.ts loads through Next's lightweight config
// transpiler, which doesn't resolve @kiln/sandbox's extensionless relative
// imports the way the app bundle's own bundler does.
function buildContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' *.anthropic.com *.openai.com *.googleapis.com",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; ");
}

const nextConfig: NextConfig = {
  transpilePackages: [
    "@kiln/tokens",
    "@kiln/ui",
    "@kiln/schema",
    "@kiln/sandbox",
    "@kiln/jury",
    "static-tool-ui-dashboard",
    "static-mcp-tool-cards",
    "declarative-json-schema-form",
    "declarative-a2ui-agent-panel",
    "declarative-mcp-ui-resource",
    "open-ended-sandboxed-artifact",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: buildContentSecurityPolicy() }],
      },
    ];
  },
};

export default nextConfig;
