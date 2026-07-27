"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BUCKETS } from "@/data/eras";
import { FLAWS } from "@/data/flaws";
import { formatDailyBlock } from "@/lib/daily";
import { encodeSteal } from "@/lib/encode";
import { freshSeed, usePrefersReducedMotion } from "@/lib/hooks";
import { resultText } from "@/lib/share";
import { drawFlaws } from "@/lib/shop";
import { simulateSteals } from "@/lib/steal";
import { maybeRecordBest } from "@/lib/storage";
import { ROUNDS, canRespin, tokensFor, totalRespinsLeft, type SpinsUsed } from "@/lib/wheel";
import type { GameMode, StealBuild, StealResult } from "@/lib/types";
import { AdSlot } from "@/components/AdSlot";
import { FlawSpin } from "@/components/FlawSpin";
import { GauntletLog } from "@/components/GauntletLog";
import { ShareRow } from "@/components/ShareRow";
import { SimTicker } from "@/components/SimTicker";
import { StealCard } from "@/components/StealCard";
import { StealRound } from "@/components/StealRound";
import { Verdict } from "@/components/Verdict";

type Phase = "flaw" | "steal" | "sim" | "verdict" | "result";

export type Challenge = {
  code: string;
  seed: number;
  ovr: number;
  archetypeName: string;
};

const ZERO: SpinsUsed = { team: 0, era: 0 };

/**
 * The v3 loop: flaw → six steals → sim → verdict → result.
 * The sim underneath is pure; this component owns UI state and timers only.
 */
