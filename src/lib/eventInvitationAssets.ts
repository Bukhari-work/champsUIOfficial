import type { Language } from "@/i18n/ui";
import type { EventEntry } from "@/lib/contentCatalog";

type Image = { src: string; alt: string };
export interface InvitationAssets {
  speakerImages: Image[];
  qrCode?: Image;
}

/** Localize recovered artwork; keep a full invitation's QR in its original source. */
export function resolveInvitationAssets(
  archive: EventEntry["data"]["invitationArchive"],
  lang: Language,
  originalQr?: Image,
): InvitationAssets | undefined {
  if (!archive && !originalQr) return undefined;
  return {
    speakerImages:
      archive?.speakerImages.map(({ src, alt }) => ({ src, alt: alt[lang] })) ??
      [],
    qrCode: archive
      ? { src: archive.qrCode.src, alt: archive.qrCode.alt[lang] }
      : originalQr,
  };
}
