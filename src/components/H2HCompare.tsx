"use client";

import { GRADE_HEX, gradeScore } from "@/lib/grade";
import { fnv1a, mulberry32 } from "@/lib/rng";
import { TIER_HEX, TIER_NAMES, tierFor } from "@/lib/tiers";
import { ATTR_LABELS, ATTRS, type StealResult } from "@/lib/types";

const LOSER_ROASTS = [
  "Same wheel. Same rosters. Different reading level.",
  "You had the answers in front of you and circled the wrong ones.",
  "The group chat is going to hear about this.",
  "Somewhere a scout just deleted your number.",
  "The wheel was identical. The knowledge was not.",
  "You lost a take-home exam.",
  "They read the roster. You read the jerseys.",
  "Run it back before anyone screenshots this.",
];

/** Winner by weighted OVR; total steal-grade points break the tie. */
export function h2hWinner(mine: StealResult, theirs: StealResult): "mine" | "theirs" | "tie" {
  if (mine.derived.ovr !== theirs.derived.ovr) return mine.derived.ovr > theirs.derived.ovr ? "mine" : "theirs";
  if (mine.gradePoints !== theirs.gradePoints) return mine.gradePoints > theirs.gradePoints ? "mine" : "theirs";
  return "tie";
}

function MiniCard({ result, label, dimmed }: { result: StealResult; label: string; dimmed: boolean }) {
  const tier = tierFor(result.derived.ovr);
  const hex = TIER_HEX[tier];
  return (
    <div
      className={`rounded-xl border-2 bg-panel px-3 py-3 text-center transition-opacity ${dimmed ? "opacity-60" : ""}`}
      style={{ borderColor: hex }}
    >
      <span className="text-[10px] font-bold tracking-[0.22em] text-dim">{label}</span>
      <div className="mt-1 font-display text-[56px] leading-none" style={{ color: hex }}>
        {result.derived.ovr}
      </div>
      <div className="font-display text-lg uppercase leading-tight" style={{ color: hex }}>
        {TIER_NAMES[tier]}
      </div>
      <div className="mt-1 truncate text-[10px] font-bold tracking-[0.12em] text-paper">
        {result.archetype.name.toUpperCase()}
      </div>
      <div className="mt-2 flex justify-center gap-0.5">
        {result.steals.map((steal) => (
          <span
            key={steal.attr}
            className="inline-flex h-4 min-w-6 items-center justify-center rounded-[2px] font-display text-[9px] text-ink"
            style={{ background: GRADE_HEX[steal.grade] }}
          >
            {steal.grade}
          </span>
        ))}
      </div>
      <div className="mt-1 text-[9px] tracking-[0.14em] text-dim">{result.gradePoints} GRADE PTS</div>
    </div>
  );
}

/**
 * The Head to Head verdict: both cards, the six grades face to face, a winner
 * banner, and a roast for whoever lost. No accounts, no sync — both results
 * re-simulated from codes.
 */
export function H2HCompare({ mine, theirs }: { mine: StealResult; theirs: StealResult }) {
  const winner = h2hWinner(mine, theirs);
  const roll = mulberry32(fnv1a(`h2h:${mine.simSeed}:${theirs.simSeed}`))();
  const roast = LOSER_ROASTS[Math.min(LOSER_ROASTS.length - 1, Math.floor(roll * LOSER_ROASTS.length))];

  const banner =
    winner === "tie"
      ? { text: `DEAD HEAT AT ${mine.derived.ovr}`, hex: "#f2b94b" }
      : winner === "mine"
        ? { text: `YOU WIN — ${mine.derived.ovr} BEATS ${theirs.derived.ovr === mine.derived.ovr ? "THE TIEBREAK" : theirs.derived.ovr}`, hex: "#3fb68b" }
        : { text: `CHALLENGER HOLDS — ${theirs.derived.ovr === mine.derived.ovr ? "ON THE TIEBREAK" : `${theirs.derived.ovr} OVER ${mine.derived.ovr}`}`, hex: "#e5484d" };

  return (
    <div>
      <div
        className="stamp-in rounded-lg border-[3px] px-3 py-3 text-center font-display text-2xl uppercase leading-none tracking-wide"
        style={{ borderColor: banner.hex, color: banner.hex }}
        role="status"
      >
        {banner.text}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MiniCard result={mine} label="YOU" dimmed={winner === "theirs"} />
        <MiniCard result={theirs} label="CHALLENGER" dimmed={winner === "mine"} />
      </div>

      {/* Grade-by-grade */}
      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-panel">
        {ATTRS.map((attr, index) => {
          const a = mine.steals[index];
          const b = theirs.steals[index];
          const cmp = gradeScore(a.grade) - gradeScore(b.grade) || a.rating - b.rating;
          return (
            <div key={attr} className="flex items-center gap-2 border-b border-line/60 px-3 py-2 last:border-b-0">
              <span
                className="inline-flex h-6 w-10 shrink-0 items-center justify-center rounded-[3px] font-display text-[13px]"
                style={{
                  background: cmp > 0 ? GRADE_HEX[a.grade] : "transparent",
                  border: cmp > 0 ? "none" : `1px solid ${GRADE_HEX[a.grade]}`,
                  color: cmp > 0 ? "#0b1220" : GRADE_HEX[a.grade],
                }}
              >
                {a.grade}
              </span>
              <span className="min-w-0 flex-1 text-center">
                <span className="block text-[10px] font-bold tracking-[0.18em] text-dim">
                  {ATTR_LABELS[attr].toUpperCase()}
                </span>
                <span className="block truncate text-[9px] text-dim/80">
                  {a.player.name} vs {b.player.name}
                </span>
              </span>
              <span
                className="inline-flex h-6 w-10 shrink-0 items-center justify-center rounded-[3px] font-display text-[13px]"
                style={{
                  background: cmp < 0 ? GRADE_HEX[b.grade] : "transparent",
                  border: cmp < 0 ? "none" : `1px solid ${GRADE_HEX[b.grade]}`,
                  color: cmp < 0 ? "#0b1220" : GRADE_HEX[b.grade],
                }}
              >
                {b.grade}
              </span>
            </div>
          );
        })}
      </div>

      {winner !== "tie" ? (
        <p className="mt-4 text-center text-[13px] leading-snug text-paper">
          <span className="mr-1 text-[10px] font-bold tracking-[0.2em] text-loss">
            {winner === "mine" ? "FOR THE CHALLENGER:" : "FOR YOU:"}
          </span>
          &ldquo;{roast}&rdquo;
        </p>
      ) : (
        <p className="mt-4 text-center text-[13px] text-dim">Nobody gets roasted on a dead heat. Rare mercy.</p>
      )}
    </div>
  );
}
