import { dailyNumberFor, dailySeed } from "@/lib/daily";
import { reachablePicks } from "@/lib/shop";
import { SLOTS, type BuildCode, type SimResult } from "@/lib/types";

/** Histogram entries live 3 days — long enough for "today" everywhere on Earth. */
export const HIST_TTL_SECONDS = 259_200;

export function histKey(dateStr: string): string {
  return `daily:${dateStr}`;
}

/**
 * Total-order daily score: OVR leads, gauntlet depth breaks ties.
 * Bounded bucket domain (~60 OVR values × 11 depths), no names, no PII.
 */
export function dailyScore(result: SimResult): number {
  const rungsWon = result.fellAt === null ? 10 : result.fellAt - 1;
  return result.derived.ovr * 100 + rungsWon;
}

/**
 * "Top N% today" from the histogram (which already includes this run).
 * Best score of the day reads Top 1%, never Top 0%.
 */
export function topPercentFrom(hist: Record<string, number>, score: number): number | null {
  let total = 0;
  let greater = 0;
  for (const [field, count] of Object.entries(hist)) {
    const s = Number.parseInt(field, 10);
    const n = Number(count);
    if (!Number.isFinite(s) || !Number.isFinite(n) || n < 0) continue;
    total += n;
    if (s > score) greater += n;
  }
  if (total <= 0) return null;
  return Math.max(1, Math.round((greater / total) * 100));
}

/**
 * Server-side gatekeeping for a submitted build code. The score is never
 * taken from the client — only the code, which must be today's official
 * daily: right mode, right seed, attempt 0, and every pick actually
 * obtainable from today's shop draw (including the one re-roll).
 */
export function validateDailySubmission(build: BuildCode, todayStr: string): string | null {
  if (build.mode !== "daily") return "not a daily build";
  if (build.attempt !== 0) return "not an official attempt";
  if (build.daily !== dailyNumberFor(todayStr)) return "not today's daily";
  if (build.seed !== dailySeed(todayStr)) return "seed mismatch";
  for (let i = 0; i < SLOTS.length; i++) {
    if (!reachablePicks(build.seed, SLOTS[i]).includes(build.picks[i])) {
      return "pick not available in today's shop";
    }
  }
  return null;
}
