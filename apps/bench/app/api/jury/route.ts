import { runJury } from "@kiln/jury";
import { getTemplate } from "../../../lib/registry/templateRegistry";
import { checkRateLimit, clientKeyFromRequest, rateLimitResponse } from "../../../lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Drives a real Jury run against this same running Bench instance (Playwright
 * navigates to `${origin}${manifest.entryRoute}` and interacts with the live
 * page — see @kiln/jury's DOM conventions). Requires Playwright's Chromium
 * to be installed (`pnpm --filter @kiln/jury exec playwright install
 * chromium`) and a resolvable API key: either the requester has a BYOK key
 * saved in their browser (passed through by TemplatePlayer), or this server
 * process has the matching provider env var set — Playwright's headless
 * browser has no access to the requester's IndexedDB, so a BYOK-only key
 * with no server-side fallback will make every run fail at generation.
 */
export async function POST(req: Request) {
  // Stricter than the generation routes — each run launches a full headless
  // browser and fires 6 model calls (1 real + the 5-prompt adversarial
  // battery), so this is meaningfully more expensive per request.
  const rateLimit = checkRateLimit(`jury:${clientKeyFromRequest(req)}`, 5, 5 * 60_000);
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  let body: { templateId?: string; prompt?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { templateId, prompt } = body;
  if (!templateId || !prompt) {
    return Response.json({ error: "templateId and prompt are required." }, { status: 400 });
  }

  const manifest = getTemplate(templateId);
  if (!manifest) {
    return Response.json({ error: `Unknown template: ${templateId}` }, { status: 404 });
  }

  try {
    const result = await runJury({ manifest, prompt, baseUrl: new URL(req.url).origin });
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Jury run failed.";
    return Response.json(
      {
        error: `Jury run could not complete: ${message}`,
        hint: "Make sure Playwright's Chromium is installed and a provider API key is resolvable server-side (or saved in this browser).",
      },
      { status: 500 },
    );
  }
}
