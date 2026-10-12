import { notFound } from "next/navigation";
import { Article, Section } from "@/components/PublisherContent";
import { PublisherAds } from "@/components/PublisherAds";
import Link from "@/components/SiteLink";
import { DECADE_GUIDES, decadeGuide } from "@/content/decades";
import { decadePool, landingsIn, VIBE_LABELS, type PoolEntry } from "@/content/rosters";
import { pageMetadata } from "@/lib/metadata";
import { POSITIONS, type Position } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return DECADE_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props) {
  const guide = decadeGuide((await params).slug);
  if (!guide) return {};
  return pageMetadata(guide.metaTitle, guide.description, `/decades/${guide.slug}`);
}

const POSITION_HEADINGS: Record<Position, string> = {
  PG: "Point guards",
  SG: "Shooting guards",
  SF: "Small forwards",
  PF: "Power forwards",
  C: "Centers",
};

function PoolList({ players }: { players: PoolEntry[] }) {
  return (
    <dl className="roster">
      {players.map((player) => (
        <div key={player.name}>
          <dt>
            {player.name}
            <small>{player.positions.join(" / ")}</small>
          </dt>
          <dd>
            <span className="stat">{player.line}</span>
            {player.note}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function DecadePage({ params }: Props) {
  const guide = decadeGuide((await params).slug);
  if (!guide) notFound();

  const index = DECADE_GUIDES.indexOf(guide);
  const previous = DECADE_GUIDES[index - 1];
  const next = DECADE_GUIDES[index + 1];
  const pool = decadePool(guide.decade);
  const landings = landingsIn(guide.decade);
  const byPrimary = POSITIONS.map((position) => ({
    position,
    players: pool.filter((player) => player.positions[0] === position),
  }));

  return (
    <>
      <Article
        title={guide.title}
        intro={guide.intro}
        eyebrow="Decade guides"
        related={[
          ...(previous ? [{ href: `/decades/${previous.slug}`, title: `← The ${previous.slug}` }] : []),
          ...(next ? [{ href: `/decades/${next.slug}`, title: `The ${next.slug} →` }] : []),
          { href: "/guides/reading-rosters", title: "How to read a roster" },
        ]}
      >
        {guide.sections.map((section) => (
          <Section key={section.id} id={section.id} title={section.title}>
            {section.body}
          </Section>
        ))}

        <Section id="drafting" title={`Drafting from the ${guide.slug}`}>
          {guide.draftTips.map((tip) => (
            <div key={tip.title}>
              <h3>{tip.title}</h3>
              {tip.body}
            </div>
          ))}
        </Section>

        {guide.watchFor.length ? (
          <Section id="players-to-know" title="Players worth knowing">
            <dl className="skill-list">
              {guide.watchFor.map((player) => (
                <div key={player.name}>
                  <dt>{player.name}</dt>
                  <dd>{player.why}</dd>
                </div>
              ))}
            </dl>
          </Section>
        ) : null}

        <Section id="franchise-wheel" title="On the Best Player wheel">
          {landings.length ? (
            <>
              <p>
                When the franchise reel lands on one of these teams in the {guide.slug}, the roster you read is the
                whole franchise across the decade, not a single season. The team that earned the slot is listed first;
                the rest of the roster is everyone else who played for the franchise in those ten years.
              </p>
              {landings.map((landing) => (
                <div key={landing.id}>
                  <h3>
                    {guide.slug} {landing.team}{" "}
                    <span className="text-[12px] font-semibold text-dim">
                      · {VIBE_LABELS[landing.vibe]} · {landing.rosterSize} players
                    </span>
                  </h3>
                  {landing.eras.map((era) => (
                    <p key={era.id}>
                      <strong>
                        {era.season} {era.team}:
                      </strong>{" "}
                      {era.tag}{" "}
                      <span className="text-[14px] text-dim">
                        Headliners: {era.headliners.slice(0, 5).map((player) => player.name).join(", ")}.
                      </span>
                    </p>
                  ))}
                </div>
              ))}
              <p>
                <Link href="/franchises">See every franchise on the wheel →</Link>
              </p>
            </>
          ) : (
            <p>
              The Best Player wheel starts in the 1970s, so the {guide.slug} appear only in positional runs. Choose a
              position in Classic or Budget and the decade reel can land here.
            </p>
          )}
        </Section>

        <Section id="positional-pool" title={`The ${guide.slug} positional pool`}>
          <p>
            Positional runs deal twelve players at random from the chosen position&rsquo;s pool when the decade reel
            lands on the {guide.slug}. These are all {pool.length} players who can appear, with the box-score clue
            from their roster card and the note shown beside it on wider screens. Players listed at two positions can be dealt in either pool. Skill
            ratings stay hidden until your verdict.
          </p>
          {byPrimary.map(({ position, players }) =>
            players.length ? (
              <div key={position}>
                <h3>{POSITION_HEADINGS[position]}</h3>
                <PoolList players={players} />
              </div>
            ) : null,
          )}
        </Section>
      </Article>
      <PublisherAds />
    </>
  );
}
