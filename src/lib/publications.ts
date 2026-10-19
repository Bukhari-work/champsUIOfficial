import type { PublicationEntry } from "./contentCatalog";
import type { Language } from "../i18n/ui";

export function publicationLanguage(publication: PublicationEntry): Language {
  return publication.id.startsWith("id/") ? "id" : "en";
}

export function publicationSortDate(publication: PublicationEntry): number {
  return (
    publication.data.date?.getTime() ?? Date.UTC(publication.data.year, 0, 1)
  );
}

// One record per work, in the requested language or its available original.
// Both languages retain the translation key as their canonical public slug.
export function selectPublications(
  records: PublicationEntry[],
  lang: Language,
  includePreviews = false,
): PublicationEntry[] {
  const groups = new Map<string, Map<Language, PublicationEntry>>();
  for (const record of records) {
    if (record.data.draft || (record.data.previewOnly && !includePreviews))
      continue;
    const key = record.data.translationKey;
    const source = publicationLanguage(record);
    const versions = groups.get(key) ?? new Map<Language, PublicationEntry>();
    if (versions.has(source))
      throw new Error(`Duplicate ${source} publication for ${key}`);
    versions.set(source, record);
    groups.set(key, versions);
  }
  return [...groups.values()]
    .map(
      (versions) =>
        (versions.get(lang) ?? versions.get("en") ?? versions.get("id"))!,
    )
    .sort(
      (a, b) =>
        b.data.year - a.data.year ||
        publicationSortDate(b) - publicationSortDate(a) ||
        a.data.title.localeCompare(b.data.title, lang),
    );
}

export function publicationDoi(doi?: string): string | undefined {
  return doi
    ?.trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "");
}

export function publicationDoiUrl(doi?: string): string | undefined {
  const value = publicationDoi(doi);
  if (!value) return;
  return `https://doi.org/${encodeURI(value).replace(/[?#]/g, encodeURIComponent)}`;
}

export function publicationCitation(publication: PublicationEntry): string {
  const data = publication.data;
  if (data.citation?.trim()) return data.citation.trim();
  const sentence = (value: string) =>
    /[.!?]$/.test(value) ? value : `${value}.`;
  return [
    `${sentence(data.authors.map((author) => author.name).join(", "))} (${data.year}).`,
    sentence(data.title),
    data.journal || data.publisher
      ? sentence(data.journal || data.publisher!)
      : undefined,
    publicationDoiUrl(data.doi) ?? data.url,
  ]
    .filter(Boolean)
    .join(" ");
}
