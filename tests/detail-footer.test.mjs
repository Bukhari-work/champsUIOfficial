import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { sharingCopy } from "../src/i18n/sharing.ts";
const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
test("sharing and copying labels remain complete in both languages", () => {
  assert.deepEqual(
    Object.keys(sharingCopy.en).sort(),
    Object.keys(sharingCopy.id).sort(),
  );
  for (const copy of Object.values(sharingCopy))
    for (const value of Object.values(copy)) assert.ok(value.trim());
  const share = read("src/components/content-page/Share.astro");
  for (const platform of ["whatsapp", "linkedin", "email"])
    assert.ok(share.includes(`aria-label={copy.${platform}}`));
});
test("Utility row is the only footer and keeps canonical copy/share/citation actions", () => {
  const page = read("src/layouts/ContentLayout.astro");
  const footer = page.slice(page.indexOf("<footer"), page.indexOf("</footer>"));
  assert.match(page, /shareUrl && kind !== "questionnaire"/);
  assert.match(footer, /scroll-mt-28 border-y py-5/);
  assert.doesNotMatch(
    footer,
    /footer-style|footerVariant|topics|<nav\b|<h[1-6]\b|CallToAction/,
  );
  assert.doesNotMatch(footer, /CopyControl|copy-control/);
  assert.equal((footer.match(/<Share\b/g) ?? []).length, 1);
  assert.match(footer, /href="#citation"/);
  for (const path of [
    "src/pages/[...lang]/what-we-do/[single].astro",
    "src/pages/[...lang]/events/[single].astro",
  ]) {
    const source = read(path);
    assert.equal((source.match(/<ContentLayout\b/g) ?? []).length, 1);
    assert.match(source, /shareUrl=\{canonical\.href\}/);
  }
  for (const file of [
    "FooterOptions.astro",
    "footer-preview-switch.ts",
    "footer-variants.ts",
  ])
    assert.equal(
      existsSync(
        new URL(`../src/components/previews/details/${file}`, import.meta.url),
      ),
      false,
    );
});
test("Share owns clipboard actions with feedback but no selectable-field fallback", () => {
  const share = read("src/components/content-page/Share.astro");
  assert.match(share, /data-copy-value=\{shareUrl\}/);
  assert.match(share, /data-share-copy-control[\s\S]*?hidden/);
  assert.match(share, /role="status"/);
  assert.match(share, /window\.isSecureContext/);
  assert.match(
    share,
    /navigator\.clipboard\.writeText\(control.dataset.copyValue/,
  );
  assert.match(share, /astro:page-load/);
  assert.match(share, /button\.isConnected/);
  assert.match(share, /aria-busy/);
  assert.doesNotMatch(
    share,
    /CopyControl|<copy-control|<textarea|data-copy-fallback|field\.select|readText|permissions\.query|execCommand|localStorage|sessionStorage/,
  );
  for (const copy of Object.values(sharingCopy)) {
    assert.equal(copy.manualLink, undefined);
    assert.equal(copy.manualCitation, undefined);
  }
});
