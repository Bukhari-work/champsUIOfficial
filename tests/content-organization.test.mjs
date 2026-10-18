import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { questionnaire } from "../src/data/questionnaire.ts";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("events own their declared documents and no longer reference legacy collections", () => {
  const folders = readdirSync(new URL("src/content/events/", root), {
    withFileTypes: true,
  });
  for (const folder of folders) {
    assert.ok(folder.isDirectory(), folder.name);
    const path = `src/content/events/${folder.name}/`;
    const event = JSON.parse(read(path + "event.json"));
    for (const kind of ["recap", "invitation"]) {
      if (!event[kind]) continue;
      assert.equal(event[kind], true);
      assert.ok(
        ["md", "mdx"].some((extension) =>
          existsSync(new URL(path + `${kind}.en.${extension}`, root))),
        `${folder.name}/${kind}`,
      );
    }
  }
  const schema = read("src/content.config.ts");
  assert.match(schema, /reference\("publications"\)/);
  assert.match(
    schema,
    /collections = \{\s*people,\s*stories,\s*storyDocuments,\s*events,\s*eventDocuments,\s*publications,?\s*\}/,
  );
  assert.doesNotMatch(
    schema,
    /reference\("(?:work|projects)"\)|isDraft|sidebarFee/,
  );
  for (const path of [
    "src/content/work",
    "src/content/projects",
    "src/layouts/ProjectLayout.astro",
  ])
    assert.equal(existsSync(new URL(path, root)), false, path);
  assert.doesNotMatch(schema, /getPublicationSample|components\/previews/);
});

test("the singleton questionnaire retains bilingual invitations and the existing external form", () => {
  assert.equal(questionnaire.href, "https://forms.gle/hFKwvqhVKRjT4yfL6");
  assert.deepEqual(Object.keys(questionnaire.content), ["en", "id"]);
  for (const content of Object.values(questionnaire.content)) {
    assert.equal(content.objectives.items.length, 3);
    assert.equal(content.facts.length, 3);
    assert.ok(content.body.includes("/images/projects/tna-champs.webp"));
    assert.ok(content.body.includes("20"));
  }
  const route = read("src/pages/[...lang]/questionnaire.astro");
  assert.match(route, /href=\{questionnaire.href\}/);
  assert.doesNotMatch(route, /<form|<iframe|ProjectLayout/);
  assert.match(
    read("src/navigation.ts"),
    /getTranslatedPath\("questionnaire", lang\)/,
  );
  assert.doesNotMatch(read("src/data/announcements.ts"), /\/projects\//);
});
