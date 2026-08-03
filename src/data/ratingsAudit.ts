import { ATTRS, type AttrId, type Ratings } from "@/lib/types";

/**
 * Specialist ratings that should never depend on whether a player came from
 * a hand-authored roster, a positional pool, or the generated decade data.
 *
 * The key deliberately includes the decade. A late-career card in a different
 * decade does not inherit a player's prime athleticism or defense.
 */
type RatingAdjustments = Partial<Record<AttrId, number>>;

const PRIME_SKILL_FLOORS = new Map<string, RatingAdjustments>();

function addFloor(decade: number, attr: AttrId, rating: number, people: readonly string[]): void {
  for (const person of people) {
    const key = `${decade}:${person}`;
    const existing = PRIME_SKILL_FLOORS.get(key) ?? {};
    // This audit establishes the requested elite floor; it does not rewrite
    // already-elite cards upward. LaVine is the explicit 96–98 exception.
    const floor = decade === 2010 && person === "zach-lavine" && attr === "athleticism" ? 97 : 93;
    existing[attr] = Math.max(existing[attr] ?? 0, Math.min(rating, floor));
    PRIME_SKILL_FLOORS.set(key, existing);
  }
}

/**
 * A decade is not enough to identify a prime card (Wizards Jordan is the
 * obvious counterexample). Position pools represent the whole decade and are
 * always eligible; concrete team/season pools opt in here.
 */
const PRIME_TEAM_CONTEXTS = new Set<string>();

function allowTeam(context: string, people: readonly string[]): void {
  for (const person of people) PRIME_TEAM_CONTEXTS.add(`${context}:${person}`);
}

// Hand-authored season/team cards.
allowTeam("sixers-01", ["allen-iverson"]);
allowTeam("grizzlies-02", ["jason-williams"]);
allowTeam("bulls-02", ["jamal-crawford", "ron-artest"]);
allowTeam("nuggets-03", ["marcus-camby"]);
allowTeam("magic-04", ["tracy-mcgrady"]);
allowTeam("wolves-04", ["kevin-garnett"]);
allowTeam("lakers-05", ["kobe-bryant"]);
allowTeam("suns-05", ["steve-nash"]);
allowTeam("heat-06", ["jason-williams"]);
allowTeam("warriors-07", ["jason-richardson"]);
allowTeam("celtics-08", ["ray-allen", "rajon-rondo", "tony-allen"]);
allowTeam("celtics-86", ["dennis-johnson", "larry-bird"]);
allowTeam("lakers-87", ["magic-johnson", "michael-cooper"]);
allowTeam("hawks-88", ["spud-webb"]);
allowTeam("pistons-89", ["isiah-thomas"]);
allowTeam("suns-93", ["cedric-ceballos", "kevin-johnson"]);
allowTeam("rockets-95", ["clyde-drexler", "hakeem-olajuwon"]);
allowTeam("pacers-95", ["mark-jackson", "reggie-miller"]);
allowTeam("bulls-96", ["scottie-pippen"]);
allowTeam("jazz-97", ["john-stockton"]);
allowTeam("celtics-97", ["dee-brown"]);
allowTeam("raptors-98", ["dee-brown", "tracy-mcgrady"]);
allowTeam("spurs-99", ["david-robinson", "steve-kerr"]);
allowTeam("bulls-11", ["joakim-noah", "kyle-korver"]);
allowTeam("mavs-11", ["dirk-nowitzki", "peja-stojakovic"]);
allowTeam("thunder-12", ["kevin-durant"]);
allowTeam("heat-13", ["lebron-james", "ray-allen"]);
allowTeam("grizzlies-13", ["marc-gasol", "tony-allen"]);
allowTeam("clippers-14", ["chris-paul", "jamal-crawford"]);
allowTeam("spurs-14", ["kawhi-leonard"]);
allowTeam("cavs-16", ["kyrie-irving", "lebron-james"]);
allowTeam("warriors-17", ["kevin-durant", "klay-thompson", "stephen-curry"]);
allowTeam("rockets-18", ["chris-paul", "gerald-green", "james-harden"]);
allowTeam("raptors-19", ["kawhi-leonard", "marc-gasol"]);
allowTeam("bucks-21", ["giannis-antetokounmpo", "jrue-holiday"]);
allowTeam("nuggets-23", ["aaron-gordon"]);

