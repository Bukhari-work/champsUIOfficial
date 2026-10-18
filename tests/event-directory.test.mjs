import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { selectFeaturedEvent } from "../src/lib/eventDirectory.ts";
import { eventsDirectoryCopy } from "../src/components/directories/events/Copy.ts";

const event = (id, period, options = {}) => ({
  id,
  data: { period, status: "completed", ...options },
});
const recap = (id, period, options = {}) =>
  event(id, period, {
    recap: true,
    ...options,
  });
const photo = (event) => ({
  event,
  image: { src: "/existing.webp", alt: "Existing photo" },
});

test("featured event prefers a recap with programme themes and a photo", () => {
  const recent = recap("recent", "2025-07");
  const complete = recap("complete", "2024-10", {
    topics: { en: ["Leadership"], id: ["Kepemimpinan"] },
  });
  const events = [recent, complete];
  for (const lang of ["en", "id"])
    assert.equal(
      selectFeaturedEvent(events, [photo(complete)], lang),
      complete,
    );
  assert.deepEqual(events, [recent, complete]);
});

test("featured event falls back to the newest recap and never invents one", () => {
  const recent = recap("recent", "2025-07");
  const old = recap("old", "2024-10");
  const invitation = event("invitation", "2026-01", {
    invitation: true,
  });
  const cancelled = recap("cancelled", "2026-02", { status: "cancelled" });
  assert.equal(
    selectFeaturedEvent([old, invitation, recent, cancelled], [], "en"),
    recent,
  );
  assert.equal(
    selectFeaturedEvent([invitation, cancelled], [], "en"),
    undefined,
  );
  assert.equal(selectFeaturedEvent([], [], "en"), undefined);
});

test("featured recap ties use stable ids, not input order", () => {
  const a = recap("a", "2025-07");
  const b = recap("b", "2025-07");
  assert.equal(selectFeaturedEvent([b, a], [], "en"), a);
  assert.equal(selectFeaturedEvent([a, b], [], "en"), a);
});

test("approved directory copy is complete in both languages", () => {
  assert.deepEqual(
    Object.keys(eventsDirectoryCopy.en).sort(),
    Object.keys(eventsDirectoryCopy.id).sort(),
  );
  for (const copy of Object.values(eventsDirectoryCopy))
    for (const value of Object.values(copy)) assert.ok(value.trim());
});

test("approved upcoming layout expands only the first event and uses canonical links", () => {
  const source = readFileSync(
    new URL(
      "../src/components/directories/events/UpcomingEvents.astro",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /const featuredEvents = events\.slice\(0, 1\);/);
  assert.match(source, /const remainingEvents = events\.slice\(1\);/);
  assert.match(source, /eventPath\(event, lang\)/);
  assert.doesNotMatch(source, /compactRemainder|eventHref|draftLabel/);
  const listing = readFileSync(
    new URL(
      "../src/components/directories/events/EventsListing.astro",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(
    listing,
    /compactUpcoming|featureRecap|pastDescription|eventHref|draftLabel|hero\?/,
  );
});

test("production event components do not depend on comparison fixtures or preview components", () => {
  const directory = new URL(
    "../src/components/directories/events/",
    import.meta.url,
  );
  function inspect(root) {
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      const path = new URL(entry.name + (entry.isDirectory() ? "/" : ""), root);
      if (entry.isDirectory()) inspect(path);
      else if (/\.(astro|ts)$/.test(entry.name)) {
        const source = readFileSync(path, "utf8");
        assert.doesNotMatch(
          source,
          /(?:from\s+["'][^"']*previews\/|demoEvent|eventsPreviewCopy|eventPreviewPath)/,
          path.pathname,
        );
      }
    }
  }
  inspect(directory);
});

test("More stories omits the removed explanatory footer", () => {
  const source = readFileSync(
    new URL(
      "../src/components/directories/what-we-do/MoreStories.astro",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(source, /periodNote|storyPeriodNote/);
});
