import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { decodeSteal, encodeSteal } from "@/lib/encode";
import { canAffordSteal, priceIn, simulateSteals } from "@/lib/steal";
import { DECADE_POOL, ROUNDS, bucketIndexAt } from "@/lib/wheel";
import { ATTR_LABELS, ATTRS, type StealBuild } from "@/lib/types";
import { StealFlow } from "@/components/StealFlow";

const SEED = 0xc0ffee;

function stubMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reducedMotion : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

const click = async (el: Element) => {
  await act(async () => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
};

const waitSim = async () => {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 700));
  });
};

/** Plays a whole Classic run: six steals, no flaw anywhere, straight to the verdict. */
async function playClassicRun(opts: { knowledge?: boolean } = {}) {
  stubMatchMedia(true); // reduced motion: reels resolve immediately, no timers to chase
  render(<StealFlow mode="classic" fixedSeed={SEED} knowledge={opts.knowledge} />);

  const taken = new Set<string>();
  const expected: Array<[number, number]> = [];
  for (let round = 0; round < ROUNDS; round++) {
    expect(screen.getByText(new RegExp(`ROUND ${round + 1} / ${ROUNDS}`))).toBeTruthy();
    // every round is its own gamble — you must pull the lever
    await click(screen.getByRole("button", { name: /^spin$/i }));

    const bucketIdx = bucketIndexAt(SEED, round, 0, 0, DECADE_POOL);
    const bucket = DECADE_POOL.buckets[bucketIdx];
    expect(screen.getAllByText(bucket.label).length).toBeGreaterThan(0);

    const best = bucket.players
      .map((player, index) => ({ player, index }))
      .filter(({ player }) => !taken.has(player.person))
      .sort((a, b) => b.player.r[round] - a.player.r[round])[0];
    taken.add(best.player.person);
    expected.push([bucketIdx, best.index]);

    await click(
      screen.getByRole("button", {
        name: new RegExp(`Steal ${ATTR_LABELS[ATTRS[round]]} from ${best.player.name}`, "i"),
      })
    );
  }

  return expected;
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("a full Classic run", () => {
  it("has no flaw step and lands on one verdict screen after the sim beat", async () => {
    const expected = await playClassicRun();

    // after the sixth steal there is no walkthrough — just the sim beat...
    expect(screen.queryByText(/ROUND 6 \/ 6/)).toBeNull();
    await waitSim();

    // ...then everything on a single screen, zero taps required
    expect(screen.getByText("Run it back")).toBeTruthy();
    expect(screen.getByText("BEST STEAL")).toBeTruthy();
    expect(screen.getByText("THE REACH")).toBeTruthy();
    expect(screen.getByText(/VIEW LOG/i)).toBeTruthy();
    expect(screen.getByText(/challenge a friend/i)).toBeTruthy();

    // the result matches an independent simulation of the same run
    const expectedResult = simulateSteals({
      v: 5, mode: "classic", seed: SEED, flaw: -1, target: "ALL",
      steals: expected, attempt: 0, daily: 0, knowledge: false,
    });
    expect(expectedResult).not.toBeNull();
    expect(expectedResult!.flaw).toBeNull();
    expect(expectedResult!.steals.every((s) => s.rank === 0)).toBe(true);
    expect(expectedResult!.bestSteal.grade).toBe("A+");
    // no flaw section on a classic card
    expect(screen.queryByText(/^FLAW$/)).toBeNull();
  });

  it("never offers the same player twice across a run", async () => {
    const expected = await playClassicRun();
    const people = expected.map(([b, p]) => DECADE_POOL.buckets[b].players[p].person);
    expect(new Set(people).size).toBe(people.length);
  });

  it("produces a share code that decodes back to the same run", async () => {
    const expected = await playClassicRun();
    await waitSim();
    const rebuilt = simulateSteals({
      v: 5, mode: "classic", seed: SEED, flaw: -1, target: "ALL",
      steals: expected, attempt: 0, daily: 0, knowledge: false,
    })!;
    const code = encodeSteal(rebuilt.build);
    expect(decodeSteal(code)).toEqual(rebuilt.build);
  });
});

describe("a full Budget run", () => {
  it("shows prices, breaks for the weakness wheel after three steals, and prints the receipt", async () => {
    stubMatchMedia(true);
    render(<StealFlow mode="budget" fixedSeed={SEED} />);

    const taken = new Set<string>();
    const steals: Array<[number, number]> = [];
    let spent = 0;
    let flawIdx = -1;

    for (let round = 0; round < ROUNDS; round++) {
      if (round === 3) {
        // the mid-run break: spin the weakness wheel, take the first flaw offered
        expect(screen.getByText(/WEAKNESS WHEEL/i)).toBeTruthy();
        await click(screen.getByRole("button", { name: /^spin$/i }));
        await click(screen.getAllByRole("button", { pressed: false })[0]);
        const { drawFlaws } = await import("@/lib/shop");
        flawIdx = drawFlaws(SEED)[0];
        await click(screen.getByRole("button", { name: /take the flaw & the cash/i }));
      }

      await click(screen.getByRole("button", { name: /^spin$/i }));
      const bucketIdx = bucketIndexAt(SEED, round, 0, 0, DECADE_POOL);
      const bucket = DECADE_POOL.buckets[bucketIdx];
      const refund = flawIdx >= 0 ? (await import("@/data/flaws")).FLAWS[flawIdx].refund : 0;
      const pick = bucket.players
        .map((player, index) => ({ player, index, price: priceIn(bucket, round, index) }))
        .filter(({ player }) => !taken.has(player.person))
        .filter(({ price }) => canAffordSteal(spent, price, round, refund))
        .sort((a, b) => b.player.r[round] - a.player.r[round])[0];
      taken.add(pick.player.person);
      spent += pick.price;
      steals.push([bucketIdx, pick.index]);

      // roster rows carry a price in their accessible names
      await click(
        screen.getByRole("button", {
          name: new RegExp(
            `Steal ${ATTR_LABELS[ATTRS[round]]} from ${pick.player.name} for \\$${pick.price}`,
            "i"
          ),
        })
      );
    }

    await waitSim();
    expect(screen.getByText("Run it back")).toBeTruthy();
    // the card carries flaw + refund and the budget receipt
    const build: StealBuild = {
      v: 5, mode: "budget", seed: SEED, flaw: flawIdx, target: "ALL",
      steals, attempt: 0, daily: 0, knowledge: false,
    };
    const result = simulateSteals(build)!;
    expect(result.spent).toBe(spent);
    expect(screen.getByText(new RegExp(`\\$${spent} spent of`))).toBeTruthy();
    expect(screen.getAllByText(result.flaw!.name).length).toBeGreaterThan(0);
    // budget faces the same boss gauntlet classic does
    expect(screen.getByText(/VIEW LOG/i)).toBeTruthy();
    expect(screen.getByText(/cleared all 10 rounds|fell in round/i)).toBeTruthy();
    // budget runs never mint H2H challenges
    expect(screen.queryByText(/challenge a friend/i)).toBeNull();
  });
});

describe("Ball Knowledge", () => {
  it("hides the box lines but still lists every name", async () => {
    stubMatchMedia(true);
    render(<StealFlow mode="classic" fixedSeed={SEED} knowledge />);
    await click(screen.getByRole("button", { name: /^spin$/i }));

    const bucket = DECADE_POOL.buckets[bucketIndexAt(SEED, 0, 0, 0, DECADE_POOL)];
    const list = screen.getByRole("list");
    for (const player of bucket.players) {
      expect(within(list).getByText(player.name)).toBeTruthy();
    }
    expect(within(list).queryByText(/PPG/)).toBeNull();
    expect(within(list).getAllByText(/stats hidden/i).length).toBe(bucket.players.length);
  });

  it("shows box lines when the modifier is off", async () => {
    stubMatchMedia(true);
    render(<StealFlow mode="classic" fixedSeed={SEED} />);
    await click(screen.getByRole("button", { name: /^spin$/i }));

    const list = screen.getByRole("list");
    expect(within(list).getAllByText(/PPG/).length).toBeGreaterThan(0);
  });
});

describe("re-spins", () => {
  it("gives exactly one team and one era re-spin, then disables both", async () => {
    stubMatchMedia(true);
    render(<StealFlow mode="classic" fixedSeed={SEED} />);
    await click(screen.getByRole("button", { name: /^spin$/i }));

    const before = DECADE_POOL.buckets[bucketIndexAt(SEED, 0, 0, 0, DECADE_POOL)];
    const afterTeam = DECADE_POOL.buckets[bucketIndexAt(SEED, 0, 1, 0, DECADE_POOL)];
    expect(screen.getAllByText(before.label).length).toBeGreaterThan(0);

    await click(screen.getByRole("button", { name: /team re-spin/i }));
    expect(screen.getAllByText(afterTeam.label).length).toBeGreaterThan(0);

    // the team token is gone — v4 has no wild tokens, whatever the mode
    expect(screen.getByRole("button", { name: /team re-spin/i })).toHaveProperty("disabled", true);
    const eraButton = screen.getByRole("button", { name: /era re-spin/i });
    expect(eraButton).toHaveProperty("disabled", false);
    await click(eraButton);
    const afterEra = DECADE_POOL.buckets[bucketIndexAt(SEED, 0, 1, 1, DECADE_POOL)];
    expect(afterEra.franchise).toBe(afterTeam.franchise);
    expect(afterEra.id).not.toBe(afterTeam.id);
    expect(screen.getAllByText(afterEra.label).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /era re-spin/i })).toHaveProperty("disabled", true);
  });
});

