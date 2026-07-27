"use client";

import { useEffect, useState } from "react";
import { GRADE_HEX } from "@/lib/grade";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { ATTR_LABELS, type Steal, type StealResult } from "@/lib/types";

function GradeStamp({ steal, animate, size = 64 }: { steal: Steal; animate: boolean; size?: number }) {
  return (
    <span
      className={`inline-flex items-center justify-center border-[3px] font-display leading-none ${animate ? "grade-pop" : ""}`}
      style={{
        borderColor: GRADE_HEX[steal.grade],
        color: GRADE_HEX[steal.grade],
        fontSize: size,
        padding: `${size * 0.06}px ${size * 0.18}px`,
      }}
    >
      {steal.grade}
    </span>
  );
}

function GradeSlide({ steal, index, animate }: { steal: Steal; index: number; animate: boolean }) {
  const perfect = steal.rank === 0;
  return (
    <div className="text-center">
      <span className="text-[10px] font-bold tracking-[0.3em] text-dim">
        ROUND {index + 1} · {ATTR_LABELS[steal.attr].toUpperCase()}
      </span>
      <p className="mt-1 font-display text-2xl uppercase leading-none text-paper">{steal.bucket.label}</p>

      <div className="mt-6 flex justify-center">
        <GradeStamp steal={steal} animate={animate} />
      </div>

      <div className="mt-6 space-y-1.5">
        <p className="text-[11px] font-bold tracking-[0.2em] text-dim">YOU STOLE</p>
        <p className="font-display text-3xl uppercase leading-none text-paper">{steal.player.name}</p>
        <p className="text-[11px] tracking-[0.14em] text-dim">
          {perfect ? "THE BEST ON THAT ROSTER" : `BEST AVAILABLE WAS ${steal.best.name.toUpperCase()}`}
        </p>
      </div>

      <p className="mx-auto mt-6 max-w-[19rem] text-[15px] leading-snug text-paper">&ldquo;{steal.verdict}&rdquo;</p>
    </div>
  );
}

function Bookends({ result, animate }: { result: StealResult; animate: boolean }) {
  const rows: Array<{ title: string; sub: string; steal: Steal; hex: string }> = [
    { title: "BEST STEAL", sub: "You earned this one.", steal: result.bestSteal, hex: "#3fb68b" },
    { title: "THE REACH", sub: "This one is going in the group chat.", steal: result.reach, hex: "#e5484d" },
  ];
  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <div
          key={row.title}
          className={`rounded-xl border-2 bg-panel p-4 ${animate ? "fade-up" : ""}`}
          style={{ borderColor: row.hex, animationDelay: `${index * 220}ms` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.24em]" style={{ color: row.hex }}>
              {row.title}
            </span>
            <GradeStamp steal={row.steal} animate={false} size={22} />
          </div>
          <p className="mt-2 font-display text-[26px] uppercase leading-none text-paper">{row.steal.player.name}</p>
          <p className="mt-1 text-[11px] tracking-[0.14em] text-dim">
            {ATTR_LABELS[row.steal.attr].toUpperCase()} · {row.steal.bucket.label}
          </p>
          <p className="mt-2 text-[12px] leading-snug text-dim">{row.sub}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * The judgment half of the run: six grades one at a time, then the bookends.
 * Auto-advances at a readable pace; tapping skips ahead immediately.
 */
export function Verdict({ result, onDone }: { result: StealResult; onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const last = result.steals.length; // final step is the bookends

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setStep((s) => Math.min(last, s + 1)), step === 0 ? 1500 : 2300);
    return () => clearTimeout(t);
  }, [step, last, reduced]);

  const advance = () => (step >= last ? onDone() : setStep(step + 1));

  return (
    <div className="flex min-h-[68vh] flex-col pt-4">
      <div className="text-center">
        <span className="text-[10px] font-bold tracking-[0.3em] text-gold/80">THE VERDICT</span>
        <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
          {result.steals.map((steal, index) => (
            <span
              key={steal.attr}
              className="h-1.5 w-6 rounded-full transition-colors"
              style={{ background: index < step ? GRADE_HEX[steal.grade] : "var(--color-line)" }}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={advance}
        className="flex flex-1 cursor-pointer flex-col justify-center py-6 text-left"
        aria-label={step >= last ? "Continue to the result" : "Next grade"}
      >
        {step < last ? (
          <GradeSlide key={step} steal={result.steals[step]} index={step} animate={!reduced} />
        ) : (
          <Bookends result={result} animate={!reduced} />
        )}
      </button>

      <div className="mt-auto pb-2">
        <button
          type="button"
          onClick={advance}
          className="w-full rounded-xl bg-gold py-4 font-display text-2xl uppercase tracking-[0.08em] text-ink shadow-[0_10px_30px_rgba(242,185,75,0.32)] transition-transform active:scale-[0.98]"
        >
          {step >= last ? "See the number" : "Next"}
        </button>
        <p className="mt-2 text-center text-[11px] text-dim">
          {step >= last
            ? "Six steals graded. Now the damage."
            : `Grade ${Math.min(step + 1, last)} of ${last} — tap anywhere to skip ahead`}
        </p>
      </div>
    </div>
  );
}
