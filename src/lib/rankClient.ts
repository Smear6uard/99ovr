"use client";

import { PERCENTILE_ENABLED } from "@/config/features";

/**
 * Submits the official daily build code and returns "Top N%" — or null on
 * any failure, flag-off, or KV-less deploy. Callers treat null as "feature
 * doesn't exist."
 */
export async function submitDailyRank(code: string): Promise<number | null> {
  if (!PERCENTILE_ENABLED) return null;
  try {
    const res = await fetch("/api/daily-rank", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { topPct?: number | null };
    return typeof data.topPct === "number" ? data.topPct : null;
  } catch {
    return null;
  }
}
