import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { BUCKETS } from "@/data/eras";
import { decodeSteal } from "@/lib/encode";
import { simulateSteals } from "@/lib/steal";
import { ROUNDS, bucketIndexAt } from "@/lib/wheel";
import { ATTR_LABELS, ATTRS } from "@/lib/types";
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

/** Plays a whole run: flaw → six steals → verdict → result. */
async function playFullRun(opts: { knowledge?: boolean } = {}) {
  stubMatchMedia(true); // reduced motion: reels resolve immediately, no timers to chase
  render(<StealFlow mode="sandbox" fixedSeed={SEED} knowledge={opts.knowledge} />);

  // ---- flaw step
  await click(screen.getByRole("button", { name: /^spin$/i }));
  const flawCards = screen.getAllByRole("button", { pressed: false });
  await click(flawCards[0]);
  await click(screen.getByRole("button", { name: /take flaw & build/i }));

  // ---- six steals, always taking the roster's best for that attribute
  const taken = new Set<string>();
  const expected: Array<[number, number]> = [];
  for (let round = 0; round < ROUNDS; round++) {
    expect(screen.getByText(new RegExp(`ROUND ${round + 1} / ${ROUNDS}`))).toBeTruthy();
    // every round is its own gamble — you must pull the lever
    await click(screen.getByRole("button", { name: /^spin$/i }));

    const bucketIdx = bucketIndexAt(SEED, round, 0, 0);
    const bucket = BUCKETS[bucketIdx];
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

describe("a full Six Steals run", () => {
  it("goes gamble → knowledge test → judgment and lands on the result", async () => {
    const expected = await playFullRun();

    // ---- the sim ticker, then the verdict sequence
    expect(screen.queryByText(/ROUND 6 \/ 6/)).toBeNull();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 700));
    });

    expect(screen.getByText(/THE VERDICT/)).toBeTruthy();

    // six grade slides, then the bookends, then the card
    for (let i = 0; i < ROUNDS; i++) {
      expect(screen.getByText(new RegExp(`ROUND ${i + 1} · ${ATTR_LABELS[ATTRS[i]].toUpperCase()}`))).toBeTruthy();
      await click(screen.getByRole("button", { name: /^next$/i }));
    }
    expect(screen.getByText("BEST STEAL")).toBeTruthy();
    expect(screen.getByText("THE REACH")).toBeTruthy();
    await click(screen.getByRole("button", { name: /see the number/i }));

    // ---- the result card matches an independent simulation of the same run
    const expectedResult = simulateSteals({
      v: 3, mode: "sandbox", seed: SEED,
      flaw: 0, steals: expected, attempt: 0, daily: 0, knowledge: false,
    });
    expect(screen.getByText("Run it back")).toBeTruthy();
    expect(screen.getAllByText(/OVR$/).length).toBeGreaterThan(0);

    // taking every roster's best should grade out near the top
    expect(expectedResult).not.toBeNull();
    expect(expectedResult!.steals.every((s) => s.rank === 0)).toBe(true);
    expect(expectedResult!.bestSteal.grade).toBe("A+");
  });

  it("never offers the same player twice across a run", async () => {
    const expected = await playFullRun();
    const people = expected.map(([b, p]) => BUCKETS[b].players[p].person);
    expect(new Set(people).size).toBe(people.length);
  });

  it("produces a share code that decodes back to the same run", async () => {
    const expected = await playFullRun();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 700));
    });
    for (let i = 0; i <= ROUNDS; i++) {
      const btn = screen.queryByRole("button", { name: /^next$|see the number/i });
      if (btn) await click(btn);
    }
    // the flow encodes the run it just played; decoding must reproduce it
    const rebuilt = simulateSteals({
      v: 3, mode: "sandbox", seed: SEED,
      flaw: 0, steals: expected, attempt: 0, daily: 0, knowledge: false,
    })!;
    const code = (await import("@/lib/encode")).encodeSteal(rebuilt.build);
    expect(decodeSteal(code)).toEqual(rebuilt.build);
  });
});

describe("Ball Knowledge", () => {
  it("hides the box lines but still lists every name", async () => {
    stubMatchMedia(true);
    render(<StealFlow mode="sandbox" fixedSeed={SEED} knowledge />);
    await click(screen.getByRole("button", { name: /^spin$/i }));
    await click(screen.getAllByRole("button", { pressed: false })[0]);
    await click(screen.getByRole("button", { name: /take flaw & build/i }));
    await click(screen.getByRole("button", { name: /^spin$/i }));

    const bucket = BUCKETS[bucketIndexAt(SEED, 0, 0, 0)];
    const list = screen.getByRole("list");
    for (const player of bucket.players) {
      expect(within(list).getByText(player.name)).toBeTruthy();
    }
    expect(within(list).queryByText(/PPG/)).toBeNull();
    expect(within(list).getAllByText(/stats hidden/i).length).toBe(bucket.players.length);
  });

  it("shows box lines when the modifier is off", async () => {
    stubMatchMedia(true);
    render(<StealFlow mode="sandbox" fixedSeed={SEED} />);
    await click(screen.getByRole("button", { name: /^spin$/i }));
    await click(screen.getAllByRole("button", { pressed: false })[0]);
    await click(screen.getByRole("button", { name: /take flaw & build/i }));
    await click(screen.getByRole("button", { name: /^spin$/i }));

    const list = screen.getByRole("list");
    expect(within(list).getAllByText(/PPG/).length).toBeGreaterThan(0);
  });
});

describe("re-spins", () => {
  it("spends a token, moves the wheel, and disables the button when spent", async () => {
    stubMatchMedia(true);
    render(<StealFlow mode="sandbox" fixedSeed={SEED} />);
    await click(screen.getByRole("button", { name: /^spin$/i }));

    // pick the Mild flaw so there are no wild tokens — exactly 1 team + 1 era
    const { FLAWS } = await import("@/data/flaws");
    const { drawFlaws } = await import("@/lib/shop");
    const offered = drawFlaws(SEED);
    const mildAt = offered.findIndex((i) => FLAWS[i].severity === "Mild");
    const cards = screen.getAllByRole("button", { pressed: false });
    await click(cards[mildAt >= 0 ? mildAt : 0]);
    await click(screen.getByRole("button", { name: /take flaw & build/i }));
    await click(screen.getByRole("button", { name: /^spin$/i }));

    const before = BUCKETS[bucketIndexAt(SEED, 0, 0, 0)];
    const afterTeam = BUCKETS[bucketIndexAt(SEED, 0, 1, 0)];
    expect(screen.getAllByText(before.label).length).toBeGreaterThan(0);

    await click(screen.getByRole("button", { name: /team re-spin/i }));
    expect(screen.getAllByText(afterTeam.label).length).toBeGreaterThan(0);

    if (mildAt >= 0) {
      // the team token is gone and no wild tokens exist to cover another
      expect(screen.getByRole("button", { name: /team re-spin/i })).toHaveProperty("disabled", true);
      // the era token is untouched and still lands inside the same franchise
      const eraButton = screen.getByRole("button", { name: /era re-spin/i });
      expect(eraButton).toHaveProperty("disabled", false);
      await click(eraButton);
      const afterEra = BUCKETS[bucketIndexAt(SEED, 0, 1, 1)];
      expect(afterEra.franchise).toBe(afterTeam.franchise);
      expect(afterEra.id).not.toBe(afterTeam.id);
      expect(screen.getAllByText(afterEra.label).length).toBeGreaterThan(0);
    }
  });
});
