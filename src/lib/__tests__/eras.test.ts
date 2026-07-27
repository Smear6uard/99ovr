import { describe, expect, it } from "vitest";
import { BUCKETS, FRANCHISES } from "@/data/eras";
import { ATTRS } from "@/lib/types";

/** Leading scorer order, from the authored display line ("28.0 PPG · ..."). */
function ppg(line: string): number {
  const match = line.match(/([\d.]+)\s*PPG/);
  return match ? Number(match[1]) : 0;
}

function scoringOrder(players: { line: string }[]): number[] {
  return players
    .map((p, index) => ({ index, ppg: ppg(p.line) }))
    .sort((a, b) => b.ppg - a.ppg)
    .map((entry) => entry.index);
}

describe("era pool shape", () => {
  it("carries 50-60 buckets across 24+ franchises", () => {
    expect(BUCKETS.length).toBeGreaterThanOrEqual(50);
    expect(BUCKETS.length).toBeLessThanOrEqual(60);
    // The wheel addresses `rounds * 4` franchise slots and must never collide.
    expect(FRANCHISES.length).toBeGreaterThanOrEqual(24);
  });

  it("gives every franchise at least two eras so the era re-spin always lands", () => {
    for (const franchise of FRANCHISES) {
      expect(franchise.eras.length, `${franchise.id} needs a second era`).toBeGreaterThanOrEqual(2);
    }
  });

  it("has unique bucket ids and 10-14 uniquely named players each", () => {
    const ids = new Set<string>();
    for (const bucket of BUCKETS) {
      expect(ids.has(bucket.id), `duplicate bucket ${bucket.id}`).toBe(false);
      ids.add(bucket.id);
      expect(bucket.players.length, bucket.id).toBeGreaterThanOrEqual(10);
      expect(bucket.players.length, bucket.id).toBeLessThanOrEqual(14);
      const people = new Set(bucket.players.map((p) => p.person));
      expect(people.size, `${bucket.id} has a duplicate player`).toBe(bucket.players.length);
      for (const player of bucket.players) {
        expect(player.r).toHaveLength(ATTRS.length);
        for (const rating of player.r) {
          expect(rating).toBeGreaterThanOrEqual(20);
          expect(rating).toBeLessThanOrEqual(99);
        }
        expect(player.line).toMatch(/PPG/);
        expect(player.note.length).toBeGreaterThan(4);
      }
    }
  });

  it("keeps roughly a quarter of the wheel genuinely rough — the groans are content", () => {
    const rough = BUCKETS.filter((b) => b.vibe === "rough").length;
    const iconic = BUCKETS.filter((b) => b.vibe === "iconic").length;
    expect(rough / BUCKETS.length).toBeGreaterThanOrEqual(0.2);
    expect(rough / BUCKETS.length).toBeLessThanOrEqual(0.35);
    expect(iconic).toBeGreaterThan(BUCKETS.length / 2);
  });
});

describe("per-bucket authoring invariants", () => {
  it("has an unambiguous best player for every attribute", () => {
    for (const bucket of BUCKETS) {
      ATTRS.forEach((attr, index) => {
        const top = Math.max(...bucket.players.map((p) => p.r[index]));
        const tied = bucket.players.filter((p) => p.r[index] === top);
        expect(tied.length, `${bucket.id} ties at best ${attr}: ${tied.map((p) => p.name).join(", ")}`).toBe(1);
      });
    }
  });

  it("hides at least one trap pick on every roster", () => {
    // A top-3 scorer who is in the bottom half of the roster at some attribute:
    // the big box-score line that does not mean what it looks like.
    for (const bucket of BUCKETS) {
      const order = scoringOrder(bucket.players);
      const topScorers = order.slice(0, 3);
      const n = bucket.players.length;
      const trap = topScorers.some((playerIdx) =>
        ATTRS.some((_attr, attrIdx) => {
          const rating = bucket.players[playerIdx].r[attrIdx];
          const better = bucket.players.filter((p) => p.r[attrIdx] > rating).length;
          return better >= Math.ceil(n / 2);
        })
      );
      expect(trap, `${bucket.id} has no trap pick`).toBe(true);
    }
  });

  it("hides at least one connoisseur pick on every roster", () => {
    // Someone outside the top 3 scorers who owns a roster-best attribute.
    for (const bucket of BUCKETS) {
      const order = scoringOrder(bucket.players);
      const deepCuts = order.slice(3);
      const connoisseur = deepCuts.some((playerIdx) =>
        ATTRS.some((_attr, attrIdx) => {
          const rating = bucket.players[playerIdx].r[attrIdx];
          return bucket.players.every((p) => p.r[attrIdx] <= rating);
        })
      );
      expect(connoisseur, `${bucket.id} has no connoisseur pick`).toBe(true);
    }
  });
});
