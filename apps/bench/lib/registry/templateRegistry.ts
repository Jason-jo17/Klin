import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { TemplateManifestSchema, type TemplateManifest } from "@kiln/schema";

const TEMPLATES_DIR = join(process.cwd(), "..", "..", "templates");

let cache: TemplateManifest[] | null = null;

/**
 * Glob-reads every templates/*\/kiln.manifest.json and validates it against
 * TemplateManifestSchema. Throws (failing the build) if any manifest is
 * invalid or missing a required field — this is the mechanism that keeps
 * the gallery honest as contributors add templates (build.md §5).
 */
export function getAllTemplates(): TemplateManifest[] {
  if (cache) return cache;

  const dirs = readdirSync(TEMPLATES_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
  const manifests: TemplateManifest[] = [];

  for (const dir of dirs) {
    const manifestPath = join(TEMPLATES_DIR, dir.name, "kiln.manifest.json");
    if (!existsSync(manifestPath)) continue;

    const raw = JSON.parse(readFileSync(manifestPath, "utf-8"));
    const parsed = TemplateManifestSchema.parse(raw); // throws on invalid manifest — fails the build intentionally

    if (parsed.id !== dir.name) {
      throw new Error(`kiln.manifest.json id "${parsed.id}" does not match directory name "${dir.name}"`);
    }

    manifests.push(parsed);
  }

  cache = manifests;
  return manifests;
}

export function getTemplate(id: string): TemplateManifest | undefined {
  return getAllTemplates().find((t) => t.id === id);
}

export function getTemplatesByStrategy(strategy: TemplateManifest["strategy"]): TemplateManifest[] {
  return getAllTemplates().filter((t) => t.strategy === strategy);
}
