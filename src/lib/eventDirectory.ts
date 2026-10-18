import type { Language } from "@/i18n/ui";
import type { EventEntry, ActivityItem } from "@/lib/contentCatalog";

// Prefer a recap with programme themes and a photo; otherwise use a recap alone.
// Callers pass past events only. Invitations and cancelled events are not recaps.
export function selectFeaturedEvent(
  pastEvents: EventEntry[],
  work: ActivityItem[],
  lang: Language,
): EventEntry | undefined {
  const recaps = pastEvents
    .filter((event) => event.data.recap && event.data.status !== "cancelled")
    .toSorted(
      (a, b) =>
        (b.data.startDate ?? b.data.period).localeCompare(
          a.data.startDate ?? a.data.period,
        ) || a.id.localeCompare(b.id),
    );
  return (
    recaps.find(
      (event) =>
        event.data.topics?.[lang]?.length &&
        work.some((item) => item.event?.id === event.id && item.image),
    ) ?? recaps[0]
  );
}
