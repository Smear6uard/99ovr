"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { decodeBuild } from "@/lib/encode";
import { simulate } from "@/lib/sim";
import { GameFlow, type Challenge } from "@/components/GameFlow";
import type { PositionMode } from "@/lib/types";

/**
 * Budget Ball — the original $20 builder, kept as a secondary mode.
 * Positional challenges are shelved, but v2 duel links that carry a position
 * still replay under their original rules.
 */
export function BudgetGame() {
  const params = useSearchParams();
  const knowledge = params.get("mode") === "knowledge";

  const challenge = useMemo<Challenge | null>(() => {
    const vs = params.get("vs");
    if (!vs) return null;
    const build = decodeBuild(vs);
    if (!build) return null;
    const sim = simulate(build);
    if (!sim) return null;
    return {
      code: vs,
      seed: build.seed,
      ovr: sim.derived.ovr,
      archetypeName: sim.archetype.name,
      position: build.position ?? "ALL",
    };
  }, [params]);

  const position: PositionMode = challenge?.position ?? "ALL";

  return (
    <div>
      <div className="pb-4 pt-1">
        <p className="text-[10px] font-bold tracking-[0.24em] text-dim">SECONDARY MODE</p>
        <h1 className="mt-1 font-display text-[27px] uppercase leading-[1.05]">
          Budget Ball
          <br />
          the $20 challenge
        </h1>
        <p className="mt-1.5 text-[13px] leading-snug text-dim">
          The original 99OVR: pick a flaw for extra cash, draft eight priced skills, beat ten bosses.{" "}
          <Link href="/play" className="underline underline-offset-2 hover:text-paper">
            Six Steals is the main game
          </Link>
          .
        </p>
      </div>

      {challenge ? (
        <div className="mb-4 rounded-lg border border-gold/50 bg-panel p-3">
          <p className="text-[10px] font-bold tracking-[0.2em] text-gold">BUDGET DUEL</p>
          <p className="mt-1 text-[13px] text-paper">
            Target: <strong>{challenge.ovr} OVR {challenge.archetypeName}</strong>. Same shop, same prices.
          </p>
        </div>
      ) : null}

      <GameFlow
        key={(challenge?.code ?? "budget") + (knowledge ? ":bk" : "")}
        fixedSeed={challenge?.seed}
        challenge={challenge}
        knowledge={knowledge}
        position={position}
      />
    </div>
  );
}
