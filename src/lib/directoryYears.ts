export const unknownDirectoryYear = "unknown";

export function matchesDirectoryYear(years: string, selected: string) {
  const recorded = years.split(/\s+/).filter(Boolean);
  return (
    !selected ||
    (selected === unknownDirectoryYear
      ? recorded.length === 0
      : recorded.includes(selected))
  );
}

export function groupDirectoryItemsByYear<T extends { year: string }>(
  items: T[],
) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const group = groups.get(item.year) ?? [];
    group.push(item);
    groups.set(item.year, group);
  }
  return [...groups]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, records]) => ({ year, items: records }));
}
