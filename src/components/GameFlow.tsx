"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { POOL } from "@/data/pool";
import { formatDailyBlock } from "@/lib/daily";
import { encodeBuild } from "@/lib/encode";
import { freshSeed, usePrefersReducedMotion } from "@/lib/hooks";
import { canPick, drawFlaws, drawShop, spendOf } from "@/lib/shop";
import { simulate } from "@/lib/sim";
import { maybeRecordBest } from "@/lib/storage";
import { SLOTS, type BuildCode, type GameMode, type SimResult, type SlotId } from "@/lib/types";
import { AdSlot } from "@/components/AdSlot";
import { FlawSpin } from "@/components/FlawSpin";
import { GauntletLog } from "@/components/GauntletLog";
import { ResultCard } from "@/components/ResultCard";
import { ShareRow } from "@/components/ShareRow";
import { SpinPhase } from "@/components/SpinPhase";
import { SimTicker } from "@/components/SimTicker";

type Phase = "shop" | "flaw" | "sim" | "result";

export type Challenge = {
  code: string;
  seed: number;
  ovr: number;
  archetypeName: string;
};

/**
 * The whole loop: shop → flaw → sim → result → (run it back | new build).
 * Pure sim underneath; this component only owns UI state and timers.
 */
export function GameFlow({
  mode,
  fixedSeed,
  daily,
  official = false,
  startAttempt = 0,
  challenge = null,
  knowledge = false,
  topPct = null,
  onOfficialComplete,
}: {
  mode: GameMode;
  fixedSeed?: number;
  daily?: { number: number; date: string };
  official?: boolean;
  startAttempt?: number;
  challenge?: Challenge | null;
  knowledge?: boolean;
  /** percentile v1.1 — supplied late by the parent once /api/daily-rank answers */
  topPct?: number | null;
  onOfficialComplete?: (result: SimResult, code: string, block: string) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [seed, setSeed] = useState<number | null>(fixedSeed ?? null);
  const [phase, setPhase] = useState<Phase>("shop");
  const [picks, setPicks] = useState<Partial<Record<SlotId, number>>>({});
  const [rerolled, setRerolled] = useState<SlotId[]>([]);
  const [flawIdx, setFlawIdx] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(startAttempt);
  const [result, setResult] = useState<SimResult | null>(null);
  const [toast, setToast] = useState<{ msg: string; nonce: number } | null>(null);
  const [shakeNonce, setShakeNonce] = useState(0);
  const officialReported = useRef(false);

  useEffect(() => {
    if (seed === null) setSeed(freshSeed());
  }, [seed]);

  const draw = useMemo(() => (seed !== null ? drawShop(seed, rerolled) : null), [seed, rerolled]);
  const flawChoices = useMemo(() => (seed !== null ? drawFlaws(seed) : []), [seed]);
  const spend = spendOf(picks);

  // toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // ticker → reveal
  useEffect(() => {
    if (phase !== "sim") return;
    const t = setTimeout(() => setPhase("result"), reduced ? 500 : 1900);
    return () => clearTimeout(t);
  }, [phase, reduced]);

  const isOfficialRun = official && attempt === startAttempt;

  // record official daily / sandbox best, once per result
  useEffect(() => {
    if (phase !== "result" || !result) return;
    const code = encodeBuild(result.build);
    if (isOfficialRun && onOfficialComplete && !officialReported.current) {
      officialReported.current = true;
      onOfficialComplete(result, code, formatDailyBlock(result, daily?.number ?? 1));
    }
    if (mode === "sandbox") {
      maybeRecordBest({ ovr: result.derived.ovr, code, archetypeName: result.archetype.name });
    }
  }, [phase, result, isOfficialRun, mode, onOfficialComplete]);

  const reject = useCallback((msg: string) => {
    setToast({ msg, nonce: Date.now() });
    setShakeNonce((n) => n + 1);
  }, []);

  const handlePick = useCallback(
    (slot: SlotId, poolIdx: number) => {
      const entry = POOL[slot][poolIdx];
      if (picks[slot] === poolIdx) {
        // tap again to unpick
        setPicks((p) => {
          const next = { ...p };
          delete next[slot];
          return next;
        });
        return;
      }
      const chk = canPick(picks, slot, entry.price);
      if (!chk.ok) {
        reject(chk.reason ?? "Over budget.");
        return;
      }
      setPicks((p) => ({ ...p, [slot]: poolIdx }));
    },
    [picks, reject]
  );

  const handleReroll = useCallback((slot: SlotId) => {
    setRerolled((r) => (r.includes(slot) ? r : [...r, slot]));
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
        v: 1,
        mode,
        seed,
        picks: SLOTS.map((s) => picks[s]!),
        flaw: flawIdx,
        attempt: withAttempt,
        daily: daily?.number ?? 0,
        knowledge,
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
    [seed, flawIdx, mode, picks, daily, reject, knowledge]
  );

  const newBuild = useCallback(() => {
    setPicks({});
    setRerolled([]);
    setFlawIdx(null);
    setResult(null);
    setAttempt((a) => (mode === "daily" ? a + 1 : 0));
    if (mode === "sandbox") setSeed(challenge ? challenge.seed : freshSeed());
    setPhase("shop");
  }, [mode, challenge]);

  if (seed === null || !draw) {
    return <div className="min-h-[420px]" aria-hidden />;
  }

  const code = result ? encodeBuild(result.build) : "";
  const modeChip =
    mode === "daily"
      ? `DAILY #${daily?.number ?? "?"} · ${isOfficialRun ? "OFFICIAL" : "PRACTICE"}`
      : challenge
        ? "DUEL"
        : "SANDBOX";

  return (
    <div>
      {phase === "shop" ? (
        <SpinPhase
          draw={draw}
          picks={picks}
          rerolled={rerolled}
          spend={spend}
          knowledge={knowledge}
          shakeNonce={shakeNonce}
          onPick={handlePick}
          onReroll={handleReroll}
          onComplete={() => setPhase("flaw")}
        />
      ) : null}

      {phase === "flaw" ? (
        <FlawSpin
          choices={flawChoices}
          selected={flawIdx}
          onSelect={setFlawIdx}
          onAccept={() => runSim(attempt)}
          onBack={() => setPhase("shop")}
        />
      ) : null}

      {phase === "sim" ? <SimTicker attempt={attempt} /> : null}

      {phase === "result" && result ? (
        <div className="pt-2">
          <ResultCard
            key={result.simSeed}
            result={result}
            animate
            modeChip={modeChip}
            challenge={challenge ? { ovr: challenge.ovr, archetypeName: challenge.archetypeName } : null}
            topPct={isOfficialRun ? topPct : null}
          />

          <button
            type="button"
            onClick={() => runSim(attempt + 1)}
            className="mt-4 w-full rounded-lg bg-gold py-4 font-display text-2xl uppercase tracking-wide text-ink shadow-[0_8px_28px_rgba(242,185,75,0.3)] transition-transform active:scale-[0.99]"
          >
            Run it back
          </button>
          <p className="mt-1.5 text-center text-[11px] text-dim">
            Same build, fresh variance{official && !isOfficialRun ? " · practice" : ""}
            {isOfficialRun && official ? " · re-sims are unofficial" : ""}
          </p>

          <ShareRow
            result={result}
            code={code}
            dailyBlock={isOfficialRun && daily ? formatDailyBlock(result, daily.number, topPct) : undefined}
          />

          <AdSlot id="result-primary" refreshKey={attempt} />

          <GauntletLog result={result} refreshKey={attempt} />

          <button
            type="button"
            onClick={newBuild}
            className="mt-6 w-full rounded-lg border border-line py-3 font-display text-lg uppercase tracking-wide text-paper transition-colors hover:border-gold hover:text-gold"
          >
            {mode === "daily" ? "New practice build" : challenge ? "Rematch: same shop" : "New build"}
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
