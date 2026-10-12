import type { ReactNode } from "react";
import Link from "@/components/SiteLink";
import { Article, Section } from "@/components/PublisherContent";
import { PublisherAds } from "@/components/PublisherAds";
import { GAUNTLET, GAUNTLET_POWERS, POSITION_GAUNTLETS } from "@/data/gauntlet";
import { FLAWS } from "@/data/flaws";
import {
  GAUNTLET_DOMINANCE_FLOOR,
  GAUNTLET_DOMINANCE_GAP,
  GAUNTLET_UPSET_WINDOW,
  GAUNTLET_VARIANCE_CAP,
  gauntletWinProbability,
} from "@/lib/sim";
import { pageMetadata } from "@/lib/metadata";
import type { Position, Rung } from "@/lib/types";

export const metadata = pageMetadata(
  "The 99OVR Boss Gauntlet: Every Boss & Ladder",
  "How 99OVR’s ten-boss gauntlet decides a run, what OVR it takes to reach Jordan, and scouting reports on every Best Player and positional boss.",
  "/guides/boss-gauntlet",
);

/** No-flaw win chance for one rung, averaged over the seeded variance band. */
function rungOdds(ovr: number, power: number): number {
  const gap = ovr - power;
  if (gap >= GAUNTLET_UPSET_WINDOW) return 1;
  if (gap <= -GAUNTLET_UPSET_WINDOW) return 0;
  const steps = 240;
  let total = 0;
  for (let i = 0; i < steps; i++) {
    const variance = -GAUNTLET_VARIANCE_CAP + (2 * GAUNTLET_VARIANCE_CAP * (i + 0.5)) / steps;
    total += gauntletWinProbability(ovr, power, variance);
  }
  return total / steps;
}

/** No-flaw chance of reaching the final two doors (rounds 9–10) and of clearing all ten. */
function ladderOdds(ovr: number): { reachDoors: number; clear: number } {
  let alive = 1;
  let reachDoors = 1;
  GAUNTLET_POWERS.forEach((power, i) => {
    if (i === GAUNTLET_POWERS.length - 2) reachDoors = alive;
    alive *= rungOdds(ovr, power);
  });
  return { reachDoors, clear: alive };
}

const pct = (x: number) => (x < 0.005 ? "under 1%" : x > 0.995 ? "100%" : `${Math.round(x * 100)}%`);

const tagsOf = (r: Rung) =>
  r.quick && r.crafty ? "Quick, crafty" : r.quick ? "Quick" : r.crafty ? "Crafty" : "—";

const joinNames = (names: string[]) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

const flawName = (id: string) => FLAWS.find((f) => f.id === id)?.name ?? id;
const flawAmount = (id: string) => {
  const effect = FLAWS.find((f) => f.id === id)?.effect;
  return effect && "amount" in effect ? effect.amount : 0;
};

const autoWin = (r: Rung) => r.power + GAUNTLET_UPSET_WINDOW;
const floorAt = (r: Rung) => r.power + GAUNTLET_DOMINANCE_GAP;
const FLOOR_PCT = `${Math.round(GAUNTLET_DOMINANCE_FLOOR * 100)}%`;
const ODDS_ROWS = [85, 88, 90, 92, 94, 96, 97];

