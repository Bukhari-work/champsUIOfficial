import assert from "node:assert/strict";
import test from "node:test";
import { selectFeaturedStory } from "../src/lib/featuredStory.ts";

test("an empty expertise area has no invented featured story", () => {
  assert.equal(selectFeaturedStory([]), undefined);
});

test("the latest recorded activity is featured without mutating the directory", () => {
  const unknown = { slug: "unknown", sortDate: 0 };
  const old = { slug: "old", sortDate: 100 };
  const recent = { slug: "recent", sortDate: 200 };
  const items = [unknown, recent, old];
  assert.equal(selectFeaturedStory(items), recent);
  assert.deepEqual(items, [unknown, recent, old]);
});

test("ties use a stable slug, not translated titles or incoming order", () => {
  const a = { slug: "a", sortDate: 100, title: "Z" };
  const b = { slug: "b", sortDate: 100, title: "A" };
  assert.equal(selectFeaturedStory([b, a]), a);
  assert.equal(selectFeaturedStory([a, b]), a);
});

test("a single record is still a valid feature", () => {
  const item = { slug: "only", sortDate: 0 };
  assert.equal(selectFeaturedStory([item]), item);
});
