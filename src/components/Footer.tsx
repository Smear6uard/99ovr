import Link from "@/components/SiteLink";
import { DONATE_URL } from "@/config/ads";
import { SfxToggle } from "@/components/SfxToggle";
import { DECADES, REFERENCE, STRATEGY } from "@/content/library";

const GROUPS: { title: string; links: [href: string, label: string][] }[] = [
  {
    title: "Play",
    links: [
      ["/daily", "Daily"],
      ["/play", "Classic"],
      ["/budget", "Budget"],
      ["/h2h", "Head to Head"],
    ],
  },
  {
    title: "Learn",
    links: [
      ["/how-to-play", "How to play"],
      ["/modes", "Compare modes"],
      ["/scoring", "Ratings & scoring"],
      ...STRATEGY.map((entry): [string, string] => [entry.href, entry.title]),
    ],
  },
  {
    title: "Reference",
    links: [
      ["/guides", "All guides"],
      ...REFERENCE.map((entry): [string, string] => [entry.href, entry.title]),
      ["/decades", "Decade guides"],
      ...DECADES.map((entry): [string, string] => [entry.href, entry.title]),
    ],
  },
  {
    title: "99OVR",
    links: [
      ["/about", "About"],
      ["/about#faq", "FAQ"],
      ["/contact", "Contact"],
      ["/privacy", "Privacy"],
      ["/terms", "Terms"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-line py-6 text-[12px] leading-relaxed text-dim">
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
        {GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/80">{group.title}</p>
            <ul className="mt-2 space-y-2">
              {group.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="underline-offset-4 hover:text-paper hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="mt-6">
        Published by Sameer Studios LLC. 99OVR is a fan-made game, not affiliated with or endorsed by the NBA, any
        team or any player. No logos or likenesses are used.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <SfxToggle />
        {DONATE_URL ? <a href={DONATE_URL}>Keep the servers alive</a> : null}
      </div>
    </footer>
  );
}
