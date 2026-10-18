import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  tableOfContentsCopy,
  getTableOfContentsLinks,
} from "../src/components/content-page/TableOfContents.ts";
const domainPaths = {
  "ContentLayout.astro": "../layouts/ContentLayout.astro",
  "ContentBody.astro": "content-page/ContentBody.astro",
  "BodyTabs.astro": "content-page/BodyTabs.astro",
  "WhatWeDoSlug.astro": "../pages/[...lang]/what-we-do/[single].astro",
  "EventSlug.astro": "../pages/[...lang]/events/[single].astro",
};
const read = (name) =>
  readFileSync(
    new URL(
      "../src/components/" + (domainPaths[name] ?? "content-page/" + name),
      import.meta.url,
    ),
    "utf8",
  );

test("contents links trim and deduplicate without changing supplied headings", () => {
  const source = [
    { slug: " intro ", text: " Introduction " },
    { slug: "intro", text: "Repeated" },
    { slug: "", text: "Empty" },
    { slug: "body", text: " " },
    { slug: "__proto__", text: "Valid id" },
  ];
  const before = structuredClone(source);
  assert.deepEqual(getTableOfContentsLinks(source), [
    { slug: "intro", text: "Introduction" },
    { slug: "__proto__", text: "Valid id" },
  ]);
  assert.deepEqual(source, before);
  assert.deepEqual(getTableOfContentsLinks([]), []);
});

test("one native disclosure distinguishes document contents from current-view contents", () => {
  assert.deepEqual(Object.keys(tableOfContentsCopy.en), Object.keys(tableOfContentsCopy.id));
  for (const lang of ["en", "id"])
    for (const scope of ["page", "view"])
      assert.ok(tableOfContentsCopy[lang][scope].trim());
  assert.equal(tableOfContentsCopy.en.view, "In this view");
  assert.equal(tableOfContentsCopy.en.page, "On this page");
  const component = read("TableOfContents.astro");
  assert.match(component, /substantial && links.length >= 3/);
  assert.match(component, /bg-primary-soft/);
  assert.match(component, /data-contents-scope=\{scope\}/);
  assert.match(component, /encodeURIComponent\(link.slug\)/);
  assert.match(component, /<details/);
  assert.match(component, /aria-label=\{label\}/);
  assert.doesNotMatch(
    component,
    /<script|<style|localStorage|sessionStorage|position:|overflow-y/,
  );
  assert.equal(
    existsSync(
      new URL(
        "../src/components/previews/details/DetailJumpLinks.astro",
        import.meta.url,
      ),
    ),
    false,
  );
  assert.match(read("WhatWeDoSlug.astro"), /import TableOfContents/);
  assert.match(read("BodyTabs.astro"), /import TableOfContents/);
  assert.match(read("BodyTabs.astro"), /scope="view"/);
  assert.doesNotMatch(component, /\bmb-\d/);
});

test("the frame owns an optional contents position before the reading container", () => {
  const frame = read("ContentLayout.astro");
  assert.match(frame, /Astro\.slots\.render\("contents"\)/);
  assert.match(frame, /contents\?\.trim\(\) &&/);
  assert.ok(
    frame.indexOf("data-detail-contents") <
      frame.indexOf("data-detail-reading"),
  );
  assert.match(read("WhatWeDoSlug.astro"), /<TableOfContents\s+slot="contents"/);
  assert.doesNotMatch(read("ContentBody.astro"), /data-table-of-contents/);
});

test("shared tabs own scoped contents before every view's reading content", () => {
  const hub = read("BodyTabs.astro");
  assert.match(hub, /getTableOfContentsLinks\(headings\)/);
  assert.match(hub, /view.links.length >= 3 &&/);
  assert.ok(
    hub.indexOf("data-body-contents") < hub.indexOf("data-body-reading"),
  );
  const event = read("EventSlug.astro");
  assert.doesNotMatch(event, /TableOfContents/);
  assert.match(read("ContentBody.astro"), /<BodyTabs/);
});

test("the sidebar card composes heading, facts, and actions in reading order", () => {
  const card = read("SidebarCard.astro");
  assert.ok(
    card.indexOf('slot name="heading"') <
      card.indexOf("data-reference-facts"),
  );
  assert.ok(
    card.indexOf("data-reference-facts") <
      card.indexOf("data-reference-action"),
  );
  assert.match(card, /factsClass\?: string/);
  assert.doesNotMatch(card, /Astro\.slots\.render\("summary"\)/);
});
