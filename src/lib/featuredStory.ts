import type { ActivityItem } from "@/lib/contentCatalog";

// The newest recorded activity, with a stable tie-break across translations.
export function selectFeaturedStory(
  items: ActivityItem[],
): ActivityItem | undefined {
  return items.reduce<ActivityItem | undefined>((featured, item) => {
    if (
      !featured ||
      item.sortDate > featured.sortDate ||
      (item.sortDate === featured.sortDate && item.slug < featured.slug)
    )
      return item;
    return featured;
  }, undefined);
}
