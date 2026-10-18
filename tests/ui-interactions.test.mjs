import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getLinkBehavior } from "../src/lib/linkBehavior.ts";
import { peopleCopy } from "../src/components/people/Copy.ts";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("navigation indicators agree with same-tab and new-tab destinations", () => {
  for (const href of [
    "/events",
    "/id/contact#contactForm",
    "#expertise-research",
    "../events",
    "mailto:champs@ui.ac.id",
    "tel:+6212345",
  ])
    assert.deepEqual(getLinkBehavior(href), {
      target: undefined,
      rel: undefined,
      arrow: "→",
    });
  for (const href of [
    "https://example.org/paper",
    "http://example.org",
    "//example.org/paper",
    "HTTPS://example.org",
  ])
    assert.deepEqual(getLinkBehavior(href), {
      target: "_blank",
      rel: "noopener noreferrer",
      arrow: "↗",
    });
});

test("biographies remain readable without JavaScript and only disclose real overflow", () => {
  const component = read("src/components/people/ProfileBiography.astro");
  assert.match(component, /data-collapsed:max-h-112/);
  assert.match(component, /aria-expanded="true"/);
  assert.match(component, /aria-controls=\{contentId\}/);
  assert.match(component, /data-biography-controls hidden/);
  const script = read("src/components/people/ProfileBiography.client.ts");
  assert.match(script, /content\.scrollHeight > content\.clientHeight \+ 1/);
  assert.match(script, /controls\.hidden = !overflowing/);
  assert.match(script, /disconnectedCallback/);
  assert.match(script, /this\.observer\?\.disconnect\(\)/);
  const page = read("src/pages/[...lang]/about/people/[single].astro");
  assert.match(page, /hasBiography &&/);
  assert.doesNotMatch(page, /onclick|toggleContent|450px|<script is:inline/);
});

test("people controls have matching bilingual labels and native carousel buttons", () => {
  assert.deepEqual(
    Object.keys(peopleCopy.en).sort(),
    Object.keys(peopleCopy.id).sort(),
  );
  for (const copy of Object.values(peopleCopy))
    for (const text of Object.values(copy)) assert.ok(text.trim());
  const carousel = read("src/components/people/PeopleDeck.astro");
  assert.equal((carousel.match(/<button\b/g) ?? []).length, 2);
  assert.match(carousel, /aria-label=\{copy\.previous\}/);
  assert.match(carousel, /aria-label=\{copy\.next\}/);
});