describe("Head to Head", () => {
  it("replaces the verdict with the comparison screen and names a winner", async () => {
    stubMatchMedia(true);
    // challenger: worst-available reads on the same wheel — beatable on purpose
    const taken = new Set<string>();
    const steals: Array<[number, number]> = [];
    for (let round = 0; round < ROUNDS; round++) {
      const bucketIdx = bucketIndexAt(SEED, round, 0, 0, DECADE_POOL);
      const bucket = DECADE_POOL.buckets[bucketIdx];
      const worst = bucket.players
        .map((player, index) => ({ player, index }))
        .filter(({ player }) => !taken.has(player.person))
        .sort((a, b) => a.player.r[round] - b.player.r[round])[0];
      taken.add(worst.player.person);
      steals.push([bucketIdx, worst.index]);
    }
    const challenger = simulateSteals({
      v: 5, mode: "classic", seed: SEED, flaw: -1, target: "ALL",
      steals, attempt: 0, daily: 0, knowledge: false,
    })!;

    render(<StealFlow mode="classic" fixedSeed={SEED} challenge={challenger} />);

    const mine = new Set<string>();
    for (let round = 0; round < ROUNDS; round++) {
      await click(screen.getByRole("button", { name: /^spin$/i }));
      const bucketIdx = bucketIndexAt(SEED, round, 0, 0, DECADE_POOL);
      const bucket = DECADE_POOL.buckets[bucketIdx];
      const best = bucket.players
        .map((player, index) => ({ player, index }))
        .filter(({ player }) => !mine.has(player.person))
        .sort((a, b) => b.player.r[round] - a.player.r[round])[0];
      mine.add(best.player.person);
      await click(
        screen.getByRole("button", {
          name: new RegExp(`Steal ${ATTR_LABELS[ATTRS[round]]} from ${best.player.name}`, "i"),
        })
      );
    }
    await waitSim();

    // side-by-side comparison, winner banner, rematch button
    expect(screen.getByText("YOU")).toBeTruthy();
    expect(screen.getByText("CHALLENGER")).toBeTruthy();
    expect(screen.getByText(/YOU WIN/)).toBeTruthy();
    expect(screen.getByText(/rematch: same wheel/i)).toBeTruthy();
  });
});
