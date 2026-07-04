import { useEffect, useMemo, useRef } from "react";
import { attachSandboxListener, bridgeInitScript, createNonce } from "./postMessageBridge";

export interface SandboxedArtifactProps {
  html: string;
  title?: string;
  onMessage?: (payload: unknown) => void;
  className?: string;
}

function injectBridge(html: string, nonce: string): string {
  const script = bridgeInitScript(nonce);
  if (html.includes("</head>")) return html.replace("</head>", `${script}</head>`);
  if (html.includes("<body")) return html.replace(/<body[^>]*>/, (tag) => `${tag}${script}`);
  return `${script}${html}`;
}

/**
 * Renders arbitrary, model-generated HTML in a locked-down iframe.
 *
 * `allow-same-origin` is deliberately OMITTED from `sandbox` below. Combined
 * with `allow-scripts`, `allow-same-origin` would let the generated document
 * read/write the parent's cookies, localStorage, and same-origin fetch
 * credentials — i.e. it would let sandboxed content escape the sandbox. The
 * tradeoff this buys: the iframe's origin becomes the opaque string "null",
 * scripts still run, but the document cannot touch anything of the parent's.
 * It does NOT stop the sandboxed content from making its own outbound
 * `fetch()` calls to public APIs — that's covered separately by the Jury's
 * Safety battery (build.md §9.1) and CSP on the top-level app, not this
 * attribute. Do not add `allow-same-origin` here for any reason.
 */
export function SandboxedArtifact({ html, title = "Generated artifact", onMessage, className }: SandboxedArtifactProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const nonce = useMemo(() => createNonce(), []);
  const srcDoc = useMemo(() => injectBridge(html, nonce), [html, nonce]);

  useEffect(() => {
    if (!onMessage) return;
    return attachSandboxListener({ nonce, onMessage });
  }, [nonce, onMessage]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-forms"
      className={className}
      style={{ width: "100%", height: "100%", border: "none", background: "white" }}
    />
  );
}
