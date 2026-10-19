import assert from "node:assert/strict";
import test from "node:test";
import {
  publicationLanguage,
  publicationCitation,
  publicationDoi,
  publicationDoiUrl,
  publicationSortDate,
  selectPublications,
} from "../src/lib/publications.ts";
import { publicationsCopy } from "../src/i18n/publications.ts";

function publication(id, key, overrides = {}) {
  return {
    id,
    collection: "publications",
    data: {
      title: "Example title for a test",
      translationKey: key,
      type: "researchArticle",
      authors: [{ name: "First Author" }, { name: "Second Author" }],
      year: 2024,
      draft: false,
      ...overrides,
    },
  };
}

test("translations resolve to a single publication and retain the available original", () => {
  const en = publication("en/study", "study");
  const id = publication("id/kajian", "study", { title: "Judul kajian" });
  const original = publication("id/laporan", "report", { year: 2023 });
  const draft = publication("en/draft", "draft", { draft: true, year: 2026 });
  assert.deepEqual(selectPublications([en, id, original, draft], "en"), [
    en,
    original,
  ]);
  assert.deepEqual(selectPublications([en, id, original, draft], "id"), [
    id,
    original,
  ]);
  assert.equal(publicationLanguage(original), "id");
});

test("two published records for the same work and language are an editorial error", () => {
  assert.throws(
    () =>
      selectPublications(
        [publication("en/one", "study"), publication("en/two", "study")],
        "en",
      ),
    /Duplicate en publication/,
  );
});

test("sample publications require explicit preview access and drafts stay excluded", () => {
  const real = publication("en/real", "real");
  const sample = publication("en/sample", "sample", {
    previewOnly: true,
    year: 2025,
  });
  const draft = publication("en/draft", "draft", {
    draft: true,
    previewOnly: true,
  });
  assert.deepEqual(selectPublications([real, sample, draft], "en"), [real]);
  assert.deepEqual(selectPublications([real, sample, draft], "en", true), [
    sample,
    real,
  ]);
});

test("publications sort by year, supplied date and a deterministic title tie-break", () => {
  const older = publication("en/older", "older", { year: 2022 });
  const newer = publication("en/newer", "newer", { year: 2025 });
  const dated = publication("en/dated", "dated", {
    date: new Date("2024-06-01"),
  });
  const undated = publication("en/undated", "undated");
  assert.deepEqual(selectPublications([older, undated, dated, newer], "en"), [
    newer,
    dated,
    undated,
    older,
  ]);
  assert.equal(publicationSortDate(undated), Date.UTC(2024, 0, 1));
  assert.deepEqual(selectPublications([], "id"), []);
});

test("DOI variants resolve through doi.org without treating identifier fragments as URL fragments", () => {
  for (const value of [
    "10.1234/example",
    "doi:10.1234/example",
    "https://doi.org/10.1234/example",
    "https://dx.doi.org/10.1234/example",
  ])
    assert.equal(publicationDoiUrl(value), "https://doi.org/10.1234/example");
  assert.equal(publicationDoi("doi: 10.1234/example"), "10.1234/example");
  assert.equal(
    publicationDoiUrl("10.1234/example#section?query"),
    "https://doi.org/10.1234/example%23section%3Fquery",
  );
  assert.equal(publicationDoiUrl(undefined), undefined);
});

test("supplied citations are preserved and fallbacks use only known bibliographic fields", () => {
  const record = publication("en/study", "study", {
    citation: "  Supplied citation exactly as authored.  ",
  });
  assert.equal(
    publicationCitation(record),
    "Supplied citation exactly as authored.",
  );
  delete record.data.citation;
  assert.equal(
    publicationCitation(record),
    "First Author, Second Author. (2024). Example title for a test.",
  );
  record.data.journal = "Test Journal";
  record.data.doi = "10.1234/example";
  assert.equal(
    publicationCitation(record),
    "First Author, Second Author. (2024). Example title for a test. Test Journal. https://doi.org/10.1234/example",
  );
  assert.doesNotMatch(publicationCitation(record), /undefined|null/);
});

test("publication controls and labels are available in both site languages", () => {
  assert.deepEqual(
    Object.keys(publicationsCopy.en).sort(),
    Object.keys(publicationsCopy.id).sort(),
  );
  for (const copy of Object.values(publicationsCopy))
    for (const value of Object.values(copy)) assert.ok(value.trim());
});
