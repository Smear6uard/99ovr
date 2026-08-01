"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DECADE_BUCKETS } from "@/data/eras/decades";
import { POS_DECADES } from "@/data/positions";
import { FLAWS } from "@/data/flaws";
import { formatDailyBlock } from "@/lib/daily";
import { encodeSteal } from "@/lib/encode";
import { GRADE_HEX } from "@/lib/grade";
import { freshSeed, usePrefersReducedMotion } from "@/lib/hooks";
import { copyText, h2hUrl, resultText } from "@/lib/share";
import { playSfx } from "@/lib/sfx";
import { drawFlaws } from "@/lib/shop";
import { POS_TOKENS, posBucketFor } from "@/lib/poswheel";
import { STEAL_BUDGET, WHEEL_AFTER, canAffordSteal, priceIn, simulateSteals } from "@/lib/steal";
import { maybeRecordBest } from "@/lib/storage";
import { TIER_HEX, tierFor } from "@/lib/tiers";
import { DECADE_POOL, ROUNDS, V4_TOKENS, bucketIndexAt, canRespin, respinBucketIndex, totalRespinsLeft, type SpinsUsed } from "@/lib/wheel";
import { ATTR_LABELS, type PositionMode, type Steal, type StealBuild, type StealMode, type StealResult } from "@/lib/types";
import { AdSlot } from "@/components/AdSlot";
import { FlawSpin } from "@/components/FlawSpin";
import { GauntletLog } from "@/components/GauntletLog";
import { H2HCompare } from "@/components/H2HCompare";
import { ShareRow } from "@/components/ShareRow";
import { SimTicker } from "@/components/SimTicker";
import { StealCard } from "@/components/StealCard";
import { StealRound } from "@/components/StealRound";

type Phase = "steal" | "wheel" | "sim" | "result";

const ZERO: SpinsUsed = { team: 0, era: 0 };

function BookendChips({ result }: { result: StealResult }) {
  const rows: Array<{ title: string; steal: Steal; hex: string }> = [
    { title: "BEST STEAL", steal: result.bestSteal, hex: "#3fb68b" },
    { title: "THE REACH", steal: result.reach, hex: "#e5484d" },
  ];
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {rows.map((row) => (
        <div key={row.title} className="rounded-lg border-2 bg-panel px-3 py-2.5" style={{ borderColor: row.hex }}>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold tracking-[0.2em]" style={{ color: row.hex }}>
              {row.title}
            </span>
            <span
              className="inline-flex h-5 min-w-7 items-center justify-center border font-display text-[12px]"
              style={{ borderColor: GRADE_HEX[row.steal.grade], color: GRADE_HEX[row.steal.grade] }}
            >
              {row.steal.grade}
            </span>
          </div>
          <p className="mt-1 truncate font-display text-lg uppercase leading-tight text-paper">
            {row.steal.player.name}
          </p>
          <p className="truncate text-[9px] tracking-[0.12em] text-dim">
            {ATTR_LABELS[row.steal.attr].toUpperCase()} · {row.steal.bucket.label}
          </p>
        </div>
      ))}
    </div>
  );
}

/** One summary line; the full game log stays behind the accordion, never auto-played. */
function GauntletAccordion({ result, refreshKey }: { result: StealResult; refreshKey?: number }) {
  const line =
    result.fellAt === null
      ? "Cleared all 10 Rounds"
      : `Fell in Round ${result.fellAt} — ${result.gauntlet[result.fellAt - 1].shortName}`;
  return (
    <details className="mt-3 rounded-lg border border-line bg-panel">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 [&::-webkit-details-marker]:hidden">
        <span className="text-[12px] font-bold tracking-[0.1em]" style={{ color: result.fellAt === null ? "#3fb68b" : "#e5484d" }}>
          {line.toUpperCase()}
        </span>
        <span className="text-[10px] tracking-[0.16em] text-dim">VIEW LOG ▾</span>
      </summary>
      <div className="px-3 pb-2">
        <GauntletLog result={result} refreshKey={refreshKey} />
      </div>
    </details>
  );
}

