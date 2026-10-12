import { DECADE_GUIDES } from "@/content/decades";

export type LibraryEntry = {
  href: string;
  title: string;
  summary: string;
  /** Long-form pages with enough original writing to carry the publisher integration. */
  substantive: boolean;
};

export type LibraryShelf = { id: string; title: string; blurb: string; entries: LibraryEntry[] };

export const START_HERE: LibraryEntry[] = [
  {
    href: "/how-to-play",
    title: "How to play",
    summary: "The full first-run walkthrough: setup, spins, re-spins, steals, the verdict and sharing.",
    substantive: true,
  },
  {
    href: "/modes",
    title: "Choose your mode",
    summary: "Daily, Classic, Budget and Head to Head side by side, with who each one is for.",
    substantive: false,
  },
  {
    href: "/scoring",
    title: "Ratings & scoring",
    summary: "Why a pick's grade and a build's OVR measure different things, and how six skills become one number.",
    substantive: true,
  },
];

export const STRATEGY: LibraryEntry[] = [
  {
    href: "/guides/skills",
    title: "The six skills, explained",
    summary: "What Jumpshot, Handles, Finishing, Playmaking, Defense and Athleticism each measure, and how they feed each other.",
    substantive: true,
  },
  {
    href: "/guides/reading-rosters",
    title: "How to read a roster",
    summary: "Turning a box-score line, a role and a decade into a good guess about one hidden skill.",
    substantive: true,
  },
  {
    href: "/guides/budget-strategy",
    title: "Budget strategy",
    summary: "Spending $15 across six skills, when to pay for a star and how the weakness-wheel refund changes the back half.",
    substantive: true,
  },
  {
    href: "/guides/positional-builds",
    title: "Positional builds, PG to C",
    summary: "How each position re-weights the build, which skills to chase first and how the decade pools differ.",
    substantive: true,
  },
];

export const REFERENCE: LibraryEntry[] = [
  {
    href: "/guides/boss-gauntlet",
    title: "The boss gauntlet",
    summary: "Scouting reports on the ten legends between your build and a perfect run, plus every positional ladder.",
    substantive: true,
  },
  {
    href: "/guides/weakness-wheel",
    title: "The weakness wheel",
    summary: "Every Budget-mode flaw: what it does in the gauntlet, what it refunds and which builds can survive it.",
    substantive: true,
  },
  {
    href: "/franchises",
    title: "Franchise wheel directory",
    summary: "Every franchise and decade on the Best Player wheel, with the story behind each roster.",
    substantive: true,
  },
];

export const DECADES: LibraryEntry[] = DECADE_GUIDES.map((guide) => ({
  href: `/decades/${guide.slug}`,
  title: `The ${guide.slug}`,
  summary: guide.summary,
  substantive: true,
}));

export const LIBRARY: LibraryShelf[] = [
  {
    id: "start",
    title: "Start here",
    blurb: "New to 99OVR? These three pages cover the rules, the modes and the numbers on your result card.",
    entries: START_HERE,
  },
  {
    id: "strategy",
    title: "Strategy",
    blurb: "Get better at the actual decision: which player answers the skill in front of you.",
    entries: STRATEGY,
  },
  {
    id: "reference",
    title: "Reference",
    blurb: "The bosses, the flaws and the franchise wheel, documented in one place.",
    entries: REFERENCE,
  },
  {
    id: "decades",
    title: "Decade guides",
    blurb: "Seven decades of basketball, how each one played and what that means when its roster lands on your wheel.",
    entries: DECADES,
  },
];

/** Hubs list other pages; they stay out of ad loading because they are navigation screens. */
export const HUBS = ["/guides", "/decades"] as const;

export const LIBRARY_PATHS: string[] = [
  ...HUBS,
  ...LIBRARY.flatMap((shelf) => shelf.entries.map((entry) => entry.href)),
];

/** Every permanent, indexable page: game screens, the library, and the studio pages. */
export const PUBLIC_PATHS: string[] = [
  ...new Set([
    "",
    "/daily",
    "/play",
    "/budget",
    "/h2h",
    ...LIBRARY_PATHS,
    "/about",
    "/privacy",
    "/terms",
    "/contact",
  ]),
];

/** Pages that mount the publisher integration: the home page, About and every long-form guide. */
export const AD_PATHS: string[] = [
  "/",
  "/about",
  ...LIBRARY.flatMap((shelf) => shelf.entries.filter((entry) => entry.substantive).map((entry) => entry.href)),
];
