"use client";
import Link from "@/components/SiteLink";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="publisher-content py-8">
      <h1>That page could not load</h1>
      <p>Try again or return to the game launcher.</p>
      <button
        type="button"
        className="rounded border border-gold px-4 py-2 text-gold"
        onClick={reset}
      >
        Try again
      </button>
      <p>
        <Link href="/">Back to 99OVR</Link>
      </p>
    </section>
  );
}
