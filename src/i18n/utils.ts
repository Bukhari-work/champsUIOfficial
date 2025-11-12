// src/i18n/utils.ts
import { i18n } from "@/config";
import { ui, type Language, showDefaultLang } from "./ui";
import { routes } from "./routes";

// Use the default language from the central configuration
const defaultLang = i18n.defaultLocale;

export function getLangFromUrl(url: URL): Language {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as Language;
  return defaultLang;
}

// Define a single "Key" type based on the default language's keys.
export type Key = keyof (typeof ui)[typeof defaultLang];

export function useTranslations(lang: Language | undefined) {
  const currentLang = lang || defaultLang;
  return function t(key: Key) {
    return ui[currentLang]?.[key] || ui[defaultLang][key];
  };
}

// A type for the keys in the `routes` object (e.g., "about", "about/mission").
export type RouteKey = keyof (typeof routes)["en"];

// Translates a canonical route key (like 'about') into a localized path,
export function getTranslatedPath(key: RouteKey, lang: Language): string {
  // 1. Get the localized slug, falling back to the default language's slug
  const slug = routes[lang]?.[key] || routes.en[key];
  // 2. Handle the "home" page
  if (key === "home" || slug === "/") {
    return !showDefaultLang && lang === defaultLang ? "/" : `/${lang}`;
  }
  // 3. Handle all other pages
  const path = `/${slug}`; // e.g., /about or /tentang
  return !showDefaultLang && lang === defaultLang
    ? path // e.g., /about
    : `/${lang}${path}`; // e.g., /en/about or /id/tentang
}
