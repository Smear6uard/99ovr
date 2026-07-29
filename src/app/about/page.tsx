import type { Metadata } from "next";
import Link from "next/link";
import { GAUNTLET } from "@/data/gauntlet";
import { BUCKETS, FRANCHISES } from "@/data/eras";
import { RATING_TIERS } from "@/config/ratingTiers";
import { STEAL_BUDGET } from "@/lib/steal";
import { ATTR_LABELS, ATTRS } from "@/lib/types";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "The rules of 99OVR: spin for a real team-era, steal one player's skill six times, then face ten boss legends — in Daily, Classic, Budget, or Head to Head.",
  alternates: { canonical: "/about" },
};

const FAQ = [
  {
    q: "Why can't I hit 99 OVR?",
    a: "Because you can't. 99 is unreachable by construction — that's the name of the game. GOAT (96–99) is technically live if you read six rosters perfectly and the wheel is kind, and almost nobody will.",
  },
  {
    q: "There are no prices in Classic. How am I supposed to know who's good?",
    a: "That's the test. Box stats only partly signal a skill — scoring 28 a game tells you nothing about handles. Every roster hides at least one trap (big numbers, wrong skill) and one connoisseur pick (a role player with an elite rating). Deep cuts are rewarded on purpose. If you want prices, that's what Budget is for.",
  },
  {
    q: "What's the difference between my grade and my OVR?",
    a: "The grade is the decision; the OVR is the outcome. Taking the best handles on a rough roster is an A+ even though the number is still a 74 — you read the room perfectly and the roster just didn't have more. Rough eras are winnable on grades and brutal on OVR.",
  },
  {
    q: "Same run, different results?",
    a: "Every sim is seeded. The same code replays identically forever — in the app, on a share link, and in the preview image. Run It Back starts a whole new build on a fresh wheel.",
  },
  {
    q: "How does the Daily leaderboard stop cheaters?",
    a: "Your device submits only your build code and three initials. The server replays the code against today's wheel — wrong seed, impossible landing, extra re-spins, or a practice attempt all get rejected — and derives the score itself. Tampered scores never existed.",
  },
  {
    q: "A player's rating is disrespectful.",
    a: "File a complaint at the barbershop. (The ratings are the debate — that's the game.)",
  },
  {
    q: "What decides who wins a Round?",
    a: "Your offense, defense, playmaking, a seeded variance roll — and in Budget, your flaw. Athleticism fights late-round fatigue. First to 11; first loss ends the run.",
  },
];

