import { Article, Section } from "@/components/PublisherContent";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "99OVR Terms of Use",
  "Terms for using 99OVR, a fan-made browser game published by Sameer Studios LLC for entertainment.",
  "/terms",
);
export default function Terms() {
  return (
    <Article
      title="Terms of use"
      intro="99OVR is published by Sameer Studios LLC for entertainment. By using the service, you agree to these terms. Updated September 6, 2026."
    >
      <Section title="A fan-made basketball game">
        <p>
          99OVR is not affiliated with or endorsed by the NBA, any team or any
          player. Player and team names identify the subjects of a fantasy game.
          Relevant names and trademarks belong to their respective owners; their
          use does not imply sponsorship. Skill ratings, archetypes and verdicts
          are fictional/editorial game opinions, not official evaluations or
          factual claims about personal character.
        </p>
      </Section>
      <Section title="Use the game fairly">
        <p>
          Do not disrupt the service, bypass access restrictions, automate
          abusive requests, manipulate leaderboard submissions, impersonate
          others or submit unlawful, harassing or infringing material. Choose
          appropriate public initials. We may reject or remove submissions and
          restrict abusive access.
        </p>
      </Section>
      <Section title="Game content and sharing">
        <p>
          The site’s original code, writing and game presentation are protected
          by applicable intellectual-property laws. You may use the provided
          sharing tools to share your results and challenge friends. These terms
          do not grant rights to third-party names or trademarks, or permission
          to copy and republish the entire service.
        </p>
      </Section>
      <Section title="Availability and changes">
        <p>
          The game, roster pools, ratings and features may change, and the
          service may be interrupted or discontinued. Local progress depends on
          your browser storage. Leaderboards depend on service availability. We
          do not promise uninterrupted access, preservation of every record or
          compatibility of every historical link after future changes. Budget
          dollars are game units with no cash value.
        </p>
      </Section>
      <Section title="Responsibility">
        <p>
          To the extent permitted by applicable law, the service is provided as
          available without warranties of uninterrupted operation or fitness for
          a particular purpose. Sameer Studios LLC is not liable for indirect or
          consequential loss arising from use of the game. Nothing here excludes
          rights or liabilities that cannot legally be excluded.
        </p>
      </Section>
      <Section title="Questions or rights concerns">
        <p>
          Email{" "}
          <a href="mailto:sameer@sameerstuidos.com">sameer@sameerstuidos.com</a>
          . Include enough information to identify the content or issue. Revised
          terms will be posted here when the service’s terms change.
        </p>
      </Section>
    </Article>
  );
}
