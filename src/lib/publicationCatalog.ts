import { getCollection } from "astro:content";
import type { PublicationEntry, DirectoryItem } from "./contentCatalog";
import type { Language } from "@/i18n/ui";
import { getLocalizedPath } from "@/i18n/utils";
import { publicationsCopy } from "@/i18n/publications";
import {
  publicationLanguage,
  publicationSortDate,
  selectPublications,
} from "./publications";

export interface PublicationDirectoryItem extends DirectoryItem {
  authors: string;
  venue?: string;
}

export async function getPublications(
  lang: Language,
): Promise<PublicationEntry[]> {
  return selectPublications(
    await getCollection("publications"),
    lang,
    import.meta.env.DEV,
  );
}

export function publicationPath(
  publication: PublicationEntry,
  lang: Language,
): string {
  return getLocalizedPath(
    `/publications/${publication.data.translationKey}`,
    lang,
  );
}

export function publicationDirectoryItem(
  publication: PublicationEntry,
  lang: Language,
): PublicationDirectoryItem {
  const { data } = publication;
  const copy = publicationsCopy[lang];
  const authors = data.authors.map((author) => author.name).join(", ");
  const source = publicationLanguage(publication);
  return {
    title: data.title,
    description: data.summary,
    href: publicationPath(publication, lang),
    date: String(data.year),
    year: String(data.year),
    sortDate: publicationSortDate(publication),
    category: copy[data.type],
    authors,
    venue: data.journal || data.publisher,
    search: [authors, data.journal, data.publisher, data.doi, data.abstract]
      .filter(Boolean)
      .join(" "),
    action: copy.readRecord,
    note: data.previewOnly
      ? copy.sampleLabel
      : source !== lang
        ? copy[source === "en" ? "englishFallback" : "indonesianFallback"]
        : undefined,
  };
}
