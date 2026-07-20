import { PERCENTILE_ENABLED } from "@/config/features";
import { utcDateString } from "@/lib/daily";
import { decodeBuild } from "@/lib/encode";
import { kvAvailable, kvPipeline } from "@/lib/kv";
import { dailyScore, HIST_TTL_SECONDS, histKey, topPercentFrom, validateDailySubmission } from "@/lib/percentile";
import { simulate } from "@/lib/sim";

export const runtime = "edge";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

/**
 * Daily percentile (v1.1). The client POSTs its build *code*, never a score:
 * the sim is deterministic, so we re-run it here and derive the score
 * ourselves. The histogram is per-day, fixed-bucket, and PII-free.
 * Flag off or KV missing → {topPct: null} and the UI renders without it.
 */
export async function POST(req: Request) {
  if (!PERCENTILE_ENABLED) return json({ topPct: null });

  let code: unknown;
  try {
    ({ code } = (await req.json()) as { code?: unknown });
  } catch {
    return json({ error: "bad body" }, 400);
  }
  if (typeof code !== "string" || code.length > 64) return json({ error: "bad code" }, 400);

  const build = decodeBuild(code);
  if (!build) return json({ error: "bad code" }, 400);

  const today = utcDateString();
  const invalid = validateDailySubmission(build, today);
  if (invalid) return json({ error: invalid }, 400);

  const result = simulate(build);
  if (!result) return json({ error: "bad build" }, 400);

  if (!kvAvailable()) return json({ topPct: null });

  const key = histKey(today);
  const score = dailyScore(result);
  const out = await kvPipeline([
    ["HINCRBY", key, String(score), "1"],
    ["EXPIRE", key, String(HIST_TTL_SECONDS)],
    ["HGETALL", key],
  ]);
  if (!out) return json({ topPct: null });

  const flat = out[2];
  const hist: Record<string, number> = {};
  if (Array.isArray(flat)) {
    for (let i = 0; i + 1 < flat.length; i += 2) {
      hist[String(flat[i])] = Number(flat[i + 1]);
    }
  }
  return json({ topPct: topPercentFrom(hist, score) });
}
