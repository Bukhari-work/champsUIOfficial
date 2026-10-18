import assert from "node:assert/strict";
import test from "node:test";
import {
  groupDirectoryItemsByYear,
  matchesDirectoryYear,
} from "../src/lib/directoryYears.ts";

test("year filtering includes every recorded year of a multi-year activity", () => {
  assert.equal(matchesDirectoryYear("2021 2022 2023", "2022"), true);
  assert.equal(matchesDirectoryYear("2021 2022 2023", "2020"), false);
  assert.equal(matchesDirectoryYear("2021 2022 2023", "unknown"), false);
});

test("all years includes unrecorded work, without inventing a year", () => {
  assert.equal(matchesDirectoryYear("", ""), true);
  assert.equal(matchesDirectoryYear("", "2025"), false);
  assert.equal(matchesDirectoryYear("", "unknown"), true);
  assert.equal(matchesDirectoryYear("2025", "unknown"), false);
});

test("chronological groups use the latest display year and preserve records", () => {
  const items = [
    { year: "2023", id: 1 },
    { year: "", id: 2 },
    { year: "2025", id: 3 },
    { year: "2023", id: 4 },
  ];
  const original = structuredClone(items);
  const groups = groupDirectoryItemsByYear(items);
  assert.deepEqual(
    groups.map((group) => group.year),
    ["2025", "2023", ""],
  );
  assert.deepEqual(
    groups[1].items.map((item) => item.id),
    [1, 4],
  );
  assert.equal(groups.flatMap((group) => group.items).length, items.length);
  assert.deepEqual(items, original);
});

test("an empty collection has no fabricated year groups", () => {
  assert.deepEqual(groupDirectoryItemsByYear([]), []);
});
