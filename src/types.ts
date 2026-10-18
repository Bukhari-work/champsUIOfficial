// src/types.ts

import type { HTMLAttributes } from "astro/types";
import type { Language } from "@/i18n/ui.ts";
import type { Key } from "@/i18n/utils.ts";

// =================================================================
//  Core Content & Navigation Types
// =================================================================

/**
 * Base properties for any link element.
 * Inherits all standard HTML `<a>` tag attributes.
 */
type BaseLink = HTMLAttributes<"a"> & {
  icon?: string;
  ariaLabel?: string;
  platform?: string;
};

/**
 * Represents a navigational link.
 * Ensures that the link's text is provided either as a raw string (`text`)
 * or as an internationalization key (`textKey`), but not both.
 */
export type Link = BaseLink &
  ({ text: string; textKey?: never } | { text?: never; textKey: Key });

/** Social links may use an icon and accessible label instead of visible text. */
export type SocialLink = BaseLink & { text?: string };

/** A themed group of links, often used in footers or navigation panels. */
export type LinkGroup = {
  titleKey: Key;
  links: Link[];
};

// Type helpers to enforce using 'textKey' instead of 'text'
export type NavLink = Omit<Link, "text"> & { textKey: Key } & {
  hasChildren?: boolean;
  children?: HTMLAttributes<"a">[];
};

export type NavLinkGroup = Omit<LinkGroup, "links" | "title"> & {
  titleKey: Key;
  links: NavLink[];
};

// Change this from 'interface' to 'type'
export type SectionNavigationLink = Link & {
  hasChildren?: boolean;
  children?: HTMLAttributes<"a">[];
};

/** Props for the main site footer component. */
export interface FooterProps {
  links: LinkGroup[];
  secondaryLinks: Link[];
  socialLinks: SocialLink[];
  footNote?: {
    textKey: Key;
    image: { src: string; alt: string };
  };
  lang?: Language;
}

// =================================================================
//  Sidebar Component Types
// =================================================================

/** Props for the SectionNavigation component. */
export interface SectionNavigationProps extends HTMLAttributes<"div"> {
  title?: string;
  menuItems: SectionNavigationLink[];
}

// =================================================================
//  Page Layout & Section Types
// =================================================================

/** Metadata for a single page, primarily for SEO purposes. */
export interface PageMetadata {
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  canonical?: string | URL;
}

/** Props for the main Base.astro layout. */
export interface BaseLayoutProps {
  content: PageMetadata;
  mode?: "light" | "dark";
  makara?: boolean;
  mainClass?: string;
  noindex?: boolean;
}