const SCOUTING: Record<string, (r: Rung) => ReactNode> = {
  boban: (r) => (
    <p>
      A Serbian center and one of the tallest players of his era, Boban Marjanović spent his NBA career as a
      cult favorite: enormous hands, a gentle sense of humor and remarkably efficient production in the
      minutes he got with several teams. In the gauntlet he is the doorman. Any build at {autoWin(r)} OVR or
      better beats him without a roll, and at {r.power - GAUNTLET_UPSET_WINDOW} or below the result is just
      as automatic in the other direction. If Boban ends your run, the draft did it, not the dice.
    </p>
  ),
  jr: (r) => (
    <p>
      JR Smith was one of the streakiest shooters of his generation: a Sixth Man of the Year with the
      Knicks, a champion with Cleveland in 2016 and the Lakers in 2020, and the central figure in a famous
      end-of-regulation mix-up in Game 1 of the 2018 Finals. On a hot night he
      could beat anyone. The simulation disagrees: {autoWin(r)} OVR wins outright, and no flaw on the wheel
      is aimed at him.
    </p>
  ),
  rodman: (r) => (
    <p>
      Dennis Rodman won five championships, two with the Bad Boys Pistons and three with the late-’90s
      Bulls, two Defensive Player of the Year awards and seven straight rebounding titles despite giving up
      size to most of the players he boxed out. He won with anticipation, angles and nuisance, which is why
      he is the ladder’s first crafty boss. Without a flaw, {autoWin(r)} OVR is enough; with{" "}
      {flawName("tunnel-vision")} you need {flawAmount("tunnel-vision")} more points for the same guarantee.
    </p>
  ),
  ray: (r) => (
    <p>
      Ray Allen retired as the NBA’s career leader in made threes, a record Stephen Curry later broke, and
      won titles in Boston in 2008 and Miami in 2013. The second came after his corner three in Game 6 of
      the 2013 Finals forced overtime and saved the Heat’s season. His rung carries no tag, so no matchup
      flaw touches it. It is also the last rung a build in the low 80s can win without a roll:{" "}
      {autoWin(r)} OVR clears it automatically.
    </p>
  ),
  iverson: (r) => (
    <p>
      Allen Iverson was listed at six feet, won the 2001 MVP, took the 76ers to the Finals that year and led
      the league in scoring four times. His crossover on Michael Jordan as a rookie is still one of the most
      replayed dribbles ever. He is the first quick boss, so {flawName("matador")} and{" "}
      {flawName("left-hand-only")} begin to cost you here. A build needs {autoWin(r)} to skip the roll, though
      an 85 still wins about {pct(rungOdds(85, r.power))} of the time.
    </p>
  ),
  dirk: (r) => (
    <p>
      Dirk Nowitzki played all 21 of his seasons in Dallas, won the 2007 MVP and the 2011 title with Finals
      MVP, and turned a one-legged fadeaway into a shot the next generation copied. He also proved a seven-footer
      could live on the perimeter, which reshaped how big men are built. Rung six carries no tag, but it is
      where the Budget clock starts: {flawName("slow-starter")} lands its second penalty here, and{" "}
      {flawName("cardio-2004")} and {flawName("fourth-quarter-tax")} begin to climb. Automatic at{" "}
      {autoWin(r)}.
    </p>
  ),
  duncan: (r) => (
    <p>
      Tim Duncan won five championships across three decades with San Antonio, plus two MVPs and three
      Finals MVPs, without ever playing for another team. The bank shot, the footwork and the defensive
      positioning were so consistent that the nickname became a description. Crafty, and the rung where free
      wins end: only a build at {autoWin(r)} or better skips the roll. {flawName("bricklayer")} switches on
      here and stays on for the rest of the run.
    </p>
  ),
  kobe: () => (
    <p>
      Kobe Bryant spent 20 seasons with the Lakers, won five titles, the 2008 MVP and two Finals MVPs, and
      scored 81 points in a game in 2006. His footwork and tough fadeaways were the product of a famously
      obsessive work ethic. He is quick, and he is the first boss nobody can beat automatically: with OVR
      capped at 97, the {GAUNTLET_UPSET_WINDOW}-point window is out of reach. {flawName("hero-ball")} starts
      charging from this rung on.
    </p>
  ),
  lebron: (r) => (
    <p>
      LeBron James won four championships with three franchises, four MVPs and four Finals MVPs, and became
      the NBA’s all-time leading scorer. The chase-down block in Game 7 of the 2016 Finals is the play the
      game’s loss line refers to. He is the first of the final two doors and is tagged crafty. A build needs{" "}
      {floorAt(r)} to get the {FLOOR_PCT} floor here; a 90 wins about {pct(rungOdds(90, r.power))} of the time.
    </p>
  ),
  mj: (r) => (
    <p>
      Michael Jordan won six championships in two three-peats, six Finals MVPs, five MVPs, ten scoring titles
      and a Defensive Player of the Year award. The shrug after his sixth three of the first half against
      Portland in the 1992 Finals is the one in his loss line. He is tagged both quick and crafty, so every
      matchup flaw on the wheel hits the final door. Only a build at {floorAt(r)} or better gets the floor; a 94
      wins about {pct(rungOdds(94, r.power))} of the time and a 90 about {pct(rungOdds(90, r.power))}.
    </p>
  ),
};

