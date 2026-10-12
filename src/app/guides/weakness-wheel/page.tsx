import type { ReactNode } from "react";
import Link from "@/components/SiteLink";
import { Article, Section } from "@/components/PublisherContent";
import { PublisherAds } from "@/components/PublisherAds";
import { BUDGET_REFUND_BY_SEVERITY } from "@/config/flawEconomy";
import { FLAWS } from "@/data/flaws";
import { flawHint } from "@/lib/flawHint";
import { pageMetadata } from "@/lib/metadata";
import { GAUNTLET_DOMINANCE_FLOOR, GAUNTLET_DOMINANCE_GAP, GAUNTLET_UPSET_WINDOW } from "@/lib/sim";
import { STEAL_BUDGET, WHEEL_AFTER } from "@/lib/steal";
import { ATTRS, ATTR_LABELS, type Flaw, type FlawSeverity } from "@/lib/types";

export const metadata = pageMetadata(
  "The 99OVR Weakness Wheel: Every Budget Flaw",
  "Every flaw on 99OVR’s Budget-mode weakness wheel: what it does inside the boss gauntlet, what it refunds, and which builds can afford to take it.",
  "/guides/weakness-wheel",
);

const byId = (id: string): Flaw => {
  const flaw = FLAWS.find((f) => f.id === id);
  if (!flaw) throw new Error(`Unknown flaw: ${id}`);
  return flaw;
};
const name = (id: string) => byId(id).name;

const FLOOR_PCT = `${Math.round(GAUNTLET_DOMINANCE_FLOOR * 100)}%`;
const FRONT_HALF = ATTRS.slice(0, WHEEL_AFTER).map((attr) => ATTR_LABELS[attr]);
const BACK_HALF = ATTRS.slice(WHEEL_AFTER).map((attr) => ATTR_LABELS[attr]);
const joinList = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
const SEVERITIES = Object.entries(BUDGET_REFUND_BY_SEVERITY) as [FlawSeverity, number][];

/** Hand-written analysis per flaw, keyed by flaw id. */
const ANALYSIS: Record<string, ReactNode> = {
  bricklayer: (
    <>
      −5 in every game from round 7 on, which on any ladder means the four hardest bosses. Those are exactly
      the games a good build can lose, so this is one of the most expensive flaws on the wheel, and it pays
      only $2. {name("hero-ball")} is the same penalty minus round 7 and pays a dollar more. Take it only if
      your build is nowhere near the late rounds.
    </>
  ),
  "cardio-2004": (
    <>
      A penalty that starts at −1 in round 6 and grows by a point each round, reaching −5 against the final
      boss. It is gentler than {name("bricklayer")} from Duncan through LeBron, identical at the last door,
      and pays $3. Still a heavy bill for a build in the low 90s, whose run is decided in exactly those rounds.
    </>
  ),
  "fourth-quarter-tax": (
    <>
      Cardio’s bigger sibling: −1.5 in round 6, growing by 1.5 a round to −6 against the ninth boss and −7.5
      against the tenth. It is the heaviest late penalty on the wheel. For a build in the low-to-mid 90s it
      turns a realistic clear into a long shot, and $3 rarely buys enough to make up for that.
    </>
  ),
  "hero-ball": (
    <>
      +2 in rounds 1–3, nothing in rounds 4–7, −5 from round 8. The bonus is cosmetic, because those early
      games are already automatic for any build at 77 or better. The penalty is {name("bricklayer")}’s
      without round 7, which makes this the best deal among the late-game flaws: $3 for slightly less damage
      than a $2 flaw.
    </>
  ),
  matador: (
    <>
      −6 against every quick boss. On the Best Player ladder that means Iverson, Kobe and Jordan; on the two
      guard ladders it is six games, both final doors included. Its cost depends almost entirely on your
      ladder’s last boss. The power forward ladder ends with a Tim Duncan who isn’t quick, so there it can be
      one of the cheapest $2 flaws available, as long as your build is comfortably clear of Giannis at nine.
      Nearly everywhere else it is one of the most expensive.
    </>
  ),
  "left-hand-only": (
    <>
      {name("matador")} with −7 instead of −6, for the same $2. Everything said about Matador applies,
      slightly worse. If both land on your wheel, there is no reason to prefer this one.
    </>
  ),
  "tunnel-vision": (
    <>
      −6 against every crafty boss. Best Player has four of them (Rodman, Duncan, LeBron, Jordan); the point
      guard ladder has nine. It hurts most where the final boss is crafty, which is every ladder except
      center. Shaq is quick, so a center build keeps the last door clean, though Hakeem and Kareem at eight
      and nine still take the full penalty.
    </>
  ),
  "scouting-report": (
    <>
      The mildest matchup flaw: −4 against crafty bosses, for $1. It hits the same games as{" "}
      {name("tunnel-vision")}, and on the Best Player ladder that includes Jordan, so a contender gives up a
      real slice of the final door for a single dollar. Center builds, whose final boss isn’t crafty, get the
      better end of this one.
    </>
  ),
  "load-mgmt": (
    <>
      Each round there is a 15% chance you play at −8. Most of those rolls land on games you were going to
      win anyway, and on any game where you are at least {GAUNTLET_DOMINANCE_GAP} clear of the boss the{" "}
      {FLOOR_PCT} floor still holds. For a $3 refund it is one of the best trades on the wheel; a build in
      the mid 90s gives up only a modest slice of its clear chance.
    </>
  ),
  "podcast-legs": (
    <>
      Load Management, louder: a 22% chance each round of playing at −10. It fires in most deep runs, and when
      it lands on a close late game it usually ends things. Because it is a chance rather than a certainty, it
      still costs a contender less than the fixed late penalties. Career-Threatening in name, mid-table in
      practice.
    </>
  ),
  "whistle-magnet": (
    <>
      A 12% chance each round of a −7 game. Across a full run it costs a strong build only a few points of
      clear chance, one of the smallest bills on the wheel. $2 for this is a good trade for nearly
      every build.
    </>
  ),
  "technical-debt": (
    <>
      {name("whistle-magnet")} with the volume up: a 20% chance of −8, paying $3. Roughly twice the damage
      of Whistle Magnet and still well below the fixed late-game flaws. A reasonable $3 for most builds.
    </>
  ),
  "glass-ankles": (
    <>
      Before each game, a 3% chance the run ends on the spot, whatever your OVR. In Budget it is a flat
      chance; nothing in your build changes it. Across all ten games that is about one run in four. The cost
      scales with how far you would otherwise go, so it is cheap for a build that falls in round 7 and
      expensive for one that would clear.
    </>
  ),
  "back-spasms": (
    <>
      {name("glass-ankles")} at 4.5% a game (the card rounds it to 5%), which over a full run ends more than
      one run in three. Injuries
      ignore both the floor and the automatic wins, so this is the worst flaw on the wheel for a 96 or 97
      build: the only kind of damage that being better cannot absorb.
    </>
  ),
  "slow-starter": (
    <>
      −6 in round 1 and round 6. Round 1 stays automatic for any build at 73 or better, and round 6 remains a
      game you win at least {FLOOR_PCT} of the time if you are at 83 or better. For $1 it is the cheapest
      flaw on the wheel for almost every serious build.
    </>
  ),
  "stone-hands": (
    <>
      −3 in every game. It sounds trivial and it is labeled Mild, but it applies to every close game you play,
      final doors included. A 94 on the Best Player ladder loses about half its clear chance to it. That is
      an expensive way to earn $1.
    </>
  ),
};

