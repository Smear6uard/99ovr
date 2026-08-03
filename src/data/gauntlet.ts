import type { Rung } from "@/lib/types";
import type { Position, PositionMode } from "@/lib/types";

/**
 * Matchup difficulty, not a second player-rating scale. The late rungs are
 * intentionally close enough that a true 96+ build owns a meaningful edge
 * over every boss while 90–95 builds still live at the final two doors.
 */
export const GAUNTLET_POWERS = [55, 60, 65, 70, 75, 80, 84, 87, 90, 93] as const;

/**
 * The 10-rung 1v1 gauntlet. First to 11, first loss ends the run.
 * `quick` rungs punish Matador Defense; `crafty` rungs punish Tunnel Vision.
 * MJ is both, obviously.
 */
export const GAUNTLET: Rung[] = [
  {
    rung: 1, id: "boban", name: "Boban Marjanović", shortName: "Boban", title: "The Friendly Giant", power: GAUNTLET_POWERS[0],
    winQuips: ["He hugged you afterward. He meant it.", "You survived the hand size."],
    lossQuips: ["Cooked by Boban. He apologized mid-bucket.", "He palmed your best shot like a grape."],
  },
  {
    rung: 2, id: "jr", name: "JR Smith", shortName: "JR Smith", title: "The Wild Card", power: GAUNTLET_POWERS[1],
    winQuips: ["Beat him while he heat-checked from 40.", "He forgot the score. You didn't."],
    lossQuips: ["Lost to a man with no plan.", "Five contested threes. Chaos always cashes."],
  },
  {
    rung: 3, id: "rodman", name: "Dennis Rodman", shortName: "Rodman", title: "The Menace", power: GAUNTLET_POWERS[2], crafty: true,
    winQuips: ["Survived the elbows and the mind games.", "He got every rebound. You got the win."],
    lossQuips: ["He grabbed every board, including your dignity.", "Pestered into early retirement."],
  },
  {
    rung: 4, id: "ray", name: "Ray Allen", shortName: "Ray Allen", title: "The Assassin", power: GAUNTLET_POWERS[3],
    winQuips: ["Chased him off the line all game.", "Ray missed one. You needed exactly that."],
    lossQuips: ["Corner three. You knew. He knew. Splash.", "Lost him once. That was enough."],
  },
  {
    rung: 5, id: "iverson", name: "Allen Iverson", shortName: "Iverson", title: "The Answer", power: GAUNTLET_POWERS[4], quick: true,
    winQuips: ["Survived the crossover with shaking legs.", "You went to practice. It showed."],
    lossQuips: ["Your ankles filed a missing persons report.", "He stepped over you on the way out."],
  },
  {
    rung: 6, id: "dirk", name: "Dirk Nowitzki", shortName: "Dirk", title: "The Fadeaway", power: GAUNTLET_POWERS[5],
    winQuips: ["Made the flamingo land. Somehow.", "One leg wasn't enough today."],
    lossQuips: ["One-legged fadeaway. Still unguardable.", "He shot straight over your soul."],
  },
  {
    rung: 7, id: "duncan", name: "Tim Duncan", shortName: "Duncan", title: "The Big Fundamental", power: GAUNTLET_POWERS[6], crafty: true,
    winQuips: ["Beat the bank before it opened.", "Off glass? Not today, sir."],
    lossQuips: ["Bank shot. Bank shot. Bank shot. Eleven.", "Politely, fundamentally dismantled."],
  },
  {
    rung: 8, id: "kobe", name: "Kobe Bryant", shortName: "Kobe", title: "The Mamba", power: GAUNTLET_POWERS[7], quick: true,
    winQuips: ["Out-worked the hardest worker. Once.", "He nodded at you after. That's everything."],
    lossQuips: ["The footwork wrote you a farewell letter.", "Fadeaway after fadeaway. A masterclass, sadly."],
  },
  {
    rung: 9, id: "lebron", name: "LeBron James", shortName: "LeBron", title: "The King", power: GAUNTLET_POWERS[8], crafty: true,
    winQuips: ["You beat a man built in a lab.", "The chase-down block never came. Yours did."],
    lossQuips: ["Chase-down block. You know the one.", "Ran into a freight train with vision."],
  },
  {
    rung: 10, id: "mj", name: "Michael Jordan", shortName: "MJ", title: "His Airness", power: GAUNTLET_POWERS[9], quick: true, crafty: true,
    winQuips: ["You beat the GOAT at his own game.", "He shrugged. This time it meant respect."],
    lossQuips: ["He took it personally. It showed.", "The shrug. The tongue. The inevitable."],
  },
];

