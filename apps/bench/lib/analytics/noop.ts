/**
 * Kiln ships with zero telemetry by default. Every call site in this app
 * imports `track` from here rather than wiring up a real analytics SDK —
 * if that ever changes, it should be an explicit, visible decision, not a
 * silently-added dependency.
 */
export function track(_event: string, _properties?: Record<string, unknown>): void {
  // Intentional no-op.
}
