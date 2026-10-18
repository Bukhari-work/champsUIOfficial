# Editing site content

Content follows its purpose, not an old page layout or collection name.

```text
src/content/
  people/en/                       English profiles
  people/id/                       Indonesian profiles
  stories/<story-slug>/
    story.json                     Shared metadata and the writer's content plan
    article.en.md or article.en.mdx  English narrative (filename is declared in the plan)
    article.id.md or article.id.mdx  Optional Indonesian translation
  events/<event-slug>/
    event.json                     Shared event facts, bilingual summaries, flyers
    recap.en.md or .mdx             Optional English coverage and photos
    recap.id.md or .mdx             Optional translated coverage
    invitation.en.md or .mdx        Optional original invitation and participation details
    invitation.id.md or .mdx        Optional translated invitation
    details.en.mdx                  Optional MDX composition of event components
  publications/                    Real publication records; currently empty

src/data/questionnaire.ts           The single TNA invitation, in both languages
src/data/announcements.ts           Popup campaign configuration
src/data/programmes.ts              Expertise and service descriptions
src/data/experiences.en.ts          Historical activity archive
src/data/experiences.id.ts          Translated activity archive
```

## Stories

Use one kebab-case folder per story. Its name determines the public
`/what-we-do/<slug>` URL. `story.json` holds bilingual title and description,
People author references, publication date, activity period, partner, optional
sidebar facts, photos and the explicit `content` plan. `sidebarFacts` adds up to
four short, bilingual label/value pairs (for example, location or population
served); do not repeat the standard period or partner fields. Set
`previewOnly: true` for an unlisted, noindex story preview; the current example
is `/what-we-do/story-sidebar-preview`. The main Markdown document holds
the story's structure and prose, including optional discussion of CHAMPS's
contribution and outputs. Those are ordinary writer-authored parts of the story,
not required JSON fields or template-defined sections. An article's `date` is its
publication date, not an inferred activity date. Indonesian Markdown is optional;
missing translations use a labelled English fallback.

The writer chooses the reading mode. A continuous story uses:

```json
"content": {
  "mode": "article",
  "sections": [{ "id": "article" }]
}
```

The ID resolves to `article.en.md` or `article.en.mdx` (and optionally the
Indonesian equivalent) in the same folder. Use `.mdx` when the content needs to
compose approved Astro components; plain prose can stay in `.md`. A document
that fully owns its section layout can set `renderMode: component` in frontmatter;
otherwise the shared content renderer supplies its section wrapper by default.
For distinct views, choose `"mode": "tabs"` and declare one or more ordered
views, each with a stable key, bilingual label and its own ordered sections.
With only one view, the page automatically omits the tab controls and presents
the view label as a heading:

```json
"content": {
  "mode": "tabs",
  "views": [
    { "key": "story", "label": { "en": "Story", "id": "Kisah" },
      "sections": [{ "id": "story" }] },
    { "key": "outcomes", "label": { "en": "Outcomes", "id": "Hasil" },
      "sections": [{ "id": "outcomes" }] }
  ]
}
```

These resolve to `story.en.md`, `outcomes.en.md`, and optional translations.
The page never infers tabs from the amount of content. Every section is a Markdown
or MDX document, and MDX may compose approved Astro components.

An event recap does not belong here. A separate story about the same activity is
appropriate only when it offers a distinct account for the What We Do audience.
The What We Do directory can also show links to event recaps without copying
them into the Stories collection.

## Events

Create one folder per event. Its folder name is the public `/events/<slug>` URL.
Keep bilingual practical facts, status, date precision, programme topics,
resource URLs and guarded live registration in `event.json`.

Set `recap: true` when a `recap.en.md` (or the requested translation) is supplied.
Set `invitation: true` when original invitation Markdown is supplied. These flags
replace cross-collection references to legacy News/Projects content. A declared
source that is missing or draft fails the build rather than fabricating content.
Missing Indonesian documents fall back to English with an explicit language notice.

