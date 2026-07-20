import type { PoolEntry, SlotId } from "@/lib/types";

/**
 * The shop pool: 12 entries per slot — 2×$5, 2×$4, 3×$3, 2×$2, 3×$1.
 * Ratings are hidden. Same-price entries differ slightly on purpose:
 * there are secretly-optimal picks for the group chat to discover.
 * Array order is encoding-stable — never reorder, only append.
 */
export const POOL: Record<SlotId, PoolEntry[]> = {
  jumpshot: [
    { id: "js-curry", name: "Stephen Curry", slot: "jumpshot", price: 5, rating: 99, tags: ["sniper"], blurb: "Half-court is a layup line." },
    { id: "js-durant", name: "Kevin Durant", slot: "jumpshot", price: 5, rating: 96, tags: ["sniper", "clutch"], blurb: "Seven feet of unguardable." },
    { id: "js-allen", name: "Ray Allen", slot: "jumpshot", price: 4, rating: 92, tags: ["sniper", "clutch"], blurb: "Corner three, Game 6. You know." },
    { id: "js-bird", name: "Larry Bird", slot: "jumpshot", price: 4, rating: 90, tags: ["sniper", "visionary"], blurb: "Told you where. Made it anyway." },
    { id: "js-klay", name: "Klay Thompson", slot: "jumpshot", price: 3, rating: 85, tags: ["sniper"], blurb: "Needs 0.2 seconds and zero dribbles." },
    { id: "js-reggie", name: "Reggie Miller", slot: "jumpshot", price: 3, rating: 84, tags: ["sniper", "clutch"], blurb: "Eight points in nine seconds. Ask Spike." },
    { id: "js-dame", name: "Damian Lillard", slot: "jumpshot", price: 3, rating: 83, tags: ["sniper", "clutch"], blurb: "Pulls from the logo. Waves goodbye." },
    { id: "js-derozan", name: "DeMar DeRozan", slot: "jumpshot", price: 2, rating: 74, tags: ["crafty"], blurb: "Midrange merchant. The three is a rumor." },
    { id: "js-lonzo", name: "Lonzo Ball", slot: "jumpshot", price: 2, rating: 70, blurb: "The jumper got surgery. It lived." },
    { id: "js-bigben", name: "Ben Wallace", slot: "jumpshot", price: 1, rating: 45, blurb: "Form: historic. Results: also historic." },
    { id: "js-shaq", name: "Shaquille O'Neal", slot: "jumpshot", price: 1, rating: 47, tags: ["strong"], blurb: "Career 1-for-22 from three. Sniper." },
    { id: "js-simmons", name: "Ben Simmons", slot: "jumpshot", price: 1, rating: 52, blurb: "Allergic to the three-point line. Medically." },
  ],
  handles: [
    { id: "h-kyrie", name: "Kyrie Irving", slot: "handles", price: 5, rating: 99, tags: ["shifty", "clutch"], blurb: "Ankle insurance not included." },
    { id: "h-iverson", name: "Allen Iverson", slot: "handles", price: 5, rating: 96, tags: ["shifty", "dawg"], blurb: "Crossed the GOAT as a rookie." },
    { id: "h-isiah", name: "Isiah Thomas", slot: "handles", price: 4, rating: 90, tags: ["shifty", "dawg"], blurb: "Baby-faced. Absolutely merciless." },
    { id: "h-crawford", name: "Jamal Crawford", slot: "handles", price: 4, rating: 88, tags: ["shifty"], blurb: "Shake. Bake. Sixth Man forever." },
    { id: "h-cp3", name: "Chris Paul", slot: "handles", price: 3, rating: 85, tags: ["crafty"], blurb: "Runs point like a chess clock." },
    { id: "h-harden", name: "James Harden", slot: "handles", price: 3, rating: 84, tags: ["shifty", "crafty"], blurb: "Stepback patented. Travel? Allegedly." },
    { id: "h-hardaway", name: "Tim Hardaway", slot: "handles", price: 3, rating: 82, tags: ["shifty"], blurb: "Invented the killer crossover. Literally." },
    { id: "h-luka", name: "Luka Dončić", slot: "handles", price: 2, rating: 77, tags: ["crafty"], blurb: "Slow motion, yet nobody stays in front." },
    { id: "h-russ", name: "Russell Westbrook", slot: "handles", price: 2, rating: 74, tags: ["motor"], blurb: "Handle held together by pure rage." },
    { id: "h-boban", name: "Boban Marjanović", slot: "handles", price: 1, rating: 45, tags: ["strong"], blurb: "The ball is a stress ball now." },
    { id: "h-shaq", name: "Shaquille O'Neal", slot: "handles", price: 1, rating: 50, tags: ["strong"], blurb: "One dribble per possession. Maximum." },
    { id: "h-dwight", name: "Dwight Howard", slot: "handles", price: 1, rating: 55, tags: ["lob"], blurb: "Brings it down. Every. Single. Time." },
  ],
  finishing: [
    { id: "f-shaq", name: "Shaquille O'Neal", slot: "finishing", price: 5, rating: 99, tags: ["strong"], blurb: "Broke two backboards. They deserved it." },
    { id: "f-giannis", name: "Giannis Antetokounmpo", slot: "finishing", price: 5, rating: 97, tags: ["bouncy", "strong"], blurb: "Eurosteps from the free-throw line." },
    { id: "f-lebron", name: "LeBron James", slot: "finishing", price: 4, rating: 92, tags: ["strong", "bouncy"], blurb: "A freight train with footwork." },
    { id: "f-zion", name: "Zion Williamson", slot: "finishing", price: 4, rating: 89, tags: ["bouncy", "strong"], blurb: "The rim files restraining orders." },
    { id: "f-amare", name: "Amar'e Stoudemire", slot: "finishing", price: 3, rating: 85, tags: ["lob", "bouncy"], blurb: "Stands for Standing Above The Rim." },
    { id: "f-wade", name: "Dwyane Wade", slot: "finishing", price: 3, rating: 84, tags: ["shifty", "clutch"], blurb: "Eurostep. Kiss off glass. Flash." },
    { id: "f-deandre", name: "DeAndre Jordan", slot: "finishing", price: 3, rating: 80, tags: ["lob"], blurb: "Catches lobs thrown into orbit." },
    { id: "f-parker", name: "Tony Parker", slot: "finishing", price: 2, rating: 76, tags: ["shifty", "crafty"], blurb: "Teardrops on seven-footers. No remorse." },
    { id: "f-randle", name: "Julius Randle", slot: "finishing", price: 2, rating: 70, tags: ["strong"], blurb: "Left hand only. Right is decorative." },
    { id: "f-miller", name: "Andre Miller", slot: "finishing", price: 1, rating: 60, tags: ["crafty"], blurb: "Zero athleticism. Finishes anyway. Somehow." },
    { id: "f-kidd", name: "Jason Kidd", slot: "finishing", price: 1, rating: 52, tags: ["visionary"], blurb: "Passes because the layup scares him." },
    { id: "f-battier", name: "Shane Battier", slot: "finishing", price: 1, rating: 48, tags: ["dawg"], blurb: "Would rather take a charge." },
  ],
  defense: [
    { id: "d-bigben", name: "Ben Wallace", slot: "defense", price: 5, rating: 98, tags: ["anchor", "motor"], blurb: "Nothing at the rim survives him." },
    { id: "d-hakeem", name: "Hakeem Olajuwon", slot: "defense", price: 5, rating: 96, tags: ["anchor", "crafty"], blurb: "Most blocks ever. Yours is next." },
    { id: "d-kawhi", name: "Kawhi Leonard", slot: "defense", price: 4, rating: 92, tags: ["dawg", "clutch"], blurb: "The Claw repossesses basketballs." },
    { id: "d-payton", name: "Gary Payton", slot: "defense", price: 4, rating: 91, tags: ["dawg", "motor"], blurb: "The Glove. Talked while locking up." },
    { id: "d-draymond", name: "Draymond Green", slot: "defense", price: 3, rating: 85, tags: ["anchor", "visionary"], blurb: "Guards one through five. Loudly." },
    { id: "d-pippen", name: "Scottie Pippen", slot: "defense", price: 3, rating: 84, tags: ["motor", "crafty"], blurb: "The blueprint for wing defense." },
    { id: "d-tonyallen", name: "Tony Allen", slot: "defense", price: 3, rating: 82, tags: ["dawg", "motor"], blurb: "First Team All-Defense. Grit. Grind." },
    { id: "d-smart", name: "Marcus Smart", slot: "defense", price: 2, rating: 76, tags: ["dawg", "motor"], blurb: "Draws charges in his sleep." },
    { id: "d-beverley", name: "Patrick Beverley", slot: "defense", price: 2, rating: 74, tags: ["dawg"], blurb: "94 feet of personal grievance." },
    { id: "d-harden", name: "James Harden", slot: "defense", price: 1, rating: 50, tags: ["crafty"], blurb: "Matador. The bulls send thank-yous." },
    { id: "d-trae", name: "Trae Young", slot: "defense", price: 1, rating: 46, blurb: "Defense is a rumor he denies." },
    { id: "d-kanter", name: "Enes Kanter", slot: "defense", price: 1, rating: 45, tags: ["strong"], blurb: "A turnstile with great post moves." },
  ],
  athleticism: [
    { id: "a-vince", name: "Vince Carter", slot: "athleticism", price: 5, rating: 99, tags: ["bouncy"], blurb: "Jumped over a seven-footer. Olympics." },
    { id: "a-rose", name: "Derrick Rose", slot: "athleticism", price: 5, rating: 96, tags: ["bouncy", "shifty"], blurb: "Youngest MVP. Gravity came later." },
    { id: "a-ja", name: "Ja Morant", slot: "athleticism", price: 4, rating: 91, tags: ["bouncy", "shifty"], blurb: "Launches from the dotted line." },
    { id: "a-russ", name: "Russell Westbrook", slot: "athleticism", price: 4, rating: 90, tags: ["bouncy", "motor"], blurb: "Zero to dunk in two steps." },
    { id: "a-blake", name: "Blake Griffin", slot: "athleticism", price: 3, rating: 85, tags: ["bouncy", "strong"], blurb: "Dunked over a car. And Mozgov." },
    { id: "a-kemp", name: "Shawn Kemp", slot: "athleticism", price: 3, rating: 84, tags: ["bouncy", "lob"], blurb: "Reign Man. Lobs became posters." },
    { id: "a-nique", name: "Dominique Wilkins", slot: "athleticism", price: 3, rating: 83, tags: ["bouncy"], blurb: "The Human Highlight Film." },
    { id: "a-cp3", name: "Chris Paul", slot: "athleticism", price: 2, rating: 72, tags: ["motor", "crafty"], blurb: "Quick enough. Smarter than quick." },
    { id: "a-love", name: "Kevin Love", slot: "athleticism", price: 2, rating: 69, tags: ["strong"], blurb: "Outlet passes need arm strength, okay?" },
    { id: "a-jokic", name: "Nikola Jokić", slot: "athleticism", price: 1, rating: 60, tags: ["crafty"], blurb: "Looks asleep. Isn't. Ever." },
    { id: "a-zaza", name: "Zaza Pachulia", slot: "athleticism", price: 1, rating: 47, tags: ["dawg"], blurb: "Runs like the floor owes him." },
    { id: "a-boban", name: "Boban Marjanović", slot: "athleticism", price: 1, rating: 45, tags: ["strong"], blurb: "Moves in cinematic slow motion." },
  ],
  iq: [
    { id: "iq-lebron", name: "LeBron James", slot: "iq", price: 5, rating: 99, tags: ["visionary", "clutch"], blurb: "Remembers every play since 2003." },
    { id: "iq-magic", name: "Magic Johnson", slot: "iq", price: 5, rating: 98, tags: ["visionary"], blurb: "Saw passes three seconds early." },
    { id: "iq-jokic", name: "Nikola Jokić", slot: "iq", price: 4, rating: 92, tags: ["visionary", "crafty"], blurb: "Plays chess. Everyone else plays tag." },
    { id: "iq-cp3", name: "Chris Paul", slot: "iq", price: 4, rating: 91, tags: ["visionary", "dawg"], blurb: "Point God. Micromanages everything. Correct." },
    { id: "iq-nash", name: "Steve Nash", slot: "iq", price: 3, rating: 85, tags: ["visionary", "sniper"], blurb: "Two MVPs of pure geometry." },
    { id: "iq-kidd", name: "Jason Kidd", slot: "iq", price: 3, rating: 84, tags: ["visionary", "motor"], blurb: "Saw the future, passed to it." },
    { id: "iq-rondo", name: "Rajon Rondo", slot: "iq", price: 3, rating: 81, tags: ["visionary", "crafty"], blurb: "Connect Four grandmaster. Really." },
    { id: "iq-draymond", name: "Draymond Green", slot: "iq", price: 2, rating: 77, tags: ["visionary", "dawg"], blurb: "The smartest technical foul alive." },
    { id: "iq-rubio", name: "Ricky Rubio", slot: "iq", price: 2, rating: 74, tags: ["visionary"], blurb: "Passed like poetry, shot like prose." },
    { id: "iq-jr", name: "JR Smith", slot: "iq", price: 1, rating: 45, tags: ["clutch"], blurb: "Thought they were up one." },
    { id: "iq-dion", name: "Dion Waiters", slot: "iq", price: 1, rating: 50, tags: ["clutch"], blurb: "Irrational Confidence Hall of Fame." },
    { id: "iq-swaggy", name: "Nick Young", slot: "iq", price: 1, rating: 48, tags: ["sniper"], blurb: "Celebrated before it missed." },
  ],
};

export function entryByIndex(slot: SlotId, index: number): PoolEntry | null {
  const arr = POOL[slot];
  if (index < 0 || index >= arr.length) return null;
  return arr[index];
}

export function indexOfEntry(slot: SlotId, id: string): number {
  return POOL[slot].findIndex((e) => e.id === id);
}
