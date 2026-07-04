/**
 * The actual implementation lives in @kiln/sandbox (packages/sandbox-runtime)
 * so every consumer of the sandboxing primitive — this template and any
 * future one — shares the exact same security-critical code path. This file
 * re-exports it under the path build.md §7 documents for discoverability.
 */
export { SandboxedArtifact } from "@kiln/sandbox";
export type { SandboxedArtifactProps } from "@kiln/sandbox";
