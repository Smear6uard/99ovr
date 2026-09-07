import { Article, Section } from "@/components/PublisherContent";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Contact 99OVR",
  "Contact Sameer Studios LLC, publisher of 99OVR, for game feedback, bug reports, privacy questions and rights concerns.",
  "/contact",
);
export default function Contact() {
  return (
    <Article title="Contact" intro="99OVR is published by Sameer Studios LLC.">
      <Section title="Talk to the publisher">
        <p>
          Email{" "}
          <a href="mailto:sameer@sameerstudios.com">sameer@sameerstudios.com</a>{" "}
          for game feedback, bug reports, privacy questions or rights concerns.
        </p>
      </Section>
      <Section title="Help us reproduce a problem">
        <p>
          Include the mode, what you expected, what happened and your browser or
          device. A build or challenge link can help reproduce a game result. Do
          not send passwords, payment details or other sensitive information.
        </p>
      </Section>
      <Section title="Ratings are open to debate">
        <p>
          If you disagree with a rating, name the player, roster and attribute,
          and explain the basketball case. Each skill is an editorial judgment
          for this game, so a scoring reputation alone may not explain a passing
          or defensive rating.
        </p>
      </Section>
    </Article>
  );
}
