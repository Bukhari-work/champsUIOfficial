# Component and layout organization

Pages own routing, metadata, page-specific data preparation, and section composition.
The homepage stays in `src/pages/[...lang]/index.astro`; it does not need a second
page-level component.

## Directory responsibilities

```text
src/
  assets/home/            Homepage photo originals and their shared image index
  pages/                  Routes and page composition
  layouts/                Page shells: Base, SidebarLayout, ProjectLayout
  components/
    site/                 Site-wide header, footer, navigation, search, and tools
    shared/               Reusable cards, headings, statistics, galleries, and helpers
    home/sections/        Homepage sections
    home/shared/          Building blocks specific to the homepage
    people/               People cards and carousel
    news/                 News cards, lists, and directory
    contact/              Contact form
    experiences/          Experience cards and timeline
    partners/             Partner marquee
    programs/             Program cards
    ui-astro/             Astro UI primitives
    ui/                   Registry primitives and framework-neutral variants
  lib/                    TypeScript data-access and utility functions
  i18n/                   Translations, locale validation, and localized paths
  scripts/                Browser behavior and transition lifecycle handlers
```

Keep feature-specific components within their feature. Move a component to
`shared/` when its responsibility is genuinely reusable; a second wrapper or
generic component is not necessary just to shorten a page.

## Component APIs

- Astro components use `class` for the outer element. Use explicit props such as
  `containerClass`, `titleClass`, or `linkClass` for inner elements.
- React components keep React's `className` convention.
- Button variants live in `components/ui/button-variants.ts`, independently of
  either rendering framework. Both button implementations use the same variants.
- The Astro marquee in `components/ui/marquee/` was installed with
  `pnpm dlx bejamas@latest add marquee`. Its styles come from
  `bejamas/tailwind.css`, with the marquee keyframes in `styles/animations.css`;
  the photo and partner wrappers preserve the site's edge
  fades and add hover pausing. The primitive's reduced-motion behavior and
  hidden duplicate track remain intact.
- Partner marquees share a `speed` in pixels per second (40 by default), rather
  than a fixed loop duration. `scripts/partner-marquee.ts` measures the track and
  updates its duration on resize; its custom element disconnects the observer
  when removed during page transitions.
- Prefer Tailwind utilities, theme colors, standard sizing/shadows, and named
  responsive breakpoints. Preserve functional selectors and accessible focus states.

## Image assets

- Homepage-only photos live in `assets/home/`; `index.ts` selects the hero,
  purpose, recap, and marquee photos from the same seven originals. Do not
  create separate full-size copies for each section.
- Use Astro's `Image` with `widths` and `sizes` matching the rendered layout.
  The hero loads eagerly with high priority; below-the-fold images stay lazy.
  The photo marquee uses 224–576px variants, rather than downloading originals.
- Shared news, people, and expertise originals retain their public URLs for
  content and other pages. `lib/imageAssets.ts` resolves those paths to imported
  image metadata for optimization without moving or copying shared originals.
- `Card` accepts optional `imageWidths` and `imageSizes` for its caller's layout.
  Public-path optimization is enabled when these responsive variants are
  requested, preserving existing behavior for other pages. Keep the source
  aspect ratio and let `object-cover` handle the visible crop.
- Astro's image service uses the project's explicit `sharp` dependency at build
  time. Generated variants are build artifacts; do not commit them. The homepage
  also generates a separate 1200×630 JPEG for social previews.

## Layouts and localized pages

- `Base` owns the document, SEO, global styles, site chrome, and global scripts.
- `SidebarLayout` owns section navigation and the content grid. Its `default`
  variant preserves the narrower content width; `wide` uses the remaining width;
  `with-aside` reserves a right-hand column. Supplying an `aside` slot selects
  `with-aside` by default. A wide layout cannot also receive an aside.
- `ProjectLayout` owns the main-content and sidebar slots for a project detail page.
- Ordinary localized routes call `getLocaleStaticPaths()` inside their own
  `getStaticPaths()` and validate route parameters with `getPageLanguage()`.
  Content-detail routes retain their collection-specific path generation;
  localized 404 generation remains separate.
- `getSidebar(lang, section)` in `navigation.ts` builds translated navigation
  props for the `about` and `whatWeDo` groups.
- User-facing translated copy belongs in `i18n/ui.ts`, rather than inline locale
  conditionals in components.

## Verification

Run `pnpm build` to generate the pages and the Pagefind search index. When moving
components, update all imports and preserve their browser scripts and functional
selectors, including behavior across Astro page transitions.
