import type { Grade } from "@/lib/types";

/** Best → worst. Index doubles as the score used for BEST STEAL / THE REACH. */
export const GRADES: Grade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"];

/** Shared percentile floors. Copy that names a grade threshold imports this module too. */
export const GRADE_PERCENTILE_BANDS: ReadonlyArray<readonly [number, Grade]> = [
  [0.95, "A+"],
  [0.9, "A"],
  [0.8, "A-"],
  [0.7, "B+"],
  [0.6, "B"],
  [0.5, "B-"],
  [0.4, "C+"],
  [0.3, "C"],
  [0.2, "C-"],
  [0.12, "D+"],
  [0.05, "D"],
];

/**
 * Grade measures the decision, not the number. Rank 0 on a bad roster is still
 * an A+ — you read the room perfectly; the OVR is what eats the low rating.
 */
export function gradeFor(rank: number, rosterSize: number): Grade {
  if (rosterSize <= 1) return "A+";
  const pct = 1 - rank / (rosterSize - 1);
  for (const [floor, grade] of GRADE_PERCENTILE_BANDS) if (pct >= floor) return grade;
  return "F";
}

/** 0 (F) → 11 (A+). Higher is better. */
export function gradeScore(grade: Grade): number {
  return GRADES.length - 1 - GRADES.indexOf(grade);
}

export const NO_WEAK_LINKS_MIN_GRADE: Grade = "A-";

export function gradeAtLeast(grade: Grade, floor: Grade): boolean {
  return gradeScore(grade) >= gradeScore(floor);
}

export const GRADE_HEX: Record<Grade, string> = {
  "A+": "#3fb68b", A: "#3fb68b", "A-": "#4dbf90",
  "B+": "#a7c957", B: "#f2b94b", "B-": "#f2b94b",
  "C+": "#e8a33d", C: "#e08b34", "C-": "#dd7b34",
  "D+": "#e5484d", D: "#e5484d", F: "#c2262b",
};

/** Share-block square. 🟢 A-range · 🟡 B/C · 🔴 D/F. */
export function gradeEmoji(grade: Grade): string {
  const letter = grade[0];
  if (letter === "A") return "🟢";
  if (letter === "B" || letter === "C") return "🟡";
  return "🔴";
}

/* ------------------------------------------------------------------ */
/* Verdict lines                                                       */
/* ------------------------------------------------------------------ */

/**
 * `{p}` your pick · `{b}` the roster's best · `{a}` attribute, lowercase ·
 * `{t}` the team-era label.
 */
const VERDICTS: Record<string, string[]> = {
  perfect: [
    "Nobody on that roster had better {a}. Nobody.",
    "You found the {a} nobody talks about. Textbook.",
    "Best {a} in that locker room. You knew.",
    "That is the correct answer and it wasn't obvious.",
    "The whole roster, and you took the right one.",
    "Deep cut. Right cut.",
  ],
  elite: [
    "One name off the best. Still a steal.",
    "You were reading the roster, not the box score.",
    "{b} was the answer. {p} was close enough to brag.",
    "Barely missed the top. Nobody will notice.",
    "Sharp. {b} would have been sharper.",
  ],
  good: [
    "Solid. {b} was sitting right there, though.",
    "Fine pick. Not the pick.",
    "You took the reputation over the {a}. It mostly worked.",
    "Respectable. {b} is going to haunt this one.",
    "Good enough to survive the tape review.",
  ],
  mid: [
    "You looked at the points, didn't you.",
    "Middle of the roster. Middle of the road.",
    "{b} had the {a}. You had a hunch.",
    "That's a guess wearing a suit.",
    "Not wrong. Not right. Just there.",
  ],
  bad: [
    "The box score lied and you believed it.",
    "{b} was the {a} on that team. This was not close.",
    "You stole the name. The skill stayed home.",
    "That roster had answers. You picked a rumor.",
    "Big stats, wrong skill. The oldest trap there is.",
  ],
  awful: [
    "{p} for {a}. On that roster. Genuinely.",
    "{b} is on the same team and you did this anyway.",
    "That is the worst available option and you paid full price.",
    "Somewhere a scout closed a laptop.",
    "You stole {a} from a man who did not have any.",
  ],
};

function poolFor(grade: Grade, perfect: boolean): string[] {
  if (perfect) return VERDICTS.perfect;
  const score = gradeScore(grade);
  if (score >= 9) return VERDICTS.elite;
  if (score >= 7) return VERDICTS.good;
  if (score >= 4) return VERDICTS.mid;
  if (score >= 2) return VERDICTS.bad;
  return VERDICTS.awful;
}

export function verdictFor(
  grade: Grade,
  roll: number,
  fields: { p: string; b: string; a: string; t: string }
): string {
  const pool = poolFor(grade, grade === "A+");
  const line = pool[Math.min(pool.length - 1, Math.floor(roll * pool.length))];
  return line
    .replace(/\{p\}/g, fields.p)
    .replace(/\{b\}/g, fields.b)
    .replace(/\{a\}/g, fields.a)
    .replace(/\{t\}/g, fields.t);
}
