"use client";

import { GAUNTLET } from "@/data/gauntlet";
import type { SimResult } from "@/lib/types";
import { AdSlot } from "@/components/AdSlot";

/** Rung-by-rung story. Reads like a box score with a narrator. */
export function GauntletLog({ result, refreshKey }: { result: SimResult; refreshKey?: number }) {
  const rows = result.rungs;
  return (
    <section aria-label="Gauntlet log" className="mt-6">
      <h2 className="font-display text-lg uppercase tracking-wide text-paper">The Gauntlet</h2>
      <ol className="mt-2 space-y-0">
        {rows.map((r, i) => {
          const opp = GAUNTLET[r.rung - 1];
          return (
            <li key={r.rung}>
              {i === 5 ? <AdSlot id="gauntlet-log" refreshKey={refreshKey} /> : null}
              <div className="flex gap-3 border-b border-line/60 py-2.5">
                <span className="w-6 shrink-0 pt-0.5 text-right font-display text-lg text-dim">{r.rung}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold">
                      {opp.name} <span className="text-dim">· {opp.title}</span>
                    </span>
                    <span
                      className="shrink-0 font-display text-[15px] tracking-wide"
                      style={{ color: r.win ? "#3fb68b" : "#e5484d" }}
                    >
                      {r.injuryEnd ? "INJ" : r.win ? "W" : "L"} {r.playerScore}–{r.oppScore}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] leading-snug text-dim">
                    {r.flawFired && !r.win ? (
                      <span className="mr-1.5 rounded-sm border border-loss/60 px-1 text-[9px] font-bold tracking-wide text-loss">
                        FLAW
                      </span>
                    ) : null}
                    {r.beat}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
        {result.fellAt === null ? (
          <li className="py-3 text-center font-display text-base uppercase tracking-wide text-win">
            All ten rungs. Nothing left to climb.
          </li>
        ) : result.rungs.length < 10 ? (
          <li className="py-3 text-center text-[11px] tracking-[0.2em] text-dim">
            {10 - result.rungs.length} RUNG{10 - result.rungs.length === 1 ? "" : "S"} NEVER REACHED
          </li>
        ) : null}
      </ol>
    </section>
  );
}
