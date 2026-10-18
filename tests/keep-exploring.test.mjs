import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { contentCopy } from "../src/i18n/content.ts";

test("shared exploration labels are available in both languages", () => {
  for (const lang of ["en", "id"]) {
    for (const key of [
      "keepExploring",
      "exploreExpertise",
      "expertiseLinkIntro",
      "exploreEvents",
      "eventsLinkIntro",
      "archiveLinkIntro",
    ])
      assert.ok(contentCopy[lang][key].trim(), `${lang}: ${key}`);
  }
});

test("Events and What We Do share the exploration component", () => {
  for (const file of [
    "src/pages/[...lang]/what-we-do/index.astro",
    "src/components/directories/events/EventsListing.astro",
  ]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(
      source,
      /import KeepExploring from "@\/components\/directories\/KeepExploring.astro";/,
    );
    assert.equal((source.match(/<KeepExploring\b/g) ?? []).length, 1);
    assert.match(source, /getLocalizedPath\("\/what-we-do\/archive", lang\)/);
  }
});
