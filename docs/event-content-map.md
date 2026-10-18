# Event content map

One event keeps one `/events/[slug]` URL as it moves from announcement to archive.
The layout stays consistent; its reading priority and available content evolve.

| Section                     | Before the event                                                        | After the event                                                                 |
| --------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Header and Action-led panel | Title, summary, dates, venue, format, fee summary, guarded registration | Same facts, completed/past status, registration closed                          |
| Main reading area           | Writer-chosen article or ordered views for supplied introduction, audience, programme | Writer-chosen article or views for recap, programme, materials and archive |
| Photo Stage, outside views  | Usually absent; do not invent documentation                             | Actual photos with captions, available below every view                         |
| Next action                 | Registration or an enquiry                                              | Discuss a future programme or collaboration                                     |

Recap, programme, and materials are sections of the event record, not separate
competing event articles. A What We Do story card can link to this record. A deeper
project story belongs under What We Do only when it adds context beyond the event.

## Content ownership

- `content/events/<slug>/event.json`: shared facts, bilingual summary, status, programme,
  resources, and optional registration URL/deadline.
- `recap.en.md` / `recap.en.mdx` (and Indonesian equivalents): report body, authors, and photos.
- `invitation.en.md` / `invitation.en.mdx` (and Indonesian equivalents): original announcement
  body, objectives, audience, speakers and participation information. Set the matching
  `recap` / `invitation` flag to true in `event.json`; there are no cross-collection
  links to legacy Work or Projects sources.
- `event.json` explicitly declares `content.mode` (`article` or `tabs`) and the
  ordered documents in its article or views. MDX owns section hierarchy and can
  compose event-specific content building blocks in authored order. The event route supplies
  metadata and practical actions around the shared `ContentBody` renderer. An
  invitation is never used as a fallback recap.
- Tabs are a writer decision, not inferred from the presence of programme data.
  The same renderer supports continuous events and tabbed stories. Learning
  objectives stay distinct from observed results. Original fees,
  conditions, QR codes and invitation artwork stay explicitly archival.
- `layouts/ContentLayout.astro` owns the continuous-column frame, guarded sticky
  placement and Utility row. Common `components/content-page/` components own the
  sidebar card surface, scoped native TableOfContents and Photo Stage.
  `components/content-page/events/` owns event-specific sidebar, fee and registration
  behavior; its `mdx/` subfolder contains content blocks authored MDX can compose.
  `components/directories/events/` owns EventsListing and UpcomingEvents.
  Real registration stays future/status/deadline guarded, with client expiry
  handling if a static build outlives its registration window.
- Missing content stays missing. A complete real record does not require a video,
  testimonials, impact statistics, or a QR code. Never invent these to fill a layout.

## Pricing

The invitation's `fees` is the single source for both the upcoming sidebar
summary and the complete breakdown in Event details. Up to four rates appear in
the sidebar; larger pricing matrices get a count and a link to the full breakdown,
not an inferred “from” price. The sidebar reads date/duration, venue and format,
then prices, an optional short inclusions sentence, registration/deadline, and
one enquiry link. `fees.includesSummary` is an optional plain-text sentence
(up to 180 characters), explicitly authored rather than truncating conditions.
Full inclusions, exclusions and all contacts remain in Event details. An upcoming
event's first supplied contact is its sidebar enquiry link; otherwise the link
leads to its on-page enquiry section. Archived contacts are not promoted as active.
Fees remain visible for upcoming events even if registration is unavailable.
Expired rate rows disappear from upcoming sidebar summaries, while the full
Event details breakdown retains them with an Ended label. Current and scheduled
rates stay visible, and an all-ended notice replaces an empty list. The client
updates these states at pricing boundaries without a reload. Large-summary counts
exclude expired rates and expand to individual rows once four or fewer remain.
Past/cancelled events keep pricing in their historical participation information,
not in the sidebar.

Each item can optionally supply `opensAt` and `closesAt` as ISO datetimes with an
explicit timezone offset. Opening is inclusive; closing is exclusive. These fields
drive the available/not-yet-available/ended labels and active-rate highlighting;
display labels are never parsed for dates. Undated rates make no availability
claim, and archived rates never receive active highlighting. Deadlines display
in WIB. A small client enhancement refreshes labels at boundaries and when the
tab returns to view, so a static build does not indefinitely advertise an expired
early-bird rate. It does not change registration or payment eligibility.
