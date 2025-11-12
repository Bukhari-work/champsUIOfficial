// This file contains all site configuration.
import type { Language } from "./i18n/ui";

// Site identity and metadata (language-agnostic)
export const SITE = {
  company: "CHAMPS UI",
  base_href: "https://www.champs-ui.org",
  favicon: "/images/favicon.svg",
  logo: "/images/logo.svg",
  logo_darkmode: "/images/logo-darkmode.svg",
  logo_width: "30",
  logo_height: "30",
};

// Internationalization settings
export const i18n: {
  defaultLocale: Language;
  locales: Language[];
} = {
  defaultLocale: "en",
  locales: ["en", "id"],
};

// Site behavioral settings
export const SETTINGS = {
  search: true,
  sticky_header: false,
  theme_switcher: true,
  default_theme: "system", // "light", "dark", or "system"

  // Content settings
  highlight: 6,
  summary_length: 250,
  people_folder: "people",
  news_folder: "news",
  publications_folder: "publications",

  contact_form_url:
    "https://script.google.com/macros/s/AKfycbwjLEn2KxA3GyW0Zcc_EZ4m_3e54Sy05gtFYmPlvNM86502ujCE7mdL1okanTdosMoX/exec",
} as const;
