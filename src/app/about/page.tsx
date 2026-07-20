import type { Metadata } from "next";
import Link from "next/link";
import { GAUNTLET } from "@/data/gauntlet";

export const metadata: Metadata = {
  title: "How it works",
  description: "The rules of 99OVR: $15, six skills, one fatal flaw, ten legends.",
  alternates: { canonical: "/about" },
};

const FAQ = [
  {
    q: "Why can't I hit 99 OVR?",
    a: "Because you can't. 99 is a religion, not a rating. The best build the math allows tops out in the low 90s — if you find it, the group chat deserves to know.",
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
    q: "What decides who wins a rung?",
    a: "Your offense and defense vs the legend's power, your flaw's fine print, and a seeded variance roll of about ±3. First to 11. First loss ends the run.",
  },
];

export default function AboutPage() {
  return (
    <article className="prose-invert pt-2 text-[14px] leading-relaxed text-paper">
      <h1 className="font-display text-3xl uppercase leading-tight">How it works</h1>

      <section className="mt-5">
        <h2 className="font-display text-xl uppercase text-gold">The rules</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-paper/90">
          <li>You get <strong>$15</strong> to fill six skill slots: jumpshot, handles, finishing, defense, athleticism, IQ.</li>
          <li>Each slot offers five players — one per price tier, $1 to $5 — drawn from a bigger pool. One re-roll per slot.</li>
          <li>Ratings are hidden. Prices are hints, not promises.</li>
          <li>Skills interact: elite finishing on $1 legs gets throttled. Spend accordingly.</li>
          <li>Then you take one <strong>fatal flaw</strong>. It's mandatory. It will haunt you.</li>
          <li>Your creation runs a 10-rung 1v1 gauntlet, first to 11. Lose once and it's over.</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-xl uppercase text-gold">The gauntlet</h2>
        <ol className="mt-2 space-y-1">
          {GAUNTLET.map((r) => (
            <li key={r.id} className="flex items-baseline gap-3 border-b border-line/50 py-1.5">
              <span className="w-5 shrink-0 text-right font-display text-base text-dim">{r.rung}</span>
              <span className="flex-1 font-semibold">{r.name}</span>
              <span className="text-[12px] text-dim">{r.title}</span>
            </li>
          ))}
        </ol>
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
          <Link href="/" className="text-gold underline underline-offset-2">Sandbox</Link> is unlimited.{" "}
          <Link href="/daily" className="text-gold underline underline-offset-2">Daily</Link> gives everyone the
          same shop and one official run per UTC day — with a streak and a copy-paste result block built for the
          group chat. Every finished build gets a share link that challenges anyone who opens it to beat it from
          the same shop.
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
