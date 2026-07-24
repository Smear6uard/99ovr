import type { Archetype, Derived, Flaw } from "@/lib/types";

export const ARCHETYPES: Record<string, Archetype> = {
  "two-way-demon": { id: "two-way-demon", name: "Two-Way Demon", desc: "Elite on both ends. A cheat code." },
  "point-god": { id: "point-god", name: "Point God", desc: "Sees everything before it happens." },
  "glass-cannon": { id: "glass-cannon", name: "Glass Cannon", desc: "All bucket, zero brakes." },
  gambler: { id: "gambler", name: "The Gambler", desc: "Took the refund and dared fate to collect." },
  "lockdown": { id: "lockdown", name: "Lockdown Artist", desc: "Scoring on this build is a felony." },
  "bully-ball": { id: "bully-ball", name: "Bully Ball", desc: "Catches deep. Dunks. Repeats." },
  "microwave": { id: "microwave", name: "Microwave", desc: "Instant buckets. Assembly not included." },
  "budget-baller": { id: "budget-baller", name: "Budget Baller", desc: "Six dollars of it, anyway." },
  "theory-crafter": { id: "theory-crafter", name: "Theory Crafter", desc: "Built in a lab for the synergies." },
  "certified-starter": { id: "certified-starter", name: "Certified Starter", desc: "A real rotation piece. No shame." },
  "glue-guy": { id: "glue-guy", name: "Glue Guy", desc: "Does the little things. Mostly little." },
  "ten-day": { id: "ten-day", name: "10-Day Contract", desc: "The tryout ended early." },
};

/**
 * First matching rule wins. Thresholds read the curved (display-scale)
 * offense/defense numbers so they line up with what's on the card.
 */
export function assignArchetype(d: Derived, flaw?: Flaw): Archetype {
  const sc = d.shotCreation;
  const rp = d.rimPressure;
  if (flaw?.refund === 3 && d.offense >= 82) return ARCHETYPES["glass-cannon"];
  if (flaw && flaw.refund >= 2 && d.spend >= 21) return ARCHETYPES.gambler;
  if (d.offense >= 85 && d.defense >= 85) return ARCHETYPES["two-way-demon"];
  if (d.iq >= 91 && d.offense >= 78) return ARCHETYPES["point-god"];
  if (d.offense >= 85 && d.defense <= 65) return ARCHETYPES["glass-cannon"];
  if (d.defense >= 88 && d.offense <= 68) return ARCHETYPES["lockdown"];
  if (rp >= sc + 12 && d.offense >= 72) return ARCHETYPES["bully-ball"];
  if (sc >= rp + 12 && d.iq <= 62 && d.offense >= 72) return ARCHETYPES["microwave"];
  if (d.spend <= 9) return ARCHETYPES["budget-baller"];
  if (d.synergies.length >= 2) return ARCHETYPES["theory-crafter"];
  if (d.ovr >= 78) return ARCHETYPES["certified-starter"];
  if (d.ovr >= 62) return ARCHETYPES["glue-guy"];
  return ARCHETYPES["ten-day"];
}
