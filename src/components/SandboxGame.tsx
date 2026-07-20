"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { decodeBuild } from "@/lib/encode";
import { useMounted } from "@/lib/hooks";
import { simulate } from "@/lib/sim";
import { getBestBuild, type BestBuild } from "@/lib/storage";
import { TIER_HEX, tierFor } from "@/lib/tiers";
import { GameFlow, type Challenge } from "@/components/GameFlow";

/** Sandbox mode — the default, unlimited, ad-engine loop. ?vs=code arms a duel. */
export function SandboxGame() {
  const params = useSearchParams();
  const mounted = useMounted();
  const [best, setBest] = useState<BestBuild | null>(null);

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
    };
  }, [params]);

  useEffect(() => {
    if (mounted) setBest(getBestBuild());
  }, [mounted]);

  return (
    <div>
      <div className="pb-4 pt-1">
        <h1 className="font-display text-[27px] uppercase leading-[1.05]">
          Build the perfect
          <br />
          NBA player
        </h1>
        <p className="mt-1.5 text-[13px] leading-snug text-dim">
          $15. Six skills bought from legends. One fatal flaw. Ten 1v1s between you and forever.{" "}
          <Link href="/about" className="underline underline-offset-2 hover:text-paper">
            Rules
          </Link>
        </p>
        {best ? (
          <p className="mt-2 text-[11px] font-bold tracking-[0.16em] text-dim">
            YOUR BEST:{" "}
            <span style={{ color: TIER_HEX[tierFor(best.ovr)] }}>
              {best.ovr} OVR · {best.archetypeName.toUpperCase()}
            </span>
          </p>
        ) : null}
      </div>

      {challenge ? (
        <div className="mb-4 rounded-lg border border-gold/50 bg-panel p-3">
          <p className="text-[10px] font-bold tracking-[0.2em] text-gold">DUEL ACCEPTED</p>
          <p className="mt-1 text-[13px] text-paper">
            Target: <strong>{challenge.ovr} OVR {challenge.archetypeName}</strong>. Same shop, same
            prices, your $15.
          </p>
        </div>
      ) : null}

      <GameFlow
        key={(challenge?.code ?? "sandbox") + (knowledge ? ":bk" : "")}
        mode="sandbox"
        fixedSeed={challenge?.seed}
        challenge={challenge}
        knowledge={knowledge}
      />
    </div>
  );
}
