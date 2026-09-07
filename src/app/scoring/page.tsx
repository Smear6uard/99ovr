import { Article, Section, Skills } from "@/components/PublisherContent";
import { PublisherAds } from "@/components/PublisherAds";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "How 99OVR Ratings & Scoring Work",
  "Understand 99OVR’s editorial skill ratings, roster-relative grades, skill combinations, positional weights and seeded boss simulation.",
  "/scoring",
);
export default function Scoring() {
  return (
    <>
      <Article
        title="Ratings & scoring"
        intro="The grade is the decision. The OVR is the outcome. Those are deliberately different measures."
      >
        <p className="disclosure">
          <strong>
            These are 99OVR’s own fictional/editorial game ratings.
          </strong>{" "}
          They are basketball opinions calibrated for this game, not official
          NBA ratings, a statistical ranking or a scientific measure of a
          player’s ability.
        </p>
        <Section title="Six judgments per player">
          <p>
            Roster entries carry a separate internal value for each of the six
            skills. A steal takes the value for the current attribute only.
            Box-stat clues help identify a player’s role; they do not directly
            calculate the pick’s rating. A player’s reputation as a scorer
            cannot answer every round.
          </p>
          <Skills />
        </Section>
        <Section title="How a pick earns its grade">
          <p>
            The game counts how many players on the landed roster have a
            strictly higher rating in that skill. Tied ratings share a rank. It
            converts that rank into a percentile using the full roster size,
            then assigns a letter grade. The top rating always earns A+; the A+
            band starts at the 95th percentile. A starts at 90%, A− at 80%, and
            lower bands descend through F.
          </p>
          <p>
            For example, taking the best handler on a weak roster earns A+ even
            if the stolen value is only 74. That 74 still feeds into your build.
            Grades use the whole landed roster, including players you have
            already used, rather than recalculating the standard around the
            remaining selectable names.
          </p>
          <p>
            Best Steal and The Reach order your picks by grade points, with the
            skill value breaking ties. They describe the strongest and weakest
            decisions within that run.
          </p>
        </Section>
        <Section title="How six skills become one OVR">
          <ol>
            <li>
              Jumpshot combines with handles to form shot creation. Finishing
              combines with athleticism to form rim pressure.
            </li>
            <li>
              Shot creation, rim pressure and playmaking combine into offense.
              Defense also receives support from athleticism.
            </li>
            <li>
              Qualifying skill combinations and decade combinations add small
              synergy bonuses. Shake & Bake rewards strong shooting and handles;
              Time Machine rewards picks spanning at least four decades.
            </li>
            <li>
              A curve reduces gains at the high end before the final target
              weights combine offense, defense and playmaking.
            </li>
          </ol>
          <p>
            For Best Player, the final mix is 52% offense, 36% defense and 12%
            playmaking, rounded to an integer and limited to 40–97. This is not
            a simple average of the six ratings. The current six-steal game
            cannot produce 99 OVR: the ceiling is explicitly 97, and diminishing
            returns make even that end of the scale difficult. Older shared
            builds may use earlier rules.
          </p>
        </Section>
        <Section title="A position changes what matters">
          <p>
            Point guards emphasize creation and playmaking. Shooting guards lean
            into shot creation. Small forwards favor a balanced two-way build.
            Power forwards and centers put more weight on rim pressure and
            defense. The position also changes the roster pool and boss ladder,
            so a center challenge is a different draft problem, not just a new
            label on the result.
          </p>
        </Section>
        <Section title="OVR is not a guaranteed boss result">
          <p>
            The gauntlet uses your build’s power against each boss, with a
            bounded seeded variance and matchup probabilities. Large power
            advantages are protected; close matchups can go either way. Budget
            flaws can change a matchup or introduce injury risk without lowering
            the displayed OVR. The simulation records scores, events and where
            the run ended.
          </p>
          <p>
            The build code carries the inputs for replay. The same code and game
            rules reproduce the same result; new runs or attempts can change the
            simulation. A higher OVR is useful, but the result log explains what
            actually happened.
          </p>
        </Section>
        <Section title="Two competitions, two tie-breakers">
          <p>
            Daily ranks by OVR, then bosses beaten. Head to Head compares OVR,
            then the total points from your six grades; if both match, the duel
            is a tie. The Daily server derives results from a submitted build
            instead of trusting a score typed by the browser. This is
            validation, not a claim that abuse is impossible.
          </p>
        </Section>
      </Article>
      <PublisherAds />
    </>
  );
}
