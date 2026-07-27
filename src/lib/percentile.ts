import { dailyNumberFor, dailySeed } from "@/lib/daily";
import { FLAWS } from "@/data/flaws";
import { ROUNDS, minSpinsFor, spinsAffordable, tokensFor } from "@/lib/wheel";
import type { StealBuild, StealResult } from "@/lib/types";

/** Histogram entries live 3 days — long enough for "today" everywhere on Earth. */
export const HIST_TTL_SECONDS = 259_200;

export function histKey(dateStr: string): string {
  return `daily:${dateStr}`;
}

/**
 * Total-order daily score: OVR leads, gauntlet depth breaks ties.
 * Bounded bucket domain (~60 OVR values × 11 depths), no names, no PII.
 */
export function dailyScore(result: StealResult): number {
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
 * daily: right mode, right seed, attempt 0, every landing actually reachable
 * from today's wheel, and no more re-spins than the chosen flaw paid for.
 */
export function validateDailySubmission(build: StealBuild, todayStr: string): string | null {
  if (build.mode !== "daily") return "not a daily build";
  if (build.attempt !== 0) return "not an official attempt";
  if (build.daily !== dailyNumberFor(todayStr)) return "not today's daily";
  if (build.seed !== dailySeed(todayStr)) return "seed mismatch";
  if (build.flaw < 0 || build.flaw >= FLAWS.length) return "unknown flaw";

  const used = { team: 0, era: 0 };
  for (let round = 0; round < ROUNDS; round++) {
    const spins = minSpinsFor(build.seed, round, build.steals[round]?.[0] ?? -1);
    if (!spins) return "landing not available on today's wheel";
    used.team += spins.team;
    used.era += spins.era;
  }
  if (!spinsAffordable(used, tokensFor(FLAWS[build.flaw]))) return "more re-spins than the flaw paid for";
  return null;
}