const boss = (
  rung: number,
  id: string,
  name: string,
  title: string,
  power: number,
  quick = false,
  crafty = false
): Rung => ({
  rung, id, name, shortName: name.split(" ").at(-1) ?? name, title, power, quick, crafty,
  winQuips: [`Round ${rung} boss handled. Next legend up.`, `${name} had answers. You had one more.`],
  lossQuips: [`${name} closed the gym on you.`, `Round ${rung} belonged to ${name}.`],
});

export const POSITION_GAUNTLETS: Record<Position, Rung[]> = {
  PG: [
    boss(1, "pg-mark", "Mark Jackson", "The Floor General", GAUNTLET_POWERS[0], false, true),
    boss(2, "pg-lowry", "Kyle Lowry", "The Bulldog", GAUNTLET_POWERS[1], false, true),
    boss(3, "pg-parker", "Tony Parker", "The Blur", GAUNTLET_POWERS[2], true, true),
    boss(4, "pg-payton", "Gary Payton", "The Glove", GAUNTLET_POWERS[3], true),
    boss(5, "pg-kidd", "Jason Kidd", "The Triple-Double", GAUNTLET_POWERS[4], false, true),
    boss(6, "pg-nash", "Steve Nash", "The Conductor", GAUNTLET_POWERS[5], true, true),
    boss(7, "pg-cp3", "Chris Paul", "Point God", GAUNTLET_POWERS[6], false, true),
    boss(8, "pg-isiah", "Isiah Thomas", "The Assassin", GAUNTLET_POWERS[7], true, true),
    boss(9, "pg-curry", "Stephen Curry", "The Revolution", GAUNTLET_POWERS[8], true, true),
    boss(10, "pg-magic", "Magic Johnson", "Showtime", GAUNTLET_POWERS[9], true, true),
  ],
  SG: [
    boss(1, "sg-crawford", "Jamal Crawford", "The Shake", GAUNTLET_POWERS[0], true),
    boss(2, "sg-manu", "Manu Ginóbili", "The Lefty", GAUNTLET_POWERS[1], false, true),
    boss(3, "sg-klay", "Klay Thompson", "The Heater", GAUNTLET_POWERS[2]),
    boss(4, "sg-reggie", "Reggie Miller", "The Provocateur", GAUNTLET_POWERS[3], true),
    boss(5, "sg-ray", "Ray Allen", "The Assassin", GAUNTLET_POWERS[4]),
    boss(6, "sg-iverson", "Allen Iverson", "The Answer", GAUNTLET_POWERS[5], true),
    boss(7, "sg-wade", "Dwyane Wade", "Flash", GAUNTLET_POWERS[6], true, true),
    boss(8, "sg-harden", "James Harden", "The Beard", GAUNTLET_POWERS[7], false, true),
    boss(9, "sg-kobe", "Kobe Bryant", "The Mamba", GAUNTLET_POWERS[8], true, true),
    boss(10, "sg-jordan", "Michael Jordan", "His Airness", GAUNTLET_POWERS[9], true, true),
  ],
  SF: [
    boss(1, "sf-ariza", "Trevor Ariza", "The Long Arm", GAUNTLET_POWERS[0]),
    boss(2, "sf-iggy", "Andre Iguodala", "The Swiss Army Knife", GAUNTLET_POWERS[1], false, true),
    boss(3, "sf-mullin", "Chris Mullin", "The Lefty", GAUNTLET_POWERS[2]),
    boss(4, "sf-tmac", "Tracy McGrady", "The Problem", GAUNTLET_POWERS[3], true),
    boss(5, "sf-pippen", "Scottie Pippen", "The Blueprint", GAUNTLET_POWERS[4], true, true),
    boss(6, "sf-kawhi", "Kawhi Leonard", "The Claw", GAUNTLET_POWERS[5], false, true),
    boss(7, "sf-drj", "Julius Erving", "Doctor J", GAUNTLET_POWERS[6], true),
    boss(8, "sf-durant", "Kevin Durant", "The Slim Reaper", GAUNTLET_POWERS[7], false, true),
    boss(9, "sf-bird", "Larry Bird", "Larry Legend", GAUNTLET_POWERS[8], false, true),
    boss(10, "sf-lebron", "LeBron James", "The King", GAUNTLET_POWERS[9], true, true),
  ],
  PF: [
    boss(1, "pf-oakley", "Charles Oakley", "The Enforcer", GAUNTLET_POWERS[0]),
    boss(2, "pf-griffin", "Blake Griffin", "The Detonator", GAUNTLET_POWERS[1], true),
    boss(3, "pf-webber", "Chris Webber", "The Technician", GAUNTLET_POWERS[2], false, true),
    boss(4, "pf-gasol", "Pau Gasol", "The Craftsman", GAUNTLET_POWERS[3], false, true),
    boss(5, "pf-barkley", "Charles Barkley", "The Round Mound", GAUNTLET_POWERS[4], true),
    boss(6, "pf-dirk", "Dirk Nowitzki", "The Fadeaway", GAUNTLET_POWERS[5], false, true),
    boss(7, "pf-kg", "Kevin Garnett", "The Big Ticket", GAUNTLET_POWERS[6], true),
    boss(8, "pf-malone", "Karl Malone", "The Mailman", GAUNTLET_POWERS[7]),
    boss(9, "pf-giannis", "Giannis Antetokounmpo", "The Greek Freak", GAUNTLET_POWERS[8], true),
    boss(10, "pf-duncan", "Tim Duncan", "The Big Fundamental", GAUNTLET_POWERS[9], false, true),
  ],
  C: [
    boss(1, "c-boban", "Boban Marjanović", "The Friendly Giant", GAUNTLET_POWERS[0]),
    boss(2, "c-sabonis", "Arvydas Sabonis", "The Maestro", GAUNTLET_POWERS[1], false, true),
    boss(3, "c-mutombo", "Dikembe Mutombo", "Mount Mutombo", GAUNTLET_POWERS[2]),
    boss(4, "c-embiid", "Joel Embiid", "The Process", GAUNTLET_POWERS[3], false, true),
    boss(5, "c-robinson", "David Robinson", "The Admiral", GAUNTLET_POWERS[4], true),
    boss(6, "c-jokic", "Nikola Jokić", "The Joker", GAUNTLET_POWERS[5], false, true),
    boss(7, "c-russell", "Bill Russell", "The Winner", GAUNTLET_POWERS[6], true),
    boss(8, "c-hakeem", "Hakeem Olajuwon", "The Dream", GAUNTLET_POWERS[7], false, true),
    boss(9, "c-kareem", "Kareem Abdul-Jabbar", "The Captain", GAUNTLET_POWERS[8], false, true),
    boss(10, "c-shaq", "Shaquille O'Neal", "The Diesel", GAUNTLET_POWERS[9], true),
  ],
};

export function gauntletFor(position: PositionMode | undefined, version = 2): Rung[] {
  if (version === 1 || !position || position === "ALL") return GAUNTLET;
  return POSITION_GAUNTLETS[position];
}
