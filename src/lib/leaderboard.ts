import { dailyNumberFor, dailySeed, dailyTargetFor } from "@/lib/daily";
import { fnv1a } from "@/lib/rng";
import { validateSteals } from "@/lib/steal";
import type { StealBuild, StealResult } from "@/lib/types";

/** Leaderboard keys live 3 days — long enough for "today" everywhere on Earth. */
export const LB_TTL_SECONDS = 259_200;
/** Arcade board depth. */
export const LB_TOP_N = 50;
/** Submissions allowed per IP per UTC day — practice re-submits stay cheap to block. */
export const LB_RATE_LIMIT = 20;

export function lbKey(dateStr: string): string {
  return `daily:lb:${dateStr}`;
}

export function rateKey(dateStr: string, ip: string): string {
  return `daily:rl:${dateStr}:${ip}`;
}

/**
 * Total-order daily score: OVR leads, gauntlet depth breaks ties.
 * Derived server-side from a re-sim — never taken from the client.
 */
export function dailyScore(result: StealResult): number {
  const roundsWon = result.fellAt === null ? 10 : result.fellAt - 1;
  return result.derived.ovr * 100 + roundsWon;
}

export function scoreParts(score: number): { ovr: number; roundsWon: number } {
  return { ovr: Math.floor(score / 100), roundsWon: score % 100 };
}

/* ------------------------------------------------------------------ */
/* Initials                                                            */
/* ------------------------------------------------------------------ */

/** Arcade-cabinet blocklist for 3-letter tags. */
const BLOCKED = new Set([
  "ASS", "CNT", "COC", "COK", "CUM", "CUN", "DIC", "DIK", "DIX", "FAG", "FAP",
  "FCK", "FKU", "FUC", "FUK", "FUX", "FGT", "GAY", "HOR", "JAP", "JIZ", "KKK",
  "KYS", "NGA", "NGR", "NIG", "NGG", "PIS", "PSS", "SEX", "SHT", "SLT", "SPK",
  "TIT", "TWT", "VAG", "WOP", "XXX",
]);

/** Uppercases and validates a 3-letter arcade tag; null if unusable. */
export function cleanInitials(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const initials = raw.toUpperCase().trim();
  if (!/^[A-Z]{3}$/.test(initials)) return null;
  if (BLOCKED.has(initials)) return null;
  return initials;
}

/**
 * Sorted-set member: initials plus an ip/code fingerprint, so a resubmission
 * of the same run from the same place updates in place instead of stacking.
 * No PII stored — the fingerprint is a one-way 32-bit hash.
 */
export function lbMember(initials: string, ip: string, code: string): string {
  return `${initials}#${(fnv1a(`${ip}|${code}`) >>> 0).toString(36)}`;
}

export function memberInitials(member: string): string {
  return member.split("#")[0] ?? "???";
}

/* ------------------------------------------------------------------ */
/* Submission gatekeeping                                              */
/* ------------------------------------------------------------------ */

/**
 * Server-side gatekeeping for a submitted build code. The score is never taken
 * from the client — only the code, which must be today's official daily:
 * v4, daily mode, attempt 0, today's seed, every landing actually reachable
 * from today's wheel within the run's re-spins (validateSteals covers both).
 */
export function validateDailySubmission(build: StealBuild, todayStr: string): string | null {
  // v4 stays accepted through the v5 cutover — stale clients submit v4 codes
  if ((build.v !== 4 && build.v !== 5) || build.mode !== "daily") return "not a daily build";
  if (build.attempt !== 0) return "not an official attempt";
  if (build.daily !== dailyNumberFor(todayStr)) return "not today's daily";
  if (build.seed !== dailySeed(todayStr)) return "seed mismatch";
  if ((build.target ?? "ALL") !== dailyTargetFor(todayStr)) return "wrong daily target";
  if (build.flaw !== -1) return "daily has no flaw";
  if (!validateSteals(build)) return "illegal run";
  return null;
}
