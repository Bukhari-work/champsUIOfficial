# Component and layout organization

Pages own routing, metadata, page-specific data preparation, and section composition.
The homepage stays in `src/pages/[...lang]/index.astro`; it does not need a second
page-level component.

## Directory responsibilities

```text
src/
  assets/home/            Homepage photo originals and their shared image index
  pages/                  Routes and page composition
  layouts/                Base site shell, SectionLayout, shared content frame, and story/event compositions
  components/
    site/                 Site-wide header, footer, navigation, search, and tools
    directories/          Browsing/discovery: hero, directory, featured record, onward links
      events/             EventsListing, UpcomingEvents, directory copy
      what-we-do/         Expertise tabs/areas, featured/more stories, activity archive
    content-page/         Shared article/tabs body, ToC, photos, sharing
      events/             Event-specific programme, sidebar, fees, registration
    shared/               Cross-role cards, image handling, icons, CTA, social links
    home/sections/        Homepage sections
    home/components/      Building blocks specific to the homepage
    announcements/        Reusable campaign announcement dialog
    people/               People cards and carousel
    contact/              Contact form
    partners/             Partner marquee
    ui/                   Basic controls, registry primitives, and button variants
  data/                   Typed site data, including localized campaign announcements
  lib/                    TypeScript data-access and utility functions
  i18n/                   Translations, locale validation, and localized paths
  scripts/                Global theme and intersection initialization
```

Organize record-related components by page role first, then content type.
Directory-only reuse lives at `directories/`; record-reading reuse lives at
`content-page/`. Place type-specific components beneath their role, such as
`directories/events/UpcomingEvents.astro` or `content-page/events/EventSidebar.astro`.
`shared/` is for general or cross-role presentation, not a catch-all for components
that happen to have two consumers. `ContentCard` remains there because directories,
homepage sections, and content-page related reading all use it. A second wrapper
or generic component is not necessary just to shorten a page.

Directory and content-page components must not import each other's components or
controllers. Shared presentation must not import either role. Routes/previews may
compose the appropriate role, and `ContentLayout` consumes content-page helpers.
An organization check enforces these static import boundaries, including relative
imports. Wording shared by What We Do's directory and story CTA lives in
`i18n/what-we-do.ts`, not in one role's component folder. Other role-owned copy
and browser controllers stay beside the components that use them.

Stories and events share `ContentBody` and `BodyTabs`; their
JSON records explicitly choose article or tabs. Publication can adopt the composer
when genuine publication records and routes are introduced.

Small, single-consumer forwarding wrappers are kept inline: `PageHero` owns its
eyebrow markup, the What We Do route supplies `PageHero` and `KeepExploring`
directly, and `ExpertiseTabs` supplies `CallToAction` directly. Meaningful sections
and interactive features remain components even when they have one importer.
`home/components/YearStats.astro` owns the homepage's four-stat grid and entrance
animations; its heading comes from the enclosing `YearReview` section. It has no
generic background, headline, icon, or wrapper options. The old shared Stats,
ComponentWrapper, Headline, unused Avatar, and unused GalleryDeck/controller are
removed. The active detail-page gallery remains `content-page/PhotoStage`.

`src/layouts/ContentLayout.astro` owns the reading/sidebar grid, gallery position,
and optional Utility footer. Its article slot receives `content-page/ContentBody.astro`,
which renders continuous sections directly or delegates tabbed reading to
`BodyTabs.astro`. `content-page/ContentHeader.astro` owns the shared
context, title, summary, status, and metadata markup. The layout owns the optional
sticky sidebar wrapper. Callers provide
identity props (`kind`, `lang`, `title`, `description`, `context`) and content
slots (`metadata`, `status`, `reference`, `contents`, `gallery`, `ending`). The
default slot is the article. Supplying `shareUrl` enables canonical copy/share
tools; `shareDescription` optionally differs from the visible introduction. The
questionnaire has no sharing footer. ToC, Photo Stage, and sidebar-card
presentation remain separate; article section markup lives in the body renderers
and the few standalone consumers that need it.

