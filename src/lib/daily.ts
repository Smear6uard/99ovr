import { fnv1a } from "@/lib/rng";
import { gradeEmoji } from "@/lib/grade";
import type { StealResult } from "@/lib/types";
import { TIER_NAMES, tierFor } from "@/lib/tiers";

/** Daily #1 = launch day (UTC). */
export const LAUNCH_UTC = Date.UTC(2026, 6, 20);
const DAY_MS = 86_400_000;

export function utcDateString(d: Date = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dailyNumberFor(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Math.max(1, Math.round((Date.UTC(y, m - 1, d) - LAUNCH_UTC) / DAY_MS) + 1);
}

/** Everyone's shop + official run key on this. */
export function dailySeed(dateStr: string): number {
  return fnv1a(`99ovr-daily-${dateStr}`);
}

export function msToNextUtcMidnight(now: Date = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return next - now.getTime();
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** "🟢A 🟢A- 🟡B 🟢A 🔴D 🟡C+" — the six steal grades, in round order. */
export function gradeStrip(result: StealResult): string {
  return result.steals.map((steal) => `${gradeEmoji(steal.grade)}${steal.grade}`).join(" ");
}

export type DailyRank = { rank: number; total: number; initials?: string };

/**
 * The copy-paste block. Format is load-bearing — see daily.test.ts.
 * A leaderboard rank adds one line when known.
 */
export function formatDailyBlock(result: StealResult, dailyNo: number, rank?: DailyRank | null): string {
  const { fellAt, derived } = result;
  const outcome = fellAt === null ? "Beat all 10" : `Round ${fellAt}`;
  const tier = TIER_NAMES[tierFor(derived.ovr)].toUpperCase();
  const lines = [
    `99OVR Daily #${dailyNo}`,
    `${gradeStrip(result)} · ${derived.ovr} OVR ${tier} · ${outcome} ⟶ 99ovr.app`,
  ];
  if (rank && typeof rank.rank === "number" && typeof rank.total === "number") {
    lines.push(`🏆 ${rank.initials ? `${rank.initials} · ` : ""}#${rank.rank} of ${rank.total} today`);
  }
  return lines.join("\n");
}
