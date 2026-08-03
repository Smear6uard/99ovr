import { describe, expect, it } from "vitest";
import { GAUNTLET } from "@/data/gauntlet";
import {
  GAUNTLET_VARIANCE_CAP,
  gauntletWinProbability,
  runGauntlet,
} from "@/lib/sim";

const RUNS_PER_BAND = 5_000;

type Calibration = {
  clearRate: number;
  beforeRound8Rate: number;
  medianExit: number;
};

function calibrate(lo: number, hi: number, seedSalt: number): Calibration {
  const exits: number[] = [];
  let clears = 0;
  let beforeRound8 = 0;
  for (let run = 0; run < RUNS_PER_BAND; run++) {
    const ovr = lo + (run % (hi - lo + 1));
    const seed = (Math.imul(run + 1, 0x9e3779b1) ^ seedSalt) >>> 0;
    const result = runGauntlet(
      { playerPower: ovr, fatigueMod: 0, durability: 75 },
      null,
      seed,
      GAUNTLET
    );
    const exit = result.fellAt ?? 11;
    exits.push(exit);
    if (result.fellAt === null) clears++;
    if (result.fellAt !== null && result.fellAt < 8) beforeRound8++;
  }
  exits.sort((a, b) => a - b);
  return {
    clearRate: clears / RUNS_PER_BAND,
    beforeRound8Rate: beforeRound8 / RUNS_PER_BAND,
    medianExit: exits[Math.floor(exits.length / 2)],
  };
}

describe("gauntlet Monte Carlo calibration", () => {
  it("locks the published OVR-band outcomes over 5k seeded runs per band", () => {
    const goat = calibrate(96, 99, 0x9600);
    expect(goat.clearRate).toBeGreaterThanOrEqual(0.6);
    expect(goat.beforeRound8Rate).toBeLessThan(0.02);

    const hof = calibrate(90, 95, 0x9000);
    expect(hof.clearRate).toBeGreaterThanOrEqual(0.2);
    expect(hof.clearRate).toBeLessThanOrEqual(0.35);
    expect(hof.medianExit).toBeGreaterThanOrEqual(9);
    expect(hof.medianExit).toBeLessThanOrEqual(10);

    const superstar = calibrate(83, 89, 0x8300);
    expect(superstar.clearRate).toBeLessThan(0.05);
    expect(superstar.medianExit).toBeGreaterThanOrEqual(6);
    expect(superstar.medianExit).toBeLessThanOrEqual(9);

    const middle = calibrate(70, 82, 0x7000);
    expect(middle.medianExit).toBeGreaterThanOrEqual(4);
    expect(middle.medianExit).toBeLessThanOrEqual(7);

    const basement = calibrate(40, 59, 0x5900);
    expect(basement.medianExit).toBeLessThanOrEqual(3);
  });

  it("is pointwise monotone and couples every higher OVR to survive at least as far", () => {
    expect(gauntletWinProbability(96, 93, -GAUNTLET_VARIANCE_CAP, -10)).toBeGreaterThanOrEqual(0.85);

    for (const boss of GAUNTLET) {
      for (const variance of [-GAUNTLET_VARIANCE_CAP, 0, GAUNTLET_VARIANCE_CAP]) {
        let previous = 0;
        for (let ovr = 40; ovr <= 99; ovr++) {
          const probability = gauntletWinProbability(ovr, boss.power, variance);
          expect(probability).toBeGreaterThanOrEqual(previous);
          previous = probability;
        }
      }
    }

    const ovrs = [55, 70, 83, 90, 96, 99];
    for (let seed = 0; seed < RUNS_PER_BAND; seed++) {
      let previousRounds = -1;
      for (const ovr of ovrs) {
        const result = runGauntlet(
          { playerPower: ovr, fatigueMod: 0, durability: 75 },
          null,
          seed,
          GAUNTLET
        );
        const roundsWon = result.fellAt === null ? 10 : result.fellAt - 1;
        expect(roundsWon, `seed ${seed}, OVR ${ovr}`).toBeGreaterThanOrEqual(previousRounds);
        previousRounds = roundsWon;
      }
    }
  });
});