// Generated all-decade franchise cards, limited to relevant prime stints.
allowTeam("blazers:1990", ["clyde-drexler", "drazen-petrovic", "isaiah-rider", "kenny-anderson", "rod-strickland", "scottie-pippen"]);
allowTeam("blazers:2000", ["andre-miller", "fred-jones", "marcus-camby"]);
allowTeam("bucks:2020", ["damian-lillard", "giannis-antetokounmpo", "jrue-holiday"]);
allowTeam("bulls:1990", ["brent-barry", "dennis-rodman", "michael-jordan", "scottie-pippen", "steve-kerr"]);
allowTeam("bulls:2000", ["ben-wallace", "jamal-crawford"]);
allowTeam("bulls:2010", ["derrick-rose", "joakim-noah", "kyle-korver", "nate-robinson", "rajon-rondo", "zach-lavine"]);
allowTeam("cavs:2010", ["kyle-korver", "kyrie-irving", "lebron-james"]);
allowTeam("celtics:1980", ["dennis-johnson", "larry-bird"]);
allowTeam("celtics:1990", ["dee-brown", "kenny-anderson"]);
allowTeam("celtics:2000", ["kevin-garnett", "nate-robinson", "rajon-rondo", "ray-allen", "tony-allen"]);
allowTeam("clippers:2000", ["andre-miller", "fred-jones", "marcus-camby"]);
allowTeam("clippers:2010", ["blake-griffin", "chris-paul", "jamal-crawford", "jj-redick", "kawhi-leonard"]);
allowTeam("grizzlies:2000", ["jason-williams"]);
allowTeam("grizzlies:2010", ["marc-gasol", "tony-allen"]);
allowTeam("hawks:1980", ["dominique-wilkins", "spud-webb"]);
allowTeam("hawks:2010", ["jamal-crawford", "jeremy-evans", "kyle-korver"]);
allowTeam("heat:2000", ["alonzo-mourning", "jason-williams"]);
allowTeam("heat:2010", ["derrick-jones-jr", "gerald-green", "lebron-james", "ray-allen"]);
allowTeam("jazz:1990", ["john-stockton"]);
allowTeam("jazz:2000", ["kyle-korver"]);
allowTeam("knicks:1990", ["mark-jackson"]);
allowTeam("lakers:1980", ["magic-johnson", "michael-cooper"]);
allowTeam("lakers:2000", ["kobe-bryant"]);
allowTeam("magic:1990", ["mark-price", "steve-kerr"]);
allowTeam("magic:2000", ["dwight-howard", "jj-redick", "steve-francis", "tracy-mcgrady"]);
allowTeam("mavs:1990", ["jason-kidd"]);
allowTeam("mavs:2010", ["dirk-nowitzki", "peja-stojakovic"]);
allowTeam("nets:2000", ["jason-kidd", "vince-carter"]);
allowTeam("nets:2010", ["deron-williams", "gerald-green", "kyrie-irving"]);
allowTeam("nuggets:2000", ["allen-iverson", "andre-miller"]);
allowTeam("nuggets:2020", ["aaron-gordon", "nikola-jokic"]);
allowTeam("pacers:1990", ["mark-jackson", "reggie-miller"]);
allowTeam("pacers:2000", ["fred-jones", "peja-stojakovic"]);
allowTeam("pistons:1980", ["isiah-thomas"]);
allowTeam("pistons:2000", ["ben-wallace"]);
allowTeam("raptors:1990", ["dee-brown", "dell-curry", "tracy-mcgrady", "vince-carter"]);
allowTeam("raptors:2010", ["kawhi-leonard", "marc-gasol", "terrence-ross"]);
allowTeam("rockets:1990", ["clyde-drexler", "hakeem-olajuwon", "scottie-pippen"]);
allowTeam("rockets:2010", ["chris-paul", "gerald-green", "james-harden"]);
allowTeam("sixers:2000", ["allen-iverson", "andre-iguodala", "andre-miller", "dikembe-mutombo", "kyle-korver"]);
allowTeam("sixers:2010", ["andre-iguodala", "jj-redick", "jrue-holiday"]);
allowTeam("spurs:1990", ["dale-ellis", "dennis-rodman", "rod-strickland", "steve-kerr", "tim-duncan"]);
allowTeam("spurs:2010", ["kawhi-leonard"]);
allowTeam("suns:1990", ["cedric-ceballos", "kevin-johnson"]);
allowTeam("suns:2000", ["amare-stoudemire", "jason-richardson", "steve-nash"]);
allowTeam("thunder:1990", ["dale-ellis", "gary-payton", "shawn-kemp"]);
allowTeam("thunder:2010", ["kevin-durant", "russell-westbrook"]);
allowTeam("warriors:2000", ["jamal-crawford", "jason-richardson"]);
allowTeam("warriors:2010", ["andre-iguodala", "draymond-green", "kevin-durant", "klay-thompson", "stephen-curry"]);
allowTeam("wizards:1970", ["earl-monroe", "kevin-porter"]);
allowTeam("wolves:2000", ["kevin-garnett"]);
allowTeam("wolves:2010", ["zach-lavine"]);

