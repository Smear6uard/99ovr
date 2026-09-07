import Link from "@/components/SiteLink";
import { Article, Section } from "@/components/PublisherContent";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "99OVR Privacy Policy",
  "How 99OVR handles browser storage, optional leaderboard submissions, shared builds, analytics and Google advertising services.",
  "/privacy",
);
export default function Privacy() {
  return (
    <Article
      title="Privacy policy"
      intro="Sameer Studios LLC publishes 99OVR. This policy describes the game’s data handling and the outside services used to operate it. Updated September 6, 2026."
    >
      <Section title="Playing and browser storage">
        <p>
          No account is required. The game uses local storage for your latest
          official Daily result, streak and best streak, personal best build,
          saved leaderboard initials and sound preference. These records remain
          in that browser until replaced or cleared; there is no account-based
          device sync. The game code does not itself set login or tracking
          cookies.
        </p>
      </Section>
      <Section title="Optional leaderboard">
        <p>
          Submitting sends a build code and three initials to the server. The
          server replays the build to calculate the score. Your initials, OVR
          and bosses beaten can appear publicly. Use a tag you are comfortable
          publishing.
        </p>
        <p>
          The leaderboard service processes your IP address for rate limiting
          and to derive a submission identifier. Rate-limit records include the
          IP address; leaderboard records store initials, a derived fingerprint
          and score. These records use Vercel KV or Upstash Redis when
          configured. Their expiration is set to three days after a relevant
          write, and further writes can refresh it. This is separate from
          provider logs and backups, whose retention depends on the provider’s
          settings.
        </p>
      </Section>
      <Section title="Build and challenge links">
        <p>
          A shared URL encodes game choices and replay settings. Anyone with the
          link can view or replay those details. Build codes are not private
          accounts or access controls. Requests for result pages and generated
          share images send the code to our server; URLs may also be processed
          by hosting, analytics and preview services.
        </p>
      </Section>
      <Section title="Analytics and hosting">
        <p>
          We integrate Vercel Web Analytics to understand visits and page usage.
          Vercel describes it as cookie-free analytics, using request
          information to report page views, referrers, device/browser
          characteristics and approximate location. See{" "}
          <a href="https://vercel.com/docs/analytics/privacy-policy">
            Vercel’s analytics privacy documentation
          </a>
          . Google Analytics is not currently configured in this site.
        </p>
        <p>
          Hosting and service providers process requests, including IP
          addresses, URLs, timestamps and device/request information, to deliver
          pages, secure the service and diagnose errors. Provider logs and
          analytics retention depend on service configuration; this policy does
          not promise that all server data disappears when you clear your
          browser.
        </p>
      </Section>
      <Section title="Google advertising and cookies">
        <p>
          99OVR integrates Google AdSense on its landing and guide pages. When
          Google advertising services load, Google and advertising partners may
          use cookies, web beacons, IP addresses and other identifiers to
          deliver and measure ads, prevent fraud and, depending on consent and
          settings, personalize advertising. Your browser can send Google the
          page URL and IP address even without clicking an ad.
        </p>
        <p>
          See{" "}
          <a href="https://policies.google.com/technologies/partner-sites">
            how Google uses information from partner sites
          </a>{" "}
          and{" "}
          <a href="https://policies.google.com/privacy">
            Google’s privacy policy
          </a>
          . Where a consent message is provided, use its choices to manage
          consent. Advertising behavior also depends on your browser and Google
          account settings.
        </p>
      </Section>
      <Section title="Your choices and requests">
        <p>
          You can skip leaderboard submission and avoid sharing build links.
          Clearing this site’s browser data removes local progress and
          preferences; it does not delete already submitted leaderboard entries
          or third-party records. Your browser can block or clear cookies.{" "}
          <a href="https://adssettings.google.com/">Google’s ad settings</a> let
          you control personalization; opting out of personalization does not
          stop all advertising-related processing.
        </p>
        <p>
          For questions or a data request, email{" "}
          <a href="mailto:sameer@sameerstuidos.com">sameer@sameerstuidos.com</a>
          . Identify the relevant initials, date or shared link without sending
          sensitive information. Because the game has no accounts, identifying a
          specific record may require more context. Contact emails and
          information you include are used to handle your request.
        </p>
      </Section>
      <p>
        We may update this policy as the service changes.{" "}
        <Link href="/contact">Contact the publisher</Link> with questions about
        the current policy.
      </p>
    </Article>
  );
}
