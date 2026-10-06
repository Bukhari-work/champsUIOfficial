import type { ImageMetadata } from "astro";

// Keep public URLs used by content while allowing cards to optimize the source.
const publicImages = import.meta.glob<ImageMetadata>(
  "/public/images/{news,people,what-we-do}/*.{jpeg,jpg,png,webp}",
  { import: "default" },
);

export async function getImageAsset(
  src: string | ImageMetadata,
): Promise<string | ImageMetadata> {
  if (typeof src !== "string" || !src.startsWith("/images/")) return src;
  const path = `/public${decodeURI(src).replace(/\/+/g, "/")}`;
  const load = publicImages[path];
  return load ? await load() : src;
}
