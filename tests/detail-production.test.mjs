import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import test from "node:test";
import { eventDetailCopy } from "../src/components/content-page/events/EventDetailCopy.ts";
const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("production detail components do not import previews or contain fictional sample branches", () => {
  const inspect = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
      if (entry.isDirectory()) inspect(path);
      else if (/\.(astro|ts)$/.test(entry.name))
        assert.doesNotMatch(
          readFileSync(path, "utf8"),
          /components\/previews|\.\/preview|page-comparison|previewCopy|demoFee|demoAccess|getDemoEvent|getPublicationSample|sample-research/,
          path.pathname,
        );
    }
  };
  inspect(new URL("src/components/shared/", root));
  inspect(new URL("src/components/content-page/", root));
  assert.doesNotMatch(
    read("src/layouts/ContentLayout.astro"),
    /components\/previews|page-comparison|demo-/,
  );
  assert.doesNotMatch(
    read("src/pages/[...lang]/what-we-do/[single].astro"),
    /components\/previews|page-comparison|fixtures/,
  );
  assert.deepEqual(
    Object.keys(eventDetailCopy.en),
    Object.keys(eventDetailCopy.id),
  );
});

test("superseded production renderers and their unused layout configuration are removed", () => {
  for (const path of [
    "events/EventPage.astro",
    "events/EventOverview.astro",
    "events/EventSectionLinks.astro",
    "events/EventAudience.astro",
    "events/event-header/EventIntro.astro",
    "events/event-header/EventFacts.astro",
    "events/event-header/styles.ts",
    "shared/detail-layouts.ts",
    "shared/PhotoGrid.astro",
  ])
    assert.equal(
      existsSync(new URL("src/components/" + path, root)),
      false,
      path,
    );
});

test("live routes compose the shared layout and content body without comparison menus", () => {
  const story = read("src/pages/[...lang]/what-we-do/[single].astro");
  const event = read("src/pages/[...lang]/events/[single].astro");
  for (const source of [story, event]) {
    assert.match(source, /<ContentLayout\b/);
    assert.match(source, /<ContentBody\b/);
    assert.doesNotMatch(
      source,
      /components\/previews|DetailPreviewMenu|page-comparison/,
    );
    assert.match(source, /canonical/);
  }
  assert.match(story, /<StorySidebar/);
  assert.match(event, /<EventSidebar/);
  assert.match(story, /filter\(\(item\) => !item.event\)/);
  assert.match(event, /!event.data.listingOnly/);
});

test("live invitations and recaps are resolved from the writer's content plan", () => {
  const route = read("src/pages/[...lang]/events/[single].astro");
  assert.match(route, /const plan = event\.data\.content/);
  assert.match(route, /plan\.mode === "article"/);
  assert.match(route, /getEventDocuments\(event, sections\.map\(\(\{ id \}\) => id\), lang\)/);
  assert.match(route, /documents\.invitation\?\.data/);
  const sections = read("src/components/content-page/ContentBody.astro");
  assert.match(sections, /sourceLang !== lang/);
  assert.match(sections, /documents\[section\.id\]/);
  assert.doesNotMatch(sections, /BodySections|ContentSection/);
});

test("production registration retains server lifecycle/deadline checks and client expiry cleanup", () => {
  const event = read("src/components/content-page/events/EventSidebar.astro");
  const registration = read(
    "src/components/content-page/events/EventRegistration.astro",
  );
  assert.match(
    event,
    /upcoming && data\.registration &&[\s\S]*closesAt\) > new Date\(\)/,
  );
  assert.match(event, /<EventRegistration \{registration\}/);
  assert.match(event, /registration && <div>/);
  assert.match(registration, /remaining <= 0/);
  assert.match(registration, /clearTimeout\(this.timer\)/);
  assert.match(registration, /disconnectedCallback/);
});

test("related reading uses supplied story links without rewriting destinations", () => {
  const related = read("src/components/content-page/RelatedReading.astro");
  assert.match(related, /<ContentCard \{item\}/);
  assert.doesNotMatch(
    related,
    /page-comparison|detailPreviewPath|getLocalizedPath|href:/,
  );
  const story = read("src/pages/[...lang]/what-we-do/[single].astro");
  assert.match(story, /<RelatedReading items=\{related\}/);
});
