#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TemplateManifestSchema } from "@kiln/schema";
import type { TemplateManifest } from "@kiln/schema";
import { runJury } from "./runner";
import type { JuryRunResult } from "./types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");
const TEMPLATES_DIR = join(REPO_ROOT, "templates");
const RUNS_DIR = join(REPO_ROOT, "jury-runs");

function loadManifests(): TemplateManifest[] {
  const dirs = readdirSync(TEMPLATES_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
  const manifests: TemplateManifest[] = [];
  for (const dir of dirs) {
    const manifestPath = join(TEMPLATES_DIR, dir.name, "kiln.manifest.json");
    if (!existsSync(manifestPath)) continue;
    const raw = JSON.parse(readFileSync(manifestPath, "utf-8"));
    const parsed = TemplateManifestSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`Invalid manifest for ${dir.name}:`, parsed.error.flatten());
      process.exitCode = 1;
      continue;
    }
    if (parsed.data.id !== dir.name) {
      console.error(`Manifest id "${parsed.data.id}" does not match directory name "${dir.name}"`);
      process.exitCode = 1;
      continue;
    }
    manifests.push(parsed.data);
  }
  return manifests;
}

function loadSuite(suitePath?: string): Record<string, string[]> {
  const resolved = suitePath ? join(process.cwd(), suitePath) : join(__dirname, "..", "suites", "fixed-prompts.json");
  return JSON.parse(readFileSync(resolved, "utf-8"));
}

function persistResult(result: JuryRunResult) {
  mkdirSync(RUNS_DIR, { recursive: true });
  writeFileSync(join(RUNS_DIR, `${result.runId}.json`), JSON.stringify(result, null, 2));
  writeFileSync(join(RUNS_DIR, `latest-${result.templateId}.json`), JSON.stringify(result, null, 2));
}

function parseFlags(argv: string[]): Record<string, string | boolean> {
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg?.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      flags[key] = next;
      i++;
    } else {
      flags[key] = true;
    }
  }
  return flags;
}

async function runCommand(flags: Record<string, string | boolean>) {
  const baseUrl = typeof flags.baseUrl === "string" ? flags.baseUrl : "http://localhost:3000";
  const manifests = loadManifests();
  const targets = flags.all
    ? manifests
    : manifests.filter((m) => m.id === flags.template);

  if (targets.length === 0) {
    console.error("No matching template(s) found. Use --template <id> or --all.");
    process.exitCode = 1;
    return;
  }

  const suite = typeof flags.suite === "string" || flags.all ? loadSuite(typeof flags.suite === "string" ? flags.suite : undefined) : null;

  let anyFailed = false;
  for (const manifest of targets) {
    const prompts = typeof flags.prompt === "string" ? [flags.prompt] : suite?.[manifest.id] ?? suite?.default ?? [];
    for (const prompt of prompts) {
      const result = await runJury({ manifest, prompt, baseUrl });
      persistResult(result);
      const status = result.passed ? "PASS" : "FAIL";
      console.log(
        `[${status}] ${manifest.id} :: "${prompt}" — a11y=${result.scores.accessibility} tokens=${result.scores.tokenAdherence} structural=${result.scores.structuralValidity} safety=${result.scores.safety} latency=${result.scores.latency} (${result.latencyMs}ms) runId=${result.runId}`,
      );
      if (!result.passed) {
        anyFailed = true;
        console.error(`  failed dimensions: ${result.thresholdFailures.join(", ")}`);
      }
    }
  }

  if (anyFailed) process.exitCode = 1;
}

function reportCommand(flags: Record<string, string | boolean>) {
  const runId = flags.runId;
  if (typeof runId !== "string") {
    console.error("--runId <id> is required for `jury report`");
    process.exitCode = 1;
    return;
  }
  const path = join(RUNS_DIR, `${runId}.json`);
  if (!existsSync(path)) {
    console.error(`No run found for runId "${runId}"`);
    process.exitCode = 1;
    return;
  }
  const result: JuryRunResult = JSON.parse(readFileSync(path, "utf-8"));
  if (flags.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result);
  }
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const flags = parseFlags(rest);

  if (command === "run") {
    await runCommand(flags);
  } else if (command === "report") {
    reportCommand(flags);
  } else {
    console.log("Usage:\n  jury run --template <id> --prompt \"...\"\n  jury run --all --suite fixed-prompts.json\n  jury report --runId <id> --format json");
    process.exitCode = command ? 1 : 0;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