export default function AboutPage() {
  const rough = BUCKETS.filter((bucket) => bucket.vibe === "rough").length;

  return (
    <article className="prose-invert pt-2 text-[14px] leading-relaxed text-paper">
      <h1 className="font-display text-3xl uppercase leading-tight">How it works</h1>
      <p className="mt-2 text-paper/80">
        A run should feel like three things in order: a <strong>gamble</strong>, a{" "}
        <strong>knowledge test</strong>, then a <strong>judgment</strong>.
      </p>

      <section className="mt-5">
        <h2 className="font-display text-xl uppercase text-gold">The core loop</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-paper/90">
          <li>
            Six rounds, one per attribute: {ATTRS.map((attr) => ATTR_LABELS[attr]).join(", ")}.
          </li>
          <li>
            Each round the slot machine lands on a real franchise and decade &mdash; {BUCKETS.length} team-eras
            across {FRANCHISES.length} franchises, and {rough} are genuinely rough. The groans are part of it.
          </li>
          <li>
            The era roster appears &mdash; real players, era-flavored box stats.{" "}
            <strong>Steal one player&rsquo;s skill</strong> for that attribute. Hidden per-attribute ratings grade
            every steal at the end.
          </li>
          <li>A player can be stolen from only once per run. No doubling up on one legend.</li>
          <li>
            Skips: one <strong>team re-spin</strong> (a brand new team-era) and one <strong>era re-spin</strong>{" "}
            (same franchise, different decade) per run. Spend them like they matter, because they do.
          </li>
          <li>Then beat 10 boss legends 1v1. Lose one Round and it&apos;s over.</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl uppercase text-gold">Four modes</h2>
        <dl className="mt-2 space-y-3 text-paper/90">
          <div>
            <dt className="font-bold">
              <Link href="/daily" className="text-gold underline underline-offset-2">
                Daily
              </Link>
            </dt>
            <dd className="mt-0.5 text-paper/80">
              Date-seeded: everyone on Earth gets the identical spin sequence and rosters. One official run per UTC
              day, a streak, and an arcade leaderboard — three initials, top 50, resets at midnight UTC.
            </dd>
          </div>
          <div>
            <dt className="font-bold">
              <Link href="/play" className="text-gold underline underline-offset-2">
                Classic
              </Link>
            </dt>
            <dd className="mt-0.5 text-paper/80">
              The pure knowledge test. A quick setup sheet first: Normal or Ball Knowledge (names only), and a build
              target — Best Player, or a positional challenge (Best PG through Best C) with that position&apos;s
              scoring weights and all-time boss ladder. No flaw anywhere in this mode.
            </dd>
          </div>
          <div>
            <dt className="font-bold">
              <Link href="/budget" className="text-gold underline underline-offset-2">
                Budget
              </Link>
            </dt>
            <dd className="mt-0.5 text-paper/80">
              Same loop, but every roster player shows a price for the current attribute and the run has $
              {STEAL_BUDGET} total. After three steals the <strong>weakness wheel</strong> interrupts: take a flaw,
              and the worse it is, the more budget it refunds for the last three steals (Mild +$1 · Bad +$2 ·
              Brutal +$3 · Career-Threatening +$3). Someone on every roster is on a $1 minimum contract.
            </dd>
          </div>
          <div>
            <dt className="font-bold">
              <Link href="/h2h" className="text-gold underline underline-offset-2">
                Head to Head
              </Link>
            </dt>
            <dd className="mt-0.5 text-paper/80">
              After any Classic run, mint a challenge link. Your friend plays the identical spins and rosters, then
              a side-by-side verdict compares every grade, crowns the higher OVR (grade points break ties), and
              roasts the loser. No accounts — the code carries everything.
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl uppercase text-gold">The verdict</h2>
        <p className="mt-1 text-paper/80">
          After the sixth steal: a short simulation beat, then one screen with everything &mdash; your OVR count-up
          and tier, all six grades, <strong>Best Steal</strong> and <strong>The Reach</strong>, how far you got in
          the boss gauntlet (full game log behind &ldquo;view log&rdquo; for whoever wants it), and the roast. Then
          Run It Back &mdash; a fresh wheel, a whole new build.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl uppercase text-gold">The gauntlet</h2>
        <p className="mt-1 text-paper/80">
          Ten Rounds, each with a boss. Positional runs face that position&apos;s all-time ladder instead.
        </p>
        <ol className="mt-2 space-y-1">
          {GAUNTLET.map((r) => (
            <li key={r.id} className="flex items-baseline gap-3 border-b border-line/50 py-1.5">
              <span className="w-16 shrink-0 text-right font-display text-base text-dim">Round {r.rung}</span>
              <span className="flex-1 font-semibold">Boss: {r.name}</span>
              <span className="text-[12px] text-dim">{r.title}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl uppercase text-gold">Rating tiers</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {RATING_TIERS.map((tier) => (
            <div key={tier.id} className="border-l-2 bg-panel px-3 py-2" style={{ borderColor: tier.color }}>
              <strong className="block" style={{ color: tier.color }}>
                {tier.name}
              </strong>
              <span className="text-[12px] text-dim">
                {tier.min}&ndash;{tier.max} OVR
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-paper/80">GOAT is real but nearly unreachable. 99 is not reachable at all.</p>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl uppercase text-gold">FAQ</h2>
        <dl className="mt-2 space-y-4">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="font-bold">{f.q}</dt>
              <dd className="mt-0.5 text-paper/80">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-lg border border-line bg-panel p-4 text-[12px] leading-relaxed text-dim">
        <p>
          99OVR is a fan-made game. Not affiliated with or endorsed by the NBA, any team, or any player. Player
          names, teams, and seasons are used in a statistical/fantasy context only. No logos or likenesses are
          used. All hidden ratings are fictional opinions, calibrated for arguments.
        </p>
      </section>
    </article>
  );
}
