import { Article, Section } from "@/components/PublisherContent";
import { PublisherAds } from "@/components/PublisherAds";
import Link from "@/components/SiteLink";
import { VIBE_LABELS, WHEEL_LANDINGS } from "@/content/rosters";
import { DECADE_BUCKETS, DECADE_FRANCHISES } from "@/data/eras/decades";
import { decadeTag } from "@/data/eras/authoring";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Franchise Wheel Directory",
  "Every franchise and decade on 99OVR’s Best Player wheel: the team that earned each slot, its story, its headliners and how deep each all-decade roster runs.",
  "/franchises",
);

/** Hand-written context for each franchise's decades on the wheel. */
const FRANCHISE_NOTES: Record<string, { name: string; note: string }> = {
  bucks: {
    name: "Milwaukee Bucks",
    note: "Two decades fifty years apart, and both end with a banner: Kareem Abdul-Jabbar and Oscar Robertson in 1971, Giannis Antetokounmpo in 2021. Either landing tends to be generous at the rim and on defense.",
  },
  wizards: {
    name: "Washington Wizards",
    note: "The franchise appears twice under two names: the 1970s Bullets of Elvin Hayes and Wes Unseld, who won it all in 1978, and the 2000s Wizards, where a 38-year-old Michael Jordan spent his final seasons.",
  },
  sixers: {
    name: "Philadelphia 76ers",
    note: "Three very different Philadelphias: Moses Malone and Julius Erving’s 1983 champions, Allen Iverson’s 2001 Finals team, and the 2015 roster that was built to lose. The 2010s roster is one of the largest on the wheel because so many players passed through.",
  },
  celtics: {
    name: "Boston Celtics",
    note: "The wheel’s biggest mood swing. The 1980s are Bird, McHale and Parish; the 1990s bottom out with the 15-win 1997 team; the 2000s end with Pierce, Garnett and Allen winning the 2008 title.",
  },
  lakers: {
    name: "Los Angeles Lakers",
    note: "Showtime in the 1980s, then a 2000s decade that holds both the Shaq-and-Kobe three-peat and the lean season after O’Neal was traded. Because decade rosters merge, a 2000s landing can deal from either version.",
  },
  hawks: {
    name: "Atlanta Hawks",
    note: "Dominique Wilkins’ high-flying 1980s teams, and the 2015 group that won 60 games with four All-Stars and no single superstar before Cleveland swept them.",
  },
  pistons: {
    name: "Detroit Pistons",
    note: "Two championship identities built on defense — the Bad Boys of 1989 and the 2004 starting five that beat the Lakers — plus an early-2010s rebuild with far fewer stars.",
  },
  blazers: {
    name: "Portland Trail Blazers",
    note: "Clyde Drexler’s early-1990s Finals teams, then the mid-2000s rebuild after the “Jail Blazers” years. The 90s roster is far stronger, but both reward reading past the headliners.",
  },
  suns: {
    name: "Phoenix Suns",
    note: "Charles Barkley’s 1993 MVP season and Steve Nash’s Seven Seconds or Less offense a decade later — two of the most entertaining teams of their eras, and both deep in athleticism.",
  },
  mavs: {
    name: "Dallas Mavericks",
    note: "The franchise’s floor and ceiling: the 11-71 team of 1993 and Dirk Nowitzki’s 2011 champions. Because rosters span the decade, the 1990s landing also reaches Jason Kidd’s first stint and the late-decade arrival of Dirk Nowitzki and Steve Nash.",
  },
  knicks: {
    name: "New York Knicks",
    note: "Patrick Ewing’s bruising 1990s contenders, and a 2010s decade that contains the franchise’s worst season, 17-65 in 2015.",
  },
  rockets: {
    name: "Houston Rockets",
    note: "Hakeem Olajuwon’s back-to-back titles in 1994 and 1995, and James Harden’s three-point-heavy teams of the late 2010s. Very different offenses, both with an elite headliner.",
  },
  pacers: {
    name: "Indiana Pacers",
    note: "Reggie Miller’s 1990s Pacers, perennial playoff rivals of the Knicks, and a late-2000s team rebuilding after the 2004 brawl in Detroit.",
  },
  magic: {
    name: "Orlando Magic",
    note: "Shaquille O’Neal and Penny Hardaway reached the 1995 Finals; a decade later Tracy McGrady won scoring titles on teams that could not win games.",
  },
  bulls: {
    name: "Chicago Bulls",
    note: "The six-title 1990s dynasty, the rebuild of the early 2000s, and Derrick Rose’s 2011 MVP team. Three decades, three completely different rosters.",
  },
  thunder: {
    name: "Seattle SuperSonics / Oklahoma City Thunder",
    note: "The franchise lands as the 1990s SuperSonics of Gary Payton and Shawn Kemp, and as Oklahoma City’s 2010s teams built around Kevin Durant, Russell Westbrook and, for a while, James Harden.",
  },
  jazz: {
    name: "Utah Jazz",
    note: "Stockton-to-Malone at its late-1990s peak, then the mid-2000s rebuild that followed both of them leaving.",
  },
  raptors: {
    name: "Toronto Raptors",
    note: "A young expansion team in the late 1990s and the 2019 champions led by Kawhi Leonard — one of the steepest climbs on the wheel.",
  },
  spurs: {
    name: "San Antonio Spurs",
    note: "Tim Duncan bookends both decades: the 1999 Twin Towers title with David Robinson and the ball-movement clinic of 2014.",
  },
  clippers: {
    name: "Los Angeles Clippers",
    note: "A 15-win team at the start of the 2000s and the Lob City era of Chris Paul and Blake Griffin in the 2010s.",
  },
  nets: {
    name: "New Jersey / Brooklyn Nets",
    note: "Jason Kidd’s back-to-back Finals trips in the early 2000s, then the 12-70 season that opened the 2010s. The 2010s roster is the largest on the wheel.",
  },
  grizzlies: {
    name: "Memphis Grizzlies",
    note: "The first season in Memphis, with Rookie of the Year Pau Gasol, and the Grit and Grind teams of the 2010s that won with defense and a famously slow offense.",
  },
  nuggets: {
    name: "Denver Nuggets",
    note: "The 17-win 2003 team that landed Carmelo Anthony in the draft, and Nikola Jokić’s 2023 champions. The 2020s roster is one of the smallest on the wheel, so the stars are easy to find.",
  },
  wolves: {
    name: "Minnesota Timberwolves",
    note: "Kevin Garnett’s 2004 MVP season and the franchise’s deepest playoff run of that era, then the Kevin Love years in the following decade.",
  },
  heat: {
    name: "Miami Heat",
    note: "Dwyane Wade’s 2006 title alongside Shaquille O’Neal, then the LeBron James, Wade and Chris Bosh teams that won in 2012 and 2013.",
  },
  warriors: {
    name: "Golden State Warriors",
    note: "The “We Believe” upset of 2007 and the Stephen Curry dynasty that won titles in 2015, 2017 and 2018.",
  },
  cavs: {
    name: "Cleveland Cavaliers",
    note: "Both Cleveland eras sit inside the 2010s — the 2011 team after LeBron James left and the 2016 champions after he returned — so they merge into a single all-decade roster.",
  },
};

