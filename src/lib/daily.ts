import { fnv1a } from "@/lib/rng";
import type { SimResult } from "@/lib/types";
import { GAUNTLET } from "@/data/gauntlet";

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

/**
 * The Wordle-style copy-paste block. Format is load-bearing — see
 * daily.test.ts. `topPct` (percentile v1.1) adds one line when known.
 */
export function formatDailyBlock(result: SimResult, dailyNo: number, topPct?: number | null): string {
  const { fellAt, derived, archetype } = result;
  const squares =
    fellAt === null
      ? "🟩".repeat(10)
      : "🟩".repeat(fellAt - 1) + "🟥" + "⬛".repeat(10 - fellAt);
  const ladderLine =
    fellAt === null
      ? "🪜 Cleared all 10 rungs"
      : `🪜 Fell at Rung ${fellAt} (${GAUNTLET[fellAt - 1].shortName})`;
  const lines = [
    `99OVR Daily #${dailyNo}`,
    `🏀 ${derived.ovr} OVR · ${archetype.name}`,
    ladderLine,
    squares,
  ];
  if (typeof topPct === "number") lines.push(`📊 Top ${topPct}% today`);
  lines.push("99ovr.app/daily");
  return lines.join("\n");
}