export type StealFlowProps = {
  mode: StealMode;
  /** Ball Knowledge + build target — Classic/Budget pick these on the setup sheet */
  knowledge?: boolean;
  target?: PositionMode;
  fixedSeed?: number;
  daily?: { number: number; date: string };
  official?: boolean;
  startAttempt?: number;
  /** Head to Head: the challenger's re-simulated run — result becomes a comparison */
  challenge?: StealResult | null;
  /** rendered on the official daily result screen (initials entry, leaderboard) */
  officialExtras?: React.ReactNode;
  onOfficialComplete?: (result: StealResult, code: string, block: string) => void;
};

/**
 * The core loop, all four modes: six spins, six steals, one verdict screen.
 * Classic/Daily never see a flaw; Budget breaks for the weakness wheel after
 * three steals. The sim underneath is pure; this owns UI state and timers.
 */
export function StealFlow({
  mode,
  knowledge = false,
  target = "ALL",
  fixedSeed,
  daily,
  official = false,
  startAttempt = 0,
  challenge = null,
  officialExtras,
  onOfficialComplete,
}: StealFlowProps) {
  const reduced = usePrefersReducedMotion();
  const budgetMode = mode === "budget";
  const [seed, setSeed] = useState<number | null>(fixedSeed ?? null);
  const [phase, setPhase] = useState<Phase>("steal");
  const [flawIdx, setFlawIdx] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  /** re-spins spent per round, index-aligned with ATTRS */
  const [spins, setSpins] = useState<SpinsUsed[]>(() => Array.from({ length: ROUNDS }, () => ({ ...ZERO })));
  /** Current one-axis landing per non-positional round; null means the base spin. */
  const [landings, setLandings] = useState<Array<number | null>>(() => Array.from({ length: ROUNDS }, () => null));
  const [picks, setPicks] = useState<Array<[number, number]>>([]);
  const [attempt, setAttempt] = useState(startAttempt);
  const [result, setResult] = useState<StealResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [challengeCopied, setChallengeCopied] = useState(false);
  const officialReported = useRef(false);

  useEffect(() => {
    if (seed === null) setSeed(freshSeed());
  }, [seed]);

  const flawChoices = useMemo(
    () => (budgetMode && seed !== null ? drawFlaws(seed) : []),
    [budgetMode, seed]
  );
  const usedTotal = useMemo(
    () => spins.reduce((acc, s) => ({ team: acc.team + s.team, era: acc.era + s.era }), { ...ZERO }),
    [spins]
  );
  const positional = target !== "ALL";
  const bucketOfPick = useCallback(
    (pick: [number, number], round: number) =>
      positional ? posBucketFor(seed ?? 0, round, POS_DECADES[pick[0]], target) : DECADE_BUCKETS[pick[0]],
    [positional, seed, target]
  );
  const stolen = useMemo(
    () => new Set(picks.map((pick, r) => bucketOfPick(pick, r).players[pick[1]].person)),
    [picks, bucketOfPick]
  );
  const refund = budgetMode && flawIdx !== null ? FLAWS[flawIdx].refund : 0;
  const spent = useMemo(
    () => (budgetMode ? picks.reduce((acc, pick, r) => acc + priceIn(bucketOfPick(pick, r), r, pick[1]), 0) : 0),
    [budgetMode, picks, bucketOfPick]
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // the short SIMULATING beat, then straight to the one verdict screen
  useEffect(() => {
    if (phase !== "sim") return;
    const t = setTimeout(() => setPhase("result"), reduced ? 400 : 1500);
    return () => clearTimeout(t);
  }, [phase, reduced]);

  const isOfficialRun = official && attempt === startAttempt;

  useEffect(() => {
    if (phase !== "result" || !result) return;
    playSfx("stamp");
    const code = encodeSteal(result.build);
    if (isOfficialRun && onOfficialComplete && !officialReported.current) {
      officialReported.current = true;
      onOfficialComplete(result, code, formatDailyBlock(result, daily?.number ?? 1));
    }
    if (mode === "classic" && !challenge) {
      maybeRecordBest({ ovr: result.derived.ovr, code, archetypeName: result.archetype.name });
    }
  }, [phase, result, isOfficialRun, mode, challenge, onOfficialComplete, daily?.number]);

  const runSim = useCallback(
    (steals: Array<[number, number]>, withAttempt: number) => {
      if (seed === null) return;
      const build: StealBuild = {
        v: 5,
        mode,
        seed,
        flaw: budgetMode ? (flawIdx ?? 0) : -1,
        target,
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
    [seed, mode, budgetMode, flawIdx, target, daily, knowledge]
  );

  const handleRespin = useCallback(
    (kind: "team" | "era") => {
      if (positional) {
        if (usedTotal.team + usedTotal.era >= POS_TOKENS) return;
      } else if (!canRespin(kind, V4_TOKENS, usedTotal)) {
        return;
      }
      if (!positional) {
        const current = landings[round] ?? bucketIndexAt(seed ?? 0, round, 0, 0, DECADE_POOL);
        const next = respinBucketIndex(seed ?? 0, round, current, kind, DECADE_POOL);
        if (next === current) return;
        setLandings((prev) => prev.map((landing, i) => (i === round ? next : landing)));
      }
      setSpins((prev) => prev.map((s, i) => (i === round ? { ...s, [kind]: s[kind] + 1 } : s)));
    },
    [positional, usedTotal, landings, round, seed]
  );

  const handleSteal = useCallback(
    (bucketIdx: number, playerIdx: number) => {
      const bucket = bucketOfPick([bucketIdx, playerIdx], round);
      if (stolen.has(bucket.players[playerIdx].person)) {
        setToast("Already stolen from. One skill per player.");
        return;
      }
      if (budgetMode) {
        const price = priceIn(bucket, round, playerIdx);
        if (!canAffordSteal(spent, price, round, refund)) {
          setToast(`Can't afford $${price} — every remaining round still needs a dollar.`);
          return;
        }
        playSfx("cash");
      }
      const next = [...picks, [bucketIdx, playerIdx] as [number, number]];
      setPicks(next);
      if (next.length === ROUNDS) {
        runSim(next, attempt);
      } else {
        setRound(next.length);
        if (budgetMode && next.length === WHEEL_AFTER) setPhase("wheel");
      }
    },
    [picks, stolen, budgetMode, round, spent, refund, runSim, attempt, bucketOfPick]
  );

  const newRun = useCallback(() => {
    setPicks([]);
    setRound(0);
    setSpins(Array.from({ length: ROUNDS }, () => ({ ...ZERO })));
    setLandings(Array.from({ length: ROUNDS }, () => null));
    setFlawIdx(null);
    setResult(null);
    setAttempt((a) => (mode === "daily" ? a + 1 : 0));
    if (mode !== "daily") setSeed(challenge ? challenge.build.seed : freshSeed());
    setPhase("steal");
  }, [mode, challenge]);

  if (seed === null) return <div className="min-h-[420px]" aria-hidden />;

  const code = result ? encodeSteal(result.build) : "";
  const posChip = positional ? ` · BEST ${target}` : "";
  const modeChip =
    mode === "daily"
      ? `DAILY #${daily?.number ?? "?"}${posChip} · ${isOfficialRun ? "OFFICIAL" : "PRACTICE"}`
      : challenge
        ? `HEAD TO HEAD${posChip}`
        : mode === "budget"
          ? `BUDGET${posChip}`
          : `CLASSIC${posChip}`;
  const tierHex = result ? TIER_HEX[tierFor(result.derived.ovr)] : "#f2b94b";
  const budgetLeft = STEAL_BUDGET + refund - spent;

  return (
    <div>
      {phase === "steal" ? (
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
            <span className="flex items-center gap-3 text-[10px] font-bold tracking-[0.14em] text-dim">
              {budgetMode ? (
                <span aria-label={`${budgetLeft} dollars left`}>
                  BUDGET <span className="font-display text-[13px] tracking-normal text-win">${budgetLeft}</span>
                </span>
              ) : null}
              <span>
                RE-SPINS{" "}
                <span className="text-gold">
                  {positional ? POS_TOKENS - usedTotal.team - usedTotal.era : totalRespinsLeft(V4_TOKENS, usedTotal)}
                </span>{" "}
                LEFT
              </span>
            </span>
          </div>

          <StealRound
            key={round}
            round={round}
            seed={seed}
            spins={spins[round]}
            tokens={V4_TOKENS}
            usedTotal={usedTotal}
            target={target}
            knowledge={knowledge}
            stolen={stolen}
            budget={budgetMode ? { spent, refund, round } : null}
            landing={landings[round]}
            onRespin={handleRespin}
            onSteal={handleSteal}
          />
          <AdSlot id="shop-footer" />
        </>
      ) : null}

      {phase === "wheel" ? (
        <FlawSpin
          choices={flawChoices}
          selected={flawIdx}
          economy="budget"
          onSelect={setFlawIdx}
          onAccept={() => setPhase("steal")}
        />
      ) : null}

      {phase === "sim" ? <SimTicker attempt={attempt} /> : null}

      {phase === "result" && result ? (
        <div className="pt-2">
          {challenge ? (
            <H2HCompare key={result.simSeed} mine={result} theirs={challenge} />
          ) : (
            <>
              <StealCard key={result.simSeed} result={result} animate modeChip={modeChip} />
              <BookendChips result={result} />
              <GauntletAccordion result={result} refreshKey={attempt} />
            </>
          )}

          {/* RUN IT BACK — the most prominent thing on the screen: a whole new build */}
          <button
            type="button"
            onClick={newRun}
            className="mt-4 w-full rounded-xl py-5 font-display text-3xl uppercase tracking-[0.08em] text-ink transition-transform active:scale-[0.99]"
            style={{ background: tierHex, boxShadow: `0 10px 34px ${tierHex}55` }}
          >
            {challenge ? "Rematch: same wheel" : "Run it back"}
          </button>
          <p className="mt-1.5 text-center text-[11px] text-dim">
            {challenge
              ? "Same wheel, new build — settle it properly"
              : mode === "daily"
                ? "Same daily wheel, new build · practice runs are unofficial"
                : "Fresh wheel, whole new build"}
          </p>

          {mode === "classic" ? (
            <button
              type="button"
              onClick={() => {
                void copyText(h2hUrl(code)).then((ok) => {
                  setChallengeCopied(ok);
                  setTimeout(() => setChallengeCopied(false), 1600);
                });
              }}
              className="mt-3 w-full rounded-lg border-2 border-gold/70 py-3 font-display text-xl uppercase tracking-wide text-gold transition-colors hover:border-gold"
            >
              {challengeCopied ? "Link copied — go start beef" : "⚔ Challenge a friend"}
            </button>
          ) : null}

          <ShareRow
            summary={{ ovr: result.derived.ovr, archetypeName: result.archetype.name }}
            text={resultText(result, code)}
            code={code}
            dailyBlock={isOfficialRun && daily ? formatDailyBlock(result, daily.number) : undefined}
          />

          {isOfficialRun && officialExtras ? <div className="mt-4">{officialExtras}</div> : null}

          {challenge ? <GauntletAccordion result={result} refreshKey={attempt} /> : null}

          <AdSlot id="result-primary" refreshKey={attempt} />
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
