// src/navigation.ts
// This file defines the site's navigation structure using keys from ui.ts.
// It's the single source of truth for what links appear and where they go.

import type { NavLink, NavLinkGroup, SectionNavigationProps } from "./types";
import { getTranslatedPath, useTranslations } from "./i18n/utils";
import type { Language } from "./i18n/ui"; // Import the Language type

/**
 * This function generates the navigation structure for a given language.
 * This avoids repeating the same link structure for English and Indonesian.
 */
const getNavStructure = (
  lang: Language,
): {
  header: NavLink[];
  bars: { about: NavLinkGroup; whatWeDo: NavLinkGroup };
  callToAction: NavLink & { href: string };
} => ({
  header: [
    { textKey: "nav.home", href: getTranslatedPath("home", lang) },
    { textKey: "nav.about", href: getTranslatedPath("about", lang) },
    {
      textKey: "nav.whatWeDo",
      href: getTranslatedPath("whatWeDo", lang),
    },
    { textKey: "nav.events", href: getTranslatedPath("events", lang) },
    {
      textKey: "nav.contact",
      href: getTranslatedPath("contact", lang),
    },
  ],

  bars: {
    about: {
      titleKey: "sidebar.about.title",
      links: [
        {
          textKey: "sidebar.about.item.overview",
          href: getTranslatedPath("about", lang),
        },
        {
          textKey: "sidebar.about.item.team",
          href: getTranslatedPath("about/people", lang),
        },
        {
          textKey: "sidebar.about.item.experts",
          href: getTranslatedPath("about/experts", lang),
        },
      ],
    },
    whatWeDo: {
      titleKey: "sidebar.whatWeDo.title",
      links: [
        {
          textKey: "sidebar.whatWeDo.item.whatWeDo",
          href: getTranslatedPath("whatWeDo", lang),
        },
        {
          textKey: "sidebar.whatWeDo.item.partners",
          href: getTranslatedPath("what-we-do/partners", lang),
        },
        {
          textKey: "nav.archive",
          href: getTranslatedPath("what-we-do/archive", lang),
        },
        { textKey: "nav.events", href: getTranslatedPath("events", lang) },
      ],
    },
  },

  callToAction: {
    textKey: "button.latestProgram",
    href: getTranslatedPath("questionnaire", lang),
  },
});

// The main navigation object, built dynamically for each language
export const navigation = {
  en: getNavStructure("en"),
  id: getNavStructure("id"),
};

export function getSectionNavigation(
  lang: Language,
  section: keyof (typeof navigation)[Language]["bars"],
): SectionNavigationProps {
  const t = useTranslations(lang);
  const group = navigation[lang].bars[section];
  return {
    title: t(group.titleKey),
    menuItems: group.links.map((item) => ({
      text: t(item.textKey),
      href: item.href,
      "aria-label": t(item.textKey),
    })),
  };
}

// Contains shared, non-translatable, or globally structured footer data
export const sharedFooter = {
  secondaryLinks: [
    {
      textKey: "footer.secondary",
      href: "https://share.google/ItznTaDxWjFuOkGUM",
    },
  ],
  contact: {
    titleKey: "footer.title.contact",
    links: [
      {
        text: "WhatsApp",
        href: "https://wa.me/6281324096624",
        target: "_blank",
      },
      { text: "champs@ui.ac.id", href: "mailto:champs@ui.ac.id" },
      {
        text: "LinkedIn",
        ariaLabel: "LinkedIn",
        icon: "LuLinkedin",
        href: "https://id.linkedin.com/company/champsui",
      },
      {
        text: "Instagram",
        ariaLabel: "Instagram",
        icon: "LuInstagram",
        href: "https://www.instagram.com/champs_ui/",
      },
    ],
  },
  socialLinks: [
    {
      ariaLabel: "Linkedin",
      icon: "LuLinkedin",
      href: "https://id.linkedin.com/company/champsui",
    },
    {
      ariaLabel: "Instagram",
      icon: "LuInstagram",
      href: "https://www.instagram.com/champs_ui/",
    },
  ],
  footNote: {
    textKey: "footer.copyright",
    image: {
      src: "/favicon.png",
      alt: "Champs logo",
    },
  },
};
