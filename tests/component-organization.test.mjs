import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const root = new URL("../src/components/", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("component modules use PascalCase, client suffixes, and exact-case imports", () => {
  const files = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const file = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
      return entry.isDirectory() ? files(file) : [file];
    });
  const componentFiles = files(root);
  const sourceRoot = new URL("../src/", import.meta.url);
  const sourceFiles = files(sourceRoot);
  const paths = new Set(sourceFiles.map((file) => file.pathname));
  for (const file of componentFiles.filter((file) =>
    /\.tsx?$/.test(file.pathname),
  )) {
    const name = file.pathname.split("/").at(-1);
    if (name !== "index.ts")
      assert.match(name, /^[A-Z][A-Za-z0-9]*(?:\.client)?\.tsx?$/);
    const source = readFileSync(file, "utf8");
    if (/extends HTMLElement/.test(source))
      assert.ok(name.endsWith(".client.ts"), name);
  }
  for (const file of sourceFiles.filter((file) =>
    /\.(astro|tsx?)$/.test(file.pathname),
  )) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(
      /(?:\bfrom\s*|\bimport\s*)["']([^"']+)["']/g,
    )) {
      const specifier = match[1];
      const target = specifier.startsWith("@/")
        ? new URL(specifier.slice(2), new URL("../src/", import.meta.url))
        : specifier.startsWith(".")
          ? new URL(specifier, file)
          : undefined;
      if (!target?.pathname.startsWith(sourceRoot.pathname)) continue;
      const candidates = [
        target.pathname,
        ...[".ts", ".tsx", ".astro", ".js", "/index.ts"].map(
          (extension) => target.pathname + extension,
        ),
      ];
      assert.ok(
        candidates.some((candidate) => paths.has(candidate)),
        `${file.pathname}: missing or mis-cased import ${specifier}`,
      );
    }
  }
});

test("the consolidated folders have no obsolete components or forwarding wrappers", () => {
  for (const folder of [
    "ui-astro/",
    "work/",
    "details/",
    "home/shared/",
    "shared/content-page/",
    "events/details/",
    "events/",
    "what-we-do/",
  ])
    assert.equal(existsSync(new URL(folder, root)), false, folder);
  for (const name of ["DetailFrame", "DetailHeader", "DetailFooter"])
    assert.equal(
      existsSync(new URL(`shared/${name}.astro`, root)),
      false,
      name,
    );
  for (const path of [
    "ui/button/Button.astro",
    "ui/button/Variants.ts",
    "shared/ContentCard.astro",
    "content-page/RelatedReading.astro",
    "content-page/SidebarCard.astro",
    "site/SectionNavigation.astro",
    "content-page/ContentBody.astro",
    "content-page/BodyTabs.astro",
    "content-page/BodyTabs.client.ts",
    "directories/what-we-do/ActivityArchive.astro",
    "people/PersonCard.astro",
    "home/components/SectionHeading.astro",
    "home/components/YearStats.astro",
  ])
    assert.equal(existsSync(new URL(path, root)), true, path);
  for (const path of ["content-page/BodySections.astro", "content-page/ContentSection.astro"])
    assert.equal(existsSync(new URL(path, root)), false, path);
  for (const path of [
    "ui/Button.astro",
    "ui/ReactButton.tsx",
    "ui/Element.astro",
    "ui/button-variants.ts",
    "ui/CopyControl.astro",
    "ui/copy-control.ts",
    "shared/HeroEyebrow.astro",
    "what-we-do/Hero.astro",
    "what-we-do/NextSteps.astro",
    "what-we-do/AreaCta.astro",
    "shared/Stats.astro",
    "shared/ComponentWrapper.astro",
    "ui/Headline.astro",
    "ui/Avatar.astro",
    "shared/GalleryDeck.astro",
    "shared/gallery-deck.ts",
    "events/EventReference.astro",
    "events/FeeAvailability.astro",
    "events/DetailResources.astro",
  ])
    assert.equal(existsSync(new URL(path, root)), false, path);
});

test("homepage statistics retain their layout without generic wrapper layers", () => {
  const stats = read("home/components/YearStats.astro");
  const yearReview = read("home/sections/YearReview.astro");
  assert.match(stats, /id="home-results"/);
  assert.match(stats, /grid-cols-2[^"\n]*lg:grid-cols-4/);
  assert.match(stats, /max-w-6xl/);
  assert.match(stats, /motion-safe:md:intersect:animate-fade-in/);
  assert.match(yearReview, /<YearStats\b/);
  assert.match(yearReview, /id="results-title"/);
  assert.equal((yearReview.match(/amount:/g) ?? []).length, 4);
  assert.doesNotMatch(
    stats,
    /ComponentWrapper|Headline|flatBackground|containerClass/,
  );
});

test("the content layout owns its header, layout, and optional sharing footer", () => {
  const page = read("../layouts/ContentLayout.astro");
  const header = read("content-page/ContentHeader.astro");
  assert.ok(existsSync(new URL("../layouts/SectionLayout.astro", root)));
  assert.equal(
    existsSync(new URL("../layouts/SidebarLayout.astro", root)),
    false,
  );
  assert.equal((page.match(/<ContentHeader\b/g) ?? []).length, 1);
  assert.equal((header.match(/<header\b/g) ?? []).length, 1);
  assert.equal((header.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((page.match(/<footer\b/g) ?? []).length, 1);
  assert.match(page, /shareUrl && kind !== "questionnaire"/);
  assert.doesNotMatch(
    page,
    /DetailHeader|DetailFooter|slot name="introduction"/,
  );
});

test("component imports no longer refer to the removed folder boundaries", () => {
  function inspect(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
      if (entry.isDirectory()) inspect(path);
      else if (/\.(astro|tsx?)$/.test(entry.name))
        assert.doesNotMatch(
          readFileSync(path, "utf8"),
          /components\/(ui-astro|work|details|events|what-we-do)\/|components\/shared\/content-page\/|layouts\/SidebarLayout|site\/SideBar|home\/shared\/|\.\.\/shared\/(SectionHeading|Kaleidoscope|PhotoMarquee)/,
          path.pathname,
        );
    }
  }
  inspect(new URL("../src/", import.meta.url));
});

test("directory, content-page, and general shared components respect their import boundaries", () => {
  function inspect(dir, forbidden) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
      if (entry.isDirectory()) inspect(file, forbidden);
      else if (/\.(astro|tsx?)$/.test(entry.name)) {
        const source = readFileSync(file, "utf8");
        for (const match of source.matchAll(
          /(?:\bfrom\s*|\bimport\s*)["']([^"']+)["']/g,
        )) {
          const specifier = match[1];
          const target = specifier.startsWith("@/")
            ? new URL(specifier.slice(2), new URL("../src/", import.meta.url))
            : specifier.startsWith(".")
              ? new URL(specifier, file)
              : undefined;
          if (target)
            for (const role of forbidden)
              assert.ok(
                !target.pathname.includes(`/components/${role}/`),
                `${file.pathname} must not import ${target.pathname}`,
              );
        }
      }
    }
  }
  inspect(new URL("directories/", root), ["content-page"]);
  inspect(new URL("content-page/", root), ["directories"]);
  inspect(new URL("shared/", root), ["directories", "content-page"]);
  assert.ok(existsSync(new URL("../i18n/what-we-do.ts", root)));
});
