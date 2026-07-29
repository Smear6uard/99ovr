"use client";

import { useState } from "react";
import { POSITIONS, POSITION_LABELS, type Position, type PositionMode } from "@/lib/types";

export type StealSettings = { knowledge: boolean; target: PositionMode };

/**
 * The quick setup sheet Classic and Budget open with: stats on/off, then the
 * build target. Daily and Head to Head never see this — Daily is what the
 * seed says, H2H inherits the challenger's settings from the code.
 */
export function SetupSheet({
  modeName,
  modeBlurb,
  onStart,
}: {
  modeName: string;
  modeBlurb: string;
  onStart: (settings: StealSettings) => void;
}) {
  const [knowledge, setKnowledge] = useState(false);
  const [target, setTarget] = useState<PositionMode>("ALL");

  return (
    <div className="flex min-h-[64vh] flex-col pt-2">
      <div className="text-center">
        <span className="block text-[10px] font-bold tracking-[0.3em] text-gold/80">
          {modeName.toUpperCase()} · SET UP YOUR RUN
        </span>
        <h1 className="mt-1 font-display text-4xl uppercase leading-[0.92] text-paper">
          Two calls,
          <br />
          then we spin
        </h1>
        <p className="mx-auto mt-2 max-w-[21rem] text-[13px] leading-snug text-dim">{modeBlurb}</p>
      </div>

      {/* Stats visible? */}
      <section className="mt-6" aria-label="Stats visibility">
        <span className="text-[10px] font-bold tracking-[0.22em] text-dim">1 · HOW MUCH HELP</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(
            [
              { value: false, name: "Normal", desc: "Era box stats on every roster." },
              { value: true, name: "Ball Knowledge", desc: "Names only. Badge on every share." },
            ] as const
          ).map((opt) => (
            <button
              key={opt.name}
              type="button"
              aria-pressed={knowledge === opt.value}
              onClick={() => setKnowledge(opt.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                knowledge === opt.value ? "border-2 border-gold bg-panel" : "border-line bg-panel2 hover:border-dim"
              }`}
            >
              <span className={`block font-display text-xl uppercase leading-tight ${opt.value ? "text-gold" : "text-paper"}`}>
                {opt.value ? "🧠 " : ""}{opt.name}
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-dim">{opt.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Build target */}
      <section className="mt-5" aria-label="Build target">
        <span className="text-[10px] font-bold tracking-[0.22em] text-dim">2 · BUILD TARGET</span>
        <button
          type="button"
          aria-pressed={target === "ALL"}
          onClick={() => setTarget("ALL")}
          className={`mt-2 w-full rounded-lg border p-3 text-left transition-colors ${
            target === "ALL" ? "border-2 border-gold bg-panel" : "border-line bg-panel2 hover:border-dim"
          }`}
        >
          <span className="block font-display text-xl uppercase leading-tight text-paper">Best Player</span>
          <span className="mt-1 block text-[11px] leading-snug text-dim">
            The standard scoring. Six skills, one monster.
          </span>
        </button>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {POSITIONS.map((pos: Position) => (
            <button
              key={pos}
              type="button"
              aria-pressed={target === pos}
              onClick={() => setTarget(pos)}
              title={`Best ${POSITION_LABELS[pos].toLowerCase()}`}
              className={`rounded-lg border py-2.5 text-center font-display text-xl uppercase transition-colors ${
                target === pos ? "border-2 border-gold bg-panel text-gold" : "border-line bg-panel2 text-paper hover:border-dim"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
        <p className="mt-1.5 px-0.5 text-[11px] leading-snug text-dim">
          {target === "ALL"
            ? "Or chase a positional crown — position scoring, that position's all-time boss ladder."
            : `BEST ${target} BUILD: ${
                target === "C"
                  ? "rim and defense count more, creation less"
                  : target === "PG"
                    ? "playmaking and creation count more"
                    : target === "PF"
                      ? "rim pressure and defense count more"
                      : target === "SG"
                        ? "shot creation counts more"
                        : "two-way balance, slightly heavier defense"
              } — and you face the all-time ${target} ladder.`}
        </p>
      </section>

      <div className="mt-auto pb-2 pt-6">
        <button
          type="button"
          onClick={() => onStart({ knowledge, target })}
          className="w-full rounded-xl bg-gold py-4 font-display text-3xl uppercase tracking-[0.1em] text-ink shadow-[0_10px_30px_rgba(242,185,75,0.32)] transition-transform active:scale-[0.98]"
        >
          Start the run
        </button>
        <p className="mt-2 text-center text-[11px] text-dim">
          {knowledge ? "Names only — respect." : "Stats on — read them sideways."}{" "}
          {target === "ALL" ? "Best player it is." : `Best ${target} it is.`}
        </p>
      </div>
    </div>
  );
}
