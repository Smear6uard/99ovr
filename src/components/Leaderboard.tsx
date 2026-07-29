"use client";

import { useState } from "react";
import { cleanInitials } from "@/lib/leaderboard";
import type { LbBoard } from "@/lib/leaderboardClient";

/** Arcade high-score board: top 50, blinking NEW HIGH SCORE for a top-10 you. */
export function Leaderboard({
  board,
  yourRank,
  yourInitials,
}: {
  board: LbBoard;
  yourRank?: number | null;
  yourInitials?: string | null;
}) {
  const isYouTop10 = typeof yourRank === "number" && yourRank <= 10;
  return (
    <section aria-label="Daily leaderboard" className="rounded-xl border-2 border-gold/60 bg-panel2 p-3">
      <div className="text-center">
        <h2 className="marquee-text font-display text-2xl uppercase tracking-[0.14em] text-gold">
          ★ Today&apos;s Top 50 ★
        </h2>
        {isYouTop10 ? (
          <p className="blink-hard mt-1 font-display text-lg uppercase tracking-[0.2em] text-win" role="status">
            New high score!
          </p>
        ) : null}
        {typeof yourRank === "number" && board.total ? (
          <p className="mt-1 text-[11px] font-bold tracking-[0.18em] text-paper">
            {yourInitials ? `${yourInitials} · ` : ""}YOUR RANK <span className="text-gold">#{yourRank}</span> OF{" "}
            {board.total}
          </p>
        ) : null}
      </div>

      <ol className="mt-3 space-y-0 font-mono text-[13px]">
        {board.top.map((row, i) => {
          const rank = i + 1;
          const you = typeof yourRank === "number" && rank === yourRank && row.initials === yourInitials;
          return (
            <li
              key={`${row.initials}-${i}`}
              className={`flex items-center gap-2 border-b border-line/40 px-2 py-1 last:border-b-0 ${
                you ? "bg-gold/10" : ""
              }`}
            >
              <span className={`w-8 text-right font-display text-[15px] ${rank <= 3 ? "text-gold" : "text-dim"}`}>
                {rank}
              </span>
              <span className={`w-12 font-bold tracking-[0.2em] ${you ? "text-gold" : "text-paper"}`}>
                {row.initials}
              </span>
              <span className="flex-1 text-right text-paper">{row.ovr} OVR</span>
              <span className="w-20 text-right text-dim">
                {row.roundsWon === 10 ? "CLEARED" : `RD ${row.roundsWon + 1}`}
              </span>
            </li>
          );
        })}
        {board.top.length === 0 ? (
          <li className="py-4 text-center text-[12px] text-dim">No scores yet today. Hang the first one.</li>
        ) : null}
      </ol>

      <p className="mt-2 text-center text-[10px] tracking-[0.16em] text-dim">RESETS AT MIDNIGHT UTC</p>
    </section>
  );
}

/** Three-letter arcade tag entry. Slur-blocked, uppercase, nothing else stored. */
export function InitialsEntry({
  defaultInitials,
  submitting,
  onSubmit,
  onSkip,
}: {
  defaultInitials?: string | null;
  submitting: boolean;
  onSubmit: (initials: string) => void;
  onSkip: () => void;
}) {
  const [value, setValue] = useState(defaultInitials ?? "");
  const clean = cleanInitials(value);

  return (
    <section aria-label="Enter your initials" className="rounded-xl border-2 border-gold/60 bg-panel2 p-4 text-center">
      <h2 className="font-display text-2xl uppercase tracking-[0.14em] text-gold">Enter your initials</h2>
      <p className="mt-1 text-[11px] text-dim">Three letters. Arcade rules. Today&apos;s board only.</p>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3))}
        maxLength={3}
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        aria-label="Your three-letter initials"
        placeholder="AAA"
        className="mt-3 w-40 rounded-lg border-2 border-gold/70 bg-ink px-2 py-3 text-center font-display text-4xl uppercase tracking-[0.5em] text-gold outline-none placeholder:text-dim/40 focus:border-gold"
      />
      {value.length === 3 && !clean ? (
        <p className="mt-1 text-[11px] font-bold text-loss" role="alert">
          Not those letters. Try again.
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={!clean || submitting}
          onClick={() => clean && onSubmit(clean)}
          className={`flex-1 rounded-lg py-3 font-display text-xl uppercase tracking-wide transition-transform active:scale-[0.99] ${
            clean && !submitting ? "bg-gold text-ink" : "cursor-not-allowed bg-gold/30 text-ink/60"
          }`}
        >
          {submitting ? "Posting…" : "Post score"}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-lg border border-line px-4 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-dim transition-colors hover:border-gold hover:text-gold"
        >
          Skip
        </button>
      </div>
    </section>
  );
}
