/** Input data and localized copy used by the PhotoStage component. */
export interface DetailPhoto {
  src: string;
  alt: string;
  caption?: string;
}

export function prepareDetailPhotos(
  images: readonly DetailPhoto[],
): DetailPhoto[] {
  const seen = new Set<string>();
  return images.flatMap((image) => {
    const raw = image.src.trim();
    const src =
      raw.startsWith("/") && !raw.startsWith("//")
        ? raw.replace(/\/{2,}/g, "/")
        : raw;
    if (!src || seen.has(src)) return [];
    seen.add(src);
    return [{ ...image, src }];
  });
}

export const photoCopy = {
  en: {
    previous: "Previous photo",
    next: "Next photo",
    counter: "Photo {current} of {total}",
    choose: "Choose a photo",
    select: "Show photo {number}",
  },
  id: {
    previous: "Foto sebelumnya",
    next: "Foto berikutnya",
    counter: "Foto {current} dari {total}",
    choose: "Pilih foto",
    select: "Tampilkan foto {number}",
  },
} as const;