const LADDERS: { position: Position; title: string; intro: ReactNode }[] = [
  {
    position: "PG",
    title: "Point guard ladder",
    intro: (
      <p>
        A seminar in reading the floor. Nine of the ten bosses are tagged crafty, from Mark Jackson, a
        pass-first floor general, all the way to Magic Johnson and the Showtime Lakers. Six are quick as
        well, from Tony Parker’s drives to Magic himself. In Budget, {flawName("tunnel-vision")} touches
        nearly every game a point guard plays.
      </p>
    ),
  },
  {
    position: "SG",
    title: "Shooting guard ladder",
    intro: (
      <p>
        It opens with Jamal Crawford’s handle and closes with Jordan, and quickness is the theme: six quick
        bosses, including the very first. The middle is pure shooting (Klay Thompson, Reggie Miller, Ray
        Allen) before Iverson, Wade, Harden and Kobe walk you to the last door.{" "}
        {flawName("matador")} is a poor bet here: it costs you power in six of the ten games, including
        both final doors.
      </p>
    ),
  },
  {
    position: "SF",
    title: "Small forward ladder",
    intro: (
      <p>
        The two-way ladder. It begins with Trevor Ariza, a long-armed three-and-D role player, and climbs
        through Pippen, Kawhi Leonard and Julius Erving to Durant, Larry Bird and LeBron. Crafty bosses hold
        five of the last six rungs, so a forward who can’t see the floor gets found out late.
      </p>
    ),
  },
  {
    position: "PF",
    title: "Power forward ladder",
    intro: (
      <p>
        From Charles Oakley, the Knicks’ enforcer, to Tim Duncan. It is the most evenly split ladder: four
        quick bosses, four crafty ones, and Oakley and Karl Malone with neither tag. It is also the only
        ladder whose final boss isn’t quick, which makes {flawName("matador")} far cheaper here than anywhere
        else.
      </p>
    ),
  },
  {
    position: "C",
    title: "Center ladder",
    intro: (
      <p>
        It runs from Boban to Shaq, with generations of great bigs in between: Sabonis, Mutombo, Embiid,
        Robinson, Jokić, Russell, then Hakeem’s footwork and Kareem’s skyhook back to back at eight and nine.
        Shaquille O’Neal is tagged quick, not crafty, so this is the one ladder where{" "}
        {flawName("tunnel-vision")} spares the final door.
      </p>
    ),
  },
];

