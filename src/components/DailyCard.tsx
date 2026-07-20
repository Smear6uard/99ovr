"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { dailyNumberFor, formatCountdown, msToNextUtcMidnight, utcDateString } from "@/lib/daily";
import { useMounted } from "@/lib/hooks";
import { getDailyState } from "@/lib/storage";

export function DailyCard() {
  const mounted = useMounted();
  const [ms, setMs] = useState(0);
  const [info, setInfo] = useState<{ number: number; streak: number } | null>(null);

  useEffect(() => {
    setInfo({ number: dailyNumberFor(utcDateString()), streak: getDailyState().streak });
    setMs(msToNextUtcMidnight());
    const t = setInterval(() => setMs(msToNextUtcMidnight()), 1000);
    return () => clearInterval(t);
  }, []);

  const ready = mounted && info;
  const number = ready ? info!.number : null;
  const streak = ready ? info!.streak : null;
  const countdown = ready ? formatCountdown(ms) : "--:--:--";

  return (
    <Link
      href="/daily"
      aria-label="Daily challenge"
      className="group block rounded-xl border border-line bg-panel px-5 py-4 transition-colors hover:border-gold/60"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-dim">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-win/70 ${ready ? "pulse-soft" : ""}`}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-win" />
          </span>
          Daily Challenge
        </span>
        <span
          className="font-display text-lg leading-none text-dim transition-colors group-hover:text-gold"
          aria-hidden
        >
          &rarr;
        </span>
      </div>

      <h2 className="mt-2.5 font-display text-4xl uppercase leading-none text-paper">
        Daily <span className="text-gold">#{ready ? number : "—"}</span>
      </h2>

      <div className="mt-3 flex items-center gap-5 text-[11px] font-bold uppercase tracking-[0.16em] text-dim">
        <span>
          Next in{" "}
          <span className={`tabular-nums text-paper ${ready ? "" : "pulse-soft"}`}>{countdown}</span>
        </span>
        <span className="h-3 w-px bg-line" aria-hidden />
        <span>
          Streak <span className="text-paper">{ready ? streak : "—"}</span>
        </span>
      </div>
    </Link>
  );
}