const GROUPS: { title: string; intro: string; ids: string[] }[] = [
  {
    title: "Late-game flaws",
    intro: "These do little or nothing for most of the run, then tax the games that decide it.",
    ids: ["bricklayer", "cardio-2004", "fourth-quarter-tax", "hero-ball"],
  },
  {
    title: "Matchup flaws",
    intro:
      "These fire only against bosses carrying a tag, so their cost depends on which ladder you are climbing. The gauntlet guide lists every boss’s tags.",
    ids: ["matador", "left-hand-only", "tunnel-vision", "scouting-report"],
  },
  {
    title: "Chance flaws",
    intro:
      "These roll every round. They are the only flaws that announce themselves in the game log even in rounds you win anyway.",
    ids: ["load-mgmt", "podcast-legs", "whistle-magnet", "technical-debt"],
  },
  {
    title: "Injuries",
    intro: "No power penalty at all. Just a roll before each game that can end the run outright.",
    ids: ["glass-ankles", "back-spasms"],
  },
  {
    title: "Flat and early",
    intro: "Two Mild flaws that look alike on the card and play nothing alike.",
    ids: ["slow-starter", "stone-hands"],
  },
];

export default function WeaknessWheelGuide() {
  return (
    <>
      <Article
        title="The weakness wheel"
        eyebrow="Reference"
        intro="Halfway through every Budget run, the game pays you to get worse. Here is what each flaw actually does, what it pays, and which ones a good build can live with."
        related={[
          { href: "/guides/budget-strategy", title: "Budget strategy" },
          { href: "/guides/boss-gauntlet", title: "The boss gauntlet" },
        ]}
      >
        <Section id="how-it-works" title="How the wheel works">
          <p>
            The wheel exists only in Budget; Classic and Daily runs never carry a flaw. It interrupts after
            your third steal, once {joinList(FRONT_HALF)} are locked in. You spin, three flaws land, and you must take one. There is no skip: the button to
            continue only appears once you have chosen.
          </p>
          <p>
            The three options are drawn from the run’s seed when the run begins, so your first three picks
            don’t influence them, and the dial is decoration: where it stops changes nothing. Each card shows
            the flaw’s name, a one-line description, the exact mechanic in game terms and its refund.
          </p>
          <p>
            The refund depends only on severity:{" "}
            {SEVERITIES.map(([severity, refund], i) => (
              <span key={severity}>
                {i > 0 ? (i === SEVERITIES.length - 1 ? " and " : ", ") : null}
                {severity} pays ${refund}
              </span>
            ))}
            . It goes straight into your ${STEAL_BUDGET} wallet and can only be spent on the last three picks:{" "}
            {joinList(BACK_HALF)}. The usual rule still applies, so every
            remaining round keeps at least $1 in reserve. How to spend that money is covered in{" "}
            <Link href="/guides/budget-strategy">Budget strategy</Link>.
          </p>
          <p>
            A flaw never touches your OVR. The number on the card comes from your six skills alone; the flaw
            lives entirely inside the boss gauntlet, where it shifts the gap between you and a boss or ends the
            run outright. That is why a Budget card can say 94 and the log can still say you lost in round 7.
          </p>
          <h3>Two rules decide how much a flaw hurts</h3>
          <p>
            Both come from the <Link href="/guides/boss-gauntlet">gauntlet’s matchup math</Link>. First, a
            penalty can cancel an automatic win: games where you are {GAUNTLET_UPSET_WINDOW} or more clear are
            free without a flaw, and a flaw can drag them back into dice territory. Second, a penalty cannot
            break the floor: if your OVR is at least {GAUNTLET_DOMINANCE_GAP} above a boss, your chance stays at{" "}
            {FLOOR_PCT} or better whatever the flaw says.
          </p>
          <p>
            Call the games where you are less than {GAUNTLET_DOMINANCE_GAP} clear your live games. A power
            penalty hits them in full and is capped everywhere else. For a 94, the only live game is the tenth.
            For an 88, it is the last three. Most of what follows comes down to which of your live games
            a flaw lands on.
          </p>
        </Section>

        <Section id="all-flaws" title="Every flaw at a glance">
          <p>
            The mechanic column is exactly what the in-game card shows. The severity label sets the refund. It
            is not a damage ranking, as the next section shows.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Flaw</th>
                  <th scope="col">Severity</th>
                  <th scope="col">Refund</th>
                  <th scope="col">Mechanic</th>
                </tr>
              </thead>
              <tbody>
                {FLAWS.map((flaw) => (
                  <tr key={flaw.id}>
                    <td>{flaw.name}</td>
                    <td>{flaw.severity}</td>
                    <td>${flaw.refund}</td>
                    <td>{flawHint(flaw)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="flaw-by-flaw" title="Flaw by flaw">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.intro}</p>
              <dl className="skill-list">
                {group.ids.map((id) => {
                  const flaw = byId(id);
                  return (
                    <div key={id}>
                      <dt>
                        {flaw.name} · {flaw.severity}, ${flaw.refund}
                      </dt>
                      <dd>{ANALYSIS[id]}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}
        </Section>

        <Section id="strategy" title="Refund versus risk">
          <p>
            You choose with three skills drafted and three to go, so you won’t know your final OVR, only your
            pace. Judge it honestly from the first three picks and what is left in the wallet, then sort the
            three cards in front of you by what they do to your live games.
          </p>
          <h3>Contender pace: 96 and up</h3>
          <p>
            Every game is protected by the floor, so no power penalty can make a single game worse than{" "}
            {FLOOR_PCT}. The flaws that can still wreck you are the injuries, which ignore the floor entirely.
            Avoid {name("back-spasms")} and {name("glass-ankles")} if you have another option. After those, the
            fixed late penalties cost the most; the chance flaws and {name("slow-starter")} barely register,
            so you can lean toward the $3 cards among them.
          </p>
          <h3>Door-chaser pace: about 88 to 95</h3>
          <p>
            Your live games are the final doors, so the run-enders are the fixed late penalties (
            {name("fourth-quarter-tax")}, {name("bricklayer")}, {name("cardio-2004")} and, a little less,{" "}
            {name("hero-ball")}) and any matchup flaw your ladder’s last boss triggers. {name("stone-hands")}{" "}
            belongs on that list too. The good cards are the chance flaws, {name("slow-starter")} and matchup
            flaws your final boss doesn’t trigger, provided the boss before it doesn’t either.
          </p>
          <h3>Rebuild pace: mid-80s or below</h3>
          <p>
            Round 7 or 8 will probably end the run regardless, and a flaw mostly changes which. Here the
            refund matters more than the risk: an extra $2 or $3 for the back half of the draft can lift the
            number you actually keep. Avoid matchup flaws aimed at the bosses you are about to meet, and
            take the money.
          </p>
          <p className="callout">
            Severity labels describe how a flaw sounds, not what it costs. {name("load-mgmt")} is Brutal and pays
            $3; {name("bricklayer")} is Bad and pays $2, and for most builds it does several times the damage.
            Read the mechanic, find your live games, and only then look at the price.
          </p>
        </Section>
      </Article>
      <PublisherAds />
    </>
  );
}
