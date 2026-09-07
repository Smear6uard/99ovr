import Link from "@/components/SiteLink";
import { Section } from "@/components/PublisherContent";
export function HomeGuide() {
  return (
    <div className="publisher-content mt-10 border-t border-line pt-2">
      <Section title="What is 99OVR?">
        <p>
          Build one hypothetical basketball player by borrowing six different
          players’ strengths: Jumpshot, Handles, Finishing, Playmaking, Defense
          and Athleticism. A franchise-and-decade wheel supplies the rosters in
          Best Player; positional challenges draw from a position’s decade
          pools. Your finished build faces ten boss legends.
        </p>
      </Section>
      <Section title="Why the choices matter">
        <p>
          The best scorer on a roster is not automatically its best passer or
          defender. Every skill has its own internal rating. Your grade rewards
          the decision relative to that roster, while your OVR reflects what
          those six skills can do together. An excellent read of a rough roster
          can earn A+ without producing a superstar.
        </p>
      </Section>
      <Section title="Your first run, in four moves">
        <ol>
          <li>Choose a mode and, where offered, your build target.</li>
          <li>
            Spin the roster and read the current skill. Use your limited
            re-spins when the tradeoff is worth it.
          </li>
          <li>Steal one skill per round from six different players.</li>
          <li>
            Read the grades and boss verdict, then share or try another build.
          </li>
        </ol>
        <Link href="/how-to-play">Learn the controls and rules →</Link>
      </Section>
      <Section title="Nobody hits 99">
        <p>
          Our editorial ratings and skill combinations feed a game-specific
          scoring curve. Shooting needs creation; finishing needs physical
          tools. The current six-steal OVR has a hard ceiling of 97, so 99 is
          deliberately out of reach. This is a game of tradeoffs, not an
          official rating of real athletes.
        </p>
        <Link href="/scoring">See how ratings and scoring work →</Link>
      </Section>
      <Section title="Before you spin">
        <dl className="skill-list">
          <div>
            <dt>Do I need an account?</dt>
            <dd>
              No. Play in your browser. Personal bests and Daily progress stay
              on that device; leaderboard submission is optional.
            </dd>
          </div>
          <div>
            <dt>Can one legend fill all six skills?</dt>
            <dd>
              No. Once you steal from a player, that player is unavailable for
              the rest of the run. Find the specialist who covers this round.
            </dd>
          </div>
          <div>
            <dt>Is Daily the same for everyone?</dt>
            <dd>
              The starting wheel and target are the same for a UTC day. Your
              choices and re-spins still matter. Classic gives you fresh runs
              when you want more.
            </dd>
          </div>
          <div>
            <dt>Is this an official NBA game?</dt>
            <dd>
              No. The ratings are our own game judgments. See{" "}
              <Link href="/about">About 99OVR</Link> for the design philosophy
              and fan-made status.
            </dd>
          </div>
        </dl>
      </Section>
    </div>
  );
}
