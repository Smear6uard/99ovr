import Link from "@/components/SiteLink";
import { Article, Section } from "@/components/PublisherContent";
import { PublisherAds } from "@/components/PublisherAds";
import { GAUNTLET, POSITION_GAUNTLETS } from "@/data/gauntlet";
import { POSITION_POOLS, POS_DECADES } from "@/data/positions";
import { POS_DRAW, POS_TOKENS } from "@/lib/poswheel";
import { TARGET_PROFILES } from "@/lib/steal";
import { pageMetadata } from "@/lib/metadata";
import { POSITIONS, type Position, type PositionMode, type Rung } from "@/lib/types";

export const metadata = pageMetadata(
  "99OVR Positional Builds: PG, SG, SF, PF and C",
  "How a positional target changes a 99OVR run: the decade wheel, each position’s scoring weights and boss ladder, and which skills to chase from PG to C.",
  "/guides/positional-builds",
);

const TARGETS: PositionMode[] = ["ALL", ...POSITIONS];
const targetLabel = (t: PositionMode) => (t === "ALL" ? "Best Player" : t);
const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Pool sizes, read from the data so the page follows any new code version. */
const sizes = (decades: number[]) =>
  decades.flatMap((d) => POSITIONS.map((pos) => POSITION_POOLS[d][pos].length));
const oldSizes = sizes([1960, 1970]);
const newSizes = sizes(POS_DECADES.filter((d) => d >= 1980));
const span = (xs: number[]) => {
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  if (lo === hi) return `${lo}`;
  return hi - lo === 1 ? `${lo} or ${hi}` : `${lo} to ${hi}`;
};

/** Players in a decade's position pool who also appear in another position's pool that decade. */
function duals(decade: number, pos: Position): { dual: number; total: number } {
  const elsewhere = new Set(
    POSITIONS.filter((p) => p !== pos).flatMap((p) => POSITION_POOLS[decade][p].map((x) => x.person)),
  );
  const pool = POSITION_POOLS[decade][pos];
  return { dual: pool.filter((x) => elsewhere.has(x.person)).length, total: pool.length };
}
const pf2000 = duals(2000, "PF");
const pgShares = POS_DECADES.map((d) => duals(d, "PG")).map((x) => x.dual / x.total);
const pgDual = { lo: Math.min(...pgShares), hi: Math.max(...pgShares) };
const modernSf = [2000, 2010, 2020].map((d) => duals(d, "SF"));
const modernSfShare =
  modernSf.reduce((a, x) => a + x.dual, 0) / modernSf.reduce((a, x) => a + x.total, 0);

const ladders: Array<[string, Rung[]]> = [
  ["Best Player", GAUNTLET],
  ...POSITIONS.map((pos): [string, Rung[]] => [pos, POSITION_GAUNTLETS[pos]]),
];

