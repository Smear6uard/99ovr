import Link from "@/components/SiteLink";
import { Article, Section } from "@/components/PublisherContent";
import { PublisherAds } from "@/components/PublisherAds";
import { BUDGET_REFUND_BY_SEVERITY } from "@/config/flawEconomy";
import { FLAWS } from "@/data/flaws";
import { GAUNTLET, POSITION_GAUNTLETS } from "@/data/gauntlet";
import { STEAL_BUDGET, WHEEL_AFTER, priceForRating } from "@/lib/steal";
import { ROUNDS } from "@/lib/wheel";
import { pageMetadata } from "@/lib/metadata";
import type { FlawSeverity, Price } from "@/lib/types";

export const metadata = pageMetadata(
  "99OVR Budget Strategy: Where Each Dollar Goes",
  "How 99OVR’s Budget mode prices every steal, why defense and playmaking return the most OVR per dollar, and spending plans that survive the flaw wheel.",
  "/guides/budget-strategy",
);

/** Rating band behind each price tag, read straight from the pricing function. */
const BANDS = ([5, 4, 3, 2, 1] as Price[]).map((price) => {
  const ratings = Array.from({ length: 100 }, (_, r) => r).filter((r) => priceForRating(r) === price);
  const lo = ratings[0];
  const hi = ratings[ratings.length - 1];
  const label = price === 5 ? `${lo} and up` : price === 1 ? `${hi} and below` : `${lo}–${hi}`;
  return { price, label };
});

/** Most the first three steals can cost: the wallet minus a dollar for each round after the wheel. */
const FIRST_HALF_CAP = STEAL_BUDGET - (ROUNDS - WHEEL_AFTER);

const SEVERITIES: FlawSeverity[] = ["Mild", "Bad", "Brutal", "Career-Threatening"];
const TOP_REFUND = Math.max(...Object.values(BUDGET_REFUND_BY_SEVERITY));

/** The wheel offers three distinct flaws, drawn uniformly. */
const OFFERED = 3;
const choose = (n: number, k: number) => {
  let out = 1;
  for (let i = 0; i < k; i++) out = (out * (n - i)) / (i + 1);
  return out;
};
const allOffers = choose(FLAWS.length, OFFERED);
const topRefundOdds = Math.round(
  100 * (1 - choose(FLAWS.filter((f) => f.refund < TOP_REFUND).length, OFFERED) / allOffers),
);
const mildOnlyOneIn = Math.round(allOffers / choose(FLAWS.filter((f) => f.refund === 1).length, OFFERED));

const count = (rungs: typeof GAUNTLET, key: "quick" | "crafty") => rungs.filter((r) => r[key]).length;

