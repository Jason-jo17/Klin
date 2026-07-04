import type { NextConfig } from "next";

// Mirrors packages/sandbox-runtime/src/cspHelper.ts — duplicated (not
// imported) because next.config.ts loads through Next's lightweight config
// transpiler, which doesn't resolve @kiln/sandbox's relative imports the
// way the app bundle's own bundler does. `frame-src 'self'` governs
// same-origin <iframe src> navigation only — SandboxedArtifact renders via
// the `srcDoc` attribute, whose isolation comes from the `sandbox`
// attribute itself (see @kiln/sandbox), not this header.
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
  transpilePackages: ["@kiln/tokens", "@kiln/ui", "@kiln/sandbox"],
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "Content-Security-Policy", value: buildContentSecurityPolicy() }] }];
  },
};

export default nextConfig;
