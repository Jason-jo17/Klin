/**
 * Parent-side bridge for talking to a sandboxed `srcdoc` iframe.
 *
 * A sandboxed iframe without `allow-same-origin` reports its origin as the
 * literal string "null" — that is expected and is what we check for. Every
 * message is also required to carry the per-session nonce handed to the
 * child at mount time; messages missing either check are dropped silently
 * (never trusted, never logged with their payload).
 */

export interface BridgeMessage<T = unknown> {
  nonce: string;
  payload: T;
}

export function createNonce(): string {
  return crypto.randomUUID();
}

export function isBridgeMessage(data: unknown): data is BridgeMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "nonce" in data &&
    "payload" in data &&
    typeof (data as { nonce: unknown }).nonce === "string"
  );
}

export interface BridgeOptions<T> {
  nonce: string;
  onMessage: (payload: T) => void;
}

/**
 * Attaches a `message` listener that only accepts events from a sandboxed
 * (`origin === "null"`) iframe whose payload carries the expected nonce.
 * Returns a cleanup function.
 */
export function attachSandboxListener<T = unknown>({ nonce, onMessage }: BridgeOptions<T>): () => void {
  function handler(event: MessageEvent) {
    if (event.origin !== "null") return;
    if (!isBridgeMessage(event.data)) return;
    if (event.data.nonce !== nonce) return;
    onMessage(event.data.payload as T);
  }

  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}

/** Sends a nonce-stamped message down into the sandboxed iframe. */
export function postToSandbox<T>(iframe: HTMLIFrameElement, nonce: string, payload: T): void {
  iframe.contentWindow?.postMessage({ nonce, payload } satisfies BridgeMessage<T>, "*");
}

/**
 * Inline script injected into the artifact's srcdoc so generated code can
 * report events back to the parent without ever needing same-origin access.
 * Exposes `window.kilnBridge.send(payload)` to the sandboxed document.
 */
export function bridgeInitScript(nonce: string): string {
  return `<script>
    window.kilnBridge = {
      send: function (payload) {
        parent.postMessage({ nonce: ${JSON.stringify(nonce)}, payload: payload }, "*");
      }
    };
  </script>`;
}
