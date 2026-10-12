import { describe, expect, it } from "vitest";
import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DECADE_GUIDES } from "@/content/decades";
import { decadePool, WHEEL_LANDINGS } from "@/content/rosters";
import { DECADE_BUCKETS } from "@/data/eras/decades";
import { BUCKETS } from "@/data/eras";
import { LIBRARY, LIBRARY_PATHS } from "@/content/library";
import { POS_DECADES } from "@/data/positions";

const words = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

describe("decade guides", () => {
  it("cover every positional decade, oldest first", () => {
    expect(DECADE_GUIDES.map((guide) => guide.decade)).toEqual([...POS_DECADES]);
    for (const guide of DECADE_GUIDES) expect(guide.slug).toBe(`${guide.decade}s`);
  });

  it.each(DECADE_GUIDES.map((guide) => [guide.slug, guide] as const))(
    "%s is a complete, original essay",
    (_slug, guide) => {
      expect(guide.intro).not.toBe("Placeholder.");
      expect(guide.metaTitle.length).toBeLessThanOrEqual(60);
      expect(guide.description.length).toBeGreaterThanOrEqual(110);
      expect(guide.description.length).toBeLessThanOrEqual(170);
      expect(guide.summary).not.toBe(guide.intro);
      expect(guide.sections.length).toBeGreaterThanOrEqual(4);
      expect(guide.sections.length).toBeLessThanOrEqual(6);
      expect(guide.draftTips.length).toBeGreaterThanOrEqual(3);
      expect(new Set(guide.sections.map((section) => section.id)).size).toBe(guide.sections.length);

      const essay = renderToStaticMarkup(
        createElement(
          Fragment,
          null,
          ...guide.sections.map((section) => section.body),
          ...guide.draftTips.map((tip) => tip.body),
        ),
      );
      expect(words(essay)).toBeGreaterThanOrEqual(700);
      // Internal links go through the document-navigation link, never "#" or external ad bait.
      expect(essay).not.toContain('href="#"');
    },
  );

  it("only points readers at players who are actually in that decade's pool", () => {
    for (const guide of DECADE_GUIDES) {
      const names = new Set(decadePool(guide.decade).map((player) => player.name));
      for (const player of guide.watchFor) expect(names, `${guide.slug}: ${player.name}`).toContain(player.name);
    }
  });
});

describe("roster views", () => {
  it("never expose hidden ratings", () => {
    for (const guide of DECADE_GUIDES)
      for (const player of decadePool(guide.decade)) expect(Object.keys(player)).not.toContain("r");
    for (const landing of WHEEL_LANDINGS)
      for (const era of landing.eras)
        for (const player of era.headliners) expect(Object.keys(player)).not.toContain("r");
  });

  it("list every wheel landing once and every authored era inside one", () => {
    expect(WHEEL_LANDINGS).toHaveLength(DECADE_BUCKETS.length);
    expect(WHEEL_LANDINGS.flatMap((landing) => landing.eras).length).toBe(BUCKETS.length);
  });
});

describe("library", () => {
  it("has unique paths and summaries", () => {
    expect(new Set(LIBRARY_PATHS).size).toBe(LIBRARY_PATHS.length);
    const summaries = LIBRARY.flatMap((shelf) => shelf.entries.map((entry) => entry.summary));
    expect(new Set(summaries).size).toBe(summaries.length);
  });
});
