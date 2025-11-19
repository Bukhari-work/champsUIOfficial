// src/navigation.ts
// This file defines the site's navigation structure using keys from ui.ts.
// It's the single source of truth for what links appear and where they go.

import type { NavLink, NavLinkGroup } from "./types";
import { getTranslatedPath } from "./i18n/utils"; // Import the path helper
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
  callToAction: NavLink;
} => ({
  header: [
    { textKey: "nav.home", href: getTranslatedPath("home", lang) },
    { textKey: "nav.about", href: getTranslatedPath("about", lang) },
    {
      textKey: "nav.whatWeDo",
      href: getTranslatedPath("whatWeDo", lang),
    },
    { textKey: "nav.news", href: getTranslatedPath("news", lang) },
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
          textKey: "sidebar.about.item.vision",
          href: getTranslatedPath("about", lang),
        },
        {
          textKey: "sidebar.about.item.mission",
          href: getTranslatedPath("about/mission", lang),
        },
        {
          textKey: "sidebar.about.item.values",
          href: getTranslatedPath("about/values", lang),
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
          textKey: "sidebar.whatWeDo.item.experiences",
          href: getTranslatedPath("what-we-do/experiences", lang),
        },
        {
          textKey: "sidebar.whatWeDo.item.partners",
          href: getTranslatedPath("what-we-do/partners", lang),
        },
      ],
    },
  },

  callToAction: {
    textKey: "button.latestProgram",
    href: getTranslatedPath("projects", lang),
  },
});

// The main navigation object, built dynamically for each language
export const navigation = {
  en: getNavStructure("en"),
  id: getNavStructure("id"),
};

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
