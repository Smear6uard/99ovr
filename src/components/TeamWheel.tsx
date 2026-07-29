"use client";

import { useMemo } from "react";
import { DECADE_BUCKETS } from "@/data/eras/decades";
import { decadeTag } from "@/data/eras/authoring";
import { POS_DECADES } from "@/data/positions";
import { POSITION_LABELS, POSITIONS, type EraBucket, type Position } from "@/lib/types";

const ROW = 44;
const STRIP = 18;
/** Lands row STRIP-1 in the middle of a three-row window. */
const TRAVEL = ROW - (STRIP - 1) * ROW;

/** Which reels actually animate on this spin — a decade re-spin must not shake the team reel. */
export type ReelMask = { left: boolean; right: boolean };

/**
 * The slot reels. CRITICAL INVARIANT, same as the v2 builder: this component
 * is pure cosmetics. `bucket` is the already-decided landing from the wheel
 * math; the filler rows above it are decoration derived from a fixed walk.
 * Nothing here imports RNG and nothing here decides anything.
 */
function fillers(offset: number, pick: (bucket: EraBucket) => string, landing: string): string[] {
  const rows: string[] = [];
  for (let i = 0; i < STRIP - 1; i++) {
    const candidate = pick(DECADE_BUCKETS[(offset + i * 7) % DECADE_BUCKETS.length]);
    rows.push(candidate === landing && i > STRIP - 4 ? pick(DECADE_BUCKETS[(offset + i * 7 + 3) % DECADE_BUCKETS.length]) : candidate);
  }
  rows.push(landing);
  return rows;
}

/** Decoration for the positional reels — a fixed cyclic walk, landing last. */
function cycleFillers(values: readonly string[], offset: number, landing: string): string[] {
  const rows: string[] = [];
  for (let i = 0; i < STRIP - 1; i++) rows.push(values[(offset + i) % values.length]);
  rows.push(landing);
  return rows;
}

function Reel({
  rows,
  spinning,
  settled,
  delay,
  duration,
  label,
  accent,
}: {
  rows: string[];
  spinning: boolean;
  /** true once this reel's value is final for the current landing */
  settled: boolean;
  delay: number;
  duration: number;
  label: string;
  accent: string;
}) {
  return (
    <div className="flex-1">
      <span
        className="mb-1 block rounded-sm border px-1 py-0.5 text-center text-[9px] font-bold tracking-[0.24em]"
        style={{ borderColor: `${accent}66`, color: accent, textShadow: `0 0 10px ${accent}88` }}
      >
        {label}
      </span>
      <div
        className="reel-window relative overflow-hidden rounded-lg border-2 bg-panel2"
        style={{ height: ROW * 3, borderColor: `${accent}55`, boxShadow: `inset 0 0 18px rgba(0,0,0,0.6), 0 0 14px ${accent}22` }}
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
              style={{
                height: ROW,
                fontSize: row.length > 9 ? 17 : 23,
                textShadow: !spinning && settled && index === rows.length - 1 ? `0 0 14px ${accent}aa` : undefined,
              }}
            >
              {row}
            </div>
          ))}
        </div>

        {/* fixed selection rails */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 border-y-2 ${spinning ? "reel-tick" : ""}`}
          style={{ top: ROW, height: ROW, borderColor: accent, "--rail": accent } as React.CSSProperties}
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

/** The chasing marquee bulbs across the cabinet top. */
function Marquee({ live }: { live: boolean }) {
  return (
    <div aria-hidden className="mb-2 flex items-center justify-center gap-2">
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={`bulb ${live ? "bulb-live" : ""}`}
          style={{ animationDelay: `${(i % 3) * 0.15}s` }}
        />
      ))}
    </div>
  );
}

const POS_LABEL_ROWS = POSITIONS.map((p) => `${POSITION_LABELS[p]}S`);
const DECADE_ROWS = POS_DECADES.map((d) => decadeTag(d));

export function TeamWheel({
  bucket,
  spinning,
  round,
  reduced,
  mask,
  position = null,
}: {
  bucket: EraBucket;
  spinning: boolean;
  round: number;
  reduced: boolean;
  /** which reels animate — re-spins only shake what actually changed */
  mask: ReelMask;
  /** set for positional runs: the wheel face reads DECADE + POSITION */
  position?: Position | null;
}) {
  const positional = position !== null;
  const left = useMemo(
    () =>
      positional
        ? cycleFillers(DECADE_ROWS, round * 3 + 1, decadeTag(bucket.decade))
        : fillers(round * 5 + 1, (b) => b.team, bucket.team),
    [positional, round, bucket.team, bucket.decade]
  );
  const right = useMemo(
    () =>
      positional
        ? cycleFillers(POS_LABEL_ROWS, round * 2, `${POSITION_LABELS[position].toUpperCase()}S`)
        : cycleFillers(DECADE_ROWS, round * 11 + 4, decadeTag(bucket.decade)),
    [positional, round, position, bucket.decade]
  );
  const live = spinning && !reduced;

  return (
    <div aria-hidden className="cabinet relative rounded-2xl px-3 pb-3 pt-2.5">
      <Marquee live={live} />
      <div className="flex gap-2.5">
        <Reel
          rows={left}
          spinning={live && mask.left}
          settled={!spinning}
          delay={0}
          duration={1350}
          label={positional ? "DECADE" : "TEAM"}
          accent="#55b8c9"
        />
        <Reel
          rows={right}
          spinning={live && mask.right}
          settled={!spinning}
          delay={260}
          duration={1500}
          label={positional ? "POSITION" : "ERA"}
          accent="#f26bb8"
        />
      </div>
      {/* cabinet corner screws */}
      <span aria-hidden className="screw" style={{ left: 7, top: 7 }} />
      <span aria-hidden className="screw" style={{ right: 7, top: 7 }} />
      <span aria-hidden className="screw" style={{ left: 7, bottom: 7 }} />
      <span aria-hidden className="screw" style={{ right: 7, bottom: 7 }} />
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
