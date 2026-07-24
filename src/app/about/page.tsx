import type { Metadata } from "next";
import Link from "next/link";
import { GAUNTLET } from "@/data/gauntlet";
import { RATING_TIERS } from "@/config/ratingTiers";

export const metadata: Metadata = {
  title: "How it works",
  description: "The rules of 99OVR: pick a flaw, build eight skills, then face ten bosses.",
  alternates: { canonical: "/about" },
};

const FAQ = [
  {
    q: "Why can't I hit 99 OVR?",
    a: "Because you can't. GOAT (96–99) is the myth; the best legal builds top out in HOF. If you find the ceiling, the group chat deserves evidence.",
  },
  {
    q: "Same build, different results?",
    a: "Every sim is seeded. The same build with the same seed replays identically, forever — that's why shared builds hold up. Run It Back re-rolls only the variance, like playing the same opponent twice.",
  },
  {
    q: "Are the hidden ratings the same for two players at the same price?",
    a: "No. Same-price players differ slightly on purpose. There are secretly-optimal picks. Happy hunting.",
  },
  {
    q: "A player's price is disrespectful.",
    a: "File a complaint at the barbershop. (The prices are the debate — that's the game.)",
  },
  {
    q: "What decides who wins a round?",
    a: "Your offense, defense, passing, IQ, durability, position profile, flaw, and a seeded variance roll. Durability fights injuries and late-round fatigue. First to 11; first loss ends the run.",
  },
];

export default function AboutPage() {
  return (
    <article className="prose-invert pt-2 text-[14px] leading-relaxed text-paper">
      <h1 className="font-display text-3xl uppercase leading-tight">How it works</h1>

      <section className="mt-5">
        <h2 className="font-display text-xl uppercase text-gold">The rules</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-paper/90">
          <li>Spin the flaw wheel first and choose one of three. Mild refunds $0, Bad $1, Brutal $2, and Career-Threatening $3.</li>
          <li>Your base budget is <strong>$20</strong>. The flaw refund is spendable immediately.</li>
          <li>Fill eight slots: jumpshot, handles, finishing, defense, athleticism, IQ, passing, and durability.</li>
          <li>Each slot opens a five-card pack — one player per $1–$5 tier, drawn from a 20-player pool. One new pack per slot.</li>
          <li>Ratings are hidden. Prices are hints, not promises.</li>
          <li>Passing creates gravity and feeds offense. Durability reduces injury odds and fatigue from Round 6 on.</li>
          <li>Beat 10 legends 1v1. Lose once and it&apos;s over.</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl uppercase text-gold">The default gauntlet</h2>
        <p className="mt-1 text-paper/80">Every named opponent is the boss for that round. PG, SG, SF, PF, and C challenges each swap in their own all-time ladder.</p>
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
              <strong className="block" style={{ color: tier.color }}>{tier.name}</strong>
              <span className="text-[12px] text-dim">{tier.min}–{tier.max} OVR</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-paper/80">HOF is the playable ceiling. GOAT is the 96–99 myth the game is named after.</p>
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
          <Link href="/play" className="text-gold underline underline-offset-2">Play</Link> is the
          unlimited sandbox.{" "}
          <Link href="/daily" className="text-gold underline underline-offset-2">Daily</Link> gives everyone the
          same shop and one official run per UTC day — with a streak and a copy-paste result block built for the
          group chat.{" "}
          <Link href="/play?mode=knowledge" className="text-gold underline underline-offset-2">Ball Knowledge</Link>{" "}
          is hard mode: stat lines hidden, just names and prices. Position challenges filter every pack to one position, retune scoring, and load that position&apos;s boss ladder. Every finished build gets a share link that
          challenges anyone who opens it to beat it from the same shop.
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-line bg-panel p-4 text-[12px] leading-relaxed text-dim">
        <p>
          99OVR is a fan-made game. Not affiliated with or endorsed by the NBA, any team, or any player. Player
          names are used in a statistical/fantasy context only. No logos or likenesses are used. All ratings are
          fictional opinions, calibrated for arguments.
        </p>
      </section>
    </article>
  );
}
