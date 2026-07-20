import type { Metadata } from "next";
import Link from "next/link";
import { DailyCard } from "@/components/DailyCard";
import { Wordmark } from "@/components/Wordmark";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <div className="pb-4">
      {/* ---------- HERO ---------- */}
      <section className="relative pt-6 pb-2 text-center">
        {/* local court-arc accent — echoes the global dashed 3pt arc, does not repeat the full court */}
        <svg
          aria-hidden
          viewBox="0 0 400 200"
          fill="none"
          className="pointer-events-none absolute inset-x-0 top-9 -z-0 mx-auto h-40 w-full"
        >
          <path
            d="M 30 190 A 175 175 0 0 1 370 190"
            stroke="#f2b94b"
            strokeWidth="1.5"
            strokeDasharray="3 8"
            className="opacity-25"
          />
          <path d="M 30 190 A 175 175 0 0 1 370 190" stroke="#26314b" strokeWidth="1.5" opacity="0.5" />
        </svg>

        <div className="relative z-10">
          <p className="fade-up text-[11px] font-bold uppercase tracking-[0.34em] text-dim">
            Nobody hits <span className="text-gold">99</span>
          </p>

          <h1 className="fade-up mt-3 flex justify-center" style={{ animationDelay: "60ms" }}>
            <span className="sr-only">99OVR</span>
            <Wordmark className="text-[82px] leading-[0.82] sm:text-8xl" />
          </h1>

          <p
            className="fade-up mx-auto mt-4 max-w-[19rem] text-[15px] leading-relaxed text-dim"
            style={{ animationDelay: "120ms" }}
          >
            $15. Six skills from legends. One fatal flaw.{" "}
            <span className="font-semibold text-paper">Ten 1v1s between you and forever.</span>
          </p>
        </div>
      </section>

      {/* ---------- MODE CARDS (PLAY -> DAILY -> BALL KNOWLEDGE) ---------- */}
      <section
        className="fade-up mt-7 flex flex-col gap-3"
        style={{ animationDelay: "180ms" }}
        aria-label="Game modes"
      >
        {/* PLAY — primary */}
        <Link
          href="/play"
          className="group block rounded-xl border border-gold/45 bg-panel px-5 py-4 shadow-[0_0_34px_-12px_rgba(242,185,75,0.5)] transition-colors hover:border-gold"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold/90">
              Play &middot; Sandbox
            </span>
            <span
              className="font-display text-lg leading-none text-gold transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              &rarr;
            </span>
          </div>
          <h2 className="mt-2.5 font-display text-4xl uppercase leading-none text-gold">Play</h2>
          <p className="mt-2 text-[13px] leading-snug text-dim">
            Unlimited runs. Spin your shop, build a monster, chase the number you&rsquo;ll never reach.
          </p>
        </Link>

        {/* DAILY — live island */}
        <DailyCard />

        {/* BALL KNOWLEDGE — hard mode (notes off) */}
        <Link
          href="/play?mode=knowledge"
          className="group block rounded-xl border border-line bg-panel2 px-5 py-4 transition-colors hover:border-gold/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-dim">
              Ball Knowledge &middot; <span className="text-loss/80">No Notes</span>
            </span>
            <span
              className="font-display text-lg leading-none text-dim transition-colors group-hover:text-gold"
              aria-hidden
            >
              &rarr;
            </span>
          </div>
          <h2 className="mt-2.5 font-display text-3xl uppercase leading-none text-paper">
            Ball Knowledge
          </h2>
          <p className="mt-2 text-[13px] leading-snug text-dim">
            No scouting notes. Just names. Prove you know ball.
          </p>
        </Link>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="mt-10" aria-label="How it works">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-dim">
          How it works
        </p>
        <div className="mt-4 flex items-start justify-center gap-3 text-center">
          <Step word="Spin" gloss="your shop" />
          <Sep />
          <Step word="Build" gloss="six slots" />
          <Sep />
          <Step word="Survive" gloss="the gauntlet" />
        </div>
      </section>
    </div>
  );
}

function Step({ word, gloss }: { word: string; gloss: string }) {
  return (
    <div className="flex flex-col items-center whitespace-nowrap">
      <span className="font-display text-2xl uppercase leading-none text-paper">{word}</span>
      <span className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-dim">{gloss}</span>
    </div>
  );
}

function Sep() {
  return (
    <span className="mt-0.5 font-display text-xl leading-none text-gold/60" aria-hidden>
      &rarr;
    </span>
  );
}
