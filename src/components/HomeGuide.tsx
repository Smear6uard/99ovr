import Link from "@/components/SiteLink";
import { Section } from "@/components/PublisherContent";
import { DECADE_GUIDES } from "@/content/decades";
import { REFERENCE, STRATEGY } from "@/content/library";

export function HomeGuide() {
  return (
    <div className="publisher-content mx-auto mt-10 max-w-2xl border-t border-line pt-2">
      <Section title="What is 99OVR?">
        <p>
          A basketball knowledge game about building one impossible player. Six rounds, six skills — Jumpshot,
          Handles, Finishing, Playmaking, Defense and Athleticism — and each round a wheel hands you a real
          franchise&rsquo;s roster from one decade. You steal exactly one skill from one player, and nobody can be
          used twice. The finished build then takes on ten boss legends, first to 11, one loss and you&rsquo;re out.
        </p>
        <p>
          The trick is that a great player is rarely great at everything. The scoring champion on the roster may be
          an ordinary passer; the bench big nobody remembers may be its best defender. Your grade rewards finding
          the right player for the skill in front of you, while your OVR shows what the six skills add up to. The
          ceiling is 97. Nobody hits 99.
        </p>
      </Section>
      <Section title="Your first run">
        <ol>
          <li>Start with Classic and Normal clues: you see each player&rsquo;s box-score line and a short note.</li>
          <li>Read the skill being asked for, then the whole roster, before you tap anyone.</li>
          <li>Save your re-spins for a roster that truly has nothing for the current skill.</li>
          <li>Compare each pick&rsquo;s grade with the boss result, then run it back.</li>
        </ol>
        <p>
          <Link href="/how-to-play">The full rules</Link> · <Link href="/modes">Which mode to play</Link> ·{" "}
          <Link href="/scoring">How scoring works</Link>
        </p>
      </Section>
      <Section title="Get better at it">
        <p>
          The field guide is written for players who want to understand why a pick worked, not just whether it did.
        </p>
        <div className="card-grid">
          {[...STRATEGY, ...REFERENCE].map((entry) => (
            <Link key={entry.href} href={entry.href}>
              <strong>{entry.title}</strong>
              <span>{entry.summary}</span>
            </Link>
          ))}
        </div>
      </Section>
      <Section title="Seven decades of rosters">
        <p>
          A 1960s roster and a 2020s roster ask different questions — set shots against pull-up threes, centers who
          never left the paint against centers who run the offense. Each decade guide explains how that era played
          and lists every player in its positional pool.
        </p>
        <div className="card-grid">
          {DECADE_GUIDES.map((guide) => (
            <Link key={guide.slug} href={`/decades/${guide.slug}`}>
              <strong>The {guide.slug}</strong>
              <span>{guide.summary}</span>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
