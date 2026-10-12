import { Article, Section } from "@/components/PublisherContent";
import Link from "@/components/SiteLink";
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
        related={[
          { href: "/modes", title: "Choose your mode" },
          { href: "/guides/reading-rosters", title: "How to read a roster" },
          { href: "/decades", title: "Decade guides" },
        ]}
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
            The six rounds always come in the same order: Jumpshot, Handles,
            Finishing, Playmaking, Defense, then Athleticism. Select one player
            to supply only that round’s skill. The remaining skills still need
            other players. Once used, that player cannot be used again in the
            same run, even if another roster includes them.{" "}
            <Link href="/guides/skills">The skills guide</Link> explains what
            each one measures, and{" "}
            <Link href="/guides/reading-rosters">reading a roster</Link> covers
            how to spot the right player.
          </p>
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
            remaining pick. After three steals, the weakness wheel deals three
            flaws and you must take one. Its severity sets the refund: Mild +$1,
            Bad +$2, Brutal +$3 or Career-Threatening +$3.
          </p>
          <p>
            The refund funds your last three picks, but the flaw can hurt your
            boss matchups. A larger wallet does not erase that risk. Classic and
            Daily do not have this weakness wheel. See{" "}
            <Link href="/guides/budget-strategy">Budget strategy</Link> and{" "}
            <Link href="/guides/weakness-wheel">every flaw</Link> before your
            first $15 run.
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
            effects; the <Link href="/guides/boss-gauntlet">gauntlet guide</Link>{" "}
            scouts every boss. A seeded simulation makes the same saved build reproducible
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
        <Section title="Settings, sound and accessibility">
          <p>
            There is nothing to install and no account to create. Arcade sounds
            start switched off; the “sounds” switch at the bottom of every page
            turns them on, and the choice is remembered in this browser. On
            phones that support it, spins and landings also give a short
            vibration.
          </p>
          <p>
            If your device asks apps to reduce motion, 99OVR honors it: the
            reels stop without the spin, the landing shake and slam effects are
            skipped and the OVR appears without counting up. Everything is
            playable from a keyboard, since each roster row is a real button
            labeled with the skill, the player and, in Budget, the price, and a
            skip link jumps straight to the page content.
          </p>
          <p>
            Your personal best, Daily result and streak are stored on this
            device only. Clearing site data resets them, and they do not follow
            you to another browser. The{" "}
            <Link href="/privacy">privacy policy</Link> lists exactly what is
            stored.
          </p>
        </Section>
      </Article>
      <PublisherAds />
    </>
  );
}
