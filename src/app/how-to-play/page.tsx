import { Article, Section, Skills } from "@/components/PublisherContent";
import { PublisherAds } from "@/components/PublisherAds";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "How to Play 99OVR",
  "A complete guide to six steals, roster choices, re-spins, positional builds, the weakness wheel and the ten-boss verdict.",
  "/how-to-play",
);
export default function HowToPlay() {
  return (
    <>
      <Article
        title="How to play"
        intro="Build one hypothetical player from six different players’ strengths. Your job is to read the roster, steal the right skill and see how far the finished build can go."
      >
        <Section title="1. Choose your run">
          <p>
            Classic is the easiest place to learn. Pick Normal to see the
            roster’s box-stat clues, or Ball Knowledge for names only. Then
            choose Best Player or a position from PG to C. Budget offers the
            same setup with a spending limit. Daily sets the target for you; a
            friend’s challenge inherits their settings.
          </p>
        </Section>
        <Section title="2. Spin, then read the whole roster">
          <p>
            Best Player spins a franchise and a decade. The roster represents
            that franchise’s players from that decade, rather than a single
            season’s starting five. Positional runs instead spin a decade and
            show a pool for your chosen position across franchises.
          </p>
          <p>
            The six rounds always follow the attribute order below. Select one
            player to supply only that round’s skill. The remaining skills still
            need other players. Once used, that player cannot be used again in
            the same run, even if another roster includes them.
          </p>
          <Skills />
        </Section>
        <Section title="3. Spend re-spins deliberately">
          <p>
            On the franchise wheel, you get one team re-spin and one decade
            re-spin for the entire run. A team re-spin keeps the decade; a
            decade re-spin keeps the franchise. On the current positional wheel,
            you get one decade re-spin for the entire run. These are shared
            allowances, not fresh tokens every round.
          </p>
          <p>
            Read the current attribute before abandoning a rough roster. It may
            still have a specialist who solves this round. A strong decision and
            a high absolute rating are different rewards.
          </p>
        </Section>
        <Section title="4. In Budget, leave money for the finish">
          <p>
            Start with $15 in game money. Prices refer to the current skill, not
            the player’s entire career. The game reserves at least $1 for each
            remaining pick. After three steals, the weakness wheel gives you a
            flaw and a refund: Mild +$1, Bad +$2, Brutal +$3 or
            Career-Threatening +$3.
          </p>
          <p>
            The refund funds your last three picks, but the flaw can hurt your
            boss matchups. A larger wallet does not erase that risk. Classic and
            Daily do not have this weakness wheel.
          </p>
        </Section>
        <Section title="5. Read the verdict">
          <p>
            After the sixth steal, the simulation reveals your OVR, tier, six
            pick grades, Best Steal, The Reach and the boss result. Grades
            compare a chosen skill with its roster. OVR combines the six skill
            values, their interactions and your target’s weights. Six excellent
            grades do not guarantee an elite OVR.
          </p>
          <p>
            The gauntlet has ten bosses, with a separate ladder for each
            position. Matchups are first to 11; the first loss ends the run.
            Open the game log to inspect each played round and any weakness
            effects. A seeded simulation makes the same saved build reproducible
            under the same game rules.
          </p>
        </Section>
        <Section title="6. Share it or run it back">
          <p>
            Use the result’s sharing controls to copy a summary or share the
            build link; available sharing options depend on your browser. A
            Classic result can create a Head-to-Head challenge. Run It Back
            starts a fresh build in regular play. After your official Daily is
            saved, practice uses that day’s wheel without replacing the official
            result.
          </p>
          <p>
            For better builds, pair shooting with handles and finishing with
            athleticism. For better grades, judge the skill being asked for
            instead of choosing by scoring average. Keep a versatile player
            available when a narrower specialist can cover the current round.
          </p>
        </Section>
      </Article>
      <PublisherAds />
    </>
  );
}
