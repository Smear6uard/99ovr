import type { Rung } from "@/lib/types";
import type { Position, PositionMode } from "@/lib/types";

/**
 * The 10-rung 1v1 gauntlet. First to 11, first loss ends the run.
 * `quick` rungs punish Matador Defense; `crafty` rungs punish Tunnel Vision.
 * MJ is both, obviously.
 */
export const GAUNTLET: Rung[] = [
  {
    rung: 1, id: "boban", name: "Boban Marjanović", shortName: "Boban", title: "The Friendly Giant", power: 62,
    winQuips: ["He hugged you afterward. He meant it.", "You survived the hand size."],
    lossQuips: ["Cooked by Boban. He apologized mid-bucket.", "He palmed your best shot like a grape."],
  },
  {
    rung: 2, id: "jr", name: "JR Smith", shortName: "JR Smith", title: "The Wild Card", power: 66,
    winQuips: ["Beat him while he heat-checked from 40.", "He forgot the score. You didn't."],
    lossQuips: ["Lost to a man with no plan.", "Five contested threes. Chaos always cashes."],
  },
  {
    rung: 3, id: "rodman", name: "Dennis Rodman", shortName: "Rodman", title: "The Menace", power: 70, crafty: true,
    winQuips: ["Survived the elbows and the mind games.", "He got every rebound. You got the win."],
    lossQuips: ["He grabbed every board, including your dignity.", "Pestered into early retirement."],
  },
  {
    rung: 4, id: "ray", name: "Ray Allen", shortName: "Ray Allen", title: "The Assassin", power: 74,
    winQuips: ["Chased him off the line all game.", "Ray missed one. You needed exactly that."],
    lossQuips: ["Corner three. You knew. He knew. Splash.", "Lost him once. That was enough."],
  },
  {
    rung: 5, id: "iverson", name: "Allen Iverson", shortName: "Iverson", title: "The Answer", power: 78, quick: true,
    winQuips: ["Survived the crossover with shaking legs.", "You went to practice. It showed."],
    lossQuips: ["Your ankles filed a missing persons report.", "He stepped over you on the way out."],
  },
  {
    rung: 6, id: "dirk", name: "Dirk Nowitzki", shortName: "Dirk", title: "The Fadeaway", power: 82,
    winQuips: ["Made the flamingo land. Somehow.", "One leg wasn't enough today."],
    lossQuips: ["One-legged fadeaway. Still unguardable.", "He shot straight over your soul."],
  },
  {
    rung: 7, id: "duncan", name: "Tim Duncan", shortName: "Duncan", title: "The Big Fundamental", power: 85, crafty: true,
    winQuips: ["Beat the bank before it opened.", "Off glass? Not today, sir."],
    lossQuips: ["Bank shot. Bank shot. Bank shot. Eleven.", "Politely, fundamentally dismantled."],
  },
  {
    rung: 8, id: "kobe", name: "Kobe Bryant", shortName: "Kobe", title: "The Mamba", power: 90, quick: true,
    winQuips: ["Out-worked the hardest worker. Once.", "He nodded at you after. That's everything."],
    lossQuips: ["The footwork wrote you a farewell letter.", "Fadeaway after fadeaway. A masterclass, sadly."],
  },
  {
    rung: 9, id: "lebron", name: "LeBron James", shortName: "LeBron", title: "The King", power: 95, crafty: true,
    winQuips: ["You beat a man built in a lab.", "The chase-down block never came. Yours did."],
    lossQuips: ["Chase-down block. You know the one.", "Ran into a freight train with vision."],
  },
  {
    rung: 10, id: "mj", name: "Michael Jordan", shortName: "MJ", title: "His Airness", power: 99, quick: true, crafty: true,
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
    boss(1, "pg-mark", "Mark Jackson", "The Floor General", 62, false, true),
    boss(2, "pg-lowry", "Kyle Lowry", "The Bulldog", 66, false, true),
    boss(3, "pg-parker", "Tony Parker", "The Blur", 70, true, true),
    boss(4, "pg-payton", "Gary Payton", "The Glove", 74, true),
    boss(5, "pg-kidd", "Jason Kidd", "The Triple-Double", 78, false, true),
    boss(6, "pg-nash", "Steve Nash", "The Conductor", 82, true, true),
    boss(7, "pg-cp3", "Chris Paul", "Point God", 85, false, true),
    boss(8, "pg-isiah", "Isiah Thomas", "The Assassin", 90, true, true),
    boss(9, "pg-curry", "Stephen Curry", "The Revolution", 95, true, true),
    boss(10, "pg-magic", "Magic Johnson", "Showtime", 99, true, true),
  ],
  SG: [
    boss(1, "sg-crawford", "Jamal Crawford", "The Shake", 62, true),
    boss(2, "sg-manu", "Manu Ginóbili", "The Lefty", 66, false, true),
    boss(3, "sg-klay", "Klay Thompson", "The Heater", 70),
    boss(4, "sg-reggie", "Reggie Miller", "The Provocateur", 74, true),
    boss(5, "sg-ray", "Ray Allen", "The Assassin", 78),
    boss(6, "sg-iverson", "Allen Iverson", "The Answer", 82, true),
    boss(7, "sg-wade", "Dwyane Wade", "Flash", 85, true, true),
    boss(8, "sg-harden", "James Harden", "The Beard", 90, false, true),
    boss(9, "sg-kobe", "Kobe Bryant", "The Mamba", 95, true, true),
    boss(10, "sg-jordan", "Michael Jordan", "His Airness", 99, true, true),
  ],
  SF: [
    boss(1, "sf-ariza", "Trevor Ariza", "The Long Arm", 62),
    boss(2, "sf-iggy", "Andre Iguodala", "The Swiss Army Knife", 66, false, true),
    boss(3, "sf-mullin", "Chris Mullin", "The Lefty", 70),
    boss(4, "sf-tmac", "Tracy McGrady", "The Problem", 74, true),
    boss(5, "sf-pippen", "Scottie Pippen", "The Blueprint", 78, true, true),
    boss(6, "sf-kawhi", "Kawhi Leonard", "The Claw", 82, false, true),
    boss(7, "sf-drj", "Julius Erving", "Doctor J", 85, true),
    boss(8, "sf-durant", "Kevin Durant", "The Slim Reaper", 90, false, true),
    boss(9, "sf-bird", "Larry Bird", "Larry Legend", 95, false, true),
    boss(10, "sf-lebron", "LeBron James", "The King", 99, true, true),
  ],
  PF: [
    boss(1, "pf-oakley", "Charles Oakley", "The Enforcer", 62),
    boss(2, "pf-griffin", "Blake Griffin", "The Detonator", 66, true),
    boss(3, "pf-webber", "Chris Webber", "The Technician", 70, false, true),
    boss(4, "pf-gasol", "Pau Gasol", "The Craftsman", 74, false, true),
    boss(5, "pf-barkley", "Charles Barkley", "The Round Mound", 78, true),
    boss(6, "pf-dirk", "Dirk Nowitzki", "The Fadeaway", 82, false, true),
    boss(7, "pf-kg", "Kevin Garnett", "The Big Ticket", 85, true),
    boss(8, "pf-malone", "Karl Malone", "The Mailman", 90),
    boss(9, "pf-giannis", "Giannis Antetokounmpo", "The Greek Freak", 95, true),
    boss(10, "pf-duncan", "Tim Duncan", "The Big Fundamental", 99, false, true),
  ],
  C: [
    boss(1, "c-boban", "Boban Marjanović", "The Friendly Giant", 62),
    boss(2, "c-sabonis", "Arvydas Sabonis", "The Maestro", 66, false, true),
    boss(3, "c-mutombo", "Dikembe Mutombo", "Mount Mutombo", 70),
    boss(4, "c-embiid", "Joel Embiid", "The Process", 74, false, true),
    boss(5, "c-robinson", "David Robinson", "The Admiral", 78, true),
    boss(6, "c-jokic", "Nikola Jokić", "The Joker", 82, false, true),
    boss(7, "c-russell", "Bill Russell", "The Winner", 85, true),
    boss(8, "c-hakeem", "Hakeem Olajuwon", "The Dream", 90, false, true),
    boss(9, "c-kareem", "Kareem Abdul-Jabbar", "The Captain", 95, false, true),
    boss(10, "c-shaq", "Shaquille O'Neal", "The Diesel", 99, true),
  ],
};

export function gauntletFor(position: PositionMode | undefined, version = 2): Rung[] {
  if (version === 1 || !position || position === "ALL") return GAUNTLET;
  return POSITION_GAUNTLETS[position];
}
