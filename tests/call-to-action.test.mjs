import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("existing page and story CTAs use the shared component", () => {
  for (const file of [
    "src/components/home/sections/Collaboration.astro",
    "src/components/directories/what-we-do/ExpertiseTabs.astro",
    "src/components/directories/events/EventsListing.astro",
    "src/pages/[...lang]/what-we-do/[single].astro",
  ]) {
    const source = read(file);
    assert.match(
      source,
      /import CallToAction from "@\/components\/shared\/CallToAction.astro";/,
      file,
    );
    assert.equal((source.match(/<CallToAction\b/g) ?? []).length, 1, file);
    assert.doesNotMatch(
      source,
      /<section\b[^>]*aria-labelledby="(?:collaboration-title|story-next)"/s,
      file,
    );
  }
});

test("shared CTA preserves page-specific heading hierarchy, numbering, and compact story treatment", () => {
  assert.match(
    read("src/components/home/sections/Collaboration.astro"),
    /number="05"/,
  );
  assert.match(
    read("src/components/directories/what-we-do/ExpertiseTabs.astro"),
    /headingLevel="h3"/,
  );
  assert.match(
    read("src/pages/[...lang]/what-we-do/[single].astro"),
    /size="compact"/,
  );
  const component = read("src/components/shared/CallToAction.astro");
  assert.match(component, /aria-labelledby=\{headingId\}/);
  assert.match(component, /<Heading\s+id=\{headingId\}/);
  assert.match(component, /bg-primary-soft border-t-primary/);
  assert.equal((component.match(/<Button\b/g) ?? []).length, 1);
  assert.doesNotMatch(component, /<script|<style|client:/);
});
