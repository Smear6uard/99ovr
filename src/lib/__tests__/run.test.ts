import { describe, expect, it } from "vitest";
import { nextAttempt } from "@/lib/run";
import { indexOfEntry } from "@/data/pool";
import { simSeedFor, simulate } from "@/lib/sim";
import type { BuildCode } from "@/lib/types";

describe("Run It Back", () => {
  it("keeps the build, increments attemptCounter, and rerolls sim variance", () => {
    const build: BuildCode = {
      v: 2, mode: "sandbox", seed: 99, position: "ALL", knowledge: false,
      picks: [
        indexOfEntry("jumpshot", "js-bigben"), indexOfEntry("handles", "h-boban"),
        indexOfEntry("finishing", "f-miller"), indexOfEntry("defense", "d-harden"),
        indexOfEntry("athleticism", "a-jokic"), indexOfEntry("iq", "iq-jr"),
        indexOfEntry("passing", "p-melo"), indexOfEntry("durability", "du-kawhi"),
      ], flaw: 0, attempt: 3, daily: 0,
    };
    const replay = nextAttempt(build);
    expect(replay.attempt).toBe(4);
    expect(replay.picks).toEqual(build.picks);
    expect(replay.flaw).toBe(build.flaw);
    expect(replay.seed).toBe(build.seed);
    expect(simSeedFor(replay)).not.toBe(simSeedFor(build));
    expect(simulate(replay)?.build.attempt).toBe(4);
  });
});
