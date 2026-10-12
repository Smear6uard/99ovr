import Link from "@/components/SiteLink";
import { DECADE_GUIDES } from "@/content/decades";
import { decadePool, landingsIn } from "@/content/rosters";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Basketball Decade Guides, 1960s–2020s",
  "Seven decades of pro basketball as 99OVR rates it: how each era played, which skills it is rich or thin in, and who is in every positional pool.",
  "/decades",
);

export default function DecadesIndex() {
  return (
    <div className="publisher-content mx-auto max-w-2xl pt-5">
      <p className="eyebrow">
        <Link href="/guides" className="!text-dim !no-underline hover:!text-gold">
          Guides
        </Link>{" "}
        / Decade guides
      </p>
      <h1>Decade guides</h1>
      <p className="intro">
        A jumpshot in 1965 and a jumpshot in 2022 are different skills played under different rules. Every roster in
        99OVR is rated inside its own decade, so knowing how a decade played is half of reading its rosters.
      </p>
      <p>
        Each guide covers how the game looked on the floor, what that era means for each of the six skills, drafting
        advice and the complete positional pool you can be dealt when the decade reel lands there. Positional runs
        can land on any of the seven decades; the Best Player franchise wheel starts in the 1970s.
      </p>
      <div className="card-grid">
        {DECADE_GUIDES.map((guide) => {
          const landings = landingsIn(guide.decade).length;
          return (
            <Link key={guide.slug} href={`/decades/${guide.slug}`}>
              <strong>The {guide.slug}</strong>
              <span>{guide.summary}</span>
              <span className="!text-[12px] !text-dim">
                {decadePool(guide.decade).length} players in the positional pool
                {landings
                  ? ` · ${landings} ${landings === 1 ? "franchise" : "franchises"} on the Best Player wheel`
                  : " · positional runs only"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