// Renowned leapers and dunk-contest winners.
addFloor(1960, "athleticism", 95, ["elgin-baylor", "gus-johnson"]);
addFloor(1960, "athleticism", 99, ["wilt-chamberlain"]);
addFloor(1970, "athleticism", 98, ["julius-erving", "david-thompson"]);
addFloor(1980, "athleticism", 93, ["dee-brown", "larry-nance", "spud-webb"]);
addFloor(1980, "athleticism", 96, ["clyde-drexler", "dominique-wilkins"]);
addFloor(1980, "athleticism", 99, ["michael-jordan"]);
addFloor(1990, "athleticism", 93, ["brent-barry", "cedric-ceballos", "dee-brown"]);
addFloor(1990, "athleticism", 95, ["isaiah-rider", "kobe-bryant", "tracy-mcgrady"]);
addFloor(1990, "athleticism", 96, ["clyde-drexler", "michael-jordan", "vince-carter"]);
addFloor(1990, "athleticism", 97, ["shawn-kemp"]);
addFloor(2000, "athleticism", 93, ["fred-jones", "nate-robinson"]);
addFloor(2000, "athleticism", 94, ["andre-iguodala", "desmond-mason", "kobe-bryant", "steve-francis"]);
addFloor(2000, "athleticism", 95, ["jason-richardson", "tracy-mcgrady"]);
addFloor(2000, "athleticism", 96, ["amare-stoudemire", "lebron-james"]);
addFloor(2000, "athleticism", 97, ["vince-carter"]);
addFloor(2000, "athleticism", 98, ["dwight-howard"]);
addFloor(2010, "athleticism", 93, ["aaron-gordon", "andre-iguodala", "nate-robinson"]);
addFloor(2010, "athleticism", 94, ["blake-griffin", "john-wall", "terrence-ross"]);
addFloor(2010, "athleticism", 95, ["gerald-green", "glenn-robinson-iii", "jeremy-evans"]);
addFloor(2010, "athleticism", 96, ["derrick-jones-jr", "derrick-rose", "lebron-james"]);
addFloor(2010, "athleticism", 97, ["russell-westbrook", "zach-lavine"]);
addFloor(2020, "athleticism", 93, ["anfernee-simons", "derrick-jones-jr", "donovan-mitchell", "obi-toppin"]);
addFloor(2020, "athleticism", 95, ["aaron-gordon", "jalen-green"]);
addFloor(2020, "athleticism", 97, ["anthony-edwards", "ja-morant"]);

