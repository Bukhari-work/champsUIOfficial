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
  Its optional `mainClass` customizes the main container for full-bleed layouts;
  ordinary pages retain their existing margins and borders, with `mt-24` reserving
  space below the floating header. The homepage overrides this margin for its photo.
- `site/Header.astro` provides the static Bridge islands header on every page.
  The logo and navigation/action cards stay separate at fixed sizes and positions
  while scrolling. Opaque backgrounds, borders, and shadows use Tailwind directly
  on each island, without SVG surfaces, geometry measurements, scroll listeners,
  or entrance animations. Mobile navigation uses `site/mobile-navigation/FullScreen.astro`
  on every page, with numbered Libron links and localized destination descriptions. The header
  retains its named, non-animated view transition so page fades do not dim it.
  The header uses one Bejamas Dialog implementation, without variant props or
  preview-link rewriting.
- Header and mobile-menu comparisons, the native menu variant, and the old drawer
  have been removed. The static header needs no scroll or resize controller.
  The mobile menu controller handles closing at
  the desktop breakpoint and dismissing same-page choices without a reload.
- The live full-screen menu uses Bejamas/ui's Dialog, installed with
  `pnpm dlx bejamas@latest add dialog` into `components/ui/dialog/`.
  Its `@data-slot/dialog` primitive owns focus containment, modal semantics,
  Escape/button closing, focus restoration, and animation
  presence. The Dialog wrapper owns Astro page-load initialization and synchronous
  disposal at the actual page swap, preventing stale portals and listeners across
  client navigation. Navigation links are not dialog-close controls: the menu stays
  visible during loading. `scripts/mobile-navigation-transition.ts` carries an inert,
  aria-hidden visual copy into the destination, without IDs, modal slots, or live
  handlers. It replaces the normal page transition and fades away after page-load,
  revealing the ready destination rather than the outgoing page. Reduced motion
  removes the visual cover without animation.
  The visual copy preserves the outgoing menu's scroll position on short screens.
  Native search does not open while a Bejamas dialog is visible or closing, avoiding
  overlapping modal focus traps.
  The header trigger and menu share one Dialog root; the menu portal moves out of
  the header's stacking context. Menu-specific Tailwind classes preserve the
  full-screen layout and use opacity-only transitions with a transparent backdrop,
  explicitly opting out of DialogContent's default fade/zoom with `animate={false}`.
  The fade eases out for a 300ms entrance and eases in for a quicker 150ms exit. Closed
  opacity remains zero after the primitive clears its temporary animation flags,
  preventing a final-frame rebound. Reduced motion disables both transitions.
  The root disables the primitive's
  scroll lock, which reserves a scrollbar gutter; `Base` locks scrolling through
  CSS while the menu remains visible, including its exit transition, keeping the
  full-screen panel edge-to-edge. It uses
  compact spacing to fit ordinary phone and laptop viewport heights.
  Keep `overflow-y-auto` as an accessibility
  fallback for short landscape screens, safe-area insets, and enlarged text;
  do not hide overflow or clip destinations to prevent necessary scrolling.
- The homepage keeps Photo first in `home/sections/Hero.astro` and the full-width
  approach band. It owns the full-bleed layout and does not need preview
  props, alternate hero markup, comparison controls, or a separate page component.
  Its white/kuning UI slogan sits over a neutral gradient, softer in light
  mode, with an opaque support card and a fade into the page background.
  Accents use the shared `--kuning` theme color without a homepage palette override.
- `styles/global.css` sets Libron on all `h1`–`h6` and ARIA headings; child links,
  spans, and emphasis inherit the heading font. Long words wrap within headings,
  and page titles use responsive sizes to fit narrow screens. Body text and
  navigation inherit Lexend from the body instead of assigning Lexend to every element. Explicit
  legacy Lexend heading classes are removed so the shared typography applies.
  Libron's self-hosted font-face is in `styles/fonts.css`, with its unmodified WOFF2
  and license under `public/fonts/libron/`.
  Lexend loads through a persistent Google Fonts stylesheet link in `Base` rather
  than a CSS `@import`, keeping its font definitions attached across client navigation.
  Unused font imports, definitions, and assets are removed; regular Trajan remains
  for the sidebar label, but its unused bold font file is not shipped.
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