Each document's Markdown/MDX body retains its role. Recaps own report text, author
credits, publication date and documentation photos. Invitations own original
announcement text and optional structured `objectives`, `audience`,
`audienceNotes`, `speakers`, `practicalDetails`, `fees`, `contact`, and
`originalRegistration` fields. These describe content, not a particular sidebar.
Fees use explicit opening/closing datetimes where known; original registration
information is historical and never automatically becomes an active action.

The event's `content` plan uses the same `article` or `tabs` shape as a story.
Each section is a document ID; there is no separate section type. MDX owns section
headings, order, and surrounding prose. Event Astro components are content building
blocks (lists, speaker cards, fees, and artwork), not preassembled titled sections.
GHLD 2025 composes audience and objectives in its invitation, then speakers and
participation in `details.en.mdx`. GHLD 2024 composes partner and topics; SEM-PLS
and AI-literacy compose archived invitation artwork. The JSON plan only orders
documents and tabs.

When `event.json` contains resource links, add a `resources` section to the content
plan and a matching `resources.en.mdx` document (plus a translation if available).
That document owns its heading and placement and composes the shared links-only
`ResourceLinks` block. The slug shows its sidebar “view materials” action only
when both the links and the planned section exist.

```json
"content": {
  "mode": "tabs",
  "views": [
    { "key": "overview", "label": { "en": "Overview", "id": "Ringkasan" },
      "sections": [{ "id": "recap" }] },
    { "key": "details", "label": { "en": "Event details", "id": "Detail kegiatan" },
      "sections": [{ "id": "details" }] }
  ]
}
```

Moving a section between views is an edit to this list. Adding programme
metadata no longer creates a tab or moves content by itself. A one-view article
stays an article even if its Markdown has many headings. The shared
`ContentBody` renderer owns the reading mode; Story and Event routes supply
their own metadata, practical sidebar, photos and ending actions.

For artwork-only archives, supply `invitationArchive` in the event record and
omit the invitation flag. Use `listingOnly` only when there is no detail content.
Never reconstruct missing fees, speaker identities, recaps or outcomes.

Astro reads JSON records through `events` and `stories`, and Markdown through
their internal document loaders. Each record and its documents stay in the same
folder; documents have no independent public URLs.

Keep event artwork under `public/images/events/<event-slug>/` and reference it
from `event.json` using `flyers`, with localized `alt` text and optional captions.
Flyer artwork is archival content, not an active registration action. The
October 2025 invitation briefs were used to author the event pages; their DOCX
source files are not part of this repository.

## Publications

The `publications` collection is ready for genuine research records. It is empty;
no public Publications directory or navigation entry has been introduced yet.

Real Markdown records require a title, translation key, publication type, year,
and ordered author names. Authors may optionally reference a People profile or
an ORCID URL. Journal/publisher, exact date, DOI, abstract, explanatory summary,
citation, external publication URL and PDF are optional. Never invent access
links or bibliographic details. Local PDF paths and HTTP(S) PDF URLs are supported.

Stories and event records can reference these records using `publications`,
validated by Astro. Publication page/navigation activation and rendering related
publication links should accompany the first real records.

## Questionnaire invitation

The TNA invitation is a singleton, not a generic Surveys or Projects collection.
Edit `src/data/questionnaire.ts` for its shared external form destination and
localized invitation, poster markup, objectives, participation facts and button
label. The invitation body was preserved from the original source.

`/questionnaire` and `/id/questionnaire` explain participation and link to the
external questionnaire. There is no embedded survey, response endpoint or response
storage. Navigation and the existing popup campaign link here; the campaign ID is
unchanged so its dismissal behaviour is preserved. The legacy `/projects` routes
and layout are removed, without redirects.

## Assets and validation

Existing `/images/news/` and `/images/projects/` URLs remain stable asset locations,
not content collections or public page sections. Do not duplicate or rename those
files merely to match the new content-folder names.

Schemas live in `src/content.config.ts`. `src/lib/contentCatalog.ts` selects
translations and supplies directory items; page components do not guess where
source documents belong. Preview fixtures stay under `components/previews/` and
never enter published collections, navigation or search.
