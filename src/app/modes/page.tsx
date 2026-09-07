import Link from "@/components/SiteLink";
import { Article, Section } from "@/components/PublisherContent";
import { PublisherAds } from "@/components/PublisherAds";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Choose Your 99OVR Mode",
  "Compare Daily’s shared challenge, Classic’s unrestricted draft, Budget’s spending tradeoffs and a friend’s Head-to-Head duel.",
  "/modes",
);
export default function Modes() {
  return (
    <>
      <Article
        title="Choose your mode"
        intro="Four ways to ask the same basketball question: which six skills would you trust against ten bosses?"
      >
        <Section title="Daily — a shared starting point">
          <p>
            Choose Daily when you want a result to compare today. The UTC date
            sets the wheel and target for everyone, including occasional
            positional challenges. Your re-spins and picks still decide your
            path. Your first completed run is saved as official in this browser;
            later practice cannot replace it. An optional three-initial
            leaderboard ranks OVR, then bosses beaten, when the service is
            available.
          </p>
          <Link href="/daily">Play Daily →</Link>
        </Section>
        <Section title="Classic — learn, experiment, argue">
          <p>
            Choose Classic when you want to try a new wheel without a wallet or
            a flaw. Normal offers box-stat clues; Ball Knowledge removes them.
            Pick Best Player for franchise-decade rosters or chase a positional
            crown with the position’s decade pools, scoring weights and boss
            ladder. Repeat freely and use the grades to find the difference
            between recognizing a name and recognizing the right skill.
          </p>
          <Link href="/play">Play Classic →</Link>
        </Section>
        <Section title="Budget — make the whole wallet work">
          <p>
            Choose Budget when a great pick should cost something. Spread $15 of
            game money across six skills; each roster has a $1 minimum-contract
            option. You cannot spend the money needed for the remaining slots. A
            mid-run flaw refunds $1–$3 for your last three choices. Prices
            reveal skill bands, so the challenge shifts toward deciding where an
            upgrade helps most and which weakness your build can survive.
          </p>
          <Link href="/budget">Play Budget →</Link>
        </Section>
        <Section title="Head to Head — settle one matchup">
          <p>
            Choose Head to Head for an asynchronous duel with a friend. Finish
            Classic and share its challenge link. Your friend inherits the
            starting wheel, position and knowledge setting, makes their own
            choices, and sees both verdicts together. Higher OVR wins; total
            grade points break ties. This is a link-based comparison, not a live
            multiplayer lobby, and it needs no account.
          </p>
          <Link href="/h2h">Start a duel →</Link>
        </Section>
      </Article>
      <PublisherAds />
    </>
  );
}
