import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { openChaptersDirectory } from "../src/components/directories/DirectoryPresets.ts";

test("open chapters preserves the approved What We Do directory settings", () => {
  assert.deepEqual(openChaptersDirectory, {
    layout: "journey",
    journeyStyle: "open",
    yearShortcuts: true,
    controlsStyle: "toolbar",
    density: "compact",
    cardSize: "small",
    cardColumns: "adaptive",
    responsiveTo: "container",
    paginate: false,
  });
});

test("stories and every past-event directory use the same preset without layout overrides", () => {
  for (const file of [
    "src/components/directories/what-we-do/MoreStories.astro",
    "src/components/directories/events/EventsListing.astro",
  ]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    const directory = source.match(
      /<ContentDirectory\b[^>]*\{\.\.\.openChaptersDirectory\}[^>]*\/>/s,
    )?.[0];
    assert.ok(directory, `Missing shared preset: ${file}`);
    for (const key of Object.keys(openChaptersDirectory)) {
      assert.doesNotMatch(
        directory,
        new RegExp(`\\s${key}=`),
        `${key} overrides preset: ${file}`,
      );
    }
    assert.match(directory, /yearHeadingLevel="h[34]"/);
    assert.match(directory, /cardHeadingLevel="h[45]"/);
  }
});
