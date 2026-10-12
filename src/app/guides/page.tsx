import Link from "@/components/SiteLink";
import { LIBRARY } from "@/content/library";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Field Guide: Rules, Strategy & Decades",
  "Every 99OVR guide in one place: rules, strategy for Classic and Budget, the boss gauntlet, the weakness wheel and seven decade guides.",
  "/guides",
);

export default function GuidesIndex() {
  return (
    <div className="publisher-content mx-auto max-w-2xl pt-5">
      <p className="eyebrow">Field guide</p>
      <h1>The 99OVR field guide</h1>
      <p className="intro">
        99OVR asks one question six times: which player on this roster is best at this one skill? These guides are
        written to make you better at answering it, whether you are learning the rules, planning a $15 Budget run or
        trying to remember who actually guarded people in 1974.
      </p>
      {LIBRARY.map((shelf) => (
        <section key={shelf.id} id={shelf.id}>
          <h2>{shelf.title}</h2>
          <p>{shelf.blurb}</p>
          <div className="card-grid">
            {shelf.entries.map((entry) => (
              <Link key={entry.href} href={entry.href}>
                <strong>{entry.title}</strong>
                <span>{entry.summary}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
      <section>
        <h2>About these guides</h2>
        <p>
          The guides are written by the team that makes the game and are checked against the game&rsquo;s own rules,
          so the numbers in them match what happens when you play. Player ratings in 99OVR are our editorial
          judgments for this game, not official NBA ratings. If you think we got a player or a rule wrong,{" "}
          <Link href="/contact">tell us</Link>.
        </p>
      </section>
    </div>
  );
}
