import Link from "@/components/SiteLink";
import { Article, Section } from "@/components/PublisherContent";
import { PublisherAds } from "@/components/PublisherAds";
import { decadePool } from "@/content/rosters";
import { DECADE_BUCKETS } from "@/data/eras/decades";
import { gradeFor } from "@/lib/grade";
import { pageMetadata } from "@/lib/metadata";
import { POS_DRAW } from "@/lib/poswheel";

export const metadata = pageMetadata(
  "How to Read a 99OVR Roster",
  "Turn a box-score line, a one-line note, a decade and a position into a good guess about one hidden skill, with worked examples from real 99OVR rosters.",
  "/guides/reading-rosters",
);

type Card = { name: string; line: string; note: string };

/**
 * Example cards are looked up in the live game data, so the quoted lines and
 * notes always match what the roster shows. Only name, line and note are read;
 * hidden ratings never reach the page.
 */
function poolCards(decade: number, names: string[]): Card[] {
  const pool = decadePool(decade);
  return names.map((name) => {
    const entry = pool.find((player) => player.name === name);
    if (!entry) throw new Error(`${name} is not in the ${decade}s pool`);
    return { name, line: entry.line, note: entry.note };
  });
}

function franchiseRoster(id: string) {
  const bucket = DECADE_BUCKETS.find((b) => b.id === id);
  if (!bucket) throw new Error(`Unknown franchise roster: ${id}`);
  return bucket;
}

function rosterCards(id: string, names: string[]): Card[] {
  const bucket = franchiseRoster(id);
  return names.map((name) => {
    const player = bucket.players.find((p) => p.name === name);
    if (!player) throw new Error(`${name} is not on ${id}`);
    return { name, line: player.line, note: player.note };
  });
}

/** How many distinct ranks still earn an A+ on a roster of this size. */
function aPlusDepth(size: number): number {
  let depth = 1;
  while (gradeFor(depth, size) === "A+") depth++;
  return depth;
}

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const say = (n: number) => NUMBER_WORDS[n] ?? String(n);

const ROSTER_SIZES = DECADE_BUCKETS.map((bucket) => bucket.players.length);
const SMALLEST = Math.min(...ROSTER_SIZES);
const LARGEST = Math.max(...ROSTER_SIZES);
const TENURE_NOTE = rosterCards("blazers-1990s", ["Clifford Robinson"])[0].note;
const MAGIC = franchiseRoster("magic-1990s");
const ROCKETS = franchiseRoster("rockets-2010s");

