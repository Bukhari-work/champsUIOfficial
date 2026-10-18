import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
test("upcoming links remain native, named, and keep listing-only records noninteractive", () => {
  const source = readFileSync(
    new URL(
      "../src/components/directories/events/UpcomingEvents.astro",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /event\.data\.listingOnly \? undefined/);
  assert.match(source, /const Row = href \? "a" : "div";/);
  assert.match(
    source,
    /aria-labelledby=\{\s*href \? `\$\{titleId\} \$\{actionId\}` : undefined\s*\}/,
  );
  assert.match(source, /data-upcoming-title-link/);
  assert.match(source, /data-upcoming-action/);
  assert.doesNotMatch(source, /<script|onclick|role="button"|↗|target=/);
});
