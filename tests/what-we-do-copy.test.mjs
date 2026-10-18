import assert from "node:assert/strict";
import test from "node:test";
import { whatWeDoCopy } from "../src/i18n/what-we-do.ts";

test("What We Do provides the same nonempty content keys in both locales", () => {
  assert.deepEqual(
    Object.keys(whatWeDoCopy.en).sort(),
    Object.keys(whatWeDoCopy.id).sort(),
  );
  for (const copy of Object.values(whatWeDoCopy))
    for (const value of Object.values(copy)) assert.ok(value.trim());
});

test("all four expertise areas keep a label, description, and contextual CTA", () => {
  for (const copy of Object.values(whatWeDoCopy)) {
    for (const id of ["research", "capacity", "consultation", "csr"]) {
      for (const suffix of [
        "Tab",
        "TabDescription",
        "Cta",
        "CtaTitle",
        "CtaIntro",
      ])
        assert.ok(copy[`${id}${suffix}`]);
    }
    assert.ok(copy.capacityMobileTab.length < copy.capacityTab.length);
  }
});
