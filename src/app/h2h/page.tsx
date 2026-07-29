import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Head to Head",
  description:
    "Finish a Classic run, mint a challenge link, and make a friend play the identical spins. Side-by-side verdict, one winner, one roast.",
  alternates: { canonical: "/h2h" },
  openGraph: { images: ["/api/og?v=h2h"] },
  twitter: { card: "summary_large_image", images: ["/api/og?v=h2h"] },
};

export default function H2HPage() {
  return (
    <div className="flex min-h-[64vh] flex-col pt-2 text-center">
      <span className="block text-[10px] font-bold tracking-[0.3em] text-gold/80">HEAD TO HEAD</span>
      <h1 className="mt-1 font-display text-4xl uppercase leading-[0.92] text-paper">
        Same wheel.
        <br />
        One winner.
      </h1>
      <p className="mx-auto mt-3 max-w-[21rem] text-[14px] leading-relaxed text-dim">
        Finish a <strong className="text-paper">Classic</strong> run and hit{" "}
        <strong className="text-gold">Challenge a friend</strong>. They play the identical position and spin
        sequence — same rosters, same everything — then the game puts both cards side by side, compares every
        grade, crowns a winner, and roasts the loser.
      </p>

      <ol className="mx-auto mt-6 max-w-[19rem] space-y-3 text-left text-[13px] text-paper/90">
        {[
          "Run Classic. Read the rosters like it matters.",
          "Tap ⚔ Challenge a friend — the link carries the whole duel.",
          "They play your exact spins. No excuses available.",
          "Side-by-side verdict. Winner banner. Roast for the loser.",
        ].map((step, i) => (
          <li key={step} className="flex items-start gap-3">
            <span className="mt-0.5 font-display text-xl leading-none text-gold">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto pb-2 pt-8">
        <Link
          href="/play"
          className="block w-full rounded-xl bg-gold py-4 font-display text-2xl uppercase tracking-[0.08em] text-ink shadow-[0_10px_30px_rgba(242,185,75,0.32)] transition-transform active:scale-[0.98]"
        >
          Start a Classic run
        </Link>
        <p className="mt-2 text-[11px] text-dim">No accounts, no sync — the build code carries everything.</p>
      </div>
    </div>
  );
}
