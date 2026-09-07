import Link from "@/components/SiteLink";
export default function NotFound() {
  return (
    <section className="publisher-content py-8">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>
        This page or build link does not exist, or its code cannot be read.
        Check the full link and try again.
      </p>
      <p>
        <Link href="/">Choose a game</Link> ·{" "}
        <Link href="/how-to-play">How to play</Link> ·{" "}
        <Link href="/contact">Report a broken link</Link>
      </p>
    </section>
  );
}