export default function PositionalBuilds() {
  return (
    <>
      <Article
        title="Positional builds, PG to C"
        eyebrow="Strategy"
        intro="Picking a position changes three things at once: which players the wheel deals you, how the six skills are weighted into your OVR and which ten legends stand at the end. Here is how each of those works, and what it means for every spot from point guard to center."
        related={[
          { href: "/guides/skills", title: "The six skills, explained" },
          { href: "/guides/budget-strategy", title: "Budget strategy" },
          { href: "/decades", title: "Decade guides" },
        ]}
      >
        <Section id="wheel" title="The decade wheel">
          <p>
            Positional runs drop the franchise reel. Each round spins a decade,
            the 1960s through the 2020s, and deals {POS_DRAW} players from that
            decade’s hand-picked pool for your position: “90s centers,” say,
            or “70s point guards.” The two oldest decades are weighted down to
            10% each, so the 1960s and 1970s together land about one spin in
            five; the five later decades split the rest at 16% apiece.
          </p>
          <p>
            Pool size matters. The 1960s and 1970s pools hold {span(oldSizes)}{" "}
            players per position, so a dealt dozen shows you most of the
            decade. Later pools run {span(newSizes)} deep, so you see well under
            half, and landing the same decade again in a later round deals a
            fresh dozen rather than the same one.
          </p>
          <p>
            You get {POS_TOKENS === 1 ? "one decade re-spin" : `${POS_TOKENS} decade re-spins`}{" "}
            for the whole run. It always moves you to a different decade, but
            which one is fixed by the run’s seed, not chosen by you. The landing
            screen helps you decide: a dozen that is strong at the round’s
            skill lands with a jackpot shake, and a weak one gets a “womp
            womp.” Spend the re-spin on a womp in a round your position weights
            heavily, knowing the new dozen isn’t guaranteed to be better. Ignore womps in rounds it doesn’t; for centers that is
            most handles rounds.
          </p>
          <p>
            The one-use rule follows the person, not the card. LeBron James is
            in the 2000s, 2010s and 2020s pools; Michael Jordan is in both the
            1980s and 1990s shooting-guard pools. Steal anything from one card
            and every other copy is locked for the rest of the run.
          </p>
        </Section>

        <Section id="weights" title="How each position is scored">
          <p>
            The pipeline is the same for every target (see{" "}
            <Link href="/scoring">ratings and scoring</Link>), but the weights
            change. The first three columns split the offense score; the last
            three combine offense, defense and a direct playmaking share into
            the OVR. These are formula weights, not player ratings.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Shot creation</th>
                  <th>Rim pressure</th>
                  <th>Playmaking</th>
                  <th>Offense</th>
                  <th>Defense</th>
                  <th>Direct playmaking</th>
                </tr>
              </thead>
              <tbody>
                {TARGETS.map((t) => {
                  const w = TARGET_PROFILES[t];
                  return (
                    <tr key={t}>
                      <td>{targetLabel(t)}</td>
                      <td>{pct(w.sc)}</td>
                      <td>{pct(w.rp)}</td>
                      <td>{pct(w.play)}</td>
                      <td>{pct(w.oOff)}</td>
                      <td>{pct(w.oDef)}</td>
                      <td>{pct(w.oPlay)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p>
            Weights alone hide how the skills interact, so here is what one
            extra rating point is worth in OVR for a build rated 72 in every
            skill, worked through the full formula. Near 80 every figure
            roughly halves, except playmaking, which holds up best because its
            direct share skips the diminishing-returns curve.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Target</th>
                  <th>DEF</th>
                  <th>PLY</th>
                  <th>JS</th>
                  <th>FIN</th>
                  <th>ATH</th>
                  <th>HND</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Best Player</td><td>0.41</td><td>0.30</td><td>0.24</td><td>0.17</td><td>0.16</td><td>0.08</td></tr>
                <tr><td>PG</td><td>0.32</td><td>0.42</td><td>0.28</td><td>0.11</td><td>0.12</td><td>0.09</td></tr>
                <tr><td>SG</td><td>0.37</td><td>0.27</td><td>0.31</td><td>0.17</td><td>0.15</td><td>0.10</td></tr>
                <tr><td>SF</td><td>0.44</td><td>0.27</td><td>0.25</td><td>0.18</td><td>0.17</td><td>0.08</td></tr>
                <tr><td>PF</td><td>0.51</td><td>0.23</td><td>0.17</td><td>0.22</td><td>0.20</td><td>0.06</td></tr>
                <tr><td>C</td><td>0.57</td><td>0.20</td><td>0.11</td><td>0.25</td><td>0.23</td><td>0.04</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            Two patterns run through every row. Defense is worth the most per
            point everywhere except point guard, and handles is worth the least
            everywhere, because it only matters as a multiplier on jumpshot.
          </p>
        </Section>

        <Section id="ladders" title="Positional boss ladders">
          <p>
            Each position faces its own ten-boss ladder at the same difficulty
            steps as the Best Player gauntlet, so the OVR you need doesn’t
            change, but the opponents do. That matters most in Budget, where
            some flaws only fire against quick or crafty bosses. Scouting
            reports live in the{" "}
            <Link href="/guides/boss-gauntlet">boss gauntlet guide</Link>.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ladder</th>
                  <th>Final boss</th>
                  <th>Quick</th>
                  <th>Crafty</th>
                </tr>
              </thead>
              <tbody>
                {ladders.map(([label, rungs]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{rungs[rungs.length - 1].name}</td>
                    <td>{rungs.filter((r) => r.quick).length}</td>
                    <td>{rungs.filter((r) => r.crafty).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="pg" title="Point guard: buy the passer, then find a defender">
          <p>
            Point guard is the one target where playmaking outranks defense.
            It takes its biggest share of the offense here and another 18% of
            the OVR directly, while rim pressure shrinks to the smallest slice
            of any position. Per point, a passer is worth about four times a
            finisher.
          </p>
          <p>
            The pools cooperate. Handles and playmaking are deep in every
            decade, and those rounds essentially never land a weak dozen. The
            catch is the grade: when everyone on the board can pass, a middling
            letter can still be a very good rating, so don’t chase the letter. Defense is the thin round. From the 1990s on, four or five
            point guards in ten in each pool are defensive liabilities, and the
            2000s pool is the leakiest of all. The 1960s and 1970s pools are
            the exception, with stoppers like K.C. Jones (“7.4 PPG · 4.3 APG”,
            a box line that tells you nothing), Walt Frazier and Norm Van Lier.
          </p>
          <p>
            The traps: spending anything on finishing, and treating the
            handles round as important because the pool is full of great ball
            handlers. Combo guards carry both tags and make up between{" "}
            {pct(pgDual.lo)} and {pct(pgDual.hi)} of each point-guard pool.
            They are often where the shooting lives:
            the best jumpers in the 1960s pool belong to Jerry West and Oscar
            Robertson, and Stephen Curry and James Harden do the same job in
            the 2010s.
          </p>
        </Section>

        <Section id="sg" title="Shooting guard: everyone can shoot, so win the defense round">
          <p>
            Shooting guard has the heaviest offense in the game: shot creation
            is half the offense score and offense is 56% of the OVR. Even so,
            in a balanced build a point of defense still edges a point of
            jumpshot, and near 80 playmaking, defense and jumpshot are worth
            about the same. The extra shooting weight makes jumpshot
            competitive, not dominant.
          </p>
          <p>
            Jumpshot, handles and athleticism are deep in every decade, so
            those rounds rarely hurt and grade harshly. Defense is where
            shooting-guard runs are won or lost: strong defensive dozens are
            rare, the 2010s pool is the deepest, and the 1980s pool has genuine
            stoppers in Sidney Moncrief and Michael Cooper. Playmaking is thin
            outside the combo guards.
          </p>
          <p>
            The classic trap is taking a famous scorer in the defense round
            because his name feels safe. The dual-tag split is useful here:
            combo guards (Oscar Robertson, Walt Frazier, James Harden, Luka
            Dončić) carry most of the passing, while wings who also play small
            forward, such as Cooper, Bruce Bowen and Tony Allen, are some of the
            best defenders on the board.
          </p>
        </Section>

        <Section id="sf" title="Small forward: the two-way middle">
          <p>
            Small forward is the closest profile to Best Player, with a little
            more weight on defense. Per point, defense leads clearly, with
            playmaking and jumpshot roughly tied behind it.
          </p>
          <p>
            Jumpshot, finishing and athleticism are deep. Playmaking is the
            problem: small-forward dozens are almost never strong at it, and
            about one landing in nine is outright weak. The 1990s, with Grant
            Hill, Scottie Pippen and Toni Kukoc, is the one decade with several
            real passers. Handles stay thin until the 2020s. Defense swings by
            era: switchable wings make the 2010s and 2020s pools deep, while
            the 1980s and 1990s pools are thin.
          </p>
          <p>
            The trap is waiting for a better passer who never comes. When Larry
            Bird or LeBron James shows up in the playmaking round, that is the
            round’s ceiling, not an opening bid. Modern small-forward pools are
            mostly hybrids: about {pct(modernSfShare)} of the 2000s–2020s
            players also sit in the shooting-guard or power-forward pool, and
            the best passers of the 2010s pool, LeBron and Giannis
            Antetokounmpo, are both forwards with two tags.
          </p>
        </Section>

        <Section id="pf" title="Power forward: defense first, then hunt a passer">
          <p>
            Power forward splits the OVR almost evenly between offense and
            defense, and tilts the offense toward rim pressure. The result:
            defense is worth more than twice any other skill per point.
            Playmaking, finishing and athleticism form a close second tier,
            and handles barely registers.
          </p>
          <p>
            This is the most mixed pool in the game. In the 2000s, {pf2000.dual}{" "}
            of the {pf2000.total} power forwards also appear in the small
            forward or center pool, so one dozen can run from Carmelo Anthony
            to Marcus Camby. Finishing, defense and athleticism are deep.
            Handles and playmaking are thin, and the playmaking round is
            usually a womp in the 1960s through 1980s pools. Stretch fours
            arrive in the 2000s with Dirk Nowitzki and Rashard Lewis; the 1990s
            pool is the weakest at shooting.
          </p>
          <p>
            Two traps. Don’t spend the re-spin on handles. And don’t skip a
            real passer: Toni Kukoc, Chris Webber and Draymond Green are rare in
            this pool, and per point playmaking is the best skill after defense. The
            defense round rewards reading past the box score, as Dennis
            Rodman’s 1990s line (“5.2 PPG · 16.7 RPG”) shows. As a loose rule, the
            forwards who also play small forward bring the handles and passing,
            and the bigs who also play center bring the rim protection.
          </p>
        </Section>

        <Section id="c" title="Center: rim, defense and one free round">
          <p>
            Center gives defense half the OVR and rim pressure more than half
            the offense, both the highest of any target. Per point, defense is
            worth more than double finishing; athleticism sits just behind
            finishing because it multiplies both of those big slices.
            Jumpshot and handles count for little.
          </p>
          <p>
            Finishing and defense are deep in every decade, so those rounds
            almost always land strong dozens. Handles is a desert: no center
            dozen ever prices a handles steal at $4 or more in Budget, and the
            round is a womp most of the time. Treat it as a free round and save
            the re-spin. Playmaking and jumpshot are thin before the 2020s;
            the 1990s pool has the fewest shooting bigs.
          </p>
          <p>
            Bigs who also play power forward supply most of the shooting and
            handling. Dirk Nowitzki leads the jumpshot rounds of the 2000s and
            2010s center pools, and the best handlers among 2010s centers
            (Draymond Green, Blake Griffin, Anthony Davis) all carry both tags.
            The great passing centers are mostly pure centers, though: Bill
            Walton, Arvydas Sabonis and Nikola Jokić. One synergy note: Killer
            Instinct needs every skill at a solid level, and no center in the
            1960s through 1980s pools handles the ball well enough to get there.
          </p>
        </Section>

        <Section id="best-player" title="How Best Player runs compare">
          <p>
            Best Player spins a franchise reel and a decade reel instead, landing
            on all-decade franchise rosters from the 1970s through the 2020s.
            Those rosters run to dozens of names rather than a dealt twelve,
            and you get one team re-spin (same decade, new franchise) and one
            decade re-spin (same franchise, new decade) instead of a single
            decade re-spin. The Best Player weights look most like small
            forward’s, with more of the offense on playmaking, and the ladder
            ends with{" "}
            {GAUNTLET[GAUNTLET.length - 1].name}.
          </p>
          <p>
            The practical difference is the search. On a franchise roster, the
            right answer is often a role player buried in a long list, and most
            of the board is filler. In a positional dozen every name is a
            plausible answer and the decision is between near neighbors. Budget
            exaggerates the gap: franchise boards are mostly $1 tags, while
            positional dozens are expensive. If you mainly play Daily, expect
            both; roughly three days in ten are positional.
          </p>
        </Section>
      </Article>
      <PublisherAds />
    </>
  );
}
