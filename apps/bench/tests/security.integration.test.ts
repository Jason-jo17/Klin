import { describe, it, expect, afterAll } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";

/**
 * Verifies the testable claim in docs/SECURITY.md §1: the BYOK proxy route
 * is stateless and never logs the apiKey. This spawns a real, built
 * `next start` (run `pnpm build` in apps/bench first — this test does not
 * build for you, since that's slow and belongs in CI's build step, not
 * every test run) and asserts a unique marker embedded in a fake key never
 * appears in the server's stdout/stderr across a real request.
 *
 * Note: `next start` runs in production mode, which — unlike `next dev` —
 * does not log requests by default. Capturing zero output is the expected,
 * safe outcome; what this test actually guards against is a *future*
 * regression that adds logging (an access log, a crash dump, an error
 * handler that prints the request body) and leaks the key through it.
 */

// A random high port per run avoids colliding with a leftover process from
// a previous interrupted run — Windows in particular can leave the actual
// `next-server` node process orphaned after killing its parent shell.
const PORT = 3900 + Math.floor(Math.random() * 500);
const MARKER = `KILN_SECRET_MARKER_${randomUUID()}`;

let serverProcess: ChildProcess | undefined;
let capturedOutput = "";

function killServer() {
  if (!serverProcess || serverProcess.killed || serverProcess.exitCode !== null) return;
  if (process.platform === "win32" && serverProcess.pid) {
    spawn(`taskkill /pid ${serverProcess.pid} /T /F`, { shell: true });
  } else {
    serverProcess.kill("SIGTERM");
  }
}

afterAll(() => {
  killServer();
});

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms on port ${PORT}. Captured output so far:\n${capturedOutput}`);
}

describe("BYOK proxy statelessness", () => {
  it(
    "never writes the apiKey to server stdout/stderr during a proxy call",
    async () => {
      serverProcess = spawn(`pnpm exec next start -p ${PORT}`, {
        cwd: __dirname + "/..",
        shell: true,
        env: { ...process.env },
      });

      serverProcess.stdout?.on("data", (chunk) => {
        capturedOutput += chunk.toString();
      });
      serverProcess.stderr?.on("data", (chunk) => {
        capturedOutput += chunk.toString();
      });

      await waitForServer(`http://localhost:${PORT}/`, 30000);

      const res = await fetch(`http://localhost:${PORT}/api/proxy/anthropic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: `sk-ant-${MARKER}`,
          model: "claude-sonnet-5",
          messages: [{ role: "user", content: "hi" }],
        }),
      });

      // Proves we actually completed a real HTTP round trip against our own
      // freshly spawned server, not a stale process from a previous run —
      // the response status matters far less here than "we got one at all."
      expect(typeof res.status).toBe("number");

      // Give any async request logging a moment to flush before we check.
      await new Promise((r) => setTimeout(r, 1000));

      expect(capturedOutput.includes(MARKER)).toBe(false);
    },
    60000,
  );
});
