import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";
const root = new URL("../src/components/content-page/", import.meta.url);
const rendererPaths = {
  "ContentLayout.astro": "../src/layouts/ContentLayout.astro",
  "StoryPage.astro": "../src/pages/[...lang]/what-we-do/[single].astro",
  "EventDetail.astro": "../src/pages/[...lang]/events/[single].astro",
};
const read = (name) =>
  readFileSync(
    rendererPaths[name]
      ? new URL(rendererPaths[name], import.meta.url)
      : new URL(name, root),
    "utf8",
  );

test("retired layout, sidebar and motion comparisons are removed, not just hidden", () => {
  for (const file of [
    "LayoutOptions.astro",
    "LayoutPreviewCard.astro",
    "layout-preview-links.ts",
    "layout-variants.ts",
    "detail-layout-classes.ts",
    "reference-styles.ts",
    "reference-motion-options.ts",
    "reader-layout-classes.ts",
    "companion-layout-classes.ts",
    "layout-preview-switch.ts",
    "DetailContents.astro",
    "DetailOpening.astro",
    "HeaderOptions.astro",
    "header-variants.ts",
    "header-preview-switch.ts",
  ])
    assert.equal(existsSync(new URL(file, root)), false, file);
  function check(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
      if (entry.isDirectory()) check(path);
      else if (/\.(astro|ts)$/.test(entry.name))
        assert.doesNotMatch(
          readFileSync(path, "utf8"),
          /data-detail-layout|data-reference-style|data-layout-option|data-reference-motion-option|layout-variants|reference-styles|layout-preview-links|reference-motion-options/,
          entry.name,
        );
    }
  }
  check(root);
  check(new URL("../src/components/previews/details/", import.meta.url));
  check(new URL("../src/components/directories/", import.meta.url));
});

test("one explicit continuous-column tree preserves mobile order and independent gallery", () => {
  const frame = read("ContentLayout.astro");
  for (const slot of [
    "metadata",
    "status",
    "reference",
    "contents",
    "gallery",
    "ending",
  ])
    assert.ok(frame.includes(`"${slot}"`));
  assert.match(frame, /lg:row-span-2/);
  assert.match(frame, /lg:col-start-9/);
  assert.match(frame, /<sidebar-sticky/);
  assert.match(frame, /SidebarSticky\.client/);
  assert.doesNotMatch(frame, /ContentSidebar/);
  assert.match(frame, /reference\?\.trim\(\)/);
  assert.match(frame, /gallery\?\.trim\(\)/);
  assert.doesNotMatch(
    frame,
    /is:inline|searchParams|dataset\.|anchored|unified|data-astro-rerun/,
  );
  assert.ok(
    frame.indexOf("data-detail-introduction") <
      frame.indexOf("data-detail-reference"),
  );
  assert.ok(
    frame.indexOf("data-detail-reference") < frame.indexOf("data-detail-body"),
  );
  assert.ok(
    frame.indexOf("data-detail-body") < frame.indexOf("data-detail-gallery"),
  );
  assert.equal((frame.match(/<ContentHeader\b/g) ?? []).length, 1);
  const header = read("ContentHeader.astro");
  assert.equal((header.match(/<header\b/g) ?? []).length, 1);
  assert.equal((header.match(/<h1\b/g) ?? []).length, 1);
  assert.doesNotMatch(header, /ContentPhoto|line-clamp|h-screen|min-h-screen/);
});

test("the reference card supports leading event facts and an optional action without a reorder script", () => {
  const card = read("SidebarCard.astro");
  assert.match(card, /action\?\.trim\(\)/);
  assert.match(card, /border-t-4/);
  assert.match(card, /border-t-primary/);
  assert.match(card, /bg-primary-soft rounded-xl p-4/);
  assert.equal((card.match(/data-reference-action/g) ?? []).length, 1);
  assert.equal((card.match(/data-reference-facts/g) ?? []).length, 1);
  assert.match(card, /facts\?\.trim\(\)/);
  assert.ok(
    card.indexOf("data-reference-facts") <
      card.indexOf("data-reference-action"),
  );
  assert.doesNotMatch(card, /<script|<style|group-data|\border-/);
  assert.match(read("EventDetail.astro"), /<EventSidebar/);
  assert.doesNotMatch(read("StoryPage.astro"), /slot="action"/);
  const sidebar = readFileSync(
    new URL(
      "../src/components/content-page/events/EventSidebar.astro",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(sidebar, /<SidebarCard/);
  assert.match(sidebar, /data-event-facts/);
  assert.match(sidebar, /slot="heading"/);
  assert.match(sidebar, /slot="facts"/);
  assert.match(sidebar, /actionClass="border-t pt-5"/);
  assert.match(read("StoryPage.astro"), /<StorySidebar/);
});

test("retired detail comparison routes and menus are absent", () => {
  for (const path of [
    "../src/pages/[...lang]/page-comparison/index.astro",
    "../src/components/previews/details/DetailPreviewMenu.astro",
  ]) assert.equal(existsSync(new URL(path, import.meta.url)), false, path);
});