There are three explicit layout responsibilities: `Base` owns the site shell;
`SectionLayout` uses `site/SectionNavigation` for navigation among related pages;
`ContentLayout` arranges individual stories, events, and
the questionnaire. Section navigation is not an informational content sidebar.
Content routes retain their existing `Base` composition; `ContentLayout` does not
nest another `Base` or duplicate its metadata/header/footer.

All informational content sidebars use `content-page/SidebarCard.astro` for their common
surface. It supports the `heading`, `summary`, `action`, and default facts slots;
`class` and `actionClass` customize presentation without content-type flags.
Events supply their approved practical-facts heading through `heading` and a
border-separated action area; publication/questionnaire actions retain their
tinted default. `ContentLayout` owns grid placement and sticky behavior, while
the supplied card owns its content.

Event directory components live under `directories/events/`: `EventsListing`
and `UpcomingEvents` serve discovery. Shared detail-body components live under
`content-page/`; `content-page/events/` owns event-specific programme, sidebar,
fee and registration components. `content-page/mdx/` contains reusable building
blocks composed directly inside authored MDX; the shared `ContentBody` and
`BodyTabs` render the declared content; the Events route supplies
event metadata and ending actions.
`BodyTabs` and `BodyTabs.client.ts` own progressive tab interactions.
The shared MDX folder contains focused content blocks (audience, objectives,
topics, individual speakers, practical details, resource links, and QR images)
that stories, events, and publications can compose. MDX owns section headings
and composes these blocks with prose and ordinary markup, rather than delegating
an entire programme or archive layout. The
resources block renders links only; its authored MDX document owns the heading
and placement. Event resource data must be included in a `resources` content-plan
section, which also gates the sidebar's “view materials” action.
`EventSidebar` owns practical facts and event actions; `EventFees` handles both
compact and full pricing. Registration and
archived invitation assets stay beside them. Practical facts and availability
labels are inline in their owners. `directories/events/Copy.ts` owns directory copy, and
`content-page/events/EventDetailCopy.ts` owns event-detail copy.
There are no forwarding files at the retired paths.

The Story and Event routes compose their type-specific metadata and ending actions
with the shared content frame.
`shared/ContentCard.astro` and `content-page/RelatedReading.astro` serve more than one
feature and do not belong to a separate Our Work section. `people/PersonCard`
represents people, not specifically article authors. `ui/button/` owns the single
Astro Button and shared variants. The unused React button and generic Element
wrapper are removed; basic button rendering does not need either abstraction.

Keep feature-specific browser controllers beside the components they enhance,
using relative imports. For example, people cards/carousels/biographies live in
`components/people/`, menu controllers live in `components/site/mobile-navigation/`,
and the expertise-tab controller lives in `components/directories/what-we-do/`.
Directory and gallery controllers live beside their respective role components. `scripts/` contains
only the global theme and intersection initialization used by `Base`.

Unused legacy taxonomy, sorting, reading-time and image helpers, the old unused
CardBase/navigation/program-card components, and the empty SEM-PLS source placeholder
have been removed after checking references. Keep installed UI primitives and
public content/image URLs stable; this organization does not rename routes or assets.

## Component APIs

- Component-related filenames use PascalCase, including TypeScript helpers,
  configuration, copy, and types (`DirectoryPresets.ts`, `FeeState.ts`, `Copy.ts`).
  Browser controllers use a descriptive `.client.ts` suffix and match their
  component's name where practical (`BodyTabs.astro` / `BodyTabs.client.ts`,
  `PhotoStage.astro` / `PhotoStage.client.ts`). The suffix documents ownership;
  it does not add hydration or change how Astro bundles an imported script.
  Conventional `index.ts` module entry points remain lowercase so folder imports
  keep working. Folder names, public URLs, custom-element names and `data-*`
  selectors do not change. General `lib/`, `i18n/`, and data files are outside
  this component-filename convention. Match import casing exactly for Linux/Vercel.
