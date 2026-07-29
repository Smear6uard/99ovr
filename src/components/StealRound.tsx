"use client";

import { useEffect, useRef, useState } from "react";
import { EraCard, TeamWheel, type ReelMask } from "@/components/TeamWheel";
import { RosterCard } from "@/components/RosterCard";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { buzz, playSfx } from "@/lib/sfx";
import { POS_DECADES } from "@/data/positions";
import { MAX_POS_SPINS, POS_TOKENS, posBucketAt } from "@/lib/poswheel";
import { DECADE_POOL, ROUNDS, bucketIndexAt, canRespin, eraCountAt, respinsLeft, type SpinsUsed, type Tokens } from "@/lib/wheel";
import { ATTRS, ATTR_LABELS, type AttrId, type PositionMode } from "@/lib/types";

type Reel = "idle" | "spinning" | "landed";

const SPIN_MS = 1900;
const BOTH: ReelMask = { left: true, right: true };

function RespinButton({
  label,
  hint,
  left,
  enabled,
  disabledHint = "SPENT",
  onClick,
}: {
  label: string;
  hint: string;
  left: number;
  enabled: boolean;
  disabledHint?: string;
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
        {enabled ? `${left} LEFT · ${hint}` : disabledHint}
      </span>
    </button>
  );
}

/**
 * One of the six rounds: spin → land → read the roster → steal.
 * The reel is cosmetic; the wheel math decides the landing before it ever
 * moves. Classic spins franchise decades; positional runs spin a decade of
 * the build's position and deal a seeded twelve.
 */
export function StealRound({
  round,
  seed,
  spins,
  tokens,
  usedTotal,
  target,
  knowledge,
  stolen,
  budget,
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
  target: PositionMode;
  knowledge: boolean;
  stolen: Set<string>;
  /** Budget mode wallet, or null everywhere else */
  budget?: { spent: number; refund: number; round: number } | null;
  onRespin: (kind: "team" | "era") => void;
  onSteal: (bucketIdx: number, playerIdx: number) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [reel, setReel] = useState<Reel>("idle");
  const [mask, setMask] = useState<ReelMask>(BOTH);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinKey = `${round}:${spins.team}:${spins.era}`;
  const previousKey = useRef(spinKey);

  const positional = target !== "ALL";
  const attr: AttrId = ATTRS[round];
  const bucketIdx = positional ? -1 : bucketIndexAt(seed, round, spins.team, spins.era, DECADE_POOL);
  const bucket = positional ? posBucketAt(seed, round, spins.team, target) : DECADE_POOL.buckets[bucketIdx];
  const previousBucket = useRef(bucket);

  const land = () => {
    setReel("landed");
    // jackpot flash for the all-timers, comic womp for the wrecks
    playSfx(bucket.vibe === "iconic" ? "jackpot" : bucket.vibe === "rough" ? "womp" : "land");
    buzz(bucket.vibe === "iconic" ? [24, 40, 24, 40, 60] : [18, 30, 40]);
  };

  const start = (nextMask: ReelMask = BOTH) => {
    if (timer.current) clearTimeout(timer.current);
    previousBucket.current = bucket;
    if (reduced) {
      setReel("landed");
      return;
    }
    setMask(nextMask);
    playSfx("spin");
    buzz(35);
    setReel("spinning");
    timer.current = setTimeout(land, SPIN_MS);
  };

  // a re-spin re-arms the reel without a second tap — the token is already
  // gone. Only the reel whose value actually changed gets to move again.
  useEffect(() => {
    if (previousKey.current === spinKey) return;
    previousKey.current = spinKey;
    const prev = previousBucket.current;
    const left = positional ? true : prev.franchise !== bucket.franchise;
    const right = positional ? false : prev.decade !== bucket.decade;
    start(left || right ? { left, right } : BOTH);
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
  const eraCount = positional ? 0 : eraCountAt(seed, round, spins.team, DECADE_POOL);
  const posLeft = POS_TOKENS - usedTotal.team - usedTotal.era;

  return (
    <section className="flex min-h-[62vh] flex-col pt-4">
      <div className="text-center">
        <span className="text-[10px] font-bold tracking-[0.3em] text-gold/80">
          ROUND {round + 1} / {ROUNDS} · {ATTR_LABELS[attr].toUpperCase()}
        </span>
        <h1 className="mt-1 font-display text-[38px] uppercase leading-none text-paper">
          {reel === "landed" ? "Steal one" : reel === "spinning" ? "Spinning…" : positional ? "Spin the decade" : "Spin the era"}
        </h1>
      </div>

      {reel === "landed" ? (
        <div className={`mt-4 space-y-3 ${!reduced && bucket.vibe === "iconic" ? "jackpot-shake" : ""}`}>
          <EraCard bucket={bucket} animate={!reduced} />
          {!reduced && bucket.vibe === "rough" ? (
            <p aria-hidden className="womp-in text-center font-display text-xl uppercase tracking-[0.2em] text-loss/80">
              womp womp
            </p>
          ) : null}

          {positional ? (
            <RespinButton
              label="DECADE RE-SPIN"
              hint="NEW DECADE"
              left={posLeft}
              enabled={posLeft > 0 && spins.team < MAX_POS_SPINS}
              onClick={() => onRespin("team")}
            />
          ) : (
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
                hint={`ANOTHER ${bucket.team} ERA`}
                left={eraLeft}
                enabled={canRespin("era", tokens, usedTotal) && eraCount > 1}
                disabledHint={eraCount > 1 ? "SPENT" : `ONLY ${bucket.team} ERA`}
                onClick={() => onRespin("era")}
              />
            </div>
          )}

          <RosterCard
            bucket={bucket}
            attr={attr}
            knowledge={knowledge}
            stolen={stolen}
            budget={budget}
            onSteal={(playerIdx) =>
              onSteal(positional ? POS_DECADES.indexOf(bucket.decade as (typeof POS_DECADES)[number]) : bucketIdx, playerIdx)
            }
          />
        </div>
      ) : (
        <>
          <div className="flex flex-1 items-center justify-center py-6">
            <div className="w-full max-w-[300px]">
              <TeamWheel
                bucket={bucket}
                spinning={reel === "spinning"}
                round={round}
                reduced={reduced}
                mask={mask}
                position={positional ? target : null}
              />
            </div>
          </div>

          <div className="mt-auto pb-2">
            <button
              type="button"
              onClick={() => start(BOTH)}
              disabled={reel === "spinning"}
              className={`spin-lever w-full rounded-xl border-b-4 border-[#a97b22] py-4 font-display text-3xl uppercase tracking-[0.1em] text-ink shadow-[0_10px_30px_rgba(242,185,75,0.32)] transition-transform active:translate-y-[3px] active:border-b-0 ${
                reel === "spinning" ? "pulse-soft cursor-default bg-gold/70" : "bg-gold"
              }`}
            >
              {reel === "spinning" ? "Spinning…" : "Spin"}
            </button>
            <p className="mt-2 text-center text-[11px] text-dim">
              {reel === "spinning"
                ? "Wherever it lands, that roster is your only shot at this skill."
                : positional
                  ? `One decade of ${target}s. One ${ATTR_LABELS[attr].toLowerCase()}. Twelve names.`
                  : `One team-era. One ${ATTR_LABELS[attr].toLowerCase()}. Whoever's on it.`}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
