"use client";

import { useEffect, useState } from "react";
import { TICKER_LINES } from "@/data/narrative";
import { mulberry32, shuffle } from "@/lib/rng";
import { usePrefersReducedMotion } from "@/lib/hooks";

/**
 * The 1.8s pre-reveal beat. Play-by-play lines build tension while the ten
 * round dots fill; the result is already computed and waiting behind it.
 */
export function SimTicker({ attempt }: { attempt: number }) {
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [dots, setDots] = useState(0);
  const lines = shuffle(mulberry32(attempt + 1), TICKER_LINES);

  useEffect(() => {
    if (reduced) return;
    const lineTimer = setInterval(() => setIdx((i) => i + 1), 320);
    const dotTimer = setInterval(() => setDots((d) => Math.min(10, d + 1)), 170);
    return () => {
      clearInterval(lineTimer);
      clearInterval(dotTimer);
    };
  }, [reduced]);

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 text-center">
      <span className="pulse-soft font-display text-4xl uppercase tracking-wide text-paper">
        Simulating
      </span>
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className="h-3 w-3 rounded-[3px] transition-colors duration-150"
            style={{ background: i < dots ? "#f2b94b" : "transparent", border: "1px solid #26314b" }}
          />
        ))}
      </div>
      <p className="h-5 text-[13px] text-dim" role="status">
        {reduced ? "Running the gauntlet…" : lines[idx % lines.length]}
      </p>
    </div>
  );
}
