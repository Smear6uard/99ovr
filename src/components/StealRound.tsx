"use client";

import { useEffect, useRef, useState } from "react";
import { EraCard, TeamWheel } from "@/components/TeamWheel";
import { RosterCard } from "@/components/RosterCard";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { BUCKETS } from "@/data/eras";
import { ROUNDS, bucketIndexAt, canRespin, respinsLeft, type SpinsUsed, type Tokens } from "@/lib/wheel";
import { ATTRS, ATTR_LABELS, type AttrId } from "@/lib/types";

type Reel = "idle" | "spinning" | "landed";

const SPIN_MS = 1900;

function RespinButton({
  label,
  hint,
  left,
  enabled,
  onClick,
}: {
  label: string;
  hint: string;
  left: number;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onClick}
      className={`flex-1 rounded-lg border px-2 py-2 text-center transition-colors ${
        enabled ? "border-line text-paper hover:border-gold hover:text-gold" : "border-line/50 text-dim/40"
      }`}
    >
      <span className="block text-[11px] font-bold tracking-[0.14em]">{label}</span>
      <span className="mt-0.5 block text-[9px] tracking-[0.1em] text-dim">
        {enabled ? `${left} LEFT · ${hint}` : "SPENT"}
      </span>
    </button>
  );
}

/**
 * One of the six rounds: spin → land → read the roster → steal.
 * The reel is cosmetic; `bucketAt` decides the landing before it ever moves.
 */
export function StealRound({
  round,
  seed,
  spins,
  tokens,
  usedTotal,
  knowledge,
  stolen,
  onRespin,
  onSteal,
}: {
  round: number;
  seed: number;
  /** re-spins spent on THIS round */
  spins: SpinsUsed;
  tokens: Tokens;
  /** re-spins spent across the whole run so far */
  usedTotal: SpinsUsed;
  knowledge: boolean;
  stolen: Set<string>;
  onRespin: (kind: "team" | "era") => void;
  onSteal: (bucketIdx: number, playerIdx: number) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [reel, setReel] = useState<Reel>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinKey = `${round}:${spins.team}:${spins.era}`;
  const previousKey = useRef(spinKey);

  const attr: AttrId = ATTRS[round];
  const bucketIdx = bucketIndexAt(seed, round, spins.team, spins.era);
  const bucket = BUCKETS[bucketIdx];

  const start = () => {
    if (timer.current) clearTimeout(timer.current);
    if (reduced) {
      setReel("landed");
      return;
    }
    setReel("spinning");
    timer.current = setTimeout(() => setReel("landed"), SPIN_MS);
  };

  // a re-spin re-arms the reel without a second tap — the token is already gone
  useEffect(() => {
    if (previousKey.current === spinKey) return;
    previousKey.current = spinKey;
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey]);

  useEffect(() => {
    setReel("idle");
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [round]);

  const teamLeft = respinsLeft("team", tokens, usedTotal);
  const eraLeft = respinsLeft("era", tokens, usedTotal);

  return (
    <section className="flex min-h-[62vh] flex-col pt-4">
      <div className="text-center">
        <span className="text-[10px] font-bold tracking-[0.3em] text-gold/80">
          ROUND {round + 1} / {ROUNDS} · {ATTR_LABELS[attr].toUpperCase()}
        </span>
        <h1 className="mt-1 font-display text-[38px] uppercase leading-none text-paper">
          {reel === "landed" ? "Steal one" : reel === "spinning" ? "Spinning…" : "Spin the era"}
        </h1>
      </div>

      {reel === "landed" ? (
        <div className="mt-4 space-y-3">
          <EraCard bucket={bucket} animate={!reduced} />

          <div className="flex gap-2">
            <RespinButton
              label="TEAM RE-SPIN"
              hint="ANY TEAM"
              left={teamLeft}
              enabled={canRespin("team", tokens, usedTotal)}
              onClick={() => onRespin("team")}
            />
            <RespinButton
              label="ERA RE-SPIN"
              hint={`ANOTHER ${bucket.team}`}
              left={eraLeft}
              enabled={canRespin("era", tokens, usedTotal)}
              onClick={() => onRespin("era")}
            />
          </div>

          <RosterCard
            bucket={bucket}
            attr={attr}
            knowledge={knowledge}
            stolen={stolen}
            onSteal={(playerIdx) => onSteal(bucketIdx, playerIdx)}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-1 items-center justify-center py-6">
            <div className="w-full max-w-[300px]">
              <TeamWheel bucket={bucket} spinning={reel === "spinning"} round={round} reduced={reduced} />
            </div>
          </div>

          <div className="mt-auto pb-2">
            <button
              type="button"
              onClick={start}
              disabled={reel === "spinning"}
              className={`w-full rounded-xl py-4 font-display text-3xl uppercase tracking-[0.1em] text-ink shadow-[0_10px_30px_rgba(242,185,75,0.32)] transition-transform active:scale-[0.98] ${
                reel === "spinning" ? "pulse-soft cursor-default bg-gold/70" : "bg-gold"
              }`}
            >
              {reel === "spinning" ? "Spinning…" : "Spin"}
            </button>
            <p className="mt-2 text-center text-[11px] text-dim">
              {reel === "spinning"
                ? "Wherever it lands, that roster is your only shot at this skill."
                : `One team-era. One ${ATTR_LABELS[attr].toLowerCase()}. Whoever's on it.`}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
