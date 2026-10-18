export interface TableOfContentsLink {
  slug: string;
  text: string;
}

export const tableOfContentsCopy = {
  en: { page: "On this page", view: "In this view" },
  id: { page: "Di halaman ini", view: "Dalam tampilan ini" },
} as const;

export function getTableOfContentsLinks(
  links: TableOfContentsLink[],
): TableOfContentsLink[] {
  const seen = new Set<string>();
  return links.flatMap(({ slug, text }) => {
    slug = slug.trim();
    text = text.trim();
    if (!slug || !text || seen.has(slug)) return [];
    seen.add(slug);
    return [{ slug, text }];
  });
}
