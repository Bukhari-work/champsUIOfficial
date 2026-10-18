# Recovered October 2025 invitations

Recovered from commit `c125739` (Complete first prototype!).
Commit `23e9eb8` (Updated to list questionnaire, 2 February 2026) deleted eleven
workshop image assets and replaced the GHLD invitation's four image references
with `tna-champs.webp`. All eleven originals are restored without conversion.

## Available sources

| Event                                               | Available source material                                                                                                        | Archived assets                                |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| AI Literacy Workshop for BPJS Kesehatan Sample Data | Supplied Indonesian brief with learning aims, audience, named speakers, practical information, and registration details          | Three speaker portraits, QR code, and flyer    |
| SEM-PLS Data Analysis Workshop for Health Policy    | Supplied Indonesian brief with audience, named speakers, analysis topics, fees, and registration details                        | Two speaker portraits, QR code, and flyer      |
| Workshop on Global Health Leadership and Diplomacy  | Supplied English brief plus the original Git invitation; includes objectives, audience, speakers, schedule, fees, and application requirements | Three speaker portraits and both flyer sides |

Where a printed flyer and its supporting brief disagree, the archive follows the
flyer for details shown to invitees and retains non-conflicting context from the
brief. For GHLD, the flyer says 25 October 2025 while the brief says 26 October;
the page records both source dates and treats registration as closed. The three
DOCX briefs were used for content authoring but are not retained in the repository.

The listing sources are `src/pages/[lang]/projects/index.astro` and
`src/i18n/ui.ts` in `c125739`. They linked to `/projects/ai`, `/projects/sempls`,
and `/projects/ghld`, but only GHLD had a committed content entry. Searching all
available branches and their history did not find full AI Literacy or SEM-PLS
invitations. The supplied briefs now provide the speaker names and event details;
those details are not inferred from portraits. The original flyers are included on
the corresponding event pages.

The [GHLD invitation](../src/content/events/ghld-2025/invitation.en.mdx) was recovered
from Git blob `2b00bc2db252d79574c9046f34d318d44cc7869d`. Its original prose and image
references are preserved; layout-specific frontmatter names were later changed to
content names (`objectives`, `fees`, `contact`, `practicalDetails`, `originalRegistration`).
This 2025 invitation is separate from the October 2024 GHLD training recap.

## Recovered images

These are decorated speaker portraits, not event-cover photographs or full posters.
Original filenames are retained, including `sempl-speaker-*` (without a final `s`).

| Event       | Speaker images                                                                                                                                             | Historical registration QR                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| AI Literacy | [1](../public/images/events/ai-literacy-bpjs-2025/speaker-1.webp), [2](../public/images/events/ai-literacy-bpjs-2025/speaker-2.webp), [3](../public/images/events/ai-literacy-bpjs-2025/speaker-3.webp) | [registration QR](../public/images/events/ai-literacy-bpjs-2025/registration-qr.png) |
| SEM-PLS     | [1](../public/images/events/sem-pls-health-policy-2025/speaker-1.webp), [2](../public/images/events/sem-pls-health-policy-2025/speaker-2.webp) | [registration QR](../public/images/events/sem-pls-health-policy-2025/registration-qr.png) |
| GHLD        | [1](../public/images/events/ghld-foundational-2025/speaker-1.webp), [2](../public/images/events/ghld-foundational-2025/speaker-2.webp), [3](../public/images/events/ghld-foundational-2025/speaker-3.webp) | [registration QR](../public/images/events/ghld-foundational-2025/registration-qr.jpg) |

The full flyers are stored with each event's assets: [AI Literacy](../public/images/events/ai-literacy-bpjs-2025/flyer.jpg), [SEM-PLS](../public/images/events/sem-pls-health-policy-2025/flyer.jpg), [GHLD front](../public/images/events/ghld-foundational-2025/front.jpg), and [GHLD programme side](../public/images/events/ghld-foundational-2025/programme.jpg).

All eight speaker images are 1080 × 1350 pixels. The QR images are 188 × 186
(AI Literacy), 715 × 715 (SEM-PLS), and 812 × 812 (GHLD).
Their Git blob hashes were checked against `c125739` after restoration.

## Where the assets are used

- `/events/ai-literacy-2025`: named speakers, original flyer, and archived QR.
- `/events/sem-pls-2025`: named speakers, original flyer, and archived QR.
- `/events/ghld-2025`: three named portraits under Speakers, and its archived QR
  under Invitation archive. The complete invitation remains the content source.

The Indonesian routes use the `/id` prefix. All detail-header comparisons use the
same assets and renderer. Events listings now link to all three records.

QR codes are shown uncropped, without lossy image conversion, and explicitly
labelled as historical reference only. Expired registration is not reactivated;
the codes are not current calls to action, and their destinations have not been verified.
