import test from "node:test";
import assert from "node:assert/strict";
import { getWorkPeriod } from "../src/lib/workPeriods.ts";

test("an unrecorded activity period does not use a publication date", () => {
  assert.deepEqual(getWorkPeriod(), {
    label: undefined,
    years: [],
    sortDate: 0,
  });
});

test("single-year work has a year label, not an invented exact date", () => {
  assert.deepEqual(getWorkPeriod({ startYear: 2022 }), {
    label: "2022",
    years: ["2022"],
    sortDate: Date.UTC(2022, 0, 1),
  });
});

test("multi-year activities can be found under every year they cover", () => {
  assert.deepEqual(getWorkPeriod({ startYear: 2016, endYear: 2017 }), {
    label: "2016–2017",
    years: ["2016", "2017"],
    sortDate: Date.UTC(2017, 0, 1),
  });
});
