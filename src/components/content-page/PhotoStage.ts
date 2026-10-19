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
    personCounter: "Person {current} of {total}",
    choose: "Choose a photo",
    select: "Show photo {number}",
    choosePerson: "Choose a person",
    previousPerson: "Previous person",
    nextPerson: "Next person",
    selectPerson: "Show person {number}",
  },
  id: {
    previous: "Foto sebelumnya",
    next: "Foto berikutnya",
    counter: "Foto {current} dari {total}",
    personCounter: "Orang {current} dari {total}",
    choose: "Pilih foto",
    select: "Tampilkan foto {number}",
    choosePerson: "Pilih anggota",
    previousPerson: "Anggota sebelumnya",
    nextPerson: "Anggota berikutnya",
    selectPerson: "Tampilkan anggota {number}",
  },
} as const;
