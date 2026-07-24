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
import { POSITIONS, type PositionMode } from "@/lib/types";

/** Sandbox mode — the default, unlimited, ad-engine loop. ?vs=code arms a duel. */
export function SandboxGame() {
  const params = useSearchParams();
  const mounted = useMounted();
  const [best, setBest] = useState<BestBuild | null>(null);

  const knowledge = params.get("mode") === "knowledge";
  const requestedPosition = params.get("position")?.toUpperCase();
  const position: PositionMode = POSITIONS.includes(requestedPosition as (typeof POSITIONS)[number])
    ? requestedPosition as PositionMode
    : "ALL";

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
          Pick a flaw for extra cash. Draft eight skills. Beat ten bosses.{" "}
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

      {!challenge ? (
        <nav aria-label="Position challenge" className="mb-4">
          <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-dim">BUILD THE BEST</p>
          <div className="grid grid-cols-6 gap-1">
            {["ALL", ...POSITIONS].map((pos) => (
              <Link key={pos} href={`/play${pos === "ALL" ? "" : `?position=${pos}`}${knowledge ? `${pos === "ALL" ? "?" : "&"}mode=knowledge` : ""}`} className={`rounded-md border py-2 text-center text-[11px] font-bold ${position === pos ? "border-gold bg-gold text-ink" : "border-line text-dim hover:border-gold"}`}>{pos}</Link>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-dim">{position === "ALL" ? "Any position. Original all-around scoring." : `${position} only. Position scoring and an all-time ${position} boss ladder.`}</p>
        </nav>
      ) : null}

      {challenge ? (
        <div className="mb-4 rounded-lg border border-gold/50 bg-panel p-3">
          <p className="text-[10px] font-bold tracking-[0.2em] text-gold">DUEL ACCEPTED</p>
          <p className="mt-1 text-[13px] text-paper">
            Target: <strong>{challenge.ovr} OVR {challenge.archetypeName}</strong>. Same shop, same
            prices, your position rules.
          </p>
        </div>
      ) : null}

      <GameFlow
        key={(challenge?.code ?? "sandbox") + (knowledge ? ":bk" : "")}
        mode="sandbox"
        fixedSeed={challenge?.seed}
        challenge={challenge}
        knowledge={knowledge}
        position={challenge?.position ?? position}
      />
    </div>
  );
}
