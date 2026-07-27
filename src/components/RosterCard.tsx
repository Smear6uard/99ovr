"use client";

import { ATTR_LABELS, type AttrId, type EraBucket } from "@/lib/types";

/**
 * The roster. No prices, no ratings — a name, a box line, and a signature
 * note. The box line only partially signals the attribute you're stealing,
 * and that gap is the whole game.
 */
export function RosterCard({
  bucket,
  attr,
  knowledge,
  stolen,
  onSteal,
}: {
  bucket: EraBucket;
  attr: AttrId;
  /** Ball Knowledge — names only, no box lines */
  knowledge: boolean;
  /** `person` keys already taken this run */
  stolen: Set<string>;
  onSteal: (playerIdx: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between px-0.5">
        <span className="text-[10px] font-bold tracking-[0.22em] text-gold/90">
          STEAL THE {ATTR_LABELS[attr].toUpperCase()}
        </span>
        <span className="text-[10px] tracking-[0.16em] text-dim">{bucket.players.length} ON THE ROSTER</span>
      </div>

      <ul className="mt-2 divide-y divide-line overflow-hidden rounded-lg border border-line bg-panel">
        {bucket.players.map((player, index) => {
          const taken = stolen.has(player.person);
          return (
            <li key={player.id}>
              <button
                type="button"
                disabled={taken}
                onClick={() => onSteal(index)}
                aria-label={`Steal ${ATTR_LABELS[attr]} from ${player.name}`}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  taken ? "cursor-not-allowed opacity-35" : "hover:bg-panel2 active:bg-panel2"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-[14px] font-semibold leading-tight text-paper ${
                      taken ? "line-through" : ""
                    }`}
                  >
                    {player.name}
                  </span>
                  {knowledge ? (
                    <span className="mt-0.5 block text-[10px] italic tracking-wide text-dim/70">
                      Ball Knowledge — stats hidden
                    </span>
                  ) : (
                    <span className="mt-0.5 block truncate font-mono text-[10px] leading-tight text-dim">
                      {player.line}
                    </span>
                  )}
                </span>
                <span className="hidden max-w-[42%] shrink-0 truncate text-right text-[10px] leading-tight text-dim/80 sm:block">
                  {taken ? "ALREADY STOLEN" : player.note}
                </span>
                <span aria-hidden className="shrink-0 font-display text-lg leading-none text-gold/70">
                  {taken ? "×" : "+"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-2 px-0.5 text-[11px] leading-snug text-dim">
        {knowledge
          ? "No stats. Just names. Prove you know ball."
          : "Points don't measure handles. Read the roster, not the box score."}
      </p>
    </div>
  );
}
