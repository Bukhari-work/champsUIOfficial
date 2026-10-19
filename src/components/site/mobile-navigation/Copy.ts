import type { Language } from "@/i18n/ui";
import { useTranslations, type Key } from "@/i18n/utils";

export function getMobileNavigationCopy(lang: Language) {
  const t = useTranslations(lang);
  const destinations: Partial<Record<Key, string>> = {
    "nav.home": t("nav.description.home"),
    "nav.about": t("nav.description.about"),
    "nav.whatWeDo": t("nav.description.whatWeDo"),
    "nav.events": t("nav.description.events"),
    "nav.publications": t("nav.description.publications"),
    "nav.contact": t("nav.description.contact"),
  };
  return {
    navigation: t("nav.explore"),
    prompt: t("nav.prompt"),
    close: t("nav.closeMenu"),
    destinations,
  };
}
