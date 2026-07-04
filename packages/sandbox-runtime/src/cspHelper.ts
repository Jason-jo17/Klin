/**
 * Strict CSP for the top-level app (apps/bench). Inline scripts are fine
 * *inside* a sandboxed iframe's srcdoc — that's a separate security context
 * governed by the `sandbox` attribute, not by this header.
 */
export function buildContentSecurityPolicy(): string {
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
