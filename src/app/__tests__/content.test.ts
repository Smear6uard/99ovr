import { beforeAll, describe, expect, it } from "vitest";
import { request } from "node:http";
import { JSDOM } from "jsdom";
import { encodeSteal } from "@/lib/encode";
import { DECADE_POOL, bucketIndexAt } from "@/lib/wheel";
import { simulateSteals } from "@/lib/steal";
import type { StealBuild } from "@/lib/types";

const base = process.env.CONTENT_TEST_BASE_URL;
const paths = [
  "/",
  "/about",
  "/how-to-play",
  "/scoring",
  "/modes",
  "/daily",
  "/play",
  "/budget",
  "/h2h",
  "/privacy",
  "/terms",
  "/contact",
];
const adPages = new Set(["/", "/about", "/how-to-play", "/scoring", "/modes"]);
const pages = new Map<string, Document>();

describe.skipIf(!base)("production HTML without JavaScript", () => {
  beforeAll(async () => {
    for (const path of paths) {
      const response = await fetch(`${base}${path}`);
      expect(response.status, path).toBe(200);
      pages.set(path, new JSDOM(await response.text()).window.document);
    }
  }, 30000);

  it.each(paths)(
    "%s has readable content, one H1 and unique metadata",
    (path) => {
      const doc = pages.get(path)!;
      expect(doc.querySelectorAll("h1").length).toBe(1);
      expect(doc.querySelector("main")?.textContent?.length).toBeGreaterThan(
        500,
      );
      expect(
        doc.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ).toBe(`https://www.99ovr.app${path === "/" ? "" : path}`);
      expect(
        doc.querySelector('meta[name="description"]')?.getAttribute("content")
          ?.length,
      ).toBeGreaterThan(40);
      expect(doc.querySelector('meta[property="og:title"]')).not.toBeNull();
      expect(
        doc.querySelector('meta[property="og:description"]'),
      ).not.toBeNull();
      expect(
        doc.querySelector('meta[property="og:url"]')?.getAttribute("content"),
      ).toBe(`https://www.99ovr.app${path === "/" ? "" : path}`);
      expect(
        doc.querySelector('meta[name="robots"][content*="noindex"]'),
      ).toBeNull();
      if (!adPages.has(path))
        expect(doc.documentElement.outerHTML).not.toContain(
          "pagead2.googlesyndication.com",
        );
    },
  );

  it("uses distinct titles and valid JSON-LD, with no broken internal navigation", async () => {
    expect(new Set([...pages.values()].map((doc) => doc.title)).size).toBe(
      paths.length,
    );
    const checked = new Set<string>();
    for (const doc of pages.values()) {
      for (const script of doc.querySelectorAll(
        'script[type="application/ld+json"]',
      ))
        expect(JSON.parse(script.textContent!)["@context"]).toBe(
          "https://schema.org",
        );
      for (const a of doc.querySelectorAll('a[href^="/"]')) {
        const href = a.getAttribute("href")!;
        if (checked.has(href)) continue;
        checked.add(href);
        const url = new URL(href, base);
        const target = pages.get(url.pathname);
        if (target) {
          if (url.hash)
            expect(
              target.getElementById(url.hash.slice(1)),
              href,
            ).not.toBeNull();
        } else expect((await fetch(url)).status, href).toBe(200);
      }
      expect(doc.querySelector('a[href="#"]')).toBeNull();
    }
  });

  it("sitemaps only canonical public pages and lets crawlers see noindex", async () => {
    const xml = await (await fetch(`${base}/sitemap.xml`)).text();
    const doc = new JSDOM(xml, { contentType: "text/xml" }).window.document;
    expect(
      [...doc.querySelectorAll("loc")].map((el) => el.textContent).sort(),
    ).toEqual(
      paths.map((p) => `https://www.99ovr.app${p === "/" ? "" : p}`).sort(),
    );
    expect(doc.querySelector("lastmod")).toBeNull();
    const robots = await (await fetch(`${base}/robots.txt`)).text();
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Sitemap: https://www.99ovr.app/sitemap.xml");
    expect(robots).not.toContain("Disallow:");
    const ads = await fetch(`${base}/ads.txt`);
    expect(ads.status).toBe(200);
    expect((await ads.text()).trim()).toBe(
      "google.com, pub-9476228948751191, DIRECT, f08c47fec0942fa0",
    );
  });

  it("returns real 404s and redirects aliases", async () => {
    for (const path of ["/not-a-real-page", "/b/invalid", "/h2h/invalid"]) {
      const response = await fetch(`${base}${path}`);
      expect(response.status, path).toBe(404);
      const html = await response.text();
      expect(html).toContain("Page not found");
      expect(html).not.toContain("pagead2.googlesyndication.com");
    }
    const classic = await fetch(`${base}/classic`, { redirect: "manual" });
    expect(classic.status).toBe(308);
    expect(classic.headers.get("location")).toBe("/play");
    // Node fetch normalizes Host; use an HTTP request to exercise the host rule.
    const www = await new Promise<{
      status: number | undefined;
      location: string | undefined;
    }>((resolve, reject) => {
      request(
        `${base}/scoring`,
        { headers: { host: "99ovr.app" } },
        (response) => {
          resolve({
            status: response.statusCode,
            location: response.headers.location,
          });
          response.resume();
        },
      )
        .on("error", reject)
        .end();
    });
    expect(www.status).toBe(308);
    expect(www.location).toBe("https://www.99ovr.app/scoring");
  });

  it("noindexes valid shared runs, query variants and APIs without ads", async () => {
    const seed = 0xc0ffee;
    const taken = new Set<string>();
    const steals: Array<[number, number]> = Array.from(
      { length: 6 },
      (_, round) => {
        const bucket = bucketIndexAt(seed, round, 0, 0, DECADE_POOL);
        const index = DECADE_POOL.buckets[bucket].players.findIndex(
          (p) => !taken.has(p.person),
        );
        taken.add(DECADE_POOL.buckets[bucket].players[index].person);
        return [bucket, index];
      },
    );
    const build: StealBuild = {
      v: 6,
      mode: "classic",
      seed,
      steals,
      flaw: -1,
      target: "ALL",
      attempt: 0,
      daily: 0,
      knowledge: false,
    };
    expect(simulateSteals(build)).not.toBeNull();
    const code = encodeSteal(build);
    for (const path of [`/b/${code}`, `/h2h/${code}`]) {
      const response = await fetch(`${base}${path}`);
      expect(response.status).toBe(200);
      expect(response.headers.get("x-robots-tag")).toBe("noindex, follow");
      const doc = new JSDOM(await response.text()).window.document;
      expect(
        doc.querySelector('meta[name="robots"]')?.getAttribute("content"),
      ).toContain("noindex");
      expect(doc.documentElement.outerHTML).not.toContain(
        "pagead2.googlesyndication.com",
      );
    }
    for (const path of [
      "/daily?source=share",
      "/api/leaderboard",
      "/api/og",
      "/api/card?b=invalid",
    ]) {
      expect((await fetch(`${base}${path}`)).headers.get("x-robots-tag")).toBe(
        "noindex, follow",
      );
    }
  }, 30000);
});
