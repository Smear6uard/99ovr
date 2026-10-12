import Link from "@/components/SiteLink";
import type { ReactNode } from "react";

export type RelatedLink = { href: string; title: string };

export function Article({
  title,
  intro,
  eyebrow = "Field guide",
  byline = true,
  related,
  children,
}: {
  title: string;
  intro: string;
  eyebrow?: string;
  /** Editorial pages carry the publisher byline; legal/contact pages turn it off. */
  byline?: boolean;
  /** Two to four pages a reader should open next. Defaults to the library index. */
  related?: RelatedLink[];
  children: ReactNode;
}) {
  return (
    <article className="publisher-content mx-auto max-w-2xl pt-5">
      <p className="eyebrow">
        <Link href="/guides" className="!text-dim !no-underline hover:!text-gold">
          Guides
        </Link>{" "}
        / {eyebrow}
      </p>
      <h1>{title}</h1>
      {byline ? <p className="byline">By the 99OVR editorial team at Sameer Studios</p> : null}
      <p className="intro">{intro}</p>
      {children}
      <nav aria-label="Keep reading" className="mt-10 border-t border-line pt-5">
        <p className="eyebrow">Keep reading</p>
        <div className="card-grid">
          {(related ?? []).map((link) => (
            <Link key={link.href} href={link.href}>
              <strong>{link.title}</strong>
            </Link>
          ))}
          <Link href="/guides">
            <strong>All guides</strong>
            <span>Strategy, reference pages and seven decade guides.</span>
          </Link>
        </div>
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