- Astro components use `class` for the outer element. Use explicit props such as
  `containerClass`, `titleClass`, or `linkClass` for inner elements.
- React components keep React's `className` convention.
- The Astro Button was installed through the official CLI (`bejamas add button`)
  and lives at `components/ui/button/Button.astro`. Its barrel exports `Button`
  and the `buttonVariants` helper from `Variants.ts`; cards and other visual action
  labels reuse those styles without becoming nested interactive controls.
  Site adaptations preserve the existing theme, variants, sizing and focus states.
  `href` automatically selects a native anchor (including an empty-string href);
  otherwise it renders a native button with `type="button"` unless overridden.
  Optional explicit `as` accepts only the matching element. Props distinguish
  anchor and button attributes: links do not accept `disabled` or button `type`.
  HTTP(S) links retain the existing new-tab default, and `_blank` links receive
  `noopener noreferrer` without dropping supplied rel tokens. Caller `data-*`
  attributes, including dialog trigger slots, are forwarded. Text/icons use normal
  Astro slots, not raw-HTML text props. The component adds no client script.
  Review these local adaptations before re-running the installer with overwrite;
  global theme and utility files should not be replaced during button updates.
- Button-style actions use clear labels without navigation arrows, including
  outlined buttons and visual card actions. Icons remain opt-in through content
  slots, never inferred from `href`. Callers mark decorative icons `aria-hidden`;
  icon-only controls must supply an accessible label. Text links and compact
  navigation rows retain directional indicators; functional icons such as play,
  menu, disclosure, carousel, and service icons remain unchanged.
- `shared/CallToAction.astro` owns the common bottom-CTA surface: opaque soft
  background, strong accent top border, rounded corners, and one labeled button.
  The default size places the action alongside the text on wide screens; compact
  stays stacked with smaller padding and headings for detail pages. Callers supply
  `title`, optional `description`/`eyebrow`/`number`, the `action` label and URL,
  a unique `headingId`, and the appropriate `headingLevel`. Copy and surrounding
  margins remain page-owned. Homepage Collaboration preserves chapter 05;
  expertise CTAs preserve their h3 hierarchy and localized contact-form links;
  Events and story-detail previews reuse the same component. There is no CTA
  client script or duplicated shared copy.
- `directories/KeepExploring.astro` owns the lightweight two-card onward navigation
  below the bottom CTA. What We Do links to Events and the activity archive;
  Events links to What We Do and the archive, never back to itself. Shared labels
  live in `i18n/content.ts`; destinations are supplied and localized by callers.
- `directories/FeaturedContent.astro` owns featured-record presentation: responsive
  photo, metadata, heading, summary, optional note/themes/partner, and one action.
  Both pages use one tinted 50/50 panel on large screens, stacked on mobile;
  there is no open/panel configuration. Missing photos use the full content width and empty
  optional fields render no placeholders. Callers own heading IDs/levels, copy,
  links, and record selection. `FeaturedStory` keeps the expertise empty state;
  `featuredStory.ts` and `eventDirectory.ts` retain their separate selection rules.
  With a destination, the image, heading, text, and visual action sit inside one
  native link named by the heading. This provides one keyboard stop and avoids
  nested links. Without an action it stays a static panel.
- `shared/Card.astro` owns card structure, responsive images, linked headings,
  and media/eyebrow/footer slots. Its default and small sizes share inset media
  and patterned hover used by people, programmes, and expertise.
  `shared/ContentCard.astro` preserves the previous News card styles, using the default
  size in the directory and the small size on the homepage. It supplies localized
  metadata, summaries, and actions rather than duplicating the shell.
  Photo media uses a fixed 16:9 ratio in both sizes; there is no fixed-height
  alternative. Custom media slots, such as programme icons, keep their own sizing.
  Linked cards use one stretched title link across the entire card; image and
  footer action are not duplicate links. Their visible action uses button
  variants on a noninteractive span. Only linked cards get hover treatment,
  with a card-level focus ring and reduced-motion-safe movement. Secondary
  controls must sit in a `relative z-10` region above the link: `PersonCard`
  does this for independent email/social destinations.
