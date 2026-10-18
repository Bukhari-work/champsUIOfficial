import { getCollection, type CollectionEntry } from "astro:content";
import type { Language } from "@/i18n/ui";
import { getLocalizedPath } from "@/i18n/utils";
import { plainify } from "@/lib/utils/textConverter";
import { contentCopy } from "@/i18n/content";
import { formatEventMonth, getEventStatus } from "@/lib/eventDates";
import { getWorkPeriod } from "@/lib/workPeriods";

export type EventEntry = CollectionEntry<"events">;
export type ContentPlan = NonNullable<EventEntry["data"]["content"]>;
export type PlannedSection = Extract<ContentPlan, { mode: "article" }>["sections"][number];
export type PlannedView = Extract<ContentPlan, { mode: "tabs" }>["views"][number];
export type StoryEntry = CollectionEntry<"stories">;
export type StoryDocumentEntry = CollectionEntry<"storyDocuments">;
export type EventDocumentEntry = CollectionEntry<"eventDocuments">;
export type PublicationEntry = CollectionEntry<"publications">;
export interface DirectoryItem {
  title: string;
  description?: string;
  href?: string;
  date: string;
  year: string;
  years?: string[];
  sortDate: number;
  category: string;
  search?: string;
  note?: string;
  status?: string;
  image?: { src: string; alt: string; caption?: string };
  action?: string;
}
export interface ActivityItem extends DirectoryItem {
  slug: string;
  href: string;
  post: StoryDocumentEntry | EventDocumentEntry;
  story?: StoryEntry;
  event?: EventEntry;
  published?: string;
  partner?: string;
}

export async function getEvents() {
  return (await getCollection("events", (event) => !event.data.draft && !event.data.previewOnly)).sort(
    (a, b) =>
      (b.data.startDate ?? b.data.period).localeCompare(
        a.data.startDate ?? a.data.period,
      ),
  );
}

export function eventPath(event: EventEntry, lang: Language) {
  return getLocalizedPath(`/events/${event.id}`, lang);
}

export function eventDirectoryItem(
  event: EventEntry,
  lang: Language,
): DirectoryItem {
  const data = event.data;
  const copy = contentCopy[lang];
  return {
    title: data.title[lang],
    description: data.summary[lang],
    href: data.listingOnly ? undefined : eventPath(event, lang),
    note: data.recap
      ? copy.recapAvailable
      : data.invitation
        ? copy.invitation
        : data.invitationArchive
          ? copy.invitationArchive
          : copy.listingOnly,
    date: formatEventMonth(data.period, lang),
    year: data.period.slice(0, 4),
    sortDate: Date.parse(
      (data.startDate ?? data.period + "-01") + "T00:00:00Z",
    ),
    category: copy[data.kind],
    status:
      copy[
        getEventStatus(data) === "completed" ? "past" : getEventStatus(data)
      ],
    search: [data.format[lang], data.venue?.[lang], data.partner?.[lang]]
      .filter(Boolean)
      .join(" "),
  };
}

export function eventDocumentLanguage(document: EventDocumentEntry): Language {
  return document.id.endsWith(".id") ? "id" : "en";
}

export async function getStoryDocument(
  story: StoryEntry,
  id: string,
  lang: Language,
) {
  const documents = new Map(
    (await getCollection("storyDocuments", (document) => !document.data.draft))
      .map((document) => [document.id, document]),
  );
  const document = documents.get(`${story.id}/${id}.${lang}`)
    ?? documents.get(`${story.id}/${id}.en`);
  if (!document) throw new Error(`Missing ${id} document for story ${story.id}`);
  return document;
}

function resolveDocuments<T extends { id: string }>(
  documents: T[],
  ownerId: string,
  ids: string[],
  lang: Language,
  kind: string,
) {
  const byId = new Map(documents.map((document) => [document.id, document]));
  return Object.fromEntries([...new Set(ids)].map((id) => {
    const document = byId.get(`${ownerId}/${id}.${lang}`)
      ?? byId.get(`${ownerId}/${id}.en`);
    if (!document) throw new Error(`Missing ${id} document for ${kind} ${ownerId}`);
    return [id, document];
  })) as Record<string, T>;
}

export async function getStoryDocuments(
  story: StoryEntry,
  ids: string[],
  lang: Language,
) {
  const documents = await getCollection("storyDocuments", (document) => !document.data.draft);
  return resolveDocuments(documents, story.id, ids, lang, "story");
}

