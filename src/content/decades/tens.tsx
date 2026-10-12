import Link from "@/components/SiteLink";
import type { DecadeGuide } from "@/content/types";
import { DECADE_BUCKETS } from "@/data/eras/decades";

/** Franchise rosters the Best Player wheel can land on in the 2010s (one per franchise). */
const TENS_FRANCHISES = DECADE_BUCKETS.filter((bucket) => bucket.decade === 2010).length;

export const TENS_GUIDE: DecadeGuide = {
  decade: 2010,
  slug: "2010s",
  title: "The 2010s: the three-point revolution and the switching wing",
  metaTitle: "2010s Basketball Decade Guide: Pace, Space, Switching",
  description:
    "How the 2010s played — Curry’s range, switch-everything wings, rim-running centers — and what it means for each skill when the 99OVR decade reel lands there.",
  intro:
    "The decade the three-pointer stopped being a specialty and became the whole argument. Here is how the 2010s actually played, and how to steal from them without falling for the wrong famous name.",
  summary:
    "Splash Brothers, switchable wings and centers who never left the paint: one of the deepest defensive pools in 99OVR, with a hard split between stretch bigs and lob catchers.",
  sections: [
    {
      id: "pace-and-space",
      title: "How the game changed",
      body: (
        <>
          <p>
            The 2010s opened with LeBron James leaving Cleveland for Miami and closed with a banner in Toronto, and in
            between the geometry of the sport was redrawn. Teams worked out that a corner three or a shot at the rim
            beat a long two, and league-wide three-point attempts climbed season after season. By the late decade Mike
            D’Antoni’s Rockets treated everything between the paint and the arc as wasted floor.
          </p>
          <p>
            Stephen Curry was the proof of concept: range from well behind the line pulled defenders out toward half
            court and opened the floor for everyone else. The <Link href="/decades/2000s">2000s</Link> ran on
            isolation and post-ups; here the post-up became a niche play, and the 18-footer LaMarcus Aldridge and
            DeMar DeRozan built careers on became the shot the spreadsheets begged them to stop taking.
          </p>
          <p>
            Defenses answered by switching, which made the long, versatile wing the prized asset: Kawhi Leonard, Andre
            Iguodala, Jimmy Butler, Paul George. Golden State took the idea to its limit with Draymond Green at center
            in the Death Lineup. Centers split into two species: rim-runners who screened, caught lobs and guarded the
            basket (DeAndre Jordan, Clint Capela, Rudy Gobert), and stretch bigs who added a three mid-career (Brook
            Lopez, Marc Gasol, Al Horford, Serge Ibaka).
          </p>
        </>
      ),
    },
    {
      id: "defining-teams",
      title: "Superteams, 73 wins and a comeback",
      body: (
        <>
          <p>
            LeBron reached eight straight Finals, four with Miami and four back in Cleveland. The Heat lost to Dirk
            Nowitzki’s Mavericks in 2011, won in 2012 and 2013 (the second saved by Ray Allen’s corner three in Game
            6), then fell in 2014 to a San Antonio passing clinic that made a 22-year-old Kawhi Leonard Finals MVP.
          </p>
          <p>
            Then Golden State took over: a title in 2015, a 73–9 season with Curry the first unanimous MVP, and a
            Finals loss after leading Cleveland three games to one, settled by LeBron’s chase-down block and Kyrie
            Irving’s three over Curry. Kevin Durant signed that summer and two more titles followed. Elsewhere, Russell
            Westbrook averaged a triple-double three seasons running, Memphis won ugly with Grit and Grind, and in
            2019 Kawhi’s four-bounce buzzer-beater against Philadelphia sent Toronto on toward its first title.
          </p>
        </>
      ),
    },
    {
      id: "six-skills",
      title: "What the decade does to the six skills",
      body: (
        <>
          <p>
            In 99OVR’s editorial ratings (not official numbers) two skills are abundant, one is quietly thin, and the
            center pool splits in half.
          </p>
          <dl className="skill-list">
            <div>
              <dt>Jumpshot</dt>
              <dd>
                The deepest guard shooting the game had seen: Curry, Klay Thompson, Damian Lillard, James Harden,
                Kyrie, plus specialists like JJ Redick and Kyle Korver. Wings and power forwards shoot too; the trap is
                a large bloc of centers who barely took a jumper.
              </dd>
            </div>
            <div>
              <dt>Handles</dt>
              <dd>
                Concentrated in the backcourt, where Kyrie, Harden, Curry and Jamal Crawford sit near the top of the
                whole game. The skill thins past the wings and becomes a real weakness at center.
              </dd>
            </div>
            <div>
              <dt>Finishing</dt>
              <dd>
                Thinner at the top than you would expect, because the decade shot from outside. The elite finishers
                are forwards and athletic bigs (LeBron, Giannis Antetokounmpo, Amar’e Stoudemire, Anthony Davis, Dwight
                Howard) plus Westbrook and Dwyane Wade.
              </dd>
            </div>
            <div>
              <dt>Playmaking</dt>
              <dd>
                Point guards at their peak (Chris Paul, Rajon Rondo, John Wall, Ricky Rubio) plus LeBron and a newer
                type, the passing big: Marc Gasol, Joakim Noah, Draymond, Horford, Pau Gasol.
              </dd>
            </div>
            <div>
              <dt>Defense</dt>
              <dd>
                One of the two richest defensive pools in the game, alongside the 2020s: switchable wings, pestering
                guards like Patrick Beverley and Marcus Smart, and a run of Defensive Player of the Year centers.
              </dd>
            </div>
            <div>
              <dt>Athleticism</dt>
              <dd>
                Plenty, from Westbrook and Wall to Giannis, Zach LaVine and Dwight. The traps are the cerebral
                veterans, such as Steve Nash’s Lakers-era card, Marc Gasol and Dirk, whose brains outran their legs.
              </dd>
            </div>
          </dl>
        </>
      ),
    },
    {
      id: "positions",
      title: "Position by position",
      body: (
        <>
          <p>
            <strong>Point guard.</strong> Among the strongest handles and playmaking pools in the game, with the best
            shooting at the top end. Defense is the weak round, since several of the best scorers are liabilities;
            look for Jrue Holiday, Beverley, Smart or Chris Paul.
          </p>
          <p>
            <strong>Shooting guard.</strong> Shooters and stoppers, little in between. Klay, Redick and Korver win
            jumpshot rounds; Tony Allen, Avery Bradley and Danny Green win defense. Finishing has one of the lowest
            ceilings in any pool, and Wade, Butler, DeRozan and Victor Oladipo are the lifelines.
          </p>
          <p>
            <strong>Small forward.</strong> Defense everywhere, down to role players like PJ Tucker, Robert Covington
            and Shane Battier. LeBron, Durant, Kawhi and Giannis are listed at both forward spots, so a power forward
            run can deal them too. Handles and playmaking thin out fast once LeBron is gone.
          </p>
          <p>
            <strong>Power forward.</strong> The stretch four arrives: Ryan Anderson, Nikola Mirotic and Channing Frye
            make the jumpshot round friendlier than in any earlier decade. Draymond, Horford and Blake Griffin carry
            playmaking.
          </p>
          <p>
            <strong>Center.</strong> The great divide. Jordan, Capela and Gobert are gifts in the finishing, defense
            and athleticism rounds and punchlines in the first two; Dirk, Frye and Kevin Love flip that. Marc Gasol,
            Noah and Pau are the playmaking round’s best hope.
          </p>
        </>
      ),
    },
    {
      id: "on-the-wheels",
      title: "Where the 2010s show up",
      body: (
        <>
          <p>
            Positional runs land on the 2010s about one spin in six, the same weight as every decade from the 1980s
            on. On the Best Player wheel this is one of the most crowded decades, with {TENS_FRANCHISES} franchises
            carrying a 2010s roster. Because each roster spans the whole decade, a slot earned by a bad season can
            still hide stars: the tanking 2015 Sixers can deal Joel Embiid and Jimmy Butler, and the 2010 Nets include
            the Kevin Garnett and Paul Pierce years in Brooklyn.
          </p>
          <p>
            Two quirks are worth knowing. The Cavaliers exist on the wheel only as a 2010s franchise, folding the
            post-Decision collapse and the 2016 champions into one roster, so landing on Cleveland leaves the decade
            re-spin with nowhere to go. And Derrick Rose, Tim Duncan and Ray Allen live only on franchise rosters, not
            in this decade’s positional pool.
          </p>
        </>
      ),
    },
  ],
  draftTips: [
    {
      title: "Spend the defense round on a specialist",
      body: (
        <p>
          If the 2010s land in your defense round, you are in the best neighborhood in the game. The temptation is a
          two-way star like Paul George or Jimmy Butler, but you only take one skill per player, so the right steal is
          often a one-trick defender like Tony Allen, whose card is useless everywhere else. Save the stars for rounds
          where their reputations point at the right skill.
        </p>
      ),
    },
    {
      title: "Read the center’s box score before the name",
      body: (
        <p>
          In Normal mode the box-score clue usually tells you which kind of center you are looking at. DeAndre
          Jordan’s “13.8 RPG · 71% FG · 42% FT” is a rim-runner: take his finishing or athleticism, never his jumper.
          Brook Lopez’s “20 a night on the block, then 512 threes” is the decade’s story in one card. Ball Knowledge
          mode shows names only, so there you need to know which bigs moved out to the arc.
        </p>
      ),
    },
    {
      title: "Rebounds are not a skill",
      body: (
        <p>
          The 2010s produced enormous rebounding lines from Andre Drummond, Kevin Love and Westbrook, and none of the
          six skills is rebounding. A fifteen-rebound season hints at size and motor, which tend to show up in
          finishing and athleticism, and tells you nothing about a jumper or a handle. The{" "}
          <Link href="/guides/reading-rosters">roster-reading guide</Link> has more on which clues mislead.
        </p>
      ),
    },
    {
      title: "In Budget, let the depth do the work",
      body: (
        <p>
          Budget prices follow the hidden rating, so the decade’s best shooters and defenders cost the most. But the
          next tier down is full of genuine starters: a three-and-D wing like Trevor Ariza or Jae Crowder in the
          defense round, Wesley Matthews or Otto Porter in the jumpshot round. Where the decade is thin (guard
          finishing, frontcourt handles) the best available is often cheaper than you expect anyway. The{" "}
          <Link href="/guides/budget-strategy">Budget strategy guide</Link> covers the wallet in full.
        </p>
      ),
    },
  ],
  watchFor: [
    {
      name: "Tony Allen",
      why: "One of the very best defenders anywhere in the game, with a jumper that barely registers. Since you only steal one skill, that is a perfect card for the defense round.",
    },
    {
      name: "Kyle Korver",
      why: "His jumper ranks with the decade’s best and every other skill on his card is below average. Take the shot and walk away.",
    },
    {
      name: "Marc Gasol",
      why: "A Defensive Player of the Year who passes like a guard, which makes him a live option in two center rounds. His athleticism is one of the pool’s traps.",
    },
    {
      name: "Draymond Green",
      why: "In a power forward or center run he can win the playmaking or defense round outright. The jumper is where his fame stops helping.",
    },
    {
      name: "Russell Westbrook",
      why: "The triple-double line tempts you in every round, including the jumpshot round, which is his card’s weak spot. His athleticism, finishing and playmaking are all elite; take one of those.",
    },
    {
      name: "Andre Drummond",
      why: "The rebounding totals are real, but rebounding is not one of the six skills. His value is finishing and athleticism, and his jumper is among the worst in the pool.",
    },
    {
      name: "Isaiah Thomas",
      why: "A fourth-quarter scorer with a real jumper and a quick handle, and one of the weakest defenders in the decade. Never the answer in the defense round.",
    },
  ],
};
