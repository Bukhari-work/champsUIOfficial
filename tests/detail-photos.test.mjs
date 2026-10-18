import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  prepareDetailPhotos,
  photoCopy,
} from "../src/components/content-page/PhotoStage.ts";
const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Photo Stage has bilingual controls and no remaining photo comparisons", () => {
  assert.deepEqual(
    Object.keys(photoCopy.en).sort(),
    Object.keys(photoCopy.id).sort(),
  );
  for (const lang of ["en", "id"])
    for (const value of Object.values(photoCopy[lang])) assert.ok(value.trim());
  for (const filename of [
    "PhotoOptions.astro",
    "photo-preview-switch.ts",
    "photo-variants.ts",
  ])
    assert.equal(
      existsSync(
        new URL(
          `../src/components/previews/details/${filename}`,
          import.meta.url,
        ),
      ),
      false,
    );
  const component = read("src/components/content-page/PhotoStage.astro");
  assert.match(component, /data-photo-stage/);
  assert.doesNotMatch(
    component,
    /photo-style|group-data|defaultPhotoVariant|<a\b|href=|target=|cursor-zoom/,
  );
});

test("photo preparation preserves content, removes blanks and duplicates without mutating", () => {
  const input = [
    { src: " /images//one.webp ", alt: "One", caption: "Original caption" },
    { src: "/images/one.webp", alt: "Duplicate" },
    { src: "", alt: "Empty" },
    { src: "https://example.org/image.webp", alt: "Remote" },
    { src: "//example.org/image.webp", alt: "Protocol relative" },
  ];
  const before = structuredClone(input);
  const result = prepareDetailPhotos(input);
  assert.equal(result.length, 3);
  assert.equal(result[0].src, "/images/one.webp");
  assert.equal(result[0].caption, "Original caption");
  assert.equal(result[1].src, "https://example.org/image.webp");
  assert.equal(result[2].src, "//example.org/image.webp");
  assert.deepEqual(input, before);
  assert.deepEqual(prepareDetailPhotos([]), []);
  assert.equal(prepareDetailPhotos([input[0]]).length, 1);
});

test("Story and Event share an optimized, non-clickable, caption-preserving stage", () => {
  for (const path of [
    "src/pages/[...lang]/what-we-do/[single].astro",
    "src/pages/[...lang]/events/[single].astro",
  ])
    assert.match(
      read(path),
      /<PhotoStage/,
    );
  const component = read("src/components/content-page/PhotoStage.astro");
  for (const regex of [
    /photos\.length > 0/,
    /photos\.length > 1/,
    /<ContentPhoto/,
    /<figcaption/,
    /photo\.caption/,
    /object-contain/,
    /data-photo-thumbnails\s+hidden/,
    /aria-controls=/,
    /alt: ""/,
  ])
    assert.match(component, regex);
});

test("Photo Stage keeps keyboard and thumbnail selection without layout observers", () => {
  const script = read("src/components/content-page/PhotoStage.client.ts");
  for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"])
    assert.ok(script.includes(key));
  assert.match(script, /item\.hidden = i !== index/);
  assert.match(script, /items\.length > 1/);
  assert.match(script, /aria-pressed/);
  assert.match(script, /disconnectedCallback/);
  assert.match(script, /this\.controller\?\.abort\(\)/);
  assert.doesNotMatch(
    script,
    /MutationObserver|ResizeObserver|photoStyle|isStage|Swiper|setInterval|setTimeout|scrollTo/,
  );
});
