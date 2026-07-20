"use client";

import { useEffect, useMemo, useState } from "react";
import { dailyNumberFor, dailySeed, formatCountdown, formatDailyBlock, msToNextUtcMidnight, utcDateString } from "@/lib/daily";
import { decodeBuild } from "@/lib/encode";
import { useMounted } from "@/lib/hooks";
import { submitDailyRank } from "@/lib/rankClient";
import { simulate } from "@/lib/sim";
import { attachDailyPercentile, getDailyState, recordOfficialDaily, type DailyState } from "@/lib/storage";
import type { SimResult } from "@/lib/types";
import { GameFlow } from "@/components/GameFlow";
import { GauntletLog } from "@/components/GauntletLog";
import { ResultCard } from "@/components/ResultCard";
import { ShareRow } from "@/components/ShareRow";

function Countdown() {
  const [ms, setMs] = useState(() => msToNextUtcMidnight());
  useEffect(() => {
    const t = setInterval(() => setMs(msToNextUtcMidnight()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="tabular-nums">{formatCountdown(ms)}</span>;
}

/**
 * The daily: seeded by UTC date, identical for everyone, one official run,
 * streak in localStorage, practice unlimited but marked.
 */
export function DailyShell() {
  const mounted = useMounted();
  const [state, setState] = useState<DailyState | null>(null);
  const [practicing, setPracticing] = useState(false);
  const [topPct, setTopPct] = useState<number | null>(null);
  /** true while this session's own official run is on screen — keeps the
   * animated reveal up instead of snapping to the locked recap */
  const [livePlaythrough, setLivePlaythrough] = useState(false);

  const today = useMemo(() => {
    const date = utcDateString();
    return { date, number: dailyNumberFor(date), seed: dailySeed(date) };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const s = getDailyState();
    setState(s);
    if (s.last?.date === today.date && typeof s.last.topPct === "number") {
      setTopPct(s.last.topPct);
    }
  }, [mounted, today.date]);

  if (!mounted || !state) {
    return <div className="min-h-[480px]" aria-hidden />;
  }

  const playedToday = state.last?.date === today.date;
  const official: SimResult | null =
    playedToday && state.last
      ? (() => {
          const build = decodeBuild(state.last.code);
          return build ? simulate(build) : null;
        })()
      : null;

  return (
    <div>
      <div className="flex items-end justify-between pb-4 pt-1">
        <div>
          <h1 className="font-display text-[27px] uppercase leading-none">Daily #{today.number}</h1>
          <p className="mt-1 text-[12px] text-dim">Everyone on Earth gets this shop.</p>
        </div>
        <div className="text-right text-[11px] font-bold tracking-[0.14em]">
          <p className="text-dim">
            STREAK <span className="text-gold">{state.streak}</span>
            {state.bestStreak > state.streak ? <span className="text-dim/70"> · BEST {state.bestStreak}</span> : null}
          </p>
          <p className="mt-1 text-dim">
            NEXT IN <Countdown />
          </p>
        </div>
      </div>

      {!playedToday || livePlaythrough ? (
        <>
          {!playedToday ? (
            <div className="mb-4 rounded-lg border border-gold/50 bg-panel p-3 text-[13px]">
              <p className="text-[10px] font-bold tracking-[0.2em] text-gold">OFFICIAL ATTEMPT</p>
              <p className="mt-1 text-paper">
                One run counts. It locks the second the buzzer sounds — build like it matters.
              </p>
            </div>
          ) : null}
          <GameFlow
            mode="daily"
            fixedSeed={today.seed}
            daily={{ number: today.number, date: today.date }}
            official
            topPct={topPct}
            onOfficialComplete={(result, code, block) => {
              setLivePlaythrough(true);
              const next = recordOfficialDaily({
                date: today.date,
                number: today.number,
                code,
                ovr: result.derived.ovr,
                archetypeName: result.archetype.name,
                fellAt: result.fellAt,
                block,
              });
              setState(next);
              // percentile v1.1 — fire-and-forget; null means the feature is off
              void submitDailyRank(code).then((pct) => {
                if (pct === null) return;
                const withPct = formatDailyBlock(result, today.number, pct);
                setTopPct(pct);
                setState(attachDailyPercentile(today.date, pct, withPct));
              });
            }}
          />
        </>
      ) : practicing ? (
        <>
          <div className="mb-4 rounded-lg border border-line bg-panel p-3 text-[12px] text-dim">
            Practice mode — same shop, nothing counts, nobody has to know.
          </div>
          <GameFlow
            mode="daily"
            fixedSeed={today.seed}
            daily={{ number: today.number, date: today.date }}
            startAttempt={1}
          />
        </>
      ) : (
        <div>
          {official ? (
            <>
              <ResultCard
                result={official}
                modeChip={`DAILY #${today.number} · OFFICIAL`}
                topPct={state.last?.topPct ?? null}
              />
              <ShareRow
                result={official}
                code={state.last!.code}
                dailyBlock={state.last!.block}
              />
            </>
          ) : null}

          <div className="mt-6 rounded-lg border border-line bg-panel p-4 text-center">
            <p className="text-[11px] font-bold tracking-[0.2em] text-dim">TODAY IS LOCKED IN</p>
            <p className="mt-2 font-display text-3xl text-paper">
              <Countdown />
            </p>
            <p className="mt-1 text-[11px] text-dim">until Daily #{today.number + 1}</p>
          </div>

          <button
            type="button"
            onClick={() => setPracticing(true)}
            className="mt-4 w-full rounded-lg border border-line py-3 font-display text-lg uppercase tracking-wide text-paper transition-colors hover:border-gold hover:text-gold"
          >
            Practice today&apos;s shop
          </button>

          {official ? <GauntletLog result={official} /> : null}
        </div>
      )}
    </div>
  );
}