- `lib/linkBehavior.ts` shares new-tab policy and directional indicators:
  HTTP(S)/protocol-relative web links use `↗`, `_blank`, and safe `rel` values;
  site paths, fragments, and email/telephone actions use `→` without forcing a
  new browser tab. Shared CTA and featured buttons preserve its target/rel policy
  without displaying arrows; hero text, section, and onward links use its indicators.
- `people/Copy.ts` owns translated profile actions and carousel labels.
  Carousel arrows are native, focusable buttons, with localized Swiper A11y
  messages. Footer social links and homepage secondary links have at least
  44-pixel hit targets and visible keyboard focus.
- `people/ProfileBiography.astro` starts with full readable content and a hidden
  disclosure control. Its custom element measures actual overflow against the
  Tailwind cutoff (`max-h-112`), only offering Read more when needed. It updates
  `aria-expanded`, retains `aria-controls`, remeasures after fonts/width changes,
  and disconnects observers/listeners on navigation. Empty bodies do not render
  a biography; without JavaScript every supplied biography remains readable.
- The Astro marquee in `components/ui/marquee/` was installed with
  `pnpm dlx bejamas@latest add marquee`. Its styles come from
  `bejamas/tailwind.css`, with the marquee keyframes in `styles/animations.css`;
  the photo and partner wrappers preserve the site's edge
  fades and add hover pausing. The primitive's reduced-motion behavior and
  hidden duplicate track remain intact.
- Partner marquees share a `speed` in pixels per second (40 by default), rather
  than a fixed loop duration. `components/partners/MarqueePartners.client.ts` measures the track and
  updates its duration on resize; its custom element disconnects the observer
  when removed during page transitions.
- Prefer Tailwind utilities, theme colors, standard sizing/shadows, and named
  responsive breakpoints. Preserve functional selectors and accessible focus states.
- `directories/PageHero.astro` owns the approved Centered Horizon treatment: eyebrow
  rules, centered typography, a quiet optional text action, and a responsive framed
  photograph. The What We Do route supplies its localized copy and image directly;
  the Events listing supplies its own copy and seminar photo. It is a
  high-level section hero, not a universal header for individual records. The component
  has no variant registry or client script, and production never imports preview code.

## What We Do

- The localized What We Do routes now compose the approved design directly with
  `Base`: the Centered Horizon hero with its quiet collaboration link, icon tabs,
  Open flow's stacked overview and featured story, and compact Journey + chapters.
  The live page has normal indexing/canonical metadata and no comparison controls.
- Directory components live in `components/directories/what-we-do/`; they do not import
  preview components, variant registries, or preview copy. The route owns locale,
  metadata, programme/work loading, and section composition. Localized page copy
  lives in `i18n/what-we-do.ts` because story CTAs also use it; programme definitions
  still come from shared data.
- `components/directories/what-we-do/ExpertiseTabs.client.ts` handles one horizontal tab row, roving focus,
  Left/Right, Home/End, selection hashes, and safe Astro reconnection. Without JS,
  all four expertise areas remain readable. Retired tab comparison controllers
  are not included in the live page.
- Homepage expertise cards now link to stable expertise IDs. Legacy translated
  heading anchors remain inside their corresponding panels and select the same
  area. Both URL styles work after direct entry and client-side navigation.
- `lib/featuredStory.ts` shares most-recent activity selection with the previews.
  The live page preserves fifteen programme definitions and ten activity cards
  (six standalone stories and four event recaps):
  three featured stories and seven remaining stories. CSR has no invented record.
  The shared content directory retains compact cards, container-width breakpoints,
  year filtering, optional search, and its stable status/reset row.
