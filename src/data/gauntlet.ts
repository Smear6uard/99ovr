import type { Rung } from "@/lib/types";

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
