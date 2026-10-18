import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("standard cards have one stretched primary link and independent secondary controls", () => {
  const card = read("src/components/shared/Card.astro");
  assert.match(card, /const Title = href \? "a" : "span"/);
  assert.equal((card.match(/data-card-link/g) ?? []).length, 1);
  assert.match(card, /after:absolute after:inset-0/);
  assert.match(card, /href &&\s*"hover:border-primary/);
  assert.match(card, /focus-within:ring-2/);
  for (const path of [
    "src/components/shared/ContentCard.astro",
    "src/components/people/PersonCard.astro",
  ]) {
    const source = read(path);
    assert.doesNotMatch(source, /<Button\b/);
    assert.match(source, /aria-hidden="true"/);
  }
  assert.match(
    read("src/components/people/PersonCard.astro"),
    /<Social[^>]*class="relative z-10 w-fit max-w-full"/,
  );
  assert.match(
    read("src/components/people/PersonCard.astro"),
    /copy\.viewProfile/,
  );
});

test("button actions omit navigation arrows while icons stay optional and decorative", () => {
  const button = read("src/components/ui/button/Button.astro");
  assert.match(button, /<slot\s*\/>/);
  assert.doesNotMatch(button, /DynamicIcon|icon\?:|text\?:/);
  assert.match(
    read("src/components/content-page/Share.astro"),
    /<DynamicIcon icon="LuCopy" aria-hidden="true"/,
  );
  for (const file of ["shared/CallToAction", "directories/FeaturedContent"])
    assert.doesNotMatch(
      read(`src/components/${file}.astro`),
      /LuArrow|link\??\.arrow|[→↗]/,
    );
  const hero = read("src/components/home/sections/Hero.astro");
  assert.doesNotMatch(
    hero.match(/<Button\b[\s\S]*?<\/Button\s*>/g).join(""),
    /Arrow/,
  );
  assert.match(hero, /<DynamicIcon icon="FaWhatsapp" aria-hidden="true"/);
  assert.match(hero, /<DynamicIcon\s+icon="FaArrowRightLong"/);
  const upcoming = read(
    "src/components/directories/events/UpcomingEvents.astro",
  );
  assert.doesNotMatch(
    upcoming.match(/<Button\b[\s\S]*?<\/Button\s*>/g).join(""),
    /[→↗]/,
  );
  assert.match(upcoming, /<span aria-hidden="true">→<\/span>/);
  const menu = read("src/components/site/mobile-navigation/MenuContent.astro");
  assert.doesNotMatch(menu.match(/<Button\b[\s\S]*?<\/Button\s*>/)[0], /Arrow/);
  assert.match(menu, /<ArrowUpRight/);
  for (const file of ["PageHero", "KeepExploring"])
    assert.match(
      read(`src/components/directories/${file}.astro`),
      /(?:link\??|behavior)\.arrow/,
    );
});

test("featured panels use a single named native link for image, title, and visual action", () => {
  const source = read("src/components/directories/FeaturedContent.astro");
  assert.match(source, /const Wrapper = action\?\.href \? "a" : "div"/);
  assert.match(source, /data-featured-link/);
  assert.match(
    source,
    /aria-labelledby=\{action\?\.href \? headingId : undefined\}/,
  );
  assert.doesNotMatch(source, /<Button\b|<script/);
  assert.match(source, /focus-visible:outline-2/);
});

test("footer and homepage secondary links retain visible focus and generous hit targets", () => {
  const footer = read("src/components/site/Footer.astro");
  assert.doesNotMatch(footer, /focus:outline-none/);
  assert.match(footer, /focus-visible:outline-background/);
  assert.match(footer, /min-h-11 min-w-11/);
  assert.match(
    read("src/components/home/components/SectionHeading.astro"),
    /min-h-11 max-w-full/,
  );
  for (const file of [
    "shared/CallToAction",
    "directories/PageHero",
    "directories/KeepExploring",
  ])
    assert.match(read(`src/components/${file}.astro`), /getLinkBehavior/);
});
