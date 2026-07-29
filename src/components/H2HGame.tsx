"use client";

import { useMemo } from "react";
import { decodeSteal } from "@/lib/encode";
import { simulateSteals } from "@/lib/steal";
import { TIER_NAMES, tierFor } from "@/lib/tiers";
import type { StealResult } from "@/lib/types";
import { StealFlow } from "@/components/StealFlow";

/**
 * The accept-a-challenge side of Head to Head: re-simulate the challenger
 * from the code, then run the friend through the identical position and spin
 * sequence. The comparison screen replaces the normal verdict.
 */
export function H2HGame({ code }: { code: string }) {
  const challenge = useMemo<StealResult | null>(() => {
    const build = decodeSteal(code);
    if (!build) return null;
    return simulateSteals(build);
  }, [code]);

  if (!challenge) {
    return (
      <p className="pt-8 text-center text-[13px] text-dim">
        That challenge link is broken or from another era. Ask for a fresh one.
      </p>
    );
  }

  const { build, derived } = challenge;
  const target = build.target ?? "ALL";

  return (
    <div>
      <div className="mb-4 rounded-lg border border-gold/50 bg-panel p-3">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gold">CHALLENGE ACCEPTED</p>
        <p className="mt-1 text-[13px] text-paper">
          Target: <strong>{derived.ovr} OVR {TIER_NAMES[tierFor(derived.ovr)]}</strong> ·{" "}
          {challenge.archetype.name}. Identical spins, identical rosters
          {target !== "ALL" ? `, Best ${target} scoring` : ""}
          {build.knowledge ? ", names only" : ""}. Your reads against theirs.
        </p>
      </div>

      <StealFlow
        key={code}
        mode="classic"
        fixedSeed={build.seed}
        knowledge={build.knowledge}
        target={target}
        challenge={challenge}
      />
    </div>
  );
}