// All-time shooting specialists and historically great high-volume shooters.
addFloor(1960, "jumpshot", 94, ["rick-barry"]);
addFloor(1960, "jumpshot", 95, ["jerry-west"]);
addFloor(1970, "jumpshot", 94, ["pete-maravich"]);
addFloor(1970, "jumpshot", 95, ["rick-barry"]);
addFloor(1980, "jumpshot", 93, ["craig-hodges", "mark-price", "steve-kerr"]);
addFloor(1980, "jumpshot", 95, ["dale-ellis"]);
addFloor(1980, "jumpshot", 97, ["larry-bird"]);
addFloor(1990, "jumpshot", 93, ["chris-mullin", "dale-ellis", "mark-price"]);
addFloor(1990, "jumpshot", 94, ["dell-curry"]);
addFloor(1990, "jumpshot", 95, ["drazen-petrovic", "glen-rice", "steve-kerr"]);
addFloor(1990, "jumpshot", 97, ["ray-allen"]);
addFloor(1990, "jumpshot", 98, ["reggie-miller"]);
addFloor(2000, "jumpshot", 94, ["jj-redick"]);
addFloor(2000, "jumpshot", 95, ["michael-redd"]);
addFloor(2000, "jumpshot", 96, ["kyle-korver", "peja-stojakovic"]);
addFloor(2000, "jumpshot", 97, ["dirk-nowitzki", "steve-nash"]);
addFloor(2000, "jumpshot", 98, ["ray-allen"]);
addFloor(2010, "jumpshot", 94, ["peja-stojakovic"]);
addFloor(2010, "jumpshot", 95, ["james-harden", "kyrie-irving", "ray-allen"]);
addFloor(2010, "jumpshot", 96, ["damian-lillard", "dirk-nowitzki", "jj-redick", "kyle-korver"]);
addFloor(2010, "jumpshot", 98, ["kevin-durant", "klay-thompson"]);
addFloor(2010, "jumpshot", 99, ["stephen-curry"]);
addFloor(2020, "jumpshot", 95, ["karl-anthony-towns", "klay-thompson", "kyrie-irving"]);
addFloor(2020, "jumpshot", 96, ["damian-lillard"]);
addFloor(2020, "jumpshot", 98, ["kevin-durant"]);
addFloor(2020, "jumpshot", 99, ["stephen-curry"]);

// DPOYs and famous lockdown defenders in their defensive primes.
addFloor(1960, "defense", 94, ["walt-frazier"]);
addFloor(1960, "defense", 96, ["nate-thurmond", "wilt-chamberlain"]);
addFloor(1960, "defense", 99, ["bill-russell"]);
addFloor(1970, "defense", 94, ["dennis-johnson", "don-buse", "norm-van-lier", "walt-frazier"]);
addFloor(1970, "defense", 96, ["bill-walton", "bobby-jones", "nate-thurmond"]);
addFloor(1980, "defense", 94, ["dennis-johnson", "michael-jordan"]);
addFloor(1980, "defense", 96, ["hakeem-olajuwon", "michael-cooper", "sidney-moncrief"]);
addFloor(1980, "defense", 97, ["mark-eaton"]);
addFloor(1990, "defense", 94, ["michael-jordan", "tim-duncan"]);
addFloor(1990, "defense", 96, ["alonzo-mourning", "david-robinson", "gary-payton"]);
addFloor(1990, "defense", 97, ["dennis-rodman"]);
addFloor(1990, "defense", 98, ["dikembe-mutombo", "hakeem-olajuwon", "scottie-pippen"]);
addFloor(2000, "defense", 93, ["marcus-camby"]);
addFloor(2000, "defense", 94, ["bruce-bowen", "tony-allen"]);
addFloor(2000, "defense", 96, ["alonzo-mourning", "dikembe-mutombo", "dwight-howard", "kevin-garnett", "ron-artest"]);
addFloor(2000, "defense", 98, ["ben-wallace"]);
addFloor(2010, "defense", 94, ["anthony-davis", "joakim-noah", "jrue-holiday", "marc-gasol"]);
addFloor(2010, "defense", 95, ["giannis-antetokounmpo", "marcus-smart"]);
addFloor(2010, "defense", 96, ["draymond-green", "rudy-gobert"]);
addFloor(2010, "defense", 97, ["kawhi-leonard", "tony-allen"]);
addFloor(2020, "defense", 94, ["bam-adebayo", "jrue-holiday", "og-anunoby"]);
addFloor(2020, "defense", 96, ["giannis-antetokounmpo"]);
addFloor(2020, "defense", 95, ["anthony-davis", "evan-mobley", "herb-jones", "jaren-jackson-jr", "marcus-smart"]);
addFloor(2020, "defense", 96, ["draymond-green", "kawhi-leonard", "rudy-gobert", "victor-wembanyama"]);

