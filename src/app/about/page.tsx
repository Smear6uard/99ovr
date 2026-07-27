import type { Metadata } from "next";
import Link from "next/link";
import { GAUNTLET } from "@/data/gauntlet";
import { BUCKETS, FRANCHISES } from "@/data/eras";
import { RATING_TIERS } from "@/config/ratingTiers";
import { ATTR_LABELS, ATTRS } from "@/lib/types";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "The rules of 99OVR: spin for a real team-era, steal one player's skill six times, then face ten bosses.",
  alternates: { canonical: "/about" },
};

const FAQ = [
  {
    q: "Why can't I hit 99 OVR?",
    a: "Because you can't. 99 is unreachable by construction — that's the name of the game. GOAT (96–99) is technically live if you read six rosters perfectly and the wheel is kind, and almost nobody will.",
  },
  {
    q: "There are no prices. How am I supposed to know who's good?",
    a: "That's the test. Box stats only partly signal a skill — scoring 28 a game tells you nothing about handles. Every roster hides at least one trap (big numbers, wrong skill) and one connoisseur pick (a role player with an elite rating). Deep cuts are rewarded on purpose.",
  },
  {
    q: "What's the difference between my grade and my OVR?",
    a: "The grade is the decision; the OVR is the outcome. Taking the best handles on the 2004 Pistons is an A+ even though the number is still a 74 — you read the room perfectly and the roster just didn't have more. Rough eras are winnable on grades and brutal on OVR.",
  },
  {
    q: "Same run, different results?",
    a: "Every sim is seeded. The same code replays identically forever — in the app, on a share link, and in the preview image. Run It Back re-rolls only the variance, like playing the same opponent twice.",
  },
  {
    q: "A player's rating is disrespectful.",
    a: "File a complaint at the barbershop. (The ratings are the debate — that's the game.)",
  },
  {
    q: "What decides who wins a round?",
    a: "Your offense, defense, playmaking, your flaw, and a seeded variance roll. Athleticism now fights late-round fatigue. First to 11; first loss ends the run.",
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
        <h2 className="font-display text-xl uppercase text-gold">The rules</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-paper/90">
          <li>Spin the flaw wheel first and choose one of three. You are keeping it all run.</li>
          <li>
            Six rounds, one per attribute: {ATTRS.map((attr) => ATTR_LABELS[attr]).join(", ")}.
          </li>
          <li>
            Each round the wheel lands on a real team-era &mdash; {BUCKETS.length} of them across{" "}
            {FRANCHISES.length} franchises, and {rough} are genuinely rough. The groans are part of it.
          </li>
          <li>
            The full roster appears with box stats and no prices. <strong>Steal one player&rsquo;s skill</strong>{" "}
            for that attribute. Hidden ratings grade the pick afterward.
          </li>
          <li>A player can only be stolen from once per run. No doubling up on one legend.</li>
          <li>
            For the <strong>entire run</strong> you get one <strong>team re-spin</strong> (a brand new team-era)
            and one <strong>era re-spin</strong> (the same franchise, a different decade). Spend them like they
            matter, because they do.
          </li>
          <li>
            A worse flaw buys more: Brutal grants one extra re-spin, Career-Threatening grants two. Mild and Bad
            grant none.
          </li>
          <li>Beat 10 legends 1v1. Lose once and it&apos;s over.</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl uppercase text-gold">The verdict</h2>
        <p className="mt-1 text-paper/80">
          After the sixth steal, every pick is graded A+ to F on where its hidden rating ranked{" "}
          <em>on that roster</em> &mdash; not on how big the number was. Then the game calls out your{" "}
          <strong>Best Steal</strong> and <strong>The Reach</strong>, counts up your OVR, stamps an archetype, and
          sends you into the gauntlet.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl uppercase text-gold">The gauntlet</h2>
        <p className="mt-1 text-paper/80">Every named opponent is the boss for that round.</p>
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

      <section className="mt-6">
        <h2 className="font-display text-xl uppercase text-gold">Modes</h2>
        <p className="mt-2 text-paper/90">
          <Link href="/play" className="text-gold underline underline-offset-2">
            Play
          </Link>{" "}
          is the unlimited sandbox.{" "}
          <Link href="/daily" className="text-gold underline underline-offset-2">
            Daily
          </Link>{" "}
          gives everyone the same six spins and one official run per UTC day, with a streak and a copy-paste grade
          strip built for the group chat.{" "}
          <Link href="/play?mode=knowledge" className="text-gold underline underline-offset-2">
            Ball Knowledge
          </Link>{" "}
          is hard mode: the box stats disappear and the roster is names only.{" "}
          <Link href="/budget" className="text-gold underline underline-offset-2">
            Budget Ball
          </Link>{" "}
          is the original $20 challenge, kept as a side mode. Every finished run gets a share link that replays the
          same wheel for whoever opens it.
        </p>
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