function Hand({ cards }: { cards: Card[] }) {
  return (
    <dl className="roster">
      {cards.map((card) => (
        <div key={card.name}>
          <dt>{card.name}</dt>
          <dd>
            <span className="stat">{card.line}</span>
            {card.note}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function ReadingRostersGuide() {
  return (
    <>
      <Article
        title="How to read a roster"
        eyebrow="Strategy"
        intro="Every round is a guess about one hidden number, made from a name, a box line and a short note. Here is how to turn those clues into the right pick, and when to stop reading and re-spin."
        related={[
          { href: "/guides/skills", title: "The six skills, explained" },
          { href: "/guides/budget-strategy", title: "Budget strategy" },
          { href: "/decades", title: "Decade guides" },
        ]}
      >
        <Section id="card" title="What the card actually shows">
          <p>
            In Normal, every row has a name and a box line, and on screens wider than a phone a one-line note sits at
            the right edge. Ball Knowledge hides both the box line and the note, so every
            screen shows names only and everything else comes from what you know. Budget adds a price for the current skill — the strongest clue
            in the game, covered in the <Link href="/guides/budget-strategy">Budget guide</Link>.
          </p>
          <p>
            The landing badge differs by wheel. On the franchise wheel it rates the franchise’s decade as a whole; on
            the positional wheel it rates the dealt {say(POS_DRAW)} at this round’s skill, so ROUGH there means weak at
            exactly what you need. List order is not a ranking: positional deals are shuffled, and franchise rosters
            show hand-written headliners first, then the rest of the decade, most minutes first.
          </p>
        </Section>

        <Section id="line" title="Reading the line, skill by skill">
          <p>
            The game’s own hint under every Normal roster is the right default: points don’t measure handles. Each part
            of a box line speaks to one or two skills and is noise for the rest.
          </p>
          <dl className="skill-list">
            <div>
              <dt>Jumpshot</dt>
              <dd>
                Free-throw and three-point percentages are the best tells when a line shows them. Field-goal percentage
                on a big usually measures dunks.
              </dd>
            </div>
            <div>
              <dt>Handles</dt>
              <dd>
                Weakly signalled. Assists help a little, guard size more, scoring volume barely at all. A note about a
                crossover, or a guard listed under six feet, outweighs any number.
              </dd>
            </div>
            <div>
              <dt>Finishing</dt>
              <dd>
                Points from a big or a slasher, a high field-goal percentage, free-throw volume. Points from a shooter
                say nothing.
              </dd>
            </div>
            <div>
              <dt>Playmaking</dt>
              <dd>Assists are the most honest number on the card, and centers can lead this column too.</dd>
            </div>
            <div>
              <dt>Defense</dt>
              <dd>
                The hardest skill to see. Steals, blocks, All-Defense and Defensive Player of the Year mentions are
                real signals; rebounds are not. A low-scoring line with a defensive note is the classic hidden gem.
              </dd>
            </div>
            <div>
              <dt>Athleticism</dt>
              <dd>
                Rebounds, blocks and dunk-contest notes point toward it; notes about age, knees or a last stop point
                away.
              </dd>
            </div>
          </dl>
        </Section>

        <Section id="notes" title="Read the note like a scouting report">
          <p>
            On hand-written cards the note is an editor’s one-liner, and it often names the skill outright: “Never
            guarded a soul doing it.” The pools are deliberately stocked with trap picks — famous names who are wrong
            for the round — and connoisseur picks, role players hiding one elite skill. A note that brags about some
            other skill usually marks a trap.
          </p>
          <p>
            Franchise rosters also carry deep-bench cards with a pure tenure note — “{TENURE_NOTE}” — and a line
            averaged across that stint. They were generated from historical box scores, so their assists track
            playmaking closely, but short stints are noisy and the note says nothing about skill. On those cards the
            name does the work: a famous specialist can be hiding at the bottom of the list.
          </p>
        </Section>

        <Section id="decades" title="Adjust for the decade">
          <p>
            Lines don’t travel across eras. The 1960s and 1970s ran at a pace that inflated points and rebounds: Walt
            Bellamy’s “31.6 PPG · 19.0 RPG” comes with a note calling it rookie numbers from a video game, and his
            jumpshot is still a punchline.
          </p>
          <p>
            The older pools treat a big man’s jumper as the exception, so a jumpshot round in a pre-2010s center deal
            is a hunt for it; Bob McAdoo’s 1970s note files his under witchcraft. The 2020s flip that: most bigs
            shoot, the question becomes one of degree, and the rim-runner without a jumper is the obvious trap.
          </p>
          <p>
            One person can also carry several cards, each rated for that decade and stint. Michael Jordan’s 2000s
            Wizards card (“Thirty-eight years old. Still your problem.”) is not his 1990s Bulls card.
          </p>
        </Section>

        <Section id="position" title="Positional cues">
          <p>
            On the franchise wheel the roster mixes positions and the defaults usually hold: guards for handles and
            playmaking, bigs for finishing and defense. The exceptions — the passing center, the stopper at shooting
            guard — are where the grades are. On a positional run everyone shares a position, so what changes is each
            round’s depth: a center deal is deep at Finishing and Defense and thin at Jumpshot and Handles, a
            point-guard deal the reverse. In the thin rounds, hunt for the one exception.
          </p>
        </Section>

        <Section id="grades" title="The grade only cares about this roster">
          <p>
            A pick’s grade counts how many players on the landed roster are strictly better at this skill, including
            players you have already used, who stay on the card crossed out. So the question is never “who is a great
            shooter?” but “who is the best shooter here that I can still take?”
          </p>
          <p>
            Roster size sets the margin for error. A positional deal has {say(POS_DRAW)} names, so only the single best
            earns an A+; if he is crossed out, the A+ is gone unless someone ties him, and second place is an{" "}
            {gradeFor(1, POS_DRAW)}. Franchise rosters run from {SMALLEST} to {LARGEST} names, so at least the top{" "}
            {say(aPlusDepth(SMALLEST))} at a skill grade A+, and the deep bench pads the bottom: a near miss still grades
            well, and only a genuinely bad pick costs letters.
          </p>
          <p className="callout">
            An A+ on a weak roster is a perfect read of a bad hand. The OVR still pays for the hand.
          </p>
        </Section>

        <Section id="one-use" title="Plan around the one-use rule">
          <p>
            The one-use rule follows the person, not the card: take Shaquille O’Neal’s finishing and every Shaq card on
            every later roster is crossed out. Because the rounds always run in the same order, a player’s future value
            is only his ratings in the skills still to come; a great shooter is worth nothing after round one.
          </p>
          <p>
            So before spending a versatile star, ask whether he is elite at a later skill and whether someone else here
            covers this one. If a specialist ties him, or both sit in the A+ band of a big franchise roster, take the
            specialist and keep the star eligible. If the star is clearly better now, take him: future rosters are
            random, and a player who may never reappear is not worth a certain grade today.
          </p>
        </Section>

        <Section id="respin" title="Re-spin or read?">
          <p>
            The franchise wheel gives one team re-spin and one decade re-spin per run; the positional wheel gives one
            decade re-spin, which deals a fresh {say(POS_DRAW)}. Never spend one for the grade — the best name on any
            roster earns an A+. Spend it for the OVR, when the best available is weak in absolute terms at a skill your
            target cares about.
          </p>
          <p>
            Defense is the usual candidate: one steal supplies your whole defensive score, and it comes fifth, so a
            token burned in round one is gone when a rough defense landing arrives. Playmaking matters more for point
            guards, Jumpshot for shooting guards, Finishing for centers; Handles, which moves OVR least, is the weakest
            reason to spin. On the franchise wheel, pick the re-spin that removes the actual problem: a team re-spin
            keeps the decade, a decade re-spin keeps the franchise.
          </p>
        </Section>

        <Section id="examples" title="Four worked examples">
          <h3>1. Jumpshot on the 1990s Magic</h3>
          <Hand cards={rosterCards(MAGIC.id, ["Shaquille O'Neal", "Dennis Scott", "Mark Price", "Steve Kerr"])} />
          <p>
            Round one, Best Player, {MAGIC.players.length} names. Shaq’s line is the loudest on the card, and his
            jumpshot sits near the very bottom of the roster. Dennis Scott is the safe read: his note is a jumpshot note.
            The sharper read is further down, where Mark Price and Steve Kerr, two of the best shooters of their era,
            sit on tenure cards that say nothing about shooting. All three grade A+ here, but the names beat the lines.
          </p>

          <h3>2. Defense on the 2010s Rockets</h3>
          <Hand cards={rosterCards(ROCKETS.id, ["James Harden", "Clint Capela", "Trevor Ariza", "P.J. Tucker"])} />
          <p>
            Round five, {ROCKETS.players.length} names. Harden’s MVP line is the trap; his defense lands in the middle of
            the roster. Capela’s lobs-and-blocks note makes him a respectable answer. The wings whose notes are about
            nothing but defense are better — Ariza, and best of all Tucker, a 6-foot-5 forward who guarded centers.
          </p>

          <h3>3. Handles in a 1990s point-guard deal</h3>
          <Hand cards={poolCards(1990, ["John Stockton", "Mark Jackson", "Kenny Anderson", "Tim Hardaway"])} />
          <p>
            Round two, positional; say these four are among the {say(POS_DRAW)}. The assist column points at Stockton
            and Mark Jackson, and that is the misread: both are better passers than ball-handlers. Anderson’s left hand
            is a real clue, but Hardaway’s note names the move, and he is the read. If Allen Iverson is among the other
            eight, he is better still.
          </p>

          <h3>4. Finishing in a 2000s center deal</h3>
          <Hand cards={poolCards(2000, ["Shaquille O'Neal", "Amar'e Stoudemire", "Tim Duncan", "Dwight Howard"])} />
          <p>
            Round three, positional. Shaq is the best finisher here, and the one-use rule agrees: Duncan and Howard are
            the players you would most want back for Defense, Howard and Amar’e for Athleticism, and Shaq’s later
            skills are good rather than great. Taking him keeps all three eligible if the wheel brings any of them
            back.
          </p>
        </Section>
      </Article>
      <PublisherAds />
    </>
  );
}
