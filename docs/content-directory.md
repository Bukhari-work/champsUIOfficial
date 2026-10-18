# ContentDirectory configuration

`src/components/directories/ContentDirectory.astro` renders one collection in several
presentations. Search, year/type filtering, sorting, reset, result counts, and
Load more all use the same progressive-enhancement script. Without JavaScript,
the records remain visible and nonfunctional controls stay hidden.

## Main layouts

| `layout`          | Presentation                                                                                       | Typical use                                     |
| ----------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `table` (default) | Text-first rows with dates and, when relevant, a type column. No card images.                      | Long activity archives and compact listings.    |
| `cards`           | A continuous grid of shared `ContentCard` cards, without year chapter headings.                    | Visual browsing without chronological grouping. |
| `journey`         | The same cards grouped into year chapters, with year-filter buttons outside the filter disclosure. | Stories or events explored over time.           |

`journeyStyle` only affects `layout="journey"`:

| Value            | Difference                                                                             |
| ---------------- | -------------------------------------------------------------------------------------- |
| `rail` (default) | Year controls become a sticky left rail on large screens.                              |
| `open`           | Full-width chapters with year headings and divider lines; no sidebar or timeline line. |
| `timeline`       | Chapters follow a vertical line with a marker for each year.                           |

Year buttons **filter**, rather than scrolling to a year. Multi-year records are
grouped by their latest recorded year but match every recorded year when filtered.
Unknown periods stay separate. Sorting and Load more preserve the chapter groups.

## Other options

| Option                                                                          | Default           | Effect                                                                                                                                                                           |
| ------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `density`                                                                       | `comfortable`     | `compact` reduces directory gaps, chapter spacing, and heading sizes.                                                                                                            |
| `cardSize`                                                                      | `default`         | `small` uses the compact card treatment: less padding, smaller title, simpler metadata, and shorter excerpt. Separate from directory density.                                    |
| `cardColumns`                                                                   | `2`               | `2` / `3` select predefined grids where supported; `adaptive` uses the shared responsive grid, up to four columns.                                                               |
| `responsiveTo`                                                                  | `viewport`        | With adaptive cards, use screen-width breakpoints or `container` breakpoints based on the actual available content width. Container mode also accounts for padding and sidebars. |
| `yearShortcuts`                                                                 | `false`           | Show year-filter buttons outside Search & filters. Journey layouts enable these automatically. Otherwise the year select stays inside the disclosure.                            |
| `categoryShortcuts`                                                             | `false`           | Replace the type dropdown with buttons inside Search & filters when multiple types exist.                                                                                        |
| `controlsStyle`                                                                 | `panel`           | Changes the expanded filter form background: tinted for `panel`, plain background for `toolbar`. Both remain behind the same disclosure toggle.                                  |
| `defaultSort`                                                                   | `newest`          | Initial descending or `oldest` ascending date order; the visitor can change it.                                                                                                  |
| `paginate`                                                                      | `true`            | When `false`, show all matching records without a Load more button or its spacing. Search, filtering, and sorting still work.                                                    |
| `cardHeadingLevel`, `yearHeadingLevel`                                          | `h3`, `h2`        | Semantic heading levels to fit the surrounding page, not alternative visual designs.                                                                                             |
| `dateLabel`, `yearFilterLabel`, `recentLabel`, `unknownYearLabel`, `periodNote` | Context-dependent | Optional labels and explanatory copy. `dateLabel` labels the table's date column.                                                                                                |

Required inputs are `items`, `lang`, a page-unique `id`, and an accessible `label`.
Item data supplies titles, descriptions, dates, years, type, images, destination
links, availability notes, and optional action labels. Layout settings do not
change which records a caller supplies or where its links lead.

With pagination enabled, tables reveal twelve records per page; card and journey
layouts reveal six. The shared open-chapters preset disables pagination.

## Shared approved preset

`DirectoryPresets.ts` exports `openChaptersDirectory`:

```ts
{
  layout: "journey",
  journeyStyle: "open",
  yearShortcuts: true,
  controlsStyle: "toolbar",
  density: "compact",
  cardSize: "small",
  cardColumns: "adaptive",
  responsiveTo: "container",
  paginate: false,
}
```

What We Do's More stories and every past-event directory spread this same preset.
Each caller retains appropriate heading levels and context-specific copy. Events
do not inherit story-only labels or explanations about multi-year assignments.