// Only the event's own folder is consulted. Missing translations use a labelled
// English fallback; a missing declared source is an editorial error, not a recap.
export async function getEventSources(event: EventEntry, lang: Language) {
  const documents = new Map(
    (
      await getCollection("eventDocuments", (document) => !document.data.draft)
    ).map((document) => [document.id, document]),
  );
  const source = (kind: "recap" | "invitation") => {
    if (!event.data[kind]) return undefined;
    const document =
      documents.get(`${event.id}/${kind}.${lang}`) ??
      documents.get(`${event.id}/${kind}.en`);
    if (!document)
      throw new Error(`Missing published ${kind} in event folder ${event.id}`);
    return document;
  };
  return { recap: source("recap"), invitation: source("invitation") };
}

export async function getEventDocuments(
  event: EventEntry,
  ids: string[],
  lang: Language,
) {
  const documents = await getCollection("eventDocuments", (document) => !document.data.draft);
  return resolveDocuments(documents, event.id, ids, lang, "event");
}

const publicationDate = (
  date: Date | undefined,
  lang: Language,
) =>
  date?.toLocaleDateString(lang, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
const languageNote = (sourceLang: string, lang: Language) =>
  sourceLang === lang
    ? undefined
    : sourceLang === "en"
      ? contentCopy[lang].english
      : contentCopy[lang].indonesian;

// The What We Do directory combines standalone stories and links to event recaps.
// They remain separate content types; no event text is duplicated as a story.
export async function getActivities(
  lang: Language,
  { includePreviewOnly = false }: { includePreviewOnly?: boolean } = {},
): Promise<ActivityItem[]> {
  const [stories, events] = await Promise.all([
    getCollection(
      "stories",
      (post) =>
        !post.data.draft && (includePreviewOnly || !post.data.previewOnly),
    ),
    getEvents(),
  ]);
  const storyItems: ActivityItem[] = await Promise.all(stories.map(async (story) => {
    const editorial = story.data;
    const sections = editorial.content.mode === "article"
      ? editorial.content.sections
      : editorial.content.views.flatMap((view) => view.sections);
    const firstDocument = sections[0];
    if (!firstDocument)
      throw new Error(`Story ${story.id} needs a document for its directory card`);
    const post = await getStoryDocument(story, firstDocument.id, lang);
    const slug = story.id;
    const period = getWorkPeriod(editorial.activityPeriod);
    return {
      post,
      story,
      slug,
      title: editorial.title[lang],
      description: editorial.description[lang],
      href: getLocalizedPath(`/what-we-do/${slug}`, lang),
      image: editorial.images[0],
      action: contentCopy[lang].readStory,
      partner: editorial.partner?.[lang],
      category: contentCopy[lang][editorial.workType ?? "research"],
      published: publicationDate(editorial.date, lang),
      date: period.label ?? contentCopy[lang].periodUnknown,
      year: period.years.at(-1) ?? "",
      years: period.years,
      sortDate: period.sortDate,
      search: [
        ...editorial.categories,
        ...editorial.tags,
        plainify(post.body ?? ""),
      ].join(" "),
      note: languageNote(post.id.endsWith(".id") ? "id" : "en", lang),
    };
  }));
  const recaps = await Promise.all(
    events
      .filter((event) => event.data.recap)
      .map(async (event): Promise<ActivityItem> => {
        const { recap } = await getEventSources(event, lang);
        if (!recap) throw new Error(`Missing recap for ${event.id}`);
        return {
          ...eventDirectoryItem(event, lang),
          post: recap,
          event,
          slug: event.id,
          href: eventPath(event, lang),
          image: recap.data.images?.[0],
          action: contentCopy[lang].readRecap,
          category: contentCopy[lang].capacityBuilding,
          published: publicationDate(recap.data.date, lang),
          partner: event.data.partner?.[lang],
          years: [event.data.period.slice(0, 4)],
          search: [
            ...recap.data.categories,
            ...recap.data.tags,
            plainify(recap.body ?? ""),
          ].join(" "),
          note: languageNote(eventDocumentLanguage(recap), lang),
        };
      }),
  );
  return [...storyItems, ...recaps].sort(
    (a, b) => b.sortDate - a.sortDate || a.title.localeCompare(b.title, lang),
  );
}

// What We Do can feature selected event recaps alongside standalone stories.
// Event records remain available to the Events directory regardless of this flag.
export async function getWhatWeDoActivities(
  lang: Language,
  options: { includePreviewOnly?: boolean } = {},
): Promise<ActivityItem[]> {
  const excludedEventRecaps = new Set([
    "dr-tb-advocacy-2024",
    "national-health-seminar-2025",
    "thyroid-screening-dialogue-2024",
  ]);
  return (await getActivities(lang, options)).filter(
    (item) => !item.event || !excludedEventRecaps.has(item.event.id),
  );
}