- The approved What We Do hub design remains unchanged. Journey Rail
  alone is retired; Journey + chapters is now the default More stories treatment.

## Detail pages

- The Events directory uses its approved See the contribution layout: one
  expanded nearest upcoming event, compact rows for subsequent events, a featured
  past-event recap, year chapters, and a contact CTA. Event recaps live at
  `/events/[slug]`; non-event stories live at `/what-we-do/[slug]`, with the
  activity archive at `/what-we-do/archive`.
- Story and Event routes compose their type-specific metadata, sidebar facts/actions,
  and ending actions directly around the same `ContentLayout` frame. `ContentBody`
  renders continuous reading or delegates writer-declared tabs to `BodyTabs`.
  Both render ordered Markdown/MDX documents directly. MDX is enabled for authored
  component composition; structured event content is composed inside MDX instead
  of selected by JSON block types. Photos remain outside
  tabs in the shared Photo Stage. Writers explicitly choose the reading mode in
  each record's JSON content plan; the renderer never infers tabs from content.
- `ContentLayout` owns the continuous-column frame, optional sticky sidebar,
  Photo Stage position, and Utility footer. Content-page components own the
  shared header, article/tabs, scoped table of contents, sidebar card, sharing,
  and photos. Event-specific programme, fee, registration, invitation, and sidebar
  components live under `content-page/events/`.
- Design comparison routes and their fictional sample fixtures have been removed.
  The live What We Do and Events pages remain; publication pages wait for genuine
  publication records. See [event-content-map.md](event-content-map.md) for event
  content ownership.

## Image assets

- Homepage-only photos live in `assets/home/`; `index.ts` selects the hero,
  purpose, recap, and marquee photos from the same seven originals. Do not
  create separate full-size copies for each section.
- Use Astro's `Image` with `widths` and `sizes` matching the rendered layout.
  The hero loads eagerly with high priority; below-the-fold images stay lazy.
  The photo marquee uses 224–576px variants, rather than downloading originals.
- Shared work, people, and expertise originals retain their public URLs for
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
  visible during loading. `components/site/mobile-navigation/MobileNavigationTransition.client.ts` carries an inert,
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
- `announcements/AnnouncementBanner.astro` receives a typed campaign and locale,
  and composes the shared Bejamas Dialog. It replaces the TNA-specific banner and
  the old `shared/InvitationModal.astro`; presentation and behavior contain no
  campaign-specific copy, paths, or IDs.
  `components/announcements/AnnouncementBanner.client.ts` handles only auto-opening and dismissal policy;
  the Dialog handles focus, Escape/backdrop closing, scrolling, and presence.
  The announcement starts closed and opens after Dialog initialization, unless
  another dialog is visible or navigation is underway. It reconnects on Astro
  navigation and aborts its listeners and scheduled opening when removed.
  Its announcement-specific key is passed through `data-storage-key` and shared
  across languages. Explicit dismissal or following the announcement CTA records
  a boolean in `sessionStorage`, with an in-memory fallback if storage is blocked.
  Navigation disposal alone does not record dismissal. Change the campaign ID
  for a new campaign; no cookies, tracking, or cross-visit persistence are
  introduced. Keep this feature-specific policy out of the generic Dialog primitive.
- `styles/global.css` sets Libron on all `h1`–`h6` and ARIA headings; child links,
  spans, and emphasis inherit the heading font. Long words wrap within headings,
  and page titles use responsive sizes to fit narrow screens. Body text and
  navigation inherit Lexend from the body instead of assigning Lexend to every element. Explicit
  legacy Lexend heading classes are removed so the shared typography applies.
  All fonts load through the Astro Fonts API configured in `astro.config.mjs` and
  rendered by `<Font>` in `Base`, which self-hosts them under `/_astro/fonts/` with
  metric-matched fallbacks. Lexend is Google Fonts' latin variable subset with its
  OFL license in `src/assets/fonts/lexend/`; site copy uses no latin-ext characters,
  so that subset is not shipped. Libron's unmodified WOFF2 and license live in
  `src/assets/fonts/libron/`. Tailwind's `--font-*` theme tokens in
  `styles/theme.css` point at the API's `--font-family-*` variables.
  Unused font imports, definitions, and assets are removed. The sidebar label uses
  Cinzel, an OFL Trajan-style face, as a latin WOFF2 subset with its license in
  `src/assets/fonts/cinzel/`.
