import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("What We Do and Events render featured records through the same component", () => {
  for (const file of [
    "src/components/directories/what-we-do/FeaturedStory.astro",
    "src/components/directories/events/EventsListing.astro",
  ]) {
    const source = read(file);
    assert.match(
      source,
      /import FeaturedContent from "@\/components\/directories\/FeaturedContent.astro";/,
    );
    assert.equal((source.match(/<FeaturedContent\b/g) ?? []).length, 1);
    assert.doesNotMatch(source, /<ContentPhoto\b|<Button\b/);
    assert.doesNotMatch(source, /\bpresentation=/);
  }
});

test("featured wrappers preserve their hierarchy, selection boundary, and optional event information", () => {
  const story = read(
    "src/components/directories/what-we-do/FeaturedStory.astro",
  );
  assert.match(story, /headingLevel="h4"/);
  assert.match(story, /data-story-feature/);
  assert.match(story, /data-expertise-empty/);
  const event = read("src/components/directories/events/EventsListing.astro");
  assert.match(event, /headingLevel="h3"/);
  assert.match(event, /selectFeaturedEvent\(past, work, lang\)/);
  assert.match(event, /items: featured\.data\.topics\[lang\]\.slice\(0, 3\)/);
  assert.match(event, /value: featured\.data\.partner\[lang\]/);
});

test("shared featured layout is presentation-only and guards optional content", () => {
  const source = read("src/components/directories/FeaturedContent.astro");
  assert.match(source, /aria-labelledby=\{headingId\}/);
  assert.match(source, /themes && themes\.items\.length > 0/);
  assert.match(source, /partner\?\.value/);
  assert.match(source, /action\?\.href/);
  assert.match(
    source,
    /bg-primary-soft grid min-w-0 overflow-hidden rounded-2xl border/,
  );
  assert.match(source, /image && "lg:grid-cols-2"/);
  assert.doesNotMatch(
    source,
    /\bpresentation\b|\bpanel\b|data-featured-presentation|lg:col-span/,
  );
  assert.doesNotMatch(
    source,
    /contentCatalog|getActivities|getEvents|selectFeatured|<script|<style|client:/,
  );
});
