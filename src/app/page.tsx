import type { Metadata } from "next";
import Link from "next/link";
import { DailyCard } from "@/components/DailyCard";
import { Wordmark } from "@/components/Wordmark";

export const metadata: Metadata = { alternates: { canonical: "/" } };

function ModeCard({
  href,
  kicker,
  kickerAccent,
  title,
  blurb,
  primary = false,
}: {
  href: string;
  kicker: string;
  kickerAccent?: string;
  title: string;
  blurb: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group block rounded-xl border px-5 py-4 transition-colors ${
        primary
          ? "border-gold/45 bg-panel shadow-[0_0_34px_-12px_rgba(242,185,75,0.5)] hover:border-gold"
          : "border-line bg-panel2 hover:border-gold/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold uppercase tracking-[0.22em] ${primary ? "text-gold/90" : "text-dim"}`}
        >
          {kicker}
          {kickerAccent ? (
            <>
              {" "}
              &middot; <span className="text-loss/80">{kickerAccent}</span>
            </>
          ) : null}
        </span>
        <span
          className={`font-display text-lg leading-none transition-all ${
            primary ? "text-gold group-hover:translate-x-0.5" : "text-dim group-hover:text-gold"
          }`}
          aria-hidden
        >
          &rarr;
        </span>
      </div>
      <h2
        className={`mt-2.5 font-display uppercase leading-none ${primary ? "text-4xl text-gold" : "text-3xl text-paper"}`}
      >
        {title}
      </h2>
      <p className="mt-2 text-[13px] leading-snug text-dim">{blurb}</p>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="pb-4">
      {/* ---------- HERO ---------- */}
      <section className="relative pb-2 pt-6 text-center">
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
            <Wordmark className="text-[82px] leading-[0.82] sm:text-8xl" />
          </h1>

          <p
            className="fade-up mx-auto mt-4 max-w-[20rem] text-[15px] leading-relaxed text-dim"
            style={{ animationDelay: "120ms" }}
          >
            Six spins. Six real rosters. Steal one skill from each.{" "}
            <span className="font-semibold text-paper">Then ten bosses find out what you built.</span>
          </p>
        </div>
      </section>

      {/* ---------- MODE CARDS: DAILY · CLASSIC · BUDGET · HEAD TO HEAD ---------- */}
      <section
        className="fade-up mt-7 flex flex-col gap-3"
        style={{ animationDelay: "180ms" }}
        aria-label="Game modes"
      >
        <DailyCard />

        <ModeCard
          href="/play"
          kicker="Classic"
          title="Classic"
          blurb="The pure knowledge test. Pick your target — best player or a positional crown — and read six rosters."
          primary
        />

        <ModeCard
          href="/budget"
          kicker="Budget"
          kickerAccent="$20 · Weakness Wheel"
          title="Budget"
          blurb="Every skill has a price and you have $20. Halfway in, the weakness wheel pays you to take a flaw."
        />

        <ModeCard
          href="/h2h"
          kicker="Head to Head"
          kickerAccent="Winner takes the roast"
          title="Head to Head"
          blurb="Mint a challenge from any Classic run. A friend plays your exact spins — side-by-side verdict decides it."
        />
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="mt-10" aria-label="How it works">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-dim">How it works</p>
        <div className="mt-4 flex items-start justify-center gap-3 text-center">
          <Step word="Gamble" gloss="spin the era" />
          <Sep />
          <Step word="Know" gloss="read the roster" />
          <Sep />
          <Step word="Answer" gloss="for the pick" />
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
