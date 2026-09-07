import Link from "@/components/SiteLink";
import { Section } from "@/components/PublisherContent";
export function ModeGuide({ mode }: { mode: "daily" | "classic" | "budget" }) {
  return (
    <aside
      className="publisher-content mt-10 border-t border-line pt-3"
      aria-label={`${mode} guide`}
    >
      {mode === "daily" ? (
        <>
          <Section title="One date, one shared challenge">
            <p>
              The Daily wheel changes at midnight UTC. Everyone receives the
              same seeded starting sequence and target, but different re-spins
              and selections can take you through different rosters. Some days
              ask for Best Player; others assign a position and its decade pool.
            </p>
          </Section>
          <Section title="What counts as official?">
            <p>
              Your first completed Daily is saved in this browser. Completing
              six steals locks that result locally and advances your streak.
              Consecutive UTC days extend the streak; missing a day starts the
              next completed streak at one. Refresh the page after midnight to
              load the new challenge.
            </p>
            <p>
              Practice opens after the official result and uses today’s wheel
              without changing your official record. Local progress does not
              sync across devices. Clearing site storage removes the saved
              result and streak.
            </p>
          </Section>
          <Section title="The daily board">
            <p>
              If the leaderboard is available, you can submit three initials
              with the official build. The server checks the run and calculates
              its result. The board shows the top 50, ordered by OVR and then
              bosses beaten, and can show your rank. Submission is optional; a
              board outage does not stop your local run from counting. It is an
              arcade comparison, not an account-verified competition.
            </p>
          </Section>
        </>
      ) : mode === "classic" ? (
        <>
          <Section title="A roster-reading game with room to experiment">
            <p>
              Classic has no prices and no weakness wheel. Normal displays
              box-stat clues; Ball Knowledge shows names only. Both use the same
              internal skill ratings. Read for the current attribute: a scorer’s
              reputation may not tell you who has the best defense or passing on
              the roster.
            </p>
          </Section>
          <Section title="Choose your basketball problem">
            <p>
              Best Player spins a franchise and decade, with one team re-spin
              and one decade re-spin for the run. A positional target spins that
              position’s decade pool across franchises and gives one decade
              re-spin. Position also changes the scoring weights and ten-boss
              ladder.
            </p>
          </Section>
          <Section title="Learn from the result">
            <p>
              Use six different players, then compare each pick’s grade with its
              raw skill contribution. A+ recognizes a strong roster-relative
              choice; OVR measures the assembled build. Run It Back starts
              fresh. Your personal best is saved in this browser, and a
              completed Classic result can become a Head-to-Head link for a
              friend.
            </p>
          </Section>
        </>
      ) : (
        <>
          <Section title="Six skills, a $15 wallet">
            <p>
              Budget prices the skill you are stealing, not the whole player.
              Each pick costs $1–$5 of game money, and the lowest-rated option
              on each roster costs $1. Picks that would leave less than $1 per
              remaining round are unavailable. There are no real-money purchases
              in this mode.
            </p>
          </Section>
          <Section title="The weakness wheel changes your plan">
            <p>
              After the first three steals, take a flaw. Mild refunds $1; Bad
              refunds $2; Brutal and Career-Threatening refund $3. The money
              arrives for the last three steals. The flaw stays for the
              gauntlet, where its effects can hurt matchups or introduce injury
              risk. A high OVR does not cancel it.
            </p>
          </Section>
          <Section title="Spend on combinations">
            <p>
              Handles support your jumpshot; athleticism supports finishing and
              defense. Consider an upgrade’s effect on the whole build before
              buying the most famous name. Budget also offers Ball Knowledge and
              positional targets. In Best Player you have one team and one
              decade re-spin; positional runs have one decade re-spin.
            </p>
          </Section>
        </>
      )}
      <p>
        <Link href="/how-to-play">Read the full guide</Link> ·{" "}
        <Link href="/scoring">Understand scoring</Link> ·{" "}
        <Link href="/modes">Compare modes</Link>
      </p>
    </aside>
  );
}
