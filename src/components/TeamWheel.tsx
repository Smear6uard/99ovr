"use client";

import { useMemo } from "react";
import { BUCKETS } from "@/data/eras";
import { decadeTag } from "@/data/eras/authoring";
import type { EraBucket } from "@/lib/types";

const ROW = 44;
const STRIP = 18;
/** Lands row STRIP-1 in the middle of a three-row window. */
const TRAVEL = ROW - (STRIP - 1) * ROW;

/**
 * The slot reels. CRITICAL INVARIANT, same as the v2 builder: this component
 * is pure cosmetics. `bucket` is the already-decided landing from
 * `bucketAt(seed, …)`; the filler rows above it are decoration derived from a
 * fixed walk through BUCKETS. Nothing here imports RNG and nothing here
 * decides anything.
 */
function fillers(offset: number, pick: (bucket: EraBucket) => string, landing: string): string[] {
  const rows: string[] = [];
  for (let i = 0; i < STRIP - 1; i++) {
    const candidate = pick(BUCKETS[(offset + i * 7) % BUCKETS.length]);
    rows.push(candidate === landing && i > STRIP - 4 ? pick(BUCKETS[(offset + i * 7 + 3) % BUCKETS.length]) : candidate);
  }
  rows.push(landing);
  return rows;
}

function Reel({
  rows,
  spinning,
  delay,
  duration,
  label,
}: {
  rows: string[];
  spinning: boolean;
  delay: number;
  duration: number;
  label: string;
}) {
  return (
    <div className="flex-1">
      <span className="mb-1 block text-center text-[9px] font-bold tracking-[0.24em] text-dim">{label}</span>
      <div
        className="relative overflow-hidden rounded-lg border border-line bg-panel2"
        style={{ height: ROW * 3 }}
      >
        <div
          className={spinning ? "slot-reel" : undefined}
          style={
            {
              "--slot-travel": `${TRAVEL}px`,
              "--slot-dur": `${duration}ms`,
              "--slot-delay": `${delay}ms`,
              transform: spinning ? undefined : `translateY(${TRAVEL}px)`,
            } as React.CSSProperties
          }
        >
          {rows.map((row, index) => (
            <div
              key={`${row}-${index}`}
              className="flex items-center justify-center font-display uppercase leading-none text-paper"
              style={{ height: ROW, fontSize: row.length > 9 ? 17 : 23 }}
            >
              {row}
            </div>
          ))}
        </div>

        {/* fixed selection rails */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 border-y-2 border-gold ${spinning ? "reel-tick" : ""}`}
          style={{ top: ROW, height: ROW }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(var(--color-ink), transparent 34%, transparent 66%, var(--color-ink))" }}
        />
      </div>
    </div>
  );
}

export function TeamWheel({
  bucket,
  spinning,
  round,
  reduced,
}: {
  bucket: EraBucket;
  spinning: boolean;
  round: number;
  reduced: boolean;
}) {
  const teams = useMemo(() => fillers(round * 5 + 1, (b) => b.team, bucket.team), [round, bucket.team]);
  const seasons = useMemo(
    () => fillers(round * 11 + 4, (b) => decadeTag(b.decade), decadeTag(bucket.decade)),
    [round, bucket.decade]
  );
  const live = spinning && !reduced;

  return (
    <div aria-hidden className="flex gap-2.5">
      <Reel rows={teams} spinning={live} delay={0} duration={1350} label="TEAM" />
      <Reel rows={seasons} spinning={live} delay={260} duration={1500} label="ERA" />
    </div>
  );
}

const VIBE_COPY: Record<EraBucket["vibe"], { label: string; hex: string }> = {
  iconic: { label: "ALL-TIME", hex: "#f2b94b" },
  solid: { label: "SOLID", hex: "#55b8c9" },
  rough: { label: "ROUGH", hex: "#e5484d" },
};

/** The big reveal once both reels settle. */
export function EraCard({ bucket, animate }: { bucket: EraBucket; animate: boolean }) {
  const vibe = VIBE_COPY[bucket.vibe];
  return (
    <div
      className={`rounded-xl border-2 bg-panel px-4 py-3 text-center ${animate ? "era-slam" : ""}`}
      style={{ borderColor: vibe.hex, boxShadow: `0 0 34px ${vibe.hex}33` }}
    >
      <span
        className="inline-block rounded-sm border px-1.5 py-0.5 text-[9px] font-bold tracking-[0.2em]"
        style={{ borderColor: vibe.hex, color: vibe.hex }}
      >
        {vibe.label}
      </span>
      <h2 className="mt-1.5 font-display text-[34px] uppercase leading-none text-paper">{bucket.label}</h2>
      <p className="mt-1.5 text-[12px] leading-snug text-dim">{bucket.tag}</p>
    </div>
  );
}
