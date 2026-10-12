import { Article, Section } from "@/components/PublisherContent";
import { PublisherAds } from "@/components/PublisherAds";
import { pageMetadata } from "@/lib/metadata";
import Link from "@/components/SiteLink";
import { DECADE_BUCKETS, DECADE_FRANCHISES } from "@/data/eras/decades";
import { DECADE_GUIDES } from "@/content/decades";
import { decadePool } from "@/content/rosters";

export const metadata = pageMetadata(
  "About 99OVR & FAQ",
  "Who makes 99OVR, why it separates a pick’s grade from a build’s OVR, how the editorial ratings are made and corrected, plus answers to common questions.",
  "/about",
);

const FAQ = [
  {
    q: "Do I need an account?",
    a: "No. The game runs in your browser. Personal bests, Daily progress and your streak stay on that device; submitting initials to the Daily leaderboard is optional.",
  },
  {
    q: "Why can't I hit 99 OVR?",
    a: "The current six-steal formula caps OVR at 97. The GOAT tier starts at 96, but 99 itself is unreachable — that is the joke in the name, and the point.",
  },
  {
    q: "Can one legend fill all six skills?",
    a: "No. Once you steal from a player, that player is unavailable for the rest of the run, even if another roster includes them. Find the specialist who covers this round.",
  },
  {
    q: "There are no prices in Classic. How am I supposed to know who's good?",
    a: "That's the test. Box stats only partly signal a skill — scoring 28 a game tells you nothing about defense. Deep cuts are rewarded on purpose. If you want prices, that's what Budget is for, and the roster-reading guide covers the rest.",
  },
  {
    q: "What's the difference between my grade and my OVR?",
    a: "The grade is the decision; the OVR is the outcome. Taking the best handles on a rough roster is an A+ even if the number is modest — you read the room perfectly and the roster just didn't have more.",
  },
  {
    q: "Is the Daily the same for everyone?",
    a: "The starting wheel and target are the same for everyone on a UTC day. Your re-spins and picks still change your path. Classic gives you fresh runs whenever you want more.",
  },
  {
    q: "Same run, different results?",
    a: "Every simulation is seeded. The same build code replays identically under the same rules — in the app, on a share link and in the preview image. Run It Back starts a new build on a fresh wheel.",
  },
  {
    q: "How does the Daily leaderboard stop cheaters?",
    a: "You submit a build code and three initials; the service also processes request information for abuse prevention. The server replays the code against today's wheel — a wrong seed, an impossible landing, extra re-spins or a practice attempt are rejected — and derives the score itself. That is validation, not a guarantee that every kind of abuse is impossible.",
  },
  {
    q: "A player's rating is disrespectful.",
    a: "The ratings are the debate — that's the game. If you have a real basketball case, send it; see “Corrections” above.",
  },
];

export default function AboutPage() {
  const poolSize = DECADE_GUIDES.reduce((sum, guide) => sum + decadePool(guide.decade).length, 0);

  return (
    <>
      <Article
        title="About 99OVR"
        intro="A run should feel like three things in order: a gamble, a knowledge test, then a judgment. Everything about the game is built to keep those three separate."
        eyebrow="About"
        related={[
          { href: "/scoring", title: "Ratings & scoring" },
          { href: "/guides/skills", title: "The six skills, explained" },
          { href: "/contact", title: "Contact" },
        ]}
      >
        <Section id="why" title="Basketball knowledge, one skill at a time">
          <p>
            Every basketball argument about the perfect player — Curry&rsquo;s shot, Kawhi&rsquo;s hands, Shaq&rsquo;s
            size — eventually turns into a list. 99OVR turns that list into six concrete decisions made under
            pressure. A famous name is only useful if it answers the skill in front of you, and the roster in front of
            you is decided by a wheel, not by you.
          </p>
          <p>
            That is the design in one sentence: luck chooses the roster, knowledge chooses the player, and the
            simulation judges the result. The grade tells you whether you read the roster well. The OVR tells you
            what the six skills add up to. The boss gauntlet tells you whether that was enough. Keeping those three
            apart is what lets a perfect read of a terrible roster still feel like a win.
          </p>
        </Section>

        <Section id="ratings" title="How the ratings are made">
          <p>
            Every player carries six ratings, one per skill, on a fixed scale where 99 means the best there has ever
            been at that one thing and the 30s are reserved for genuine weaknesses. A great scorer can be an average
            passer; a bench big can be the best defender on his roster. Splitting a player into six judgments is the
            whole point.
          </p>
          <p>
            Players are rated inside their decade. A 1960s set shooter is measured against the shooting of his own
            era rather than against a modern three-point specialist, and each{" "}
            <Link href="/decades">decade guide</Link> explains how its pool was calibrated. The headline rosters and
            all seven positional pools — {poolSize} players across {DECADE_GUIDES.length} decades — were written and
            rated by hand, including the one-line note on every card.
          </p>
          <p>
            The deeper bench of each franchise roster ({DECADE_BUCKETS.length} decade rosters across{" "}
            {DECADE_FRANCHISES.length} franchises) is filled from a public-domain historical box-score dataset, so
            those cards show decade averages instead of a hand-written note. A consistency check keeps a recognized
            specialist on the same standard whether he appears on a headline roster, a positional pool or a bench
            list, and stops a late-career card from inheriting prime athleticism.
          </p>
          <p className="callout">
            These are 99OVR&rsquo;s own editorial game ratings. They are basketball opinions calibrated for this game,
            not official NBA ratings, a statistical model or a claim about any real player&rsquo;s ability.
          </p>
        </Section>

        <Section id="corrections" title="Corrections">
          <p>
            Ratings get revised when someone makes a better basketball case than ours. If you disagree with a card,{" "}
            <Link href="/contact">email us</Link> with the player, the roster or decade, the skill and your reasoning.
            Players can be re-rated, but rosters are never reordered or trimmed, so an old share link always points
            at the same players it was built from.
          </p>
        </Section>

        <Section id="publisher" title="Who makes 99OVR">
          <p>
            99OVR is designed, written and published by Sameer Studios LLC. It is a fan-made game: it is not
            affiliated with or endorsed by the NBA, its teams or its players, and it uses no team logos or player
            likenesses. Player names appear in a fantasy-game context. There are no real-money purchases; Budget
            mode&rsquo;s dollars are game currency. The game is free to play and supported by advertising on our
            guide pages, never inside the game screens.
          </p>
        </Section>

        <Section id="faq" title="FAQ">
          <dl className="skill-list">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </Article>
      <PublisherAds />
    </>
  );
}
