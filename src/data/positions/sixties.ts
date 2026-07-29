import { pp, type PosDraft } from "@/data/positions/authoring";

/**
 * 1960s position pool. Set-shot era: jumpshots are mostly modest by design
 * (Sam Jones, West, Arizin are the deliberate exceptions), handles are honest
 * for a decade with no crossover vocabulary, and the centers carry absurd
 * finishing and defense because the whole sport funneled through them.
 * Positions are generous — the era listed everyone as G or F.
 * ORDER IS FROZEN — see authoring.ts.
 */
export const SIXTIES_POOL: PosDraft[] = [
  // ---- Point guards ----
  pp("Lenny Wilkens", "16.5 PPG · 6.2 APG", "Left hand, first step, and a coaching career already forming behind his eyes.", [66, 84, 74, 90, 82, 74], ["PG"]),
  pp("Guy Rodgers", "11.7 PPG · 10.7 APG", "Led the league in assists twice. Could not throw it in the ocean.", [44, 88, 52, 96, 68, 70], ["PG"]),
  pp("K.C. Jones", "7.4 PPG · 4.3 APG", "Eight rings and a scoring average you could hide in a shoe.", [34, 72, 48, 78, 95, 74], ["PG"]),
  pp("Wali Jones", "13.2 PPG · 3.1 APG", "Wallypop. Sixers' release valve when Wilt got double-teamed in '67.", [78, 76, 58, 66, 66, 70], ["PG"]),
  pp("Johnny Egan", "9.6 PPG · 3.6 APG", "Five-eleven and unbothered. Ten seasons of finding the gap.", [68, 78, 52, 74, 54, 56], ["PG"]),
  pp("Al Attles", "8.9 PPG · 3.5 APG", "The Destroyer. Went 8-for-8 the night Wilt scored 100 and nobody noticed.", [42, 70, 60, 68, 88, 76], ["PG"]),
  pp("Howie Komives", "15.7 PPG · 3.6 APG", "Butch. Led the nation in scoring at Bowling Green, then learned about NBA defenders.", [76, 74, 54, 68, 52, 54], ["PG"]),
  // ---- Combo guards, both pools ----
  pp("Oscar Robertson", "30.8 PPG · 12.5 RPG · 11.4 APG", "Averaged a triple-double for a season and considered it unremarkable.", [84, 92, 90, 97, 80, 86], ["PG", "SG"]),
  pp("Jerry West", "31.0 PPG · 4.9 APG", "Mr. Clutch. The silhouette came later; the jumper came first.", [92, 84, 86, 82, 90, 84], ["PG", "SG"]),
  pp("Dave Bing", "27.1 PPG · 6.4 APG", "Detroit's scoring champ at 24, legally blind in one eye by 26.", [80, 86, 82, 82, 62, 84], ["PG", "SG"]),
  pp("Larry Costello", "12.2 PPG · 4.4 APG", "The last two-handed set shooter in the league. Made it look deliberate.", [74, 70, 56, 76, 80, 52], ["PG", "SG"]),
  pp("Richie Guerin", "29.5 PPG · 6.9 APG", "Marine, All-Star, and eventually his own head coach mid-season.", [72, 78, 80, 82, 72, 72], ["PG", "SG"]),
  pp("Gene Shue", "22.8 PPG · 6.8 APG", "Five All-Star teams on bad Pistons squads nobody televised.", [76, 74, 66, 78, 62, 62], ["PG", "SG"]),
  pp("Walt Frazier", "17.5 PPG · 6.1 APG", "Clyde, first draft: the hands were already stealing everything.", [72, 88, 78, 86, 94, 84], ["PG", "SG"]),
  pp("Archie Clark", "19.9 PPG · 4.4 APG", "Shake and Bake. The crossover existed before it had a name.", [68, 90, 78, 74, 66, 80], ["PG", "SG"]),
  pp("Adrian Smith", "18.4 PPG · 1966 All-Star MVP", "Won the All-Star MVP. Nobody has said his name out loud since.", [78, 66, 58, 62, 58, 60], ["PG", "SG"]),
  // ---- Shooting guards ----
  pp("Sam Jones", "25.9 PPG · the bank shot", "Used the glass like it owed him. Boston's closer before closers.", [90, 74, 78, 60, 66, 84], ["SG"]),
  pp("Hal Greer", "24.1 PPG · 4.6 APG", "Shot his free throws as jump shots. Made 80% of them anyway.", [86, 76, 72, 70, 78, 76], ["SG"]),
  pp("Dick Barnett", "23.1 PPG · kick-back release", "Fall back, baby. Legs behind him, ball already in.", [82, 74, 70, 58, 72, 70], ["SG"]),
  pp("Don Ohl", "20.6 PPG · 5 All-Star nods", "Five All-Star selections and a permanent seat in the trivia section.", [80, 72, 66, 56, 56, 68], ["SG"]),
  pp("Kevin Loughery", "22.6 PPG · 3.9 APG", "Baltimore's volume. Later coached Jordan and lived to tell it.", [78, 76, 62, 66, 60, 62], ["SG"]),
  // ---- Wings, both pools ----
  pp("John Havlicek", "21.6 PPG · 6.7 RPG · 5.5 APG", "Havlicek stole the ball, then ran for another sixteen years.", [78, 82, 84, 82, 88, 92], ["SG", "SF"]),
  pp("Jeff Mullins", "22.8 PPG · 4.1 APG", "Duke polish on a Warriors team built entirely out of noise.", [80, 76, 72, 70, 60, 74], ["SG", "SF"]),
  pp("Cazzie Russell", "18.3 PPG · they named the gym", "Michigan built an arena for him. New York got a very good sixth man.", [84, 72, 70, 56, 48, 72], ["SG", "SF"]),
  // ---- Small forwards ----
  pp("Elgin Baylor", "34.8 PPG · 14.3 RPG · 4.6 APG", "Invented hang time on weekends while serving in the Army reserve.", [76, 84, 94, 80, 68, 94], ["SF"]),
  pp("Rick Barry", "35.6 PPG · scoring title at 23", "Underhand free throws, overhand contempt for everyone guarding him.", [86, 82, 88, 78, 62, 82], ["SF"]),
  pp("Paul Arizin", "21.9 PPG · Pitchin' Paul", "Believed in the jump shot back when coaches called it showboating.", [88, 66, 76, 56, 62, 76], ["SF"]),
  pp("Tom Sanders", "9.6 PPG · 6.3 RPG", "Satch drew Baylor, Pettit, and Hawkins. Boston slept fine because of it.", [52, 52, 60, 48, 92, 74], ["SF"]),
  pp("Don Nelson", "10.7 PPG · 50% FG", "The ugliest shot in the building went in more than yours.", [66, 56, 78, 54, 60, 48], ["SF"]),
  pp("Bill Bradley", "12.4 PPG · Rhodes Scholar", "Princeton legend, future senator, distinctly ordinary pro scorer.", [78, 66, 58, 70, 66, 50], ["SF"]),
  // ---- Forwards, both pools ----
  pp("Billy Cunningham", "24.8 PPG · 12.8 RPG", "The Kangaroo Kid came off the bench and left the floor entirely.", [64, 76, 88, 68, 70, 92], ["SF", "PF"]),
  pp("Dave DeBusschere", "16.4 PPG · 11.0 RPG", "Player-coach at 24. Also pitched for the White Sox. Guarded everyone.", [68, 58, 76, 62, 92, 76], ["SF", "PF"]),
  pp("Gus Johnson", "17.1 PPG · 12.6 RPG", "Broke three backboards and a gold tooth's worth of reputations.", [62, 62, 86, 54, 84, 94], ["SF", "PF"]),
  pp("Chet Walker", "19.3 PPG · 7.5 RPG", "Chet the Jet drew the foul before you knew there was contact.", [74, 76, 84, 60, 62, 74], ["SF", "PF"]),
  pp("Bailey Howell", "20.0 PPG · 10.0 RPG", "Twenty and ten for a decade, and you still can't picture him.", [66, 54, 86, 46, 72, 74], ["SF", "PF"]),
  pp("Rudy LaRusso", "15.6 PPG · 9.0 RPG", "Dartmouth toughness. Took the Lakers' worst defensive assignment nightly.", [70, 52, 74, 50, 80, 62], ["SF", "PF"]),
  pp("Tom Heinsohn", "21.3 PPG · 10.0 RPG", "Tommy Gun. Shot 40% and considered every one of them a good look.", [68, 54, 82, 50, 60, 72], ["SF", "PF"]),
  pp("Happy Hairston", "16.0 PPG · 10.6 RPG", "Lived on the offensive glass. Smiled about it, hence the name.", [62, 54, 80, 48, 70, 76], ["SF", "PF"]),
  // ---- Power forwards ----
  pp("Tom Meschery", "12.7 PPG · 9.6 RPG", "Published poet. Fouled you like it was a stanza he was working on.", [58, 46, 72, 46, 78, 62], ["PF"]),
  pp("Bob Boozer", "14.8 PPG · 8.4 RPG", "Olympic gold in '60, then eleven years of dependable fifteen-footers.", [66, 48, 78, 46, 64, 66], ["PF"]),
  // ---- Bigs, both pools ----
  pp("Jerry Lucas", "21.4 PPG · 20.0 RPG", "Memorized phone books between games. Rebounded like he'd memorized the miss.", [78, 52, 74, 62, 74, 62], ["PF", "C"]),
  pp("Willis Reed", "20.9 PPG · 14.7 RPG", "Fought the entire Lakers bench once. Won.", [74, 50, 86, 52, 88, 78], ["PF", "C"]),
  pp("Zelmo Beaty", "20.7 PPG · 11.4 RPG", "Big Z. Guarded Wilt and Russell without complaining to the press about it.", [62, 46, 84, 44, 80, 72], ["PF", "C"]),
  pp("Ray Scott", "17.6 PPG · 11.5 RPG", "Six-nine of Philadelphia, doing every unglamorous thing Detroit asked.", [64, 50, 74, 52, 72, 74], ["PF", "C"]),
  pp("Luke Jackson", "14.7 PPG · 12.9 RPG", "The muscle beside Wilt in '67. Championship enforcement, salaried.", [56, 44, 76, 48, 84, 70], ["PF", "C"]),
  pp("Johnny Green", "13.7 PPG · 10.1 RPG", "Jumpin' Johnny could touch the top of the square and not the rim from twelve feet.", [38, 42, 82, 40, 78, 90], ["PF", "C"]),
  pp("LeRoy Ellis", "12.9 PPG · 10.9 RPG", "Long arms, quiet mouth, rebounds that showed up in the box score only.", [60, 44, 70, 42, 74, 72], ["PF", "C"]),
  // ---- Centers ----
  pp("Wilt Chamberlain", "50.4 PPG · 25.7 RPG", "Scored 100 in a game and led the league in assists later out of spite.", [52, 62, 99, 74, 96, 99], ["C"]),
  pp("Bill Russell", "15.1 PPG · 22.5 RPG · 11 rings", "Never averaged 20. Never lost a Game 7 either.", [40, 54, 68, 76, 99, 96], ["C"]),
  pp("Nate Thurmond", "18.9 PPG · 21.3 RPG", "The only man Wilt admitted was a problem.", [54, 44, 76, 52, 96, 84], ["C"]),
  pp("Walt Bellamy", "31.6 PPG · 19.0 RPG", "Rookie numbers from a video game. Zero rings, and people had theories.", [44, 46, 92, 46, 72, 82], ["C"]),
  pp("Wayne Embry", "12.4 PPG · 9.6 RPG", "Two hundred sixty pounds of legal screen. Oscar sends his regards.", [50, 40, 74, 44, 74, 58], ["C"]),
  pp("Bob Rule", "24.0 PPG · 11.5 RPG", "Seattle's whole offense in year two, before the Achilles ended it.", [64, 48, 84, 42, 66, 78], ["C"]),
  pp("Mel Counts", "7.4 PPG · 7.0 RPG · 7'0\"", "A seven-footer who preferred to shoot from eighteen feet. Ahead of schedule.", [76, 40, 62, 44, 62, 50], ["C"]),
  pp("Darrall Imhoff", "7.5 PPG · 7.4 RPG", "Guarded Wilt the night of the 100. It goes on the tombstone regardless.", [42, 34, 58, 40, 74, 52], ["C"]),
  pp("Walter Dukes", "8.8 PPG · 9.5 RPG", "Led the league in personal fouls three times. On purpose, probably.", [36, 30, 60, 38, 76, 60], ["C"]),
];