function LadderTable({ rungs, difficulty = false }: { rungs: Rung[]; difficulty?: boolean }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Round</th>
            <th scope="col">Boss</th>
            <th scope="col">Title</th>
            {difficulty ? <th scope="col">Difficulty</th> : null}
            <th scope="col">Tags</th>
          </tr>
        </thead>
        <tbody>
          {rungs.map((r) => (
            <tr key={r.id}>
              <td>{r.rung}</td>
              <td>{r.name}</td>
              <td>{r.title}</td>
              {difficulty ? <td>{r.power}</td> : null}
              <td>{tagsOf(r)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BossGauntletGuide() {
  const quickBosses = GAUNTLET.filter((r) => r.quick).map((r) => r.shortName);
  const craftyBosses = GAUNTLET.filter((r) => r.crafty).map((r) => r.shortName);
  const lastBoss = GAUNTLET[GAUNTLET.length - 1];

  return (
    <>
      <Article
        title="The boss gauntlet"
        eyebrow="Reference"
        intro="Ten games of one-on-one stand between your six steals and a perfect run. Here is exactly how they are decided, what each OVR can expect, and who is waiting on every rung."
        related={[
          { href: "/guides/weakness-wheel", title: "The weakness wheel" },
          { href: "/guides/positional-builds", title: "Positional builds, PG to C" },
          { href: "/scoring", title: "Ratings & scoring" },
        ]}
      >
        <Section id="how-it-works" title="How a run is decided">
          <p>
            After your sixth steal, the build plays up to ten games of one-on-one, one boss per rung, always in
            the same order. Every game is to 11. Win and you climb; lose once and the run is over, recorded as
            the round you fell in. Clear all ten and the card says so.
          </p>
          <p>
            Which ten you face depends on your build target. Best Player runs climb the ladder from Boban
            Marjanović to Michael Jordan. A positional run faces that position’s own ladder. The cast changes
            but the difficulty never does: every ladder uses the same number for each rung, climbing{" "}
            {GAUNTLET_POWERS.join(", ")}.
          </p>
          <p>
            Your side of the matchup is the OVR printed on your card and nothing else. Offense, defense,
            synergies and positional weights all matter, but only through the OVR they produce; the simulation
            never looks at your six skills again. Boss difficulty is a matchup number on that same scale, not a
            rating of the real player. Nobody is claiming Dirk Nowitzki was an 80.
          </p>
        </Section>

        <Section id="matchup-math" title="The math of one game">
          <p>
            Every game starts from the gap: your OVR minus the boss’s difficulty, adjusted by your flaw if you
            are playing Budget. Three rules then decide it.
          </p>
          <ol>
            <li>
              <strong>Big gaps skip the dice.</strong> If the gap, after any flaw penalty, is{" "}
              {GAUNTLET_UPSET_WINDOW} or more, you win outright. If it is −{GAUNTLET_UPSET_WINDOW} or worse,
              you lose outright. Outside that window no upset is possible in either direction.
            </li>
            <li>
              <strong>Inside the window, a curve sets the odds.</strong> An even gap is a coin flip, and near
              even each point of OVR is worth roughly eight percentage points. Before the roll, the game adds a
              seeded nudge to the gap, anywhere from −{GAUNTLET_VARIANCE_CAP} to +{GAUNTLET_VARIANCE_CAP}.
              That nudge can tilt a close game by about a dozen points either way; it cannot rescue a lopsided
              one.
            </li>
            <li>
              <strong>A clear edge is protected.</strong> If your OVR, before any flaw, is at least{" "}
              {GAUNTLET_DOMINANCE_GAP} above the boss, your chance never drops below {FLOOR_PCT}. The floor
              ignores flaws entirely, which matters a great deal once the{" "}
              <Link href="/guides/weakness-wheel">weakness wheel</Link> is involved.
            </li>
          </ol>
          <p>
            The rolls are seeded by the build itself: the six players you stole, your flaw, the mode and the
            target. The same build plays the same ten games, roll for roll, which is how a shared build code
            reproduces your result exactly. In Daily the attempt number is part of the seed too, so rebuilding
            your official six in a practice run can play out differently.
          </p>
          <p>
            The scoreline is honest as well. The winner always has 11, and the loser’s total shrinks as the gap
            grows, with a point or two of noise. An 11–9 loss was a genuine coin flip; an 11–2 loss was
            decided in the draft. The <Link href="/scoring">scoring page</Link> has the one-paragraph version
            of all this.
          </p>
        </Section>

        <Section id="ovr-odds" title="What your OVR can expect">
          <p>
            Put those rules together and the ladder sorts builds with uncomfortable precision. These odds come
            straight from the current simulation for a run with no flaw, as in Classic and Daily. The final
            two doors are rounds 9 and 10.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">OVR</th>
                  <th scope="col">Reaches the final two doors</th>
                  <th scope="col">Clears all ten</th>
                </tr>
              </thead>
              <tbody>
                {ODDS_ROWS.map((ovr) => {
                  const odds = ladderOdds(ovr);
                  return (
                    <tr key={ovr}>
                      <td>{ovr}</td>
                      <td>{pct(odds.reachDoors)}</td>
                      <td>{pct(odds.clear)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p>
            The first six rungs are a formality for a serious build. At {autoWin(GAUNTLET[5])} or better every
            one of them is an automatic win, and a mid-80s build usually gets through, although Dirk at six
            already takes a real bite. The gauntlet that decides runs is four games long: rounds 7 to 10,
            which on the Best Player ladder means Duncan, Kobe, LeBron and Jordan.
          </p>
          <p>
            {floorAt(lastBoss)} is the number that matters. It is the lowest OVR that sits{" "}
            {GAUNTLET_DOMINANCE_GAP} clear of Jordan, so the {FLOOR_PCT} floor covers every rung. Even then a
            perfect run is not guaranteed: the floor is a minimum you have to beat several games in a row. Builds from 90 to 95 are the ones the ladder was tuned to send to the final two doors; they
            usually get there. Against LeBron they range from a coin flip at 90 to a solid favorite at{" "}
            {floorAt(GAUNTLET[8])} and up; against Jordan, a 90 is a clear underdog and a 95 only a modest
            favorite. Below about 85, the run usually ends somewhere in rounds 6 to 8.
          </p>
          <p className="callout">
            In Daily, the leaderboard sorts by OVR and then by bosses beaten. Two players on the same OVR are
            separated by these games, so the gauntlet is the tie-breaker even when it isn’t the headline.
          </p>
        </Section>

        <Section id="tags" title="Quick and crafty bosses">
          <p>
            Some bosses carry one or both of two tags. In Classic and Daily they change nothing. In Budget they
            are what four flaws aim at: {flawName("matador")} and {flawName("left-hand-only")} cost you power
            against quick bosses, while {flawName("tunnel-vision")} and {flawName("scouting-report")} cost you
            power against crafty ones.
          </p>
          <p>
            On the Best Player ladder the quick bosses are {joinNames(quickBosses)}; the crafty ones are{" "}
            {joinNames(craftyBosses)}. The tag on the last boss matters most, because the final door is the
            game a contender is most likely to lose. Jordan carries both, so a Best Player build has no safe
            matchup flaw. The positional ladders split differently, as the tables below show.
          </p>
        </Section>

        <Section id="best-player" title="The Best Player ladder">
          <LadderTable rungs={GAUNTLET} difficulty />
          {GAUNTLET.map((r) => (
            <div key={r.id}>
              <h3>
                Round {r.rung}: {r.name}, “{r.title}”
              </h3>
              {SCOUTING[r.id]?.(r)}
            </div>
          ))}
        </Section>

        <Section id="positional" title="The five positional ladders">
          <p>
            A positional run swaps the cast, not the difficulty: round {GAUNTLET_POWERS.length} is as hard on
            the center ladder as it is for Best Player. What changes is who you meet and which tags they carry,
            and in Budget that decides which flaws you can afford. The{" "}
            <Link href="/guides/positional-builds">positional builds guide</Link> covers how each target
            weights your skills.
          </p>
          {LADDERS.map((ladder) => (
            <div key={ladder.position}>
              <h3>{ladder.title}</h3>
              {ladder.intro}
              <LadderTable rungs={POSITION_GAUNTLETS[ladder.position]} />
            </div>
          ))}
        </Section>
      </Article>
      <PublisherAds />
    </>
  );
}
