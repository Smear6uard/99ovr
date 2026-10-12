import Link from "@/components/SiteLink";
import { Article, Section } from "@/components/PublisherContent";
import { PublisherAds } from "@/components/PublisherAds";
import { STEAL_SYNERGIES } from "@/lib/steal";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "The Six Skills in 99OVR, Explained",
  "What Jumpshot, Handles, Finishing, Playmaking, Defense and Athleticism measure in 99OVR, how each one moves your OVR, and the misread that costs picks.",
  "/guides/skills",
);

/** Names and bonus sizes come from the game so the table never drifts; the thresholds are written out by hand. */
function synergy(id: string) {
  const found = STEAL_SYNERGIES.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown synergy: ${id}`);
  return found;
}

const BONUS_TARGET: Record<string, string> = {
  sc: "shot creation",
  rp: "rim pressure",
  off: "offense",
  def: "defense",
  both: "offense and defense",
};

const SKILL_SYNERGIES: [id: string, needs: string][] = [
  ["shake-bake", "Jumpshot 86+ and Handles 86+"],
  ["gravity-well", "Jumpshot 88+ and Playmaking 84+"],
  ["lob-city", "Finishing 86+ and Athleticism 88+"],
  ["post-office", "Finishing 88+ and Playmaking 76+"],
  ["no-fly-zone", "Defense 88+ and Athleticism 84+"],
  ["killer-instinct", "All six skills at 74+"],
];

const BANDS: [range: string, meaning: string][] = [
  ["99", "The best there has ever been at this one thing"],
  ["95–98", "All-time elite"],
  ["88–94", "Elite"],
  ["80–87", "Very good"],
  ["70–79", "Solid starter"],
  ["60–69", "Average NBA"],
  ["45–59", "A weakness"],
  ["30–44", "A punchline"],
];

export default function SkillsGuide() {
  return (
    <>
      <Article
        title="The six skills, explained"
        eyebrow="Strategy"
        intro="Every 99OVR player carries six hidden ratings, and each round asks about exactly one. Here is what each skill measures, how it moves your OVR, who sets the standard for it in every decade, and the misread that costs the most picks."
        related={[
          { href: "/guides/reading-rosters", title: "How to read a roster" },
          { href: "/guides/positional-builds", title: "Positional builds, PG to C" },
          { href: "/decades", title: "Decade guides" },
        ]}
      >
        <Section id="scale" title="One scale, six unequal skills">
          <p>All six skills share one scale, and it is stingy at the top:</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Rating</th>
                  <th scope="col">What it means</th>
                </tr>
              </thead>
              <tbody>
                {BANDS.map(([range, meaning]) => (
                  <tr key={range}>
                    <td>{range}</td>
                    <td>{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Only a handful of names in the whole game hold a 99. The bottom is just as real: a center who never took a
            jumper is a punchline at Jumpshot, rings or no rings, which is what makes him a trap in round one. These
            are 99OVR’s editorial ratings for this game, not official NBA numbers.
          </p>
          <p>
            The <Link href="/scoring">scoring page</Link> walks through the whole OVR pipeline. The short version: the
            skills are not equal partners. Jumpshot and Handles combine into shot creation, Finishing and Athleticism
            into rim pressure, Defense is scaled by Athleticism, and Playmaking counts twice. Six synergies add a small
            bonus when your stolen ratings clear a bar together:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Synergy</th>
                  <th scope="col">Needs</th>
                  <th scope="col">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {SKILL_SYNERGIES.map(([id, needs]) => {
                  const s = synergy(id);
                  return (
                    <tr key={id}>
                      <td>{s.name}</td>
                      <td>{needs}</td>
                      <td>
                        +{s.amount} {BONUS_TARGET[s.target]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p>
            Synergies read the ratings you stole, not any one player, so your finishing and athleticism can come from
            different decades. The bonuses land before the diminishing-returns curve, so they buy the most in builds
            not already near the ceiling. {synergy("time-machine").name} and {synergy("same-era").name} reward the
            decades you stole from instead.
          </p>
        </Section>

        <Section id="jumpshot" title="Jumpshot">
          <p>
            Touch and range: the pull-up, the catch-and-shoot, the shot a defense has to close out on. The skyhook
            counts as finishing. Elite means a shot defenses planned around; average is a starter who hits open looks;
            a weakness is a big who shot only when ignored. The punchline band is full of famous centers — Shaquille
            O’Neal, Dwight Howard and Rudy Gobert all live there.
          </p>
          <p>
            <strong>In the build.</strong> Jumpshot is the base of shot creation, the largest slice of a Best Player
            offense. Handles decides how much of it survives: about three-quarters behind a punchline handle,
            all of it behind an all-time one. It anchors Shake &amp; Bake and Gravity Well. Shooting guards weight shot
            creation most and centers least; the <Link href="/guides/positional-builds">positional builds guide</Link>{" "}
            covers each target.
          </p>
          <p>
            <strong>Who sets the standard.</strong> Jerry West and Sam Jones stand out in a set-shot 1960s; Rick Barry
            and Pete Maravich carry the 1970s; Larry Bird and Dale Ellis a 1980s league that barely shot threes; Reggie
            Miller the 1990s; Ray Allen and Dirk Nowitzki the 2000s. Then Stephen Curry becomes the measuring stick for
            everyone.
          </p>
          <p>
            <strong>The misread.</strong> Scoring is not shooting. Wilt Chamberlain’s 1960s card reads “50.4 PPG · 25.7
            RPG,” and his jumpshot is still a weakness. Field-goal percentage on a big usually measures dunks: Shaq’s
            1990s card shows “58% FG,” and his 2000s note adds “Free throws excepted.” Trust the note.
          </p>
        </Section>

        <Section id="handles" title="Handles">
          <p>
            Ball control, and getting somewhere a defender doesn’t want you to go — judged honestly for a 1960s with no
            crossover vocabulary. Elite handles come with signature moves that have names; bigs and catch-and-shoot
            specialists fill the weakness band.
          </p>
          <p>
            <strong>In the build.</strong> Handles never counts on its own. It multiplies your Jumpshot inside shot
            creation, which makes it, point for point, the skill that moves OVR least. Its real payoff is Shake &amp;
            Bake, which needs it and Jumpshot both at 86 or better, and it matters more to guard targets than to bigs.
            It is the cheapest round to misjudge for your OVR, though its grade counts as much as any other.
          </p>
          <p>
            <strong>Who sets the standard.</strong> Oscar Robertson tops the 1960s; Pete Maravich and Earl Monroe the
            1970s; Isiah Thomas the 1980s; Tim Hardaway and Allen Iverson the 1990s; Iverson, Jamal Crawford and Chris
            Paul the 2000s; Kyrie Irving and James Harden the 2010s; Irving and Luka Doncic the 2020s. Irving’s 2020s
            note calls him “the finest ball-handler who ever lived.”
          </p>
          <p>
            <strong>The misread.</strong> The scoring champion is not automatically the best handler. George Gervin’s
            1970s card reads “27.2 PPG · scoring title, 1978,” but the Iceman scored on finger rolls and jumpers, and
            Maravich and Monroe handle it far better in the same pool. Assists don’t prove it either: Mark Jackson’s
            1990s note — “Backed you down for 20 seconds, then found the shooter” — describes an elite passer, not a
            dribble artist.
          </p>
        </Section>

        <Section id="finishing" title="Finishing">
          <p>
            Converting near the basket: layups, dunks, post moves, floaters, the skyhook. Elite finishers are the
            players defenses fouled rather than let score; a weakness is the jump-shooting specialist who rarely got to
            the rim.
          </p>
          <p>
            <strong>In the build.</strong> Finishing is the base of rim pressure, and Athleticism decides how much of it
            survives — around 70 percent behind a punchline athlete, all of it behind an all-time one. Lob City pairs
            it with Athleticism; Post Office with Playmaking. Rim pressure weighs most for centers and power forwards
            and least for point guards, the mirror image of shot creation.
          </p>
          <p>
            <strong>Who sets the standard.</strong> Wilt Chamberlain and Elgin Baylor in the 1960s; Kareem
            Abdul-Jabbar and Julius Erving in the 1970s; Kareem, Kevin McHale and Adrian Dantley in the 1980s;
            Shaquille O’Neal across the 1990s and 2000s; then LeBron James and Giannis Antetokounmpo, with Zion
            Williamson joining them in the 2020s.
          </p>
          <p>
            <strong>The misread.</strong> Hops are not finishing. Spud Webb won a dunk contest at 5-foot-7, and his
            finishing is modest at best — the dunk title is an Athleticism clue. Volume shooters mislead the same way:
            Reggie Miller scored from distance, and his finishing is ordinary.
          </p>
        </Section>

        <Section id="playmaking" title="Playmaking">
          <p>
            Vision and passing: creating shots for teammates and running an offense, judged independently of how much a
            player scored. Elite playmakers bend an offense around their reads; a weakness is a finisher or shooter who
            ends possessions rather than starting them.
          </p>
          <p>
            <strong>In the build.</strong> Playmaking counts twice: inside offense, and again directly in the final OVR
            blend. That direct share skips the diminishing-returns curve, so once the rest of a build is strong, a point
            of playmaking buys more OVR than a point of anything else at every target except center, where Defense
            still edges it. It anchors Gravity Well and Post Office, and point guards weight it most.
          </p>
          <p>
            <strong>Who sets the standard.</strong> Oscar Robertson in the 1960s; Nate Archibald and Kevin Porter in the
            1970s; Magic Johnson, the 1980s measuring stick; John Stockton in the 1990s; Steve Nash, Jason Kidd and Chris
            Paul in the 2000s; Paul and Rajon Rondo in the 2010s; Nikola Jokic in the 2020s.
          </p>
          <p>
            <strong>The misread.</strong> Playmaking is not a point-guard monopoly. Jokic is a center, Bill Walton’s
            1970s note says he “passed like a point guard,” and Arvydas Sabonis and Chris Webber rate as real
            playmakers from the frontcourt. The reverse trap is the score-first guard with a decent assist number:
            Allen Iverson’s “31.1 PPG · 5.4 APG · MVP” is a far better answer in the Handles round than in this one.
          </p>
        </Section>

        <Section id="defense" title="Defense">
          <p>
            Stopping people: on the ball, at the rim, in the passing lanes and on the switch. Elite defenders changed
            what opponents tried at all; the bottom bands belong to scorers and stretch bigs whose teams hid them.
          </p>
          <p>
            <strong>In the build.</strong> Defense is the only skill that carries a whole side of the formula alone.
            Offense is split among three ingredients; your defensive score is your one Defense steal, scaled by
            Athleticism (which keeps roughly four-fifths of it behind a punchline athlete). It is over a third of a Best
            Player OVR and half of a center’s, so for an ordinary build at any target but point guard it is the most
            valuable skill of the six. No-Fly Zone, which lands on that whole score, is usually the strongest two-skill
            synergy.
          </p>
          <p>
            <strong>Who sets the standard.</strong> Bill Russell is the measuring stick. Walt Frazier and Bill Walton
            define the 1970s; Sidney Moncrief, Michael Cooper and Mark Eaton the 1980s; Hakeem Olajuwon, Scottie Pippen
            and Dikembe Mutombo the 1990s; Ben Wallace and Bruce Bowen the 2000s; Kawhi Leonard and Tony Allen the
            2010s; Victor Wembanyama, Draymond Green and Alex Caruso the 2020s.
          </p>
          <p>
            <strong>The misread.</strong> Rebounds are not defense. Kevin Love and Enes Kanter in the 2010s pool and Zach
            Randolph in the 2000s pool post big rebounding lines and are liabilities here; Kanter’s note says his
            defense was “a rumor with a forwarding address.” Real stoppers barely register in a box score: Bowen’s line
            is “6.6 PPG · corner three · the toes.”
          </p>
        </Section>

        <Section id="athleticism" title="Athleticism">
          <p>
            Speed, lift, explosion and the motor to use them. Elite athletes are the dunk-contest names and the guards
            who got end to end in a blink; a weakness is the below-the-rim craftsman.
          </p>
          <p>
            <strong>In the build.</strong> Athleticism never counts by itself. It scales Finishing into rim pressure and
            Defense into the defensive score, and it unlocks Lob City and No-Fly Zone. As the last round, it is the one
            steal you make knowing who supplied the rest: a great athlete behind elite finishing and defense multiplies
            both and may tip you into a synergy; behind weak ones, he has little to amplify. Center and power-forward targets lean on it most.
          </p>
          <p>
            <strong>Who sets the standard.</strong> Wilt Chamberlain in the 1960s; Julius Erving and David Thompson in
            the 1970s; Michael Jordan, the measuring stick, in the 1980s; Shawn Kemp in the 1990s; LeBron James and
            Dwight Howard in the 2000s; Giannis, Russell Westbrook and Zach LaVine in the 2010s; Ja Morant and Anthony
            Edwards in the 2020s.
          </p>
          <p>
            <strong>The misread.</strong> Great defenders are not automatically great athletes. Mark Eaton’s 1980s card
            is a Defensive Player of the Year with “5.6 BPG,” and his athleticism is a punchline; Tim Duncan and Jokic
            won with craft, not lift. Age matters too: a late-career card does not keep a player’s prime bounce, so the
            2000s Wizards Jordan is a different athlete from the 1990s Bulls one.
          </p>
        </Section>

        <Section id="calibration" title="How ratings travel across decades">
          <p>
            Every decade uses the same scale, but each pool was written with its era in mind. The 1960s pool keeps the
            set-shot era honest: most jumpshots are modest by design, with West, Sam Jones and Paul Arizin as the
            deliberate exceptions, while its centers carry towering finishing and defense because the sport ran
            through them. The 2020s pool reflects skill inflation — nearly everyone shoots, including most bigs — yet
            the rim-running center without a jumper stays a punchline on purpose.
          </p>
          <p>
            A consistency check sits on top. Renowned specialists — famous leapers, all-time shooters, Defensive Players
            of the Year, historic ball-handlers, elite table-setters — are guaranteed an elite rating at their specialty
            in their prime, whichever pool the card comes from. It is a floor, not a promotion, and it is tied to the
            decade and, on franchise rosters, to specific prime stints. The deep-bench franchise cards, generated from
            historical box scores, get the opposite treatment: caps stop a tiny sample of perfect shooting from passing
            for all-time finishing.
          </p>
        </Section>
      </Article>
      <PublisherAds />
    </>
  );
}
