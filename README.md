# CHAMPS UI website

Bilingual English/Indonesian website built with Astro, TypeScript and Tailwind CSS.
Public content includes What We Do stories, Events, an activity archive and people
profiles. Design comparison previews have been removed for now.
The questionnaire invitation lives at `/questionnaire` and opens the existing
external survey; the site does not collect survey responses.

## Development

Use Node.js **22.12 or later** and **pnpm 10.18.2** (declared in `package.json`).

```sh
pnpm install
pnpm dev
```

Other commands:

- `pnpm build` — build prerendered pages, Vercel functions, and the Pagefind
  search index into `.vercel/output/`.
- `pnpm preview` — Astro preview; use `pnpm dev` or Vercel Preview deployments
  when checking the contact endpoint, as Astro preview cannot run Vercel functions.
- `pnpm test` — run the existing Node test suite. For small changes, run only the
  relevant files: `node --experimental-strip-types --test tests/event-fees.test.mjs`.

## Project organization

- `src/pages/` — routing, metadata, data preparation and page composition.
- `src/layouts/` — the site shell, section-navigation layout, and shared content layout.
- `src/components/` — feature-owned components, copy and browser controllers.
  `directories/` owns browsing/discovery components; `content-page/` owns record
  reading components. Each has content-type subfolders, such as `events/` and
  `what-we-do/`. General cross-role presentation lives in `shared/`, and basic
  controls/registry primitives live in `ui/`. Individual-content page structure
  lives in `layouts/ContentLayout.astro`.
- `src/content/`, `src/data/` — published content and structured site data.
- `src/lib/`, `src/i18n/` — data helpers, translations and route localization.
- `src/scripts/` — global theme and intersection initialization only.
- `src/components/previews/` — fictional fixtures and review-only presentation;
  production components must not import these.
- `src/assets/`, `public/` — optimized source assets and stable public URLs.
- `tests/`, `docs/` — regression checks and implementation guidance.

Keep a feature's browser controller beside its component. Pages own composition;
avoid adding page-sized wrappers or generic abstractions just to shorten a file.
Generated output, dependency stores and local browser artifacts are not source.

## Documentation

- [Contact database, email setup and activation](docs/form-submissions.md)
- [Architecture and component ownership](docs/architecture.md)
- [Where to edit Stories, Events, Publications and the questionnaire](docs/content-authoring.md)
- [Content directories and migration](docs/content-directory.md)
- [Event content model](docs/event-content-map.md)
- [Recovered invitation sources and images](docs/recovered-invitations.md)
