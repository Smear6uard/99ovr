import { describe, expect, it } from "vitest";
import { BUCKETS } from "@/data/eras";
import { DECADE_BUCKETS } from "@/data/eras/decades";
import { POSITION_POOLS, POS_DECADES } from "@/data/positions";
import { ratingFloorsFor } from "@/data/ratingsAudit";
import { ATTRS, type EraBucket } from "@/lib/types";

function assertFloors(bucket: EraBucket, context: string): void {
  for (const player of bucket.players) {
    const floors = ratingFloorsFor(bucket.decade, player.person, context);
    for (const [attr, floor] of Object.entries(floors)) {
      const index = ATTRS.indexOf(attr as (typeof ATTRS)[number]);
      expect(player.r[index], `${bucket.id}:${player.person}:${attr}`).toBeGreaterThanOrEqual(floor);
    }
  }
}

describe("ratings audit", () => {
  it("enforces every prime-decade specialist floor in every runtime pool", () => {
    for (const bucket of BUCKETS) assertFloors(bucket, bucket.id);
    for (const bucket of DECADE_BUCKETS) assertFloors(bucket, `${bucket.franchise}:${bucket.decade}`);
    for (const decade of POS_DECADES) {
      for (const [position, players] of Object.entries(POSITION_POOLS[decade])) {
        assertFloors({
          id: `pos:${decade}:${position}`,
          franchise: "position",
          team: position,
          season: String(decade),
          label: `${decade} ${position}`,
          decade,
          vibe: "solid",
          tag: "",
          players,
        }, "position");
      }
    }
  });

  it("fixes every 2010s LaVine card and removes generated false elites", () => {
    const wolves = DECADE_BUCKETS.find((bucket) => bucket.id === "wolves-2010s")!;
    const bulls = DECADE_BUCKETS.find((bucket) => bucket.id === "bulls-2010s")!;
    const position = POSITION_POOLS[2010].SG.find((player) => player.person === "zach-lavine")!;
    expect(wolves.players.find((player) => player.person === "zach-lavine")!.r[5]).toBe(97);
    expect(bulls.players.find((player) => player.person === "zach-lavine")!.r[5]).toBe(97);
    expect(position.r[5]).toBe(97);

    const blazers = DECADE_BUCKETS.find((bucket) => bucket.id === "blazers-2000s")!;
    expect(blazers.players.find((player) => player.person === "will-perdue")!.r[2]).toBe(88);
    const knicks = DECADE_BUCKETS.find((bucket) => bucket.id === "knicks-2010s")!;
    expect(knicks.players.find((player) => player.person === "jimmer-fredette")!.r[2]).toBe(88);
    const cavs = DECADE_BUCKETS.find((bucket) => bucket.id === "cavs-2010s")!;
    expect(cavs.players.find((player) => player.person === "edy-tavares")!.r[5]).toBe(88);
  });
});
