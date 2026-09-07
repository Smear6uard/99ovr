import Link from "@/components/SiteLink";
import { DONATE_URL } from "@/config/ads";
import { SfxToggle } from "@/components/SfxToggle";
export function Footer() {
  return (
    <footer className="mt-12 border-t border-line py-6 text-[12px] leading-relaxed text-dim">
      <nav
        aria-label="Play and learn"
        className="grid grid-cols-2 gap-x-4 gap-y-3"
      >
        {[
          ["/daily", "Daily"],
          ["/play", "Classic"],
          ["/budget", "Budget"],
          ["/h2h", "Head to Head"],
          ["/how-to-play", "How to play"],
          ["/scoring", "Ratings & scoring"],
          ["/modes", "Compare modes"],
          ["/about", "About"],
          ["/about#faq", "FAQ"],
          ["/privacy", "Privacy"],
          ["/terms", "Terms"],
          ["/contact", "Contact"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="underline underline-offset-4 hover:text-paper"
          >
            {label}
          </Link>
        ))}
      </nav>
      <p className="mt-6">
        Published by Sameer Studios LLC. 99OVR is a fan-made game, not
        affiliated with or endorsed by the NBA, any team or any player. Names
        are used in a fantasy context. No logos or likenesses are used.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <SfxToggle />
        {DONATE_URL ? <a href={DONATE_URL}>Keep the servers alive</a> : null}
      </div>
    </footer>
  );
}
