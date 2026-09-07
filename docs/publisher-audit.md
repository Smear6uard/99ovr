# Publisher content audit — 2026-09-06

## Before changes
- Next.js 15 App Router; static server pages wrap React client gameplay. Daily returns only a hydration placeholder; Play/Budget contain setup UI but no persistent guide.
- Permanent routes: /, /about, /daily, /play (Classic), /budget, /h2h. Shared /b/[code] and /h2h/[code] validate codes and call notFound but lack noindex. Image APIs /api/og and /api/card; leaderboard GET/POST /api/leaderboard. No separate classic route.
- Metadata API, apex canonical origin, permissive robots, six-entry sitemap; no host redirect, custom 404, legal/contact pages or JSON-LD.
- Global AdSense loader + verification meta, real publisher ID matching ads.txt. Three unconfigured manual units reserve large blank spaces in selection, results and gauntlet logs. Dashboard Auto Ads and consent settings cannot be inspected here.
- Vercel Analytics mounted globally; GA4 ID empty. Local storage holds Daily record/streak, personal best, initials and sound preference; no application cookie/session storage implementation found.
- Optional Vercel KV/Upstash leaderboard: public initials, OVR and rounds won; submitted build is replayed server-side. Raw IP in rate-limit keys, IP/build-derived member fingerprint. Keys expire three days after writes (expiration is refreshed). No account system. Share code encodes replayable gameplay state.
- No public email, publisher biography or legal identity found in source/config/docs. Do not infer these from a local username or Git author.
- Current OVR cap is 97, not 99. Best Player uses team + decade reels; current positional runs use a position/decade pool and one decade re-spin. Earlier About wording misses this distinction and overstates anti-cheat guarantees.

## Scope
Add visible server content and a small guide library; retain game formulas, ratings, pools, seeded replay and controls. Keep FAQ within About with an anchor. Remove gameplay ad calls and load the existing publisher integration only on substantive editorial/landing pages. Keep errors, legal pages and ephemeral pages outside ad loading. Canonicalize apex to www (live hosting already uses www) and /classic to /play; allow crawling noindex URLs.

## External follow-up
Owner supplied Sameer Studios LLC and sameer@sameerstudios.com; verify mailbox delivery and hosting/provider retention and CMP/consent deployment. Configure Auto Ads exclusions for /daily, /play, /classic, /budget, /h2h and descendants, /b and descendants, /api and descendants, /privacy, /terms, /contact and error pages; disable anchor/vignette formats that interfere with navigation. The repository does not change AdSense dashboard settings. Verify live deployment and both ads.txt hosts; submit sitemap and request AdSense review only after these checks. Approval remains Google's decision.

## Live host check
The existing Vercel deployment redirects apex to www (308). www /ads.txt responds 200 with the configured publisher ID. Canonical metadata, sitemap and robots now use www to match hosting and avoid a redirect loop.
