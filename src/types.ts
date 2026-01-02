// src/types.ts

import type { HTMLAttributes } from "astro/types";
import type { Language } from "@/i18n/ui.ts";
import type { Key } from "@/i18n/utils.ts";
import type { Props as ButtonProps } from "@/components/ui-astro/Button.astro";

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

/** A themed group of links, often used in footers or navigation panels. */
export type LinkGroup = {
  titleKey: Key;
  links: Link[];
};

// Type helpers to enforce using 'textKey' instead of 'text'
export type NavLink = Omit<Link, "text"> & { textKey: string } & {
  hasChildren?: boolean;
  children?: HTMLAttributes<"a">[];
};

export type NavLinkGroup = Omit<LinkGroup, "links" | "title"> & {
  titleKey: Key;
  links: NavLink[];
};

// Change this from 'interface' to 'type'
export type SideBarLink = Link & {
  hasChildren?: boolean;
  children?: HTMLAttributes<"a">[];
};

/** Props for the main site footer component. */
export interface FooterProps {
  links: LinkGroup[];
  secondaryLinks: Link[];
  socialLinks: Link[];
  footNote?: {
    textKey: Key;
    image: { src: string; alt: string };
  };
  lang?: Language;
}

// =================================================================
//  Reusable UI Component Types
// =================================================================

/** A standard headline block with title, subtitle, and tagline. */
export interface Headline {
  title?: string;
  subtitle?: string;
  tagline?: string;
}

/** Base properties for a UI component or page section. */
export interface Component {
  id?: string;
  bg?: string;
  hasFlatBackground?: boolean; // Renamed for clarity
  classes?: Record<string, string | Record<string, string>>;
}

/** Props for the SideBar component. */
export interface SideBarProps extends HTMLAttributes<"div"> {
  title?: string;
  menuItems: SideBarLink[];
  className?: string;
}

export type Stat = {
  amount?: number | string;
  icon?: string;
  description?: string;
} & ({ title: string; titleKey?: never } | { title?: never; titleKey: Key });

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
}

/**
 * A reusable base for page sections that combine Headline and Component props.
 * This avoids repeating `Omit` in every layout type.
 */
export interface SectionProps extends Headline, Component {}

/** Props for the Hero section of a page. */
export interface Hero extends SectionProps {
  content?: string;
  actions?: ButtonProps[];
  image?: string | ImageMetadata;
  imageAlt?: string;
}

/** Props for a section displaying a list of statistics. */
export interface Stats extends SectionProps {
  stats?: Stat[];
  flatBackground?: boolean;
}