- `SectionLayout` owns section navigation and the content grid. Its `default`
  variant preserves the narrower content width; `wide` uses the remaining width;
  `with-aside` reserves a right-hand column. Supplying an `aside` slot selects
  `with-aside` by default. A wide layout cannot also receive an aside.
- Ordinary localized routes call `getLocaleStaticPaths()` inside their own
  `getStaticPaths()` and validate route parameters with `getPageLanguage()`.
  Content-detail routes retain their collection-specific path generation;
  localized 404 generation remains separate.
- `getSectionNavigation(lang, section)` in `navigation.ts` builds translated navigation
  props for the `about` and `whatWeDo` groups.
- Shared translated interface copy belongs in `i18n/ui.ts`, rather than inline
  locale conditionals in components. Campaign-specific copy lives together in
  the typed locale records in `data/announcements.ts`.

## Changing the homepage announcement

Edit `homeAnnouncement` in `src/data/announcements.ts`:

- Set `enabled: false` to remove the popup entirely, without editing the page.
- Update each language's `title`, `description`, and optional `action`.
- An action contains its `label` and `href`. Unprefixed site paths, such as
  `/questionnaire`, are localized automatically; HTTPS links stay unchanged.
  Omit `action` for a notice without a CTA. Copy is rendered as text, not raw HTML.
- Keep `id` stable for corrections to the same campaign. Use a new lowercase,
  hyphen-separated ID for a new campaign so the previous dismissal does not hide it.
  The existing `tna-champs-ui` ID preserves dismissal during this refactor.
- Pass another `AnnouncementCampaign` to `AnnouncementBanner` to use it on a
  different page. Mount at most one auto-opening announcement per page; mounting
  the same campaign on several pages shares its dismissal for the tab session.

Campaign replacement needs no changes to the dialog markup, browser controller,
or shared interface translations. There is no campaign scheduling or queue.

## Verification

Run `pnpm build` to generate the pages and the Pagefind search index. When moving
components, update all imports and preserve their browser scripts and functional
selectors, including behavior across Astro page transitions.

## Stories and Events

- `/what-we-do` is the approved tabbed discovery page, combining expertise,
  programme areas, featured stories, and filtered story collections.
  `/what-we-do/archive` owns the complete searchable, year-filtered historical list,
  with a breadcrumb and links back to What We Do. Historical records are not
  embedded in the story collections. `/what-we-do/[slug]` owns non-event stories;
  Partners remains under the same section. The public Our Work section is retired.
- `/events` separates announced upcoming activities from past records.
  `/events/[slug]` owns an event's verified recap, programme highlights, photos,
  available resources, and participation information. An event card in What We Do
  links directly to this record; there is no second event article route.
- Standalone stories live in `content/stories/<slug>/`. Each folder contains a
  `story.json` record and its English/optional Indonesian Markdown documents.
  Folder names are stable URL slugs. Original article bodies, author references,
  public story URLs and image URLs have been preserved.
  `/images/news/` is an asset path, not a legacy page route; keep those originals
  rather than copying them into a second directory.