// Ballhandlers whose handle is itself a defining piece of NBA history.
addFloor(1960, "handles", 94, ["bob-cousy"]);
addFloor(1970, "handles", 96, ["earl-monroe"]);
addFloor(1970, "handles", 98, ["pete-maravich"]);
addFloor(1980, "handles", 93, ["magic-johnson"]);
addFloor(1980, "handles", 96, ["isiah-thomas"]);
addFloor(1990, "handles", 94, ["kenny-anderson"]);
addFloor(1990, "handles", 96, ["rod-strickland"]);
addFloor(1990, "handles", 97, ["tim-hardaway"]);
addFloor(1990, "handles", 99, ["allen-iverson"]);
addFloor(2000, "handles", 94, ["steve-francis"]);
addFloor(2000, "handles", 95, ["jason-williams", "steve-nash"]);
addFloor(2000, "handles", 96, ["chris-paul", "jamal-crawford", "rajon-rondo"]);
addFloor(2000, "handles", 99, ["allen-iverson"]);
addFloor(2010, "handles", 95, ["rajon-rondo"]);
addFloor(2010, "handles", 97, ["chris-paul", "stephen-curry"]);
addFloor(2010, "handles", 98, ["jamal-crawford"]);
addFloor(2010, "handles", 98, ["james-harden"]);
addFloor(2010, "handles", 99, ["kyrie-irving"]);
addFloor(2020, "handles", 95, ["shai-gilgeous-alexander"]);
addFloor(2020, "handles", 96, ["stephen-curry"]);
addFloor(2020, "handles", 97, ["luka-doncic"]);
addFloor(2020, "handles", 99, ["kyrie-irving"]);

// Elite table-setters, judged independently of scoring volume.
addFloor(1960, "playmaking", 96, ["bob-cousy", "guy-rodgers"]);
addFloor(1960, "playmaking", 97, ["oscar-robertson"]);
addFloor(1970, "playmaking", 93, ["pete-maravich"]);
addFloor(1970, "playmaking", 96, ["kevin-porter", "nate-archibald"]);
addFloor(1980, "playmaking", 93, ["kevin-johnson", "mark-jackson"]);
addFloor(1980, "playmaking", 96, ["isiah-thomas", "john-stockton"]);
addFloor(1980, "playmaking", 99, ["magic-johnson"]);
addFloor(1990, "playmaking", 93, ["andre-miller", "kevin-johnson", "mark-jackson"]);
addFloor(1990, "playmaking", 96, ["jason-kidd"]);
addFloor(1990, "playmaking", 99, ["john-stockton"]);
addFloor(2000, "playmaking", 93, ["andre-miller", "deron-williams", "rajon-rondo"]);
addFloor(2000, "playmaking", 96, ["chris-paul", "jason-kidd"]);
addFloor(2000, "playmaking", 98, ["steve-nash"]);
addFloor(2010, "playmaking", 93, ["deron-williams"]);
addFloor(2010, "playmaking", 95, ["james-harden"]);
addFloor(2010, "playmaking", 96, ["russell-westbrook"]);
addFloor(2010, "playmaking", 96, ["rajon-rondo"]);
addFloor(2010, "playmaking", 97, ["chris-paul", "lebron-james"]);
addFloor(2010, "playmaking", 99, ["nikola-jokic"]);
addFloor(2020, "playmaking", 95, ["russell-westbrook"]);
addFloor(2020, "playmaking", 97, ["chris-paul", "lebron-james"]);
addFloor(2020, "playmaking", 98, ["luka-doncic", "trae-young", "tyrese-haliburton"]);
addFloor(2020, "playmaking", 99, ["nikola-jokic"]);