export default function Franchises() {
  const franchises = [...DECADE_FRANCHISES].sort((a, b) =>
    (FRANCHISE_NOTES[a.id]?.name ?? a.team).localeCompare(FRANCHISE_NOTES[b.id]?.name ?? b.team),
  );

  return (
    <>
      <Article
        title="Franchise wheel directory"
        intro={`Best Player runs spin two reels: a franchise and a decade. This is every combination the wheel can land on — ${DECADE_BUCKETS.length} all-decade rosters across ${DECADE_FRANCHISES.length} franchises — with the team that earned each slot and what you are walking into.`}
        eyebrow="Reference"
        related={[
          { href: "/decades", title: "Decade guides" },
          { href: "/guides/reading-rosters", title: "How to read a roster" },
          { href: "/how-to-play", title: "How to play" },
        ]}
      >
        <Section id="how-the-wheel-works" title="How a landing becomes a roster">
          <p>
            Each franchise slot on the wheel was earned by one specific team — the 1996 Bulls, the 2004 Pistons —
            but the roster you read is bigger than that team. When the reels stop on a franchise and decade, the game
            deals every player the franchise used in those ten years, with the headline team listed first. That is
            why a 2000s Lakers landing can hand you both a three-peat champion and a role player from a lottery
            season.
          </p>
          <p>
            Some slots were earned by lottery teams on purpose. Those landings are not lost rounds: the full decade
            roster usually hides more than the headline season suggests, and grades compare your pick with the rest
            of that roster, so finding its one real defender earns the same top grade as taking the best defender on
            a champion. Your build&rsquo;s OVR is where the difference shows. The team and decade re-spins exist for exactly this tradeoff; the{" "}
            <Link href="/how-to-play">rules page</Link> covers how many you get.
          </p>
        </Section>

        <Section id="vibes" title="All-time, solid and rough">
          <p>
            When the reels settle, the landing card shows a badge. On the franchise wheel it describes the whole
            decade roster, not the headline season.
          </p>
          <dl className="skill-list">
            <div>
              <dt>{VIBE_LABELS.iconic}</dt>
              <dd>
                The decade&rsquo;s best players are elite at something. Expect several legitimate answers in most
                rounds, and a jackpot sound when the card lands.
              </dd>
            </div>
            <div>
              <dt>{VIBE_LABELS.solid}</dt>
              <dd>
                Good players without an overwhelming peak. There is usually a strong pick for each skill, but it may
                not be the famous one.
              </dd>
            </div>
            <div>
              <dt>{VIBE_LABELS.rough}</dt>
              <dd>
                Reserved for thin rosters. Because every franchise landing deals ten years of players, none of the
                current franchise rosters comes up rough; you will see the badge in positional runs, where it judges
                the twelve players you were dealt on the current skill.
              </dd>
            </div>
          </dl>
          <p>
            When a franchise has two headline seasons in the same decade — the 2001 and 2005 Lakers, say — they
            share one landing and one roster.
          </p>
        </Section>

        <Section id="franchises" title="Every franchise on the wheel">
          {franchises.map((franchise) => {
            const info = FRANCHISE_NOTES[franchise.id];
            const landings = WHEEL_LANDINGS.filter((landing) => landing.franchise === franchise.id);
            return (
              <div key={franchise.id} id={franchise.id}>
                <h3>
                  {info?.name ?? franchise.team}{" "}
                  <span className="text-[12px] font-semibold text-dim">
                    · {landings.map((landing) => decadeTag(landing.decade)).join(", ")}
                  </span>
                </h3>
                {info ? <p>{info.note}</p> : null}
                <ul>
                  {landings.map((landing) => (
                    <li key={landing.id}>
                      <strong>
                        <Link href={`/decades/${landing.decade}s`}>{decadeTag(landing.decade)}</Link> {landing.team}
                      </strong>{" "}
                      <span className="text-dim">
                        ({VIBE_LABELS[landing.vibe].toLowerCase()}, {landing.rosterSize} players)
                      </span>
                      {landing.eras.map((era) => (
                        <span key={era.id} className="block text-[14px]">
                          {era.season}: {era.tag}{" "}
                          <span className="text-dim">
                            Headliners: {era.headliners.slice(0, 4).map((player) => player.name).join(", ")}.
                          </span>
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </Section>
      </Article>
      <PublisherAds />
    </>
  );
}
