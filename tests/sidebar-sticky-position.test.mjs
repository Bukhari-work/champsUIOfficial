import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getStickySidebarTop } from "../src/components/content-page/SidebarStickyPosition.ts";
const read = (name) =>
  readFileSync(
    new URL(
      name === "ContentLayout.astro"
        ? "../src/layouts/ContentLayout.astro"
        : `../src/components/content-page/${name}`,
      import.meta.url,
    ),
    "utf8",
  );
const fittingCard = {
  viewportHeight: 768,
  top: 112,
  cardHeight: 640,
  bottomGap: 16,
  headerBottom: 88,
};

test("short reference cards stick below the header, while tall ones pin their bottom without clipping actions", () => {
  assert.equal(getStickySidebarTop(fittingCard), 112);
  assert.equal(getStickySidebarTop({ ...fittingCard, cardHeight: 641 }), 111);
  assert.equal(getStickySidebarTop({ ...fittingCard, cardHeight: 752 }), 0);
  assert.equal(getStickySidebarTop({ ...fittingCard, cardHeight: 800 }), -48);
  assert.equal(
    getStickySidebarTop({ ...fittingCard, viewportHeight: 400 }),
    -256,
  );
});

test("sticky rejects mobile CSS insets, obstructed headers and invalid geometry", () => {
  for (const change of [
    { headerBottom: 97 },
    { viewportHeight: 100 },
    { cardHeight: 0 },
    { bottomGap: -1 },
  ])
    assert.equal(
      getStickySidebarTop({ ...fittingCard, ...change }),
      undefined,
    );
  for (const field of Object.keys(fittingCard))
    for (const value of [NaN, Infinity, -Infinity])
      assert.equal(
        getStickySidebarTop({ ...fittingCard, [field]: value }),
        undefined,
      );
});

test("sticky uses native CSS with resize/print/lifecycle handling, not scroll interception", () => {
  const frame = read("ContentLayout.astro");
  const script = read("SidebarSticky.client.ts");
  assert.match(
    frame,
    /lg:top-28 lg:data-(?:\[sticky-ready\]|sticky-ready):sticky print:static!/,
  );
  assert.ok(frame.indexOf("<sidebar-sticky") < frame.indexOf("<article"));
  assert.ok(frame.indexOf("</article>") < frame.indexOf("data-detail-ending"));
  for (const token of [
    "ResizeObserver",
    "astro:page-load",
    "disconnectedCallback",
    "observer?.disconnect()",
    "controller?.abort()",
    'matchMedia("print")',
    'style.removeProperty("top")',
    "getStickySidebarTop",
  ])
    assert.ok(script.includes(token), token);
  assert.doesNotMatch(
    script,
    /searchParams|location\.|layout|mode|addEventListener\("scroll"|scrollTo|overflow|transform|localStorage|sessionStorage|document\.cookie/,
  );
});