// Preserve an unambiguous best defender on the 2021 Bucks after Jrue reaches
// the shared elite floor.
PRIME_SKILL_FLOORS.get("2020:giannis-antetokounmpo")!.defense = 94;
PRIME_SKILL_FLOORS.get("1990:tracy-mcgrady")!.athleticism = 94;

/**
 * Generated box-score cards occasionally turn a tiny perfect-FG sample into
 * all-time finishing, or blocks into impossible athleticism. These caps are
 * intentionally supplement-only; authored prime cards are not flattened.
 */
const SUPPLEMENT_CAPS = new Map<string, RatingAdjustments>();

function addSupplementCap(decade: number, attr: AttrId, rating: number, people: readonly string[]): void {
  for (const person of people) {
    const key = `${decade}:${person}`;
    const existing = SUPPLEMENT_CAPS.get(key) ?? {};
    existing[attr] = Math.min(existing[attr] ?? 99, rating);
    SUPPLEMENT_CAPS.set(key, existing);
  }
}

addSupplementCap(1990, "finishing", 88, [
  "chad-gallagher", "chucky-brown", "darren-morningstar", "david-vaughn", "felton-spencer",
  "ian-lockhart", "monti-davis",
]);
addSupplementCap(2000, "finishing", 88, [
  "dajuan-wagner", "donnell-harvey", "jelani-mccoy", "john-thomas", "kaniel-dickens",
  "matt-walsh", "randy-holcomb", "reggie-slater", "trey-gilder", "will-perdue",
]);
addSupplementCap(2010, "finishing", 88, [
  "alex-stepheson", "anthony-brown", "arinze-onuaku", "jimmer-fredette", "jordan-sibert",
  "nigel-hayes", "tyrus-thomas", "willie-reed",
]);
addSupplementCap(2010, "athleticism", 88, ["edy-tavares"]);

export type RatingAuditSource = "authored" | "supplement";

export function auditRatings(
  decade: number,
  person: string,
  ratings: Ratings,
  source: RatingAuditSource = "authored",
  context = "position"
): Ratings {
  const next = [...ratings] as number[];
  const eligibleForFloors = context === "position" || PRIME_TEAM_CONTEXTS.has(`${context}:${person}`);
  const floors = eligibleForFloors ? PRIME_SKILL_FLOORS.get(`${decade}:${person}`) : undefined;
  if (floors) {
    for (const [attr, floor] of Object.entries(floors) as Array<[AttrId, number]>) {
      const index = ATTRS.indexOf(attr);
      next[index] = Math.max(next[index], floor);
    }
  }
  if (source === "supplement") {
    const caps = SUPPLEMENT_CAPS.get(`${decade}:${person}`);
    if (caps) {
      for (const [attr, cap] of Object.entries(caps) as Array<[AttrId, number]>) {
        const index = ATTRS.indexOf(attr);
        next[index] = Math.min(next[index], cap);
      }
    }
  }
  return next as unknown as Ratings;
}

export function ratingFloorsFor(decade: number, person: string, context = "position"): Readonly<RatingAdjustments> {
  if (context !== "position" && !PRIME_TEAM_CONTEXTS.has(`${context}:${person}`)) return {};
  return PRIME_SKILL_FLOORS.get(`${decade}:${person}`) ?? {};
}
