"use client";

import { useMemo, useState } from "react";
import { GRADE_HEX } from "@/lib/grade";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { STEAL_BUDGET } from "@/lib/steal";
import { TIER_HEX, TIER_NAMES, tierFor } from "@/lib/tiers";
import { ATTR_ABBR, ATTR_LABELS, type StealResult } from "@/lib/types";
import { Odometer } from "@/components/Odometer";
import { RungSquares } from "@/components/RungSquares";

function StatCol({ label, value }: { label: string; value: number }) {
  const hex = TIER_HEX[tierFor(value)];
  return (
    <div className="flex-1">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-semibold tracking-[0.18em] text-dim">{label}</span>
        <span className="font-display text-xl" style={{ color: hex }}>
          {value}
        </span>
      </div>
      <div className="mt-1 h-[3px] w-full rounded-full bg-line">
        <div className="h-full rounded-full" style={{ width: `${(value / 99) * 100}%`, background: hex }} />
      </div>
    </div>
  );
}

/**
 * The screenshot. Everything above the fold on the result screen, and the
 * server-rendered body of /b/[code] for v3 codes.
 */
export function StealCard({
  result,
  animate = false,
  modeChip,
  challenge,
  rank,
}: {
  result: StealResult;
  animate?: boolean;
  modeChip?: string;
  challenge?: { ovr: number; archetypeName: string } | null;
  /** daily leaderboard placement, when known */
  rank?: { rank: number; total: number } | null;
}) {
  const reduced = usePrefersReducedMotion();
  const { derived, archetype, fellAt, injured, flaw, steals, roast, build } = result;
  const target = build.target ?? "ALL";
  const budgetMode = build.v === 4 && build.mode === "budget";
  const [shown, setShown] = useState(animate ? 0 : derived.ovr);
  const [stamped, setStamped] = useState(!animate);

  const tier = tierFor(shown);
  const hex = TIER_HEX[tier];
  const finalTier = tierFor(derived.ovr);
  const gauntletLine = useMemo(() => {
    if (fellAt === null) return "CLEARED THE GAUNTLET";
    const opp = result.gauntlet[fellAt - 1];
    return `${injured ? "INJURED" : "LOST"} · ROUND ${fellAt} BOSS: ${opp.shortName.toUpperCase()}`;
  }, [fellAt, injured, result.gauntlet]);

  const beat = challenge ? derived.ovr > challenge.ovr : null;
  const lateReveal = stamped ? "fade-up" : "opacity-0";

  return (
    <div
      className="relative overflow-hidden rounded-xl border-[3px] bg-panel px-5 pb-5 pt-4 transition-colors duration-200"
      style={{
        borderColor: hex,
        boxShadow: stamped && (finalTier === "hof" || finalTier === "goat") ? `0 0 42px ${hex}55` : undefined,
      }}
    >
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.25]" viewBox="0 0 400 560" fill="none" preserveAspectRatio="xMidYMax slice">
        <g stroke="#26314b" strokeWidth="1.5">
          <path d="M -80 560 A 280 280 0 0 1 480 560" />
          <circle cx="200" cy="560" r="70" />
        </g>
      </svg>

      <div className="relative">
        <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.18em] text-dim">
          <span>
            <span className="text-gold">99</span>OVR
          </span>
          <span className="flex items-center gap-2">
            {build.knowledge ? (
              <span className="rounded-sm border border-gold/70 px-1.5 py-0.5 text-gold">🧠 BALL KNOWLEDGE</span>
            ) : null}
            {target !== "ALL" ? (
              <span className="rounded-sm border border-gold/70 px-1.5 py-0.5 text-gold">BEST {target}</span>
            ) : null}
            {modeChip ? <span className="rounded-sm border border-line px-1.5 py-0.5">{modeChip}</span> : null}
            <span className="rounded-sm border border-line px-1.5 py-0.5">SIM #{build.attempt + 1}</span>
          </span>
        </div>

        {challenge ? (
          <div
            className={`mt-3 rounded-md border px-3 py-2 text-center text-[12px] font-bold tracking-wide ${lateReveal}`}
            style={{
              borderColor: beat ? "#3fb68b" : "#e5484d",
              color: beat ? "#3fb68b" : "#e5484d",
              animationDelay: "0.45s",
            }}
          >
            {beat
              ? `TARGET DOWN — ${derived.ovr} BEATS ${challenge.ovr}`
              : derived.ovr === challenge.ovr
                ? `DEAD HEAT AT ${derived.ovr}`
                : `TARGET STANDS — ${challenge.ovr} HOLDS OFF ${derived.ovr}`}
          </div>
        ) : null}

        {/* The number */}
        <div className="mt-1 text-center">
          <Odometer
            value={derived.ovr}
            animate={animate}
            reduced={reduced}
            onTick={setShown}
            onDone={() => setStamped(true)}
            className="block text-[96px] leading-[1.02] transition-colors duration-200"
            style={{ color: hex }}
          />
          <div className="-mt-1 font-display text-3xl uppercase tracking-wide" style={{ color: hex }}>
            {TIER_NAMES[tier]}
          </div>
          <div className="mt-1 text-[11px] font-semibold tracking-[0.25em] text-paper">
            {target !== "ALL" ? `BEST ${target} BUILD — ` : ""}
            {derived.ovr} OVR
          </div>
        </div>

        {/* The stamp */}
        <div className="mt-4 flex justify-center" style={{ minHeight: 54 }}>
          {stamped ? (
            <div className={reduced || !animate ? "-rotate-3" : "stamp-in"} style={{ color: TIER_HEX[finalTier] }}>
              <span
                className="inline-block border-[3px] px-3 py-1 font-display text-2xl uppercase tracking-wide"
                style={{ borderColor: TIER_HEX[finalTier] }}
              >
                {archetype.name}
              </span>
            </div>
          ) : null}
        </div>

        {/* Six grades */}
        <div className={`mt-4 grid grid-cols-6 gap-1 ${lateReveal}`} style={{ animationDelay: "0.1s" }}>
          {steals.map((steal) => (
            <div key={steal.attr} className="text-center">
              <span className="block text-[8px] font-bold tracking-[0.1em] text-dim">{ATTR_ABBR[steal.attr]}</span>
              <span
                className="mt-0.5 block border font-display text-[15px] leading-tight"
                style={{ borderColor: GRADE_HEX[steal.grade], color: GRADE_HEX[steal.grade] }}
              >
                {steal.grade}
              </span>
            </div>
          ))}
        </div>

        {/* The story */}
        <div className={`mt-4 flex flex-col items-center gap-2 ${lateReveal}`} style={{ animationDelay: "0.2s" }}>
          <RungSquares result={result} />
          <span className="text-[12px] font-bold tracking-[0.14em]" style={{ color: fellAt === null ? "#3fb68b" : "#e5484d" }}>
            {gauntletLine}
          </span>
          {rank ? (
            <span className="rounded-sm border border-gold/70 px-2 py-0.5 text-[11px] font-bold tracking-[0.16em] text-gold">
              #{rank.rank} OF {rank.total} TODAY
            </span>
          ) : null}
        </div>

        {/* Sub-ratings */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatCol label="OFF" value={derived.offense} />
          <StatCol label="DEF" value={derived.defense} />
          <StatCol label="PLY" value={derived.playmaking} />
        </div>

        {/* Synergies */}
        {derived.synergies.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {derived.synergies.map((s) => (
              <span
                key={s.id}
                title={s.desc}
                className="rounded-sm border border-gold/60 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-gold"
              >
                {s.name.toUpperCase()} {s.bonus.split(" ")[0]}
              </span>
            ))}
          </div>
        ) : null}

        {/* The six steals */}
        <div className="mt-4 space-y-1.5">
          {steals.map((steal) => (
            <div key={steal.attr} className="flex items-center gap-2 text-[12px]">
              <span
                className="inline-flex h-5 w-9 shrink-0 items-center justify-center rounded-[3px] font-display text-[11px] text-ink"
                style={{ background: GRADE_HEX[steal.grade] }}
              >
                {steal.grade}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold leading-tight">{steal.player.name}</span>
                <span className="block truncate text-[9px] tracking-[0.12em] text-dim">
                  {ATTR_LABELS[steal.attr].toUpperCase()} · {steal.bucket.label}
                </span>
              </span>
              {budgetMode ? (
                <span className="shrink-0 font-display text-[13px] text-gold" aria-label={`cost $${steal.price}`}>
                  ${steal.price}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {/* The flaw — Budget (and v3) only */}
        {flaw ? (
          <div className="mt-4 border-l-2 border-loss pl-3 text-[12px]">
            <span className="mr-2 text-[10px] font-bold tracking-[0.18em] text-loss">FLAW</span>
            <span className="font-semibold">{flaw.name}</span>
            <span className="ml-2 text-[10px] tracking-[0.14em] text-dim">
              {flaw.severity.toUpperCase()}
              {budgetMode ? ` · +$${result.refund} BACK` : ""}
            </span>
          </div>
        ) : null}

        {/* The receipt — Budget only */}
        {budgetMode ? (
          <div className="mt-3 flex items-center justify-between border-l-2 border-gold pl-3 text-[12px]">
            <span>
              <span className="mr-2 text-[10px] font-bold tracking-[0.18em] text-gold">BUDGET</span>
              <span className="font-semibold">
                ${result.spent} spent of ${STEAL_BUDGET + result.refund}
              </span>
            </span>
            <span className="text-[10px] tracking-[0.14em] text-dim">
              ${STEAL_BUDGET + result.refund - result.spent} LEFT OVER
            </span>
          </div>
        ) : null}

        {/* The roast */}
        <div className={`relative mt-4 ${lateReveal}`} style={{ animationDelay: "0.4s" }}>
          <span aria-hidden className="absolute -left-1 -top-3 font-display text-4xl text-gold/70">
            &ldquo;
          </span>
          <p className="pl-4 text-[14px] font-medium leading-snug text-paper">{roast}</p>
        </div>

        <div className="mt-5 flex items-end justify-between">
          <span className="text-[9px] tracking-[0.14em] text-dim">
            SIX STEALS · SEED {result.simSeed.toString(16).slice(0, 6).toUpperCase()}
          </span>
          <span className="font-display text-sm tracking-wide text-gold">99OVR.APP</span>
        </div>
      </div>
    </div>
  );
}
