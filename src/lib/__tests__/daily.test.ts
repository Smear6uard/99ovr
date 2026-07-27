import { describe, expect, it } from "vitest";
import { dailyNumberFor, dailySeed, formatCountdown, formatDailyBlock, gradeStrip, utcDateString } from "@/lib/daily";
import type { Grade, StealResult } from "@/lib/types";

function fakeResult(ovr: number, fellAt: number | null, grades: Grade[]): StealResult {
  return {
    derived: { ovr },
    fellAt,
    steals: grades.map((grade) => ({ grade })),
  } as unknown as StealResult;
}

describe("daily numbering", () => {
  it("launch day is Daily #1 and increments per UTC day", () => {
    expect(dailyNumberFor("2026-07-20")).toBe(1);
    expect(dailyNumberFor("2026-07-21")).toBe(2);
    expect(dailyNumberFor("2026-08-02")).toBe(14);
  });

  it("daily seed is stable per date and differs across dates", () => {
    expect(dailySeed("2026-07-20")).toBe(dailySeed("2026-07-20"));
    expect(dailySeed("2026-07-20")).not.toBe(dailySeed("2026-07-21"));
  });

  it("utcDateString formats as YYYY-MM-DD", () => {
    expect(utcDateString(new Date(Date.UTC(2026, 6, 20, 23, 59)))).toBe("2026-07-20");
  });
});

describe("grade strip", () => {
  it("colors A green, B and C yellow, D and F red", () => {
    expect(gradeStrip(fakeResult(88, 9, ["A", "A-", "B", "A", "D", "C+"]))).toBe("🟢A 🟢A- 🟡B 🟢A 🔴D 🟡C+");
  });
});

describe("emoji block", () => {
  it("matches the spec format exactly for a Round 9 loss", () => {
    const block = formatDailyBlock(fakeResult(88, 9, ["A", "A-", "B", "A", "D", "C+"]), 372);
    expect(block).toBe(
      "99OVR Daily #372\n" + "🟢A 🟢A- 🟡B 🟢A 🔴D 🟡C+ · 88 OVR SUPERSTAR · Round 9 ⟶ 99ovr.app"
    );
  });

  it("renders a first-round exit and a full clear correctly", () => {
    const out = formatDailyBlock(fakeResult(48, 1, ["F", "D", "F", "D+", "F", "D"]), 3);
    expect(out).toContain("Round 1");
    expect(out).toContain("48 OVR BENCH WARMER");

    const clear = formatDailyBlock(fakeResult(93, null, ["A+", "A", "A", "A+", "A-", "A"]), 20);
    expect(clear).toContain("Beat all 10");
    expect(clear).toContain("93 OVR HOF");
    expect(clear).not.toContain("Round");
  });
});

describe("countdown", () => {
  it("formats HH:MM:SS", () => {
    expect(formatCountdown(7 * 3600_000 + 23 * 60_000 + 11_000)).toBe("07:23:11");
    expect(formatCountdown(0)).toBe("00:00:00");
    expect(formatCountdown(-5)).toBe("00:00:00");
  });
});
