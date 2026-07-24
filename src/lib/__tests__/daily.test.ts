import { describe, expect, it } from "vitest";
import { dailyNumberFor, dailySeed, formatCountdown, formatDailyBlock, utcDateString } from "@/lib/daily";
import type { SimResult } from "@/lib/types";

function fakeResult(ovr: number, archetypeName: string, fellAt: number | null): SimResult {
  return {
    derived: { ovr },
    archetype: { name: archetypeName },
    fellAt,
  } as unknown as SimResult;
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

describe("emoji block", () => {
  it("matches the spec format exactly for a Round 9 loss", () => {
    const block = formatDailyBlock(fakeResult(87, "Two-Way Demon", 9), 14);
    expect(block).toBe(
      "99OVR Daily #14\n" +
        "🏀 87 OVR · Superstar\n" +
        "🧬 Two-Way Demon\n" +
        "🏀 Round 9 Boss: LeBron\n" +
        "🟩🟩🟩🟩🟩🟩🟩🟩🟥⬛\n" +
        "99ovr.app/daily"
    );
  });

  it("renders a first-rung exit and a full clear correctly", () => {
    expect(formatDailyBlock(fakeResult(48, "10-Day Contract", 1), 3)).toContain("🟥⬛⬛⬛⬛⬛⬛⬛⬛⬛");
    expect(formatDailyBlock(fakeResult(48, "10-Day Contract", 1), 3)).toContain("Round 1 Boss: Boban");
    const clear = formatDailyBlock(fakeResult(93, "Two-Way Demon", null), 20);
    expect(clear).toContain("🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩");
    expect(clear).toContain("🏆 Beat all 10 bosses");
  });
});

describe("countdown", () => {
  it("formats HH:MM:SS", () => {
    expect(formatCountdown(7 * 3600_000 + 23 * 60_000 + 11_000)).toBe("07:23:11");
    expect(formatCountdown(0)).toBe("00:00:00");
    expect(formatCountdown(-5)).toBe("00:00:00");
  });
});