- `content/events/<slug>/event.json` holds shared facts and bilingual summaries.
  The same folder owns optional `recap.en.md`, `recap.id.md`, `invitation.en.md`
  and `invitation.id.md` sources. JSON uses `recap: true` / `invitation: true`
  rather than references into Stories or legacy Projects. `events` and the internal
  `eventDocuments` loader validate these files; no separate document routes exist.
  `contentCatalog.ts` resolves story and event documents from their own folders,
  labels English fallbacks, and centralizes
  links. `getActivities` combines story cards with event recap links without
  duplicating recaps as Stories.
  Optional `workFeature` stores a featured card's title and contribution in the
  event's own record, so replacing its content does not require editing a component.
- Five event records were identified in the existing content. The 2024 GHLD
  training and the 2025 GHLD invitation are distinct records. The ICHA story
  spans multiple editions and stays a standalone story instead of becoming a falsely
  dated single event. The singleton TNA invitation now lives at `/questionnaire`,
  with localized content and its unchanged external form URL in `data/questionnaire.ts`.
  The Projects collection, route and layout are removed. No Surveys collection,
  embedded form, response endpoint or response storage is introduced.
  Two old workshop tiles (SEM-PLS and AI literacy) had no full invitation body.
  Their original summaries, dates, and venues are retained; recovered speaker
  images and QR codes now live in each JSON record's `invitationArchive` with
  bilingual alt text. These archival records have detail routes, but are not
  recaps or reconstructed invitations. Unknown speaker identities stay unknown.
  Records without a recap, invitation, or recovered artwork remain `listingOnly`.
  Archive MDX composes recovered artwork separately from event photos; GHLD's
  named portraits and historical QR still come from its original Markdown.
  Archive-only records have one Invitation archive section containing the recovery
  explanation and artwork, not a separate empty invitation introduction.
- Store an actual event date separately from an article's publication date.
  Standalone Stories use optional `activityPeriod: {startYear, endYear?}`;
  the directory's year filter includes every year in a range. Unknown periods
  remain unknown instead of using publication dates, and sort after dated work.
  The original `date` remains the article publication date, shown on its detail page.
  Story JSON holds bilingual `summary` and `partner`, plus a curated `workType`
  of research, consulting, or capacityBuilding. Contribution and output details
  belong in the writer's Markdown narrative, not as required metadata fields or
  template-defined sections.
  Month-only records use `period` without `startDate`. Dates use Jakarta's
  calendar for upcoming/past classification and UTC for date-only formatting.
  A passed invitation is labelled `past`, not `completed` without a recap.
  Rebuild the static site as scheduled events pass or content changes.
  Event `kind` (training/workshop/seminar/policyDialogue) drives the Type filter;
  recap/invitation availability is separate from status. Upcoming records default
  to nearest-first, past records to newest-first. When there are no upcoming
  events, a compact notice keeps the past-event directory prominent.
- `EventRegistration` is rendered only for an upcoming event with a configured,
  unexpired registration link. It checks expiry again in the browser to protect
  against a stale static build. Past records have no registration button. Original
  QR codes may appear in Invitation archive, explicitly marked as historical,
  without an active registration link; QR files are displayed without conversion.
  Resource links appear only when supplied; missing files have no fake downloads.
  Empty resources sections and their navigation links are omitted. The Programme panel
  header keeps all facts, status, and section links visible on both mobile and
  desktop; the old `EventDetails` disclosure and breakpoint listener are removed.
  Details and navigation remain accessible without JavaScript.
- All original experience entries remain in the archive data. Optional
  `detailPath` links only confirmed matching event records; other entries remain
  plain text, never empty detail pages. The old animated timeline is removed.
  `ActivityArchive` renders its directory only on the standalone archive page;
  the What We Do next-steps section supplies the archive entry point. Footer and homepage
  year-review links target the standalone page, without adding a top-level nav item.
