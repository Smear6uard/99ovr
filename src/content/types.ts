import type { ReactNode } from "react";

export type GuideSection = { id: string; title: string; body: ReactNode };

/**
 * One decade field guide. The essay is hand-written editorial; the roster
 * listings on the page are rendered from the game data, so the prose should
 * add context the data cannot (how the decade played, what that means for
 * each skill, how to draft from it). Never print hidden numeric ratings.
 */
export type DecadeGuide = {
  decade: number;
  slug: string;
  /** Page H1, e.g. "The 1960s: set shots, giants and a Boston dynasty". */
  title: string;
  /** Document title, under 60 characters before the " · 99OVR" suffix. */
  metaTitle: string;
  /** Meta description, roughly 130–160 characters. */
  description: string;
  /** Opening paragraph under the H1. */
  intro: string;
  /** One or two sentences for the /decades hub card, worded differently from `intro`. */
  summary: string;
  /** The essay: four to six sections. */
  sections: GuideSection[];
  /** Decade-specific drafting advice for 99OVR. */
  draftTips: { title: string; body: ReactNode }[];
  /** Players from this decade's positional pool worth knowing; names must match the pool exactly. */
  watchFor: { name: string; why: string }[];
};
