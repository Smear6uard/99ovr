"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { POOL } from "@/data/pool";
import { FLAWS } from "@/data/flaws";
import { encodeBuild } from "@/lib/encode";
import { freshSeed, usePrefersReducedMotion } from "@/lib/hooks";
import { budgetResultText } from "@/lib/share";
import { canPick, drawFlaws, drawShop, spendOf } from "@/lib/shop";
import { simulate } from "@/lib/sim";
import { nextAttempt } from "@/lib/run";
import { SLOTS, type BuildCode, type PositionMode, type SimResult, type SlotId } from "@/lib/types";
import { AdSlot } from "@/components/AdSlot";
import { FlawSpin } from "@/components/FlawSpin";
import { GauntletLog } from "@/components/GauntletLog";
import { ResultCard } from "@/components/ResultCard";
import { ShareRow } from "@/components/ShareRow";
import { SpinPhase } from "@/components/SpinPhase";
import { SimTicker } from "@/components/SimTicker";

type Phase = "flaw" | "shop" | "sim" | "result";

export type Challenge = {
  code: string;
  seed: number;
  ovr: number;
  archetypeName: string;
  position: PositionMode;
};

/**
 * Budget Ball — the original $20 builder, now a secondary mode at /budget.
 * Sandbox only: the daily and duel infrastructure moved to Six Steals.
 */
export function GameFlow({
  fixedSeed,
  challenge = null,
  knowledge = false,
  position = "ALL",
}: {
  fixedSeed?: number;
  challenge?: Challenge | null;
  knowledge?: boolean;
  position?: PositionMode;
}) {
  const reduced = usePrefersReducedMotion();
  const [seed, setSeed] = useState<number | null>(fixedSeed ?? null);
  const [phase, setPhase] = useState<Phase>("flaw");
  const [picks, setPicks] = useState<Partial<Record<SlotId, number>>>({});
  const [rerolled, setRerolled] = useState<SlotId[]>([]);
  const [flawIdx, setFlawIdx] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<SimResult | null>(null);
  const [toast, setToast] = useState<{ msg: string; nonce: number } | null>(null);
  const [shakeNonce, setShakeNonce] = useState(0);

  useEffect(() => {
    if (seed === null) setSeed(freshSeed());
  }, [seed]);

  const draw = useMemo(() => (seed !== null ? drawShop(seed, rerolled, position) : null), [seed, rerolled, position]);
  const flawChoices = useMemo(() => (seed !== null ? drawFlaws(seed) : []), [seed]);
  const spend = spendOf(picks);
  const budget = 20 + (flawIdx === null ? 0 : FLAWS[flawIdx].refund);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (phase !== "sim") return;
    const t = setTimeout(() => setPhase("result"), reduced ? 500 : 1900);
    return () => clearTimeout(t);
  }, [phase, reduced]);

  const reject = useCallback((msg: string) => {
    setToast({ msg, nonce: Date.now() });
    setShakeNonce((n) => n + 1);
  }, []);

  const handlePick = useCallback(
    (slot: SlotId, poolIdx: number) => {
      const entry = POOL[slot][poolIdx];
      if (picks[slot] === poolIdx) {
        setPicks((p) => {
          const next = { ...p };
          delete next[slot];
          return next;
        });
        return;
      }
      const chk = canPick(picks, slot, entry.price, budget);
      if (!chk.ok) {
        reject(chk.reason ?? "Over budget.");
        return;
      }
      setPicks((p) => ({ ...p, [slot]: poolIdx }));
    },
    [picks, reject, budget]
  );

  const handleReroll = useCallback((slot: SlotId) => {
    setRerolled((r) => (r.includes(slot) ? r : [...r, slot]));
    setPicks((p) => {
      const next = { ...p };
      delete next[slot];
      return next;
    });
  }, []);

  // Clear one pick so the builder returns to that slot. A used new pack is
  // not refunded — `rerolled` is intentionally untouched.
  const handleRevise = useCallback((slot: SlotId) => {
    setPicks((p) => {
      const next = { ...p };
      delete next[slot];
      return next;
    });
  }, []);

  const runSim = useCallback(
    (withAttempt: number) => {
      if (seed === null || flawIdx === null) return;
      const build: BuildCode = {
        v: 2,
        mode: "sandbox",
        seed,
        picks: SLOTS.map((s) => picks[s]!),
        flaw: flawIdx,
        attempt: withAttempt,
        daily: 0,
        knowledge,
        position,
      };
      const res = simulate(build);
      if (!res) {
        reject("That build doesn't fit the budget.");
        setPhase("shop");
        return;
      }
      setAttempt(withAttempt);
      setResult(res);
      setPhase("sim");
    },
    [seed, flawIdx, picks, reject, knowledge, position]
  );

  const newBuild = useCallback(() => {
    setPicks({});
    setRerolled([]);
    setFlawIdx(null);
    setResult(null);
    setAttempt(0);
    setSeed(challenge ? challenge.seed : freshSeed());
    setPhase("flaw");
  }, [challenge]);

  if (seed === null || !draw) {
    return <div className="min-h-[420px]" aria-hidden />;
  }

  const code = result ? encodeBuild(result.build) : "";

  return (
    <div>
      {phase === "shop" ? (
        <SpinPhase
          draw={draw}
          picks={picks}
          rerolled={rerolled}
          spend={spend}
          budget={budget}
          knowledge={knowledge}
          shakeNonce={shakeNonce}
          onPick={handlePick}
          onReroll={handleReroll}
          onRevise={handleRevise}
          onComplete={() => runSim(attempt)}
        />
      ) : null}

      {phase === "flaw" ? (
        <FlawSpin
          choices={flawChoices}
          selected={flawIdx}
          economy="budget"
          onSelect={setFlawIdx}
          onAccept={() => setPhase("shop")}
        />
      ) : null}

      {phase === "sim" ? <SimTicker attempt={attempt} /> : null}

      {phase === "result" && result ? (
        <div className="pt-2">
          <ResultCard
            key={result.simSeed}
            result={result}
            animate
            modeChip={challenge ? "BUDGET DUEL" : "BUDGET BALL"}
            challenge={challenge ? { ovr: challenge.ovr, archetypeName: challenge.archetypeName } : null}
          />

          <button
            type="button"
            onClick={() => runSim(nextAttempt(result.build).attempt)}
            className="mt-4 w-full rounded-lg bg-gold py-4 font-display text-2xl uppercase tracking-wide text-ink shadow-[0_8px_28px_rgba(242,185,75,0.3)] transition-transform active:scale-[0.99]"
          >
            Run it back
          </button>
          <p className="mt-1.5 text-center text-[11px] text-dim">Same build, fresh variance</p>

          <ShareRow
            summary={{ ovr: result.derived.ovr, archetypeName: result.archetype.name }}
            text={budgetResultText(result, code)}
            code={code}
          />

          <AdSlot id="result-primary" refreshKey={attempt} />

          <GauntletLog result={result} refreshKey={attempt} />

          <button
            type="button"
            onClick={newBuild}
            className="mt-6 w-full rounded-lg border border-line py-3 font-display text-lg uppercase tracking-wide text-paper transition-colors hover:border-gold hover:text-gold"
          >
            {challenge ? "Rematch: same shop" : "New build"}
          </button>
        </div>
      ) : null}

      {phase === "shop" ? <AdSlot id="shop-footer" /> : null}

      {toast ? (
        <div
          role="alert"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-loss px-4 py-2 text-[13px] font-semibold text-white shadow-xl"
        >
          {toast.msg}
        </div>
      ) : null}
    </div>
  );
}