export default function BudgetStrategy() {
  return (
    <>
      <Article
        title="Budget strategy"
        eyebrow="Strategy"
        intro="Budget mode puts a price on every steal. Here is how those prices are set, what the scoring formula says a dollar is worth in each round, and the spending plans that hold up once the weakness wheel has had its say."
        related={[
          { href: "/guides/weakness-wheel", title: "The weakness wheel" },
          { href: "/guides/skills", title: "The six skills, explained" },
          { href: "/guides/positional-builds", title: "Positional builds, PG to C" },
        ]}
      >
        <Section id="prices" title="How a price is set">
          <p>
            Every Budget roster shows a tag beside each name, and the tag is
            about one thing only: that player’s hidden rating in the skill on
            the clock. A legend is cheap in the round he can’t play and
            expensive in the one he can. The bands never change:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Rating in this round’s skill</th>
                </tr>
              </thead>
              <tbody>
                {BANDS.map((band) => (
                  <tr key={band.price}>
                    <td>${band.price}</td>
                    <td>{band.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            One override sits on top: whoever is worst at the skill on that
            roster is always $1, whatever his rating. Call it the minimum
            contract. Ties at the bottom all get it. Every board therefore has
            a $1 option, and on a strong roster the minimum contract can be a
            genuinely useful player who just happens to be last in line.
          </p>
          <p>
            The board is sorted from the most expensive tag down, which means
            the price leaks the band before you commit. That changes the
            reading job. You are not guessing whether a guard can shoot;
            you are deciding which of the $4 shooters sits at the top of the
            band, or which of the $1 names is a near-miss rather than a
            liability. In Ball Knowledge, the tag is the only number on
            the board.
          </p>
          <h3>Franchise boards and positional boards price differently</h3>
          <p>
            Best Player runs land on all-decade franchise rosters: dozens of
            names, many of them depth players. On those boards roughly nine
            players in ten are on $1 for playmaking or defense, true stars are
            scarce (fewer than half of franchise landings have a $5 playmaker
            or a $5 defender), and the best player in the $1 pile is usually
            rated just under the $2 line. Finding him is the cheapest edge in
            the mode, and it is exactly the skill{" "}
            <Link href="/guides/reading-rosters">reading a roster</Link> trains.
          </p>
          <p>
            Positional runs deal twelve players from a hand-picked pool, so the
            prices bunch upward. In a dozen point guards, about three in four
            cost $3 or more at playmaking, and the minimum contract often marks
            down a perfectly solid passer simply because somebody has to be
            the worst of twelve. Your money goes less far, but the floor is
            higher. The{" "}
            <Link href="/guides/positional-builds">positional builds guide</Link>{" "}
            covers which pools are deep in what.
          </p>
        </Section>

        <Section id="wallet" title="The wallet, the reserve and the refund">
          <p>
            You start with ${STEAL_BUDGET}. A steal is legal only if it leaves
            at least $1 for every round still to come; anything that would
            break that rule is greyed out as unaffordable. In practice the
            reserve caps your first three steals (jumpshot, handles and
            finishing) at ${FIRST_HALF_CAP} combined, because three rounds
            remain and the refund has not arrived yet.
          </p>
          <p>
            After the third steal the weakness wheel offers three flaws and you
            must take one. The refund depends on severity:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Flaws in the pool</th>
                  <th>Refund</th>
                </tr>
              </thead>
              <tbody>
                {SEVERITIES.map((severity) => (
                  <tr key={severity}>
                    <td>{severity}</td>
                    <td>{FLAWS.filter((f) => f.severity === severity).length}</td>
                    <td>+${BUDGET_REFUND_BY_SEVERITY[severity]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            The money arrives immediately and is spendable only on the last
            three picks: playmaking, defense and athleticism. Your whole run
            therefore has $16 to $18 to spend. You can’t see the offer
            until the wheel stops, but the odds are friendly: with the current
            flaw list, about {topRefundOdds}% of runs offer at least one
            ${TOP_REFUND} flaw, and an offer where nothing pays more than $1
            turns up roughly once in {mildOnlyOneIn} runs. Plan for $17 or $18
            and make sure the plan still works on $16.
          </p>
          <p>
            Unspent dollars are printed on the result card as left over and do
            nothing else, so the athleticism round should take whatever remains.
          </p>
        </Section>

        <Section id="math" title="Where a dollar buys the most OVR">
          <p>
            The full pipeline lives on the <Link href="/scoring">scoring page</Link>.
            The short version: handles scale jumpshot into shot creation,
            athleticism scales both finishing (into rim pressure) and defense,
            and a
            Best Player build is 52% offense, 36% defense and 12% playmaking
            after a diminishing-returns curve. Working that formula through,
            this is roughly what one extra rating point adds to the final OVR:
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Build averaging the low 70s</th>
                  <th>Build averaging 80</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Defense</td><td>0.41</td><td>0.21</td></tr>
                <tr><td>Playmaking</td><td>0.30</td><td>0.22</td></tr>
                <tr><td>Jumpshot</td><td>0.24</td><td>0.13</td></tr>
                <tr><td>Finishing</td><td>0.17</td><td>0.10</td></tr>
                <tr><td>Athleticism</td><td>0.16</td><td>0.10</td></tr>
                <tr><td>Handles</td><td>0.08</td><td>0.05</td></tr>
              </tbody>
            </table>
          </div>
          <h3>Why the order looks like that</h3>
          <p>
            <strong>Handles</strong> is a multiplier on jumpshot rather than a
            skill of its own in the formula. Shot creation is 60% jumpshot plus
            up to 40% more depending on handles, so when the two ratings are
            similar a point of handles is worth about a third of a point of
            jumpshot. It is the safest round in the game to go cheap.
          </p>
          <p>
            <strong>Finishing</strong> works the same way with athleticism, but
            rim pressure carries 30% of the offense to shot creation’s 42%, so
            finishing trails jumpshot. <strong>Athleticism</strong> multiplies
            twice, once on finishing and once on defense. That sounds like
            double duty; in practice it works out to about finishing’s value.
          </p>
          <p>
            <strong>Defense</strong> carries 36% of the OVR on its own, lightly
            boosted by athleticism. Nothing else shares that slice, so each
            point lands at close to full weight. <strong>Playmaking</strong> is
            counted twice: 28% of the offense, plus 12% of the final number
            directly. That direct share never passes through the curve, which
            is why playmaking keeps its value as a build improves. In a build
            averaging 88, a point of playmaking is worth about three times a
            point of jumpshot.
          </p>
          <h3>The curve punishes holes more than it rewards stars</h3>
          <p>
            Offense and defense go through the curve separately, and the curve
            is steep at the bottom and flat at the top. Whichever side of your
            build is weaker is where points count. Take a sharp scorer who
            can’t guard anyone: in that build, a point of defense is worth six
            to eight times a point of jumpshot.
          </p>
          <p>
            In dollar terms, assuming each price buys a rating from the middle
            of its band: from a build that paid $3 in every round, dropping
            defense to $1 costs about seven OVR (closer to ten if the $1 is a
            real liability), dropping playmaking about five, and dropping
            handles about one. Pushing any single skill from $3 to $5 usually
            adds one or two, and three at most. Cuts hurt more than splurges
            help.
          </p>
          <p>
            Synergies don’t change that math much. Each one adds a point or two
            to a sub-score before the curve, and crossing a single threshold
            usually moves the final OVR by one point or not at all. Never pay an
            extra dollar just to qualify for one.
          </p>
          <p className="callout">
            The refund lands right before playmaking and defense, the two
            rounds where a dollar does the most work. Spend light early and
            heavy late.
          </p>
        </Section>

        <Section id="plans" title="Spending plans that obey the rules">
          <p>
            The lines below assume each price buys a mid-band rating, and they
            use no synergies. Your real OVR will drift a point or two either
            way depending on where in each band you land. Every line is legal
            under the reserve rule.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>JS / HND / FIN</th>
                  <th>Refund</th>
                  <th>PLY / DEF / ATH</th>
                  <th>Spent</th>
                  <th>OVR, roughly</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Back-half</td><td>$3 / $1 / $2</td><td>+$3</td><td>$5 / $4 / $3</td><td>$18</td><td>90</td></tr>
                <tr><td>Stars and scrubs</td><td>$5 / $1 / $1</td><td>+$3</td><td>$5 / $5 / $1</td><td>$18</td><td>90</td></tr>
                <tr><td>Balanced</td><td>$3 / $3 / $3</td><td>+$3</td><td>$3 / $3 / $3</td><td>$18</td><td>88</td></tr>
                <tr><td>Famous scorer</td><td>$5 / $5 / $2</td><td>+$3</td><td>$2 / $2 / $2</td><td>$18</td><td>83</td></tr>
              </tbody>
            </table>
          </div>
          <h3>Back-half: the default</h3>
          <p>
            Pay for a decent jumpshot, take the cheapest acceptable handler,
            spend a little on finishing and arrive at the wheel with $9 still
            in hand. Take a $3 flaw you can live with and you have $12 for the
            three rounds that matter most. If the best offer only pays $2, drop
            athleticism to $2 and you lose about a point; with a $1 refund,
            defense slips to $3 as well and the build lands around 88. It
            degrades gently, which is the whole appeal.
          </p>
          <h3>Stars and scrubs</h3>
          <p>
            Same ceiling, more fragile. It needs a $5 shooter, a $5 passer and
            a $5 defender to appear on three specific boards, and on franchise
            rosters they often don’t. It also leans on the refund. With only $1
            back, after a $5 playmaker the reserve rule caps your defender at
            $3, because athleticism still needs its dollar.
          </p>
          <h3>Balanced</h3>
          <p>
            Paying $3 everywhere is easy to execute and only possible with a
            full $3 refund. It finishes a couple of points behind the back-half
            plan because it pays full price for handles, the round that returns
            the least, and under-pays for defense, the round that returns the
            most. With a $1 refund the nearest balanced line ($3, $2, $3, then
            $3, $3, $2) sits around 87.
          </p>
          <h3>The famous-scorer opening</h3>
          <p>
            The cautionary row. Spending the legal first-half maximum of
            ${FIRST_HALF_CAP} on a great jumpshot and great handles feels like
            building a superstar, but it leaves $3 plus the refund for
            playmaking, defense and athleticism. Even with $3 back that is $2
            apiece, and the build finishes about seven points behind the
            back-half plan for the same $18. With a $1 refund it collapses to
            $1 in all three late rounds and lands in the mid-70s.
          </p>
        </Section>

        <Section id="refund" title="Choosing the flaw as a shopper">
          <p>
            Because the refund can only be spent on the last three rounds, it
            isn’t just more money. It is permission to buy one tier higher in
            playmaking or defense. Even so, it is worth less than it looks:
            on the same mid-band assumption, across every legal combination
            of prices, the best possible Best Player build improves by only one or two OVR going from a $1 refund
            to a $3 one.
          </p>
          <p>
            Flaws, meanwhile, never touch your OVR. They act in the gauntlet as
            matchup penalties: some apply every round, some only late, some
            only against quick or crafty bosses, and a few carry a chance of
            ending the run outright. Most penalties are worth three to ten
            points against the boss they hit, and the run ends at the first
            loss. A flaw that bites the wrong boss costs more than the extra
            dollar or two ever bought.
          </p>
          <p>
            So pick the flaw for the ladder you face, then treat the refund as
            a tiebreaker. Ladders differ. The Best Player ladder has{" "}
            {count(GAUNTLET, "quick")} quick bosses and{" "}
            {count(GAUNTLET, "crafty")} crafty ones; the point-guard ladder has{" "}
            {count(POSITION_GAUNTLETS.PG, "crafty")} crafty bosses out of{" "}
            {POSITION_GAUNTLETS.PG.length}, which turns a flaw aimed at crafty
            opponents into a near-permanent tax. The{" "}
            <Link href="/guides/weakness-wheel">weakness wheel guide</Link>{" "}
            covers each flaw, and the{" "}
            <Link href="/guides/boss-gauntlet">boss gauntlet guide</Link> covers
            which bosses are quick or crafty.
          </p>
        </Section>

        <Section id="pitfalls" title="Common ways to waste a wallet">
          <dl className="skill-list">
            <div>
              <dt>Spending the reserve early</dt>
              <dd>
                The first-half cap exists, but reaching it is almost always a
                mistake. The three rounds after the wheel return the most per
                dollar, and they are the rounds a front-loaded build can no
                longer afford.
              </dd>
            </div>
            <div>
              <dt>Paying for the name</dt>
              <dd>
                The tag tracks the skill, so the trap isn’t an overpriced
                legend; it’s a legend bought in the wrong round. Three extra
                dollars on handles buy no more OVR than one extra dollar on
                defense. Near the top it gets thinner still: in a build already
                full of $4 picks, one more dollar in any single round buys a
                point of OVR at most, and often nothing after rounding.
              </dd>
            </div>
            <div>
              <dt>Ignoring what the flaw does</dt>
              <dd>
                A bigger refund paired with a flaw that fires against the late
                bosses is a bad trade: builds near 90 are already in close
                matchups at the last doors, which is exactly where a penalty
                decides the run.
              </dd>
            </div>
            <div>
              <dt>Shopping for grades</dt>
              <dd>
                Letter grades are roster-relative and don’t enter the OVR. On
                a huge franchise roster the best $1 player can even grade well;
                in a positional dozen a cheap pick usually grades badly. Either
                way, the grade is not what you are buying.
              </dd>
            </div>
          </dl>
        </Section>
      </Article>
      <PublisherAds />
    </>
  );
}