export function StealFlow({
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
  topPct?: number | null;
  onOfficialComplete?: (result: StealResult, code: string, block: string) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [seed, setSeed] = useState<number | null>(fixedSeed ?? null);
  const [phase, setPhase] = useState<Phase>("flaw");
  const [flawIdx, setFlawIdx] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  /** re-spins spent per round, index-aligned with ATTRS */
  const [spins, setSpins] = useState<SpinsUsed[]>(() => Array.from({ length: ROUNDS }, () => ({ ...ZERO })));
  const [picks, setPicks] = useState<Array<[number, number]>>([]);
  const [attempt, setAttempt] = useState(startAttempt);
  const [result, setResult] = useState<StealResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const officialReported = useRef(false);

  useEffect(() => {
    if (seed === null) setSeed(freshSeed());
  }, [seed]);

  const flawChoices = useMemo(() => (seed !== null ? drawFlaws(seed) : []), [seed]);
  const tokens = useMemo(() => (flawIdx === null ? null : tokensFor(FLAWS[flawIdx])), [flawIdx]);
  const usedTotal = useMemo(
    () => spins.reduce((acc, s) => ({ team: acc.team + s.team, era: acc.era + s.era }), { ...ZERO }),
    [spins]
  );
  const stolen = useMemo(() => new Set(picks.map(([b, p]) => BUCKETS[b].players[p].person)), [picks]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (phase !== "sim") return;
    const t = setTimeout(() => setPhase("verdict"), reduced ? 400 : 1700);
    return () => clearTimeout(t);
  }, [phase, reduced]);

  const isOfficialRun = official && attempt === startAttempt;

  useEffect(() => {
    if (phase !== "result" || !result) return;
    const code = encodeSteal(result.build);
    if (isOfficialRun && onOfficialComplete && !officialReported.current) {
      officialReported.current = true;
      onOfficialComplete(result, code, formatDailyBlock(result, daily?.number ?? 1));
    }
    if (mode === "sandbox") {
      maybeRecordBest({ ovr: result.derived.ovr, code, archetypeName: result.archetype.name });
    }
  }, [phase, result, isOfficialRun, mode, onOfficialComplete, daily?.number]);

  const runSim = useCallback(
    (steals: Array<[number, number]>, withAttempt: number) => {
      if (seed === null || flawIdx === null) return;
      const build: StealBuild = {
        v: 3,
        mode,
        seed,
        flaw: flawIdx,
        steals,
        attempt: withAttempt,
        daily: daily?.number ?? 0,
        knowledge,
      };
      const res = simulateSteals(build);
      if (!res) {
        setToast("That run doesn't add up. Start over.");
        return;
      }
      setAttempt(withAttempt);
      setResult(res);
      setPhase("sim");
    },
    [seed, flawIdx, mode, daily, knowledge]
  );

  const handleRespin = useCallback(
    (kind: "team" | "era") => {
      if (!tokens || !canRespin(kind, tokens, usedTotal)) return;
      setSpins((prev) => prev.map((s, i) => (i === round ? { ...s, [kind]: s[kind] + 1 } : s)));
    },
    [tokens, usedTotal, round]
  );

  const handleSteal = useCallback(
    (bucketIdx: number, playerIdx: number) => {
      if (stolen.has(BUCKETS[bucketIdx].players[playerIdx].person)) {
        setToast("Already stolen from. One skill per player.");
        return;
      }
      const next = [...picks, [bucketIdx, playerIdx] as [number, number]];
      setPicks(next);
      if (next.length === ROUNDS) runSim(next, attempt);
      else setRound(next.length);
    },
    [picks, stolen, runSim, attempt]
  );

  const newRun = useCallback(() => {
    setPicks([]);
    setRound(0);
    setSpins(Array.from({ length: ROUNDS }, () => ({ ...ZERO })));
    setFlawIdx(null);
    setResult(null);
    setAttempt((a) => (mode === "daily" ? a + 1 : 0));
    if (mode === "sandbox") setSeed(challenge ? challenge.seed : freshSeed());
    setPhase("flaw");
  }, [mode, challenge]);

  if (seed === null) return <div className="min-h-[420px]" aria-hidden />;

  const code = result ? encodeSteal(result.build) : "";
  const modeChip =
    mode === "daily"
      ? `DAILY #${daily?.number ?? "?"} · ${isOfficialRun ? "OFFICIAL" : "PRACTICE"}`
      : challenge
        ? "DUEL"
        : "SANDBOX";

  return (
    <div>
      {phase === "flaw" ? (
        <FlawSpin
          choices={flawChoices}
          selected={flawIdx}
          onSelect={setFlawIdx}
          onAccept={() => setPhase("steal")}
        />
      ) : null}

      {phase === "steal" && tokens ? (
        <>
          <div className="sticky top-0 z-30 -mx-4 flex items-center justify-between border-b border-line bg-ink/95 px-4 py-2 backdrop-blur">
            <div className="flex gap-1" aria-label={`${picks.length} of ${ROUNDS} steals made`}>
              {Array.from({ length: ROUNDS }, (_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i < picks.length ? "bg-gold" : i === picks.length ? "border-2 border-gold pulse-soft" : "bg-line"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold tracking-[0.14em] text-dim">
              RE-SPINS <span className="text-gold">{totalRespinsLeft(tokens, usedTotal)}</span> LEFT
            </span>
          </div>

          <StealRound
            key={round}
            round={round}
            seed={seed}
            spins={spins[round]}
            tokens={tokens}
            usedTotal={usedTotal}
            knowledge={knowledge}
            stolen={stolen}
            onRespin={handleRespin}
            onSteal={handleSteal}
          />
          <AdSlot id="shop-footer" />
        </>
      ) : null}

      {phase === "sim" ? <SimTicker attempt={attempt} /> : null}

      {phase === "verdict" && result ? (
        <Verdict key={result.simSeed} result={result} onDone={() => setPhase("result")} />
      ) : null}

      {phase === "result" && result ? (
        <div className="pt-2">
          <StealCard
            key={result.simSeed}
            result={result}
            animate
            modeChip={modeChip}
            challenge={challenge ? { ovr: challenge.ovr, archetypeName: challenge.archetypeName } : null}
            topPct={isOfficialRun ? topPct : null}
          />

          <button
            type="button"
            onClick={() => runSim(picks, attempt + 1)}
            className="mt-4 w-full rounded-lg bg-gold py-4 font-display text-2xl uppercase tracking-wide text-ink shadow-[0_8px_28px_rgba(242,185,75,0.3)] transition-transform active:scale-[0.99]"
          >
            Run it back
          </button>
          <p className="mt-1.5 text-center text-[11px] text-dim">
            Same six steals, fresh variance{official && !isOfficialRun ? " · practice" : ""}
            {isOfficialRun && official ? " · re-sims are unofficial" : ""}
          </p>

          <ShareRow
            summary={{ ovr: result.derived.ovr, archetypeName: result.archetype.name }}
            text={resultText(result, code)}
            code={code}
            dailyBlock={isOfficialRun && daily ? formatDailyBlock(result, daily.number, topPct) : undefined}
          />

          <AdSlot id="result-primary" refreshKey={attempt} />

          <GauntletLog result={result} refreshKey={attempt} />

          <button
            type="button"
            onClick={newRun}
            className="mt-6 w-full rounded-lg border border-line py-3 font-display text-lg uppercase tracking-wide text-paper transition-colors hover:border-gold hover:text-gold"
          >
            {mode === "daily" ? "New practice run" : challenge ? "Rematch: same wheel" : "New run"}
          </button>
        </div>
      ) : null}

      {toast ? (
        <div
          role="alert"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-loss px-4 py-2 text-[13px] font-semibold text-white shadow-xl"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
