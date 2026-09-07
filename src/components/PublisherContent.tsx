import Link from "@/components/SiteLink";
import type { ReactNode } from "react";

export function Article({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <article className="publisher-content pt-5">
      <p className="eyebrow">99OVR / Field guide</p>
      <h1>{title}</h1>
      <p className="intro">{intro}</p>
      {children}
      <nav
        aria-label="Keep exploring"
        className="mt-8 flex flex-wrap gap-x-4 gap-y-3 border-t border-line pt-5"
      >
        <Link href="/">Choose a game</Link>
        <Link href="/how-to-play">How to play</Link>
        <Link href="/scoring">Scoring</Link>
      </nav>
    </article>
  );
}
export function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export function Skills() {
  return (
    <dl className="skill-list">
      {[
        [
          "Jumpshot",
          "Shooting touch and range. Handles help turn that shot into effective shot creation.",
        ],
        [
          "Handles",
          "Ball control and creating room. A famous scorer is not automatically the best handler on a roster.",
        ],
        [
          "Finishing",
          "Converting chances near the rim. Athleticism helps that finishing become rim pressure.",
        ],
        [
          "Playmaking",
          "Creating opportunities and reading the floor. It contributes to offense and directly to OVR.",
        ],
        [
          "Defense",
          "Stopping opponents. Athleticism supports the build’s defensive score.",
        ],
        [
          "Athleticism",
          "Physical tools that support rim pressure, defense and the simulation’s fatigue modifier.",
        ],
      ].map(([name, text]) => (
        <div key={name}>
          <dt>{name}</dt>
          <dd>{text}</dd>
        </div>
      ))}
    </dl>
  );
}