- `ContentDirectory` progressively enhances server-rendered table rows, Work cards,
  or chronological card groups (`layout="journey"`) with search,
  year/type filters, ordering, counts, and pagination. Each instance owns its
  listeners and aborts them when disconnected during Astro navigation. Without
  JavaScript, all records and links remain visible. `ContentPhoto` and `PhotoStage`
  generate responsive images with Astro and lazy-load the gallery.
  Paginated Work cards reveal six at a time, tables twelve; `paginate={false}`
  shows every matching record and omits the Load more control and its wrapper.
  `DirectoryPresets.ts` keeps the approved `openChaptersDirectory` settings in
  one place for What We Do's More stories and the live past-event listing:
  open year chapters, compact small cards, adaptive
  container-width columns, toolbar filters, and no pagination. Callers retain their own content,
  heading levels, and labels. Upcoming-event layouts are independent. See
  [ContentDirectory configuration](./content-directory.md) for the available options.
  The archive has no redundant
  single-option Type filter or repeated missing-write-up notices. Search, category
  shortcuts, year/type controls, and sorting normally share an initially closed native
  disclosure on all screen sizes. Result counts stay visible outside the disclosure;
  active-search/filter badges and an external reset button keep narrowed lists
  understandable even when controls are collapsed. Reset retains the disclosure
  state and returns focus to either the query field or closed toggle. Resizing does
  not override the visitor's choice. Controls remain hidden without JavaScript,
  while all server-rendered records remain available. Table entries give titles the
  full width with their date above them. Gallery `caption` is optional and separate
  from descriptive alt text, so generic captions are not manufactured.
  The journey option (`journeyStyle="rail" | "open" | "timeline"`) exposes synchronized year buttons outside the disclosure,
  without a duplicate visible year select inside. `directoryYears.ts` groups by
  the latest display year, matches every recorded year in a range, and supports
  an explicit unknown-period choice. Grouped pagination and sorting preserve
  section wrappers; empty groups disappear. A selected year replaces the first
  visible group's heading; subsequent group headings and the Recent stories label
  are suppressed until All years restores the original chronology. Without JavaScript, all stories and
  year headings are shown, the nonfunctional controls stay hidden, and no empty
  sidebar column remains. Existing table/card layouts are unchanged.
  Card collections can opt into the same top-level year buttons with
  `yearShortcuts`; the default remains false, so existing table/card pages keep
  their controls. Timeline decoration is ignored by assistive technology.
- Header, mobile menu, footer, homepage, and Pagefind facets follow What We Do
  and Events. The article search facet is labelled Stories. Share links use
  each page's localized canonical URL.
- At the owner's request, old News, Experiences, and GHLD project page routes
  are removed without redirects. The temporary content previews and superseded
  News components/controller are removed too. No hosting adapter is required
  for this static Vercel deployment. Nothing has been deployed automatically.
- The `publications` collection is ready for genuine records, with ordered authors,
  publication type/year and optional DOI, abstract, source URL and PDF. Stories and
  event records have optional validated `publications` references. The collection
  has no supplied real records; the production directory shows an empty state,
  while real records create bilingual detail routes through their
  `translationKey`. A story tagged `Report` is not treated as a published paper.

Publications reuse `directories/PageHero`, `ContentDirectory` and the open-chapters
preset. The directory accepts a card component for publication-specific author
and journal metadata; its filtering and year grouping stay shared with Events
and What We Do. Publications use compact rows and 10 results per page, with
filtering and sorting across the full collection before paging. Detail pages compose `ContentLayout`, `SidebarCard`, the shared
table of contents and sharing controls. Publication-specific sidebar and citation
markup live under `content-page/publications/`. Locale selection, DOI handling and
citations live in `lib/publications.ts`; Astro collection access stays in
`lib/publicationCatalog.ts`. The 15 bilingual samples marked `previewOnly` are
available in development and excluded from production directories and routes.

See [Content authoring](./content-authoring.md) for the editor-facing folder map.

Run `pnpm test` for date/status boundary tests, `pnpm astro check` for diagnostics,
and `pnpm build` for static routes and search. Browser verification uses the
globally installed `playwright-cli` with cached Chromium, without project test
dependencies or an installed Google Chrome application.
